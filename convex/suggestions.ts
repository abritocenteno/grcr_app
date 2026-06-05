import { query } from "./_generated/server";

async function requireAuth(ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  return identity.subject;
}

export interface FrequentItem {
  name: string;
  count: number;
  imgUrl?: string;
}

// All lists a user can see: ones they own + ones shared via a group they're in.
async function getAccessibleLists(
  ctx: { db: any },
  userId: string
) {
  const ownedLists = await ctx.db
    .query("lists")
    .withIndex("by_owner", (q: any) => q.eq("ownerId", userId))
    .collect();

  const memberships = await ctx.db
    .query("groupMembers")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .collect();

  const groupListArrays = await Promise.all(
    memberships.map((m: any) =>
      ctx.db
        .query("lists")
        .withIndex("by_group", (q: any) => q.eq("groupId", m.groupId))
        .collect()
    )
  );

  const ownedIds = new Set(ownedLists.map((l: any) => l._id));
  return [
    ...ownedLists,
    ...groupListArrays.flat().filter((l: any) => !ownedIds.has(l._id)),
  ];
}

// Distinct stores the user has actually shopped, most-used first. Combines each
// list's configured `stores` with the stores items were actually added to, so
// the home page can show one popular row per real store. Always includes the
// two defaults so a fresh account still sees rows.
export const getVisitedStores = query({
  args: {},
  handler: async (ctx): Promise<string[]> => {
    const userId = await requireAuth(ctx);
    const allLists = await getAccessibleLists(ctx, userId);

    const counts = new Map<string, number>();
    const bump = (store?: string) => {
      const s = store?.trim().toLowerCase();
      if (!s) return;
      counts.set(s, (counts.get(s) ?? 0) + 1);
    };

    for (const list of allLists) {
      for (const s of list.stores ?? []) bump(s);
    }

    const itemArrays = await Promise.all(
      allLists.map((list: any) =>
        ctx.db
          .query("items")
          .withIndex("by_list", (q: any) => q.eq("listId", list._id))
          .collect()
      )
    );
    for (const item of itemArrays.flat()) bump(item.store);

    // Most-used first; guarantee the two default stores are present.
    const ordered = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([store]) => store);

    for (const def of ["ah", "lidl"]) {
      if (!ordered.includes(def)) ordered.push(def);
    }
    return ordered;
  },
});

export const getFrequentItems = query({
  args: {},
  handler: async (ctx): Promise<FrequentItem[]> => {
    const userId = await requireAuth(ctx);

    // Gather all lists the user owns or is a group member of
    const ownedLists = await ctx.db
      .query("lists")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const groupListArrays = await Promise.all(
      memberships.map((m) =>
        ctx.db
          .query("lists")
          .withIndex("by_group", (q: any) => q.eq("groupId", m.groupId))
          .collect()
      )
    );

    const ownedIds = new Set(ownedLists.map((l) => l._id));
    const allLists = [
      ...ownedLists,
      ...groupListArrays.flat().filter((l) => !ownedIds.has(l._id)),
    ];

    // Collect all items across all lists
    const itemArrays = await Promise.all(
      allLists.map((list) =>
        ctx.db
          .query("items")
          .withIndex("by_list", (q: any) => q.eq("listId", list._id))
          .collect()
      )
    );

    // Aggregate by normalised name
    const counts = new Map<string, FrequentItem>();
    for (const item of itemArrays.flat()) {
      const key = item.name.toLowerCase().trim();
      const existing = counts.get(key);
      if (existing) {
        existing.count++;
        if (!existing.imgUrl && item.imgUrl) existing.imgUrl = item.imgUrl;
      } else {
        counts.set(key, {
          name: item.name,
          count: 1,
          imgUrl: item.imgUrl ?? undefined,
        });
      }
    }

    return Array.from(counts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  },
});
