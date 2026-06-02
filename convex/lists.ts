import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function requireAuth(ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  return identity.subject;
}

export const getUserLists = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const lists = await ctx.db
      .query("lists")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const lidl = lists.find((l) => l.store === "lidl");
    const ah = lists.find((l) => l.store === "ah");
    return {
      lidl: lidl?._id ?? null,
      ah: ah?._id ?? null,
    };
  },
});

export const ensureUserLists = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const lists = await ctx.db
      .query("lists")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    let lidlId = lists.find((l) => l.store === "lidl")?._id;
    let ahId = lists.find((l) => l.store === "ah")?._id;
    const now = Date.now();

    if (!lidlId) {
      lidlId = await ctx.db.insert("lists", {
        userId,
        store: "lidl",
        name: "Lidl",
        createdAt: now,
      });
    }
    if (!ahId) {
      ahId = await ctx.db.insert("lists", {
        userId,
        store: "ah",
        name: "Albert Heijn",
        createdAt: now,
      });
    }
    return { lidl: lidlId, ah: ahId };
  },
});
