import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

async function requireAuth(ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  return identity.subject;
}

async function canAccessList(ctx: any, listId: Id<"lists">) {
  const userId = await requireAuth(ctx);
  const list = await ctx.db.get(listId);
  if (!list) throw new Error("List not found");

  if (list.ownerId === userId) return { list, userId };

  if (list.groupId) {
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q: any) =>
        q.eq("groupId", list.groupId).eq("userId", userId)
      )
      .first();
    if (membership) return { list, userId };
  }

  throw new Error("Forbidden");
}

export const getUserLists = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const ownedLists = await ctx.db
      .query("lists")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const sharedListArrays = await Promise.all(
      memberships.map((m) =>
        ctx.db
          .query("lists")
          .withIndex("by_group", (q: any) => q.eq("groupId", m.groupId))
          .collect()
      )
    );

    const ownedIds = new Set(ownedLists.map((l) => l._id));
    const sharedLists = sharedListArrays
      .flat()
      .filter((l) => !ownedIds.has(l._id));

    const all = [...ownedLists, ...sharedLists].sort(
      (a, b) => b.createdAt - a.createdAt
    );

    // Enrich with group names and item counts
    const enriched = await Promise.all(
      all.map(async (list) => {
        const group = list.groupId ? await ctx.db.get(list.groupId) : null;
        const groupName = group && "name" in group ? group.name : null;
        const items = await ctx.db
          .query("items")
          .withIndex("by_list", (q: any) => q.eq("listId", list._id))
          .collect();
        const lidlCount = items.filter((i: any) => i.store === "lidl" && !i.done).length;
        const ahCount = items.filter((i: any) => i.store === "ah" && !i.done).length;
        const totalCount = items.length;
        return { ...list, groupName, lidlCount, ahCount, totalCount, isOwner: list.ownerId === userId };
      })
    );

    return enriched;
  },
});

export const getList = query({
  args: { listId: v.id("lists") },
  handler: async (ctx, { listId }) => {
    const { list, userId } = await canAccessList(ctx, listId);
    const group = list.groupId ? await ctx.db.get(list.groupId) : null;
    const groupName = group && "name" in group ? group.name : null;
    return { ...list, groupName, isOwner: list.ownerId === userId };
  },
});

export const createList = mutation({
  args: {
    name: v.string(),
    groupId: v.optional(v.id("groups")),
  },
  handler: async (ctx, { name, groupId }) => {
    const userId = await requireAuth(ctx);

    if (groupId) {
      const membership = await ctx.db
        .query("groupMembers")
        .withIndex("by_group_user", (q) =>
          q.eq("groupId", groupId).eq("userId", userId)
        )
        .first();
      if (!membership) throw new Error("Not a member of that group");
    }

    return await ctx.db.insert("lists", {
      ownerId: userId,
      name: name.trim(),
      groupId,
      createdAt: Date.now(),
    });
  },
});

export const setStores = mutation({
  args: { listId: v.id("lists"), stores: v.array(v.string()) },
  handler: async (ctx, { listId, stores }) => {
    await canAccessList(ctx, listId);
    // Normalise: trim, drop blanks, dedupe (case-insensitive, keep first form)
    const seen = new Set<string>();
    const cleaned: string[] = [];
    for (const s of stores) {
      const t = s.trim();
      const key = t.toLowerCase();
      if (t && !seen.has(key)) {
        seen.add(key);
        cleaned.push(t);
      }
    }
    await ctx.db.patch(listId, { stores: cleaned });
  },
});

export const renameList = mutation({
  args: { listId: v.id("lists"), name: v.string() },
  handler: async (ctx, { listId, name }) => {
    const { list, userId } = await canAccessList(ctx, listId);
    if (list.ownerId !== userId) throw new Error("Only the owner can rename");
    await ctx.db.patch(listId, { name: name.trim() });
  },
});

export const deleteList = mutation({
  args: { listId: v.id("lists") },
  handler: async (ctx, { listId }) => {
    const { list, userId } = await canAccessList(ctx, listId);
    if (list.ownerId !== userId) throw new Error("Only the owner can delete");
    const items = await ctx.db
      .query("items")
      .withIndex("by_list", (q: any) => q.eq("listId", listId))
      .collect();
    await Promise.all(items.map((i: any) => ctx.db.delete(i._id)));
    await ctx.db.delete(listId);
  },
});

export const shareListWithGroup = mutation({
  args: { listId: v.id("lists"), groupId: v.id("groups") },
  handler: async (ctx, { listId, groupId }) => {
    const { list, userId } = await canAccessList(ctx, listId);
    if (list.ownerId !== userId) throw new Error("Only the owner can share");
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", groupId).eq("userId", userId)
      )
      .first();
    if (!membership) throw new Error("Not a member of that group");
    await ctx.db.patch(listId, { groupId });
  },
});

export const unshareList = mutation({
  args: { listId: v.id("lists") },
  handler: async (ctx, { listId }) => {
    const { list, userId } = await canAccessList(ctx, listId);
    if (list.ownerId !== userId) throw new Error("Only the owner can unshare");
    await ctx.db.patch(listId, { groupId: undefined });
  },
});
