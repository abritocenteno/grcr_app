import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

async function requireAuth(ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  return identity.subject;
}

async function verifyListOwnership(
  ctx: { db: any; auth: { getUserIdentity: () => Promise<{ subject: string } | null> } },
  listId: Id<"lists">
) {
  const userId = await requireAuth(ctx);
  const list = await ctx.db.get(listId);
  if (!list || list.userId !== userId) throw new Error("Forbidden");
  return userId;
}

async function verifyItemOwnership(
  ctx: { db: any; auth: { getUserIdentity: () => Promise<{ subject: string } | null> } },
  itemId: Id<"items">
) {
  const item = await ctx.db.get(itemId);
  if (!item) throw new Error("Item not found");
  await verifyListOwnership(ctx, item.listId);
  return item;
}

export const getItems = query({
  args: { listId: v.id("lists") },
  handler: async (ctx, { listId }) => {
    await verifyListOwnership(ctx, listId);
    return await ctx.db
      .query("items")
      .withIndex("by_list", (q: any) => q.eq("listId", listId))
      .order("desc")
      .collect();
  },
});

export const addItem = mutation({
  args: { listId: v.id("lists"), name: v.string() },
  handler: async (ctx, { listId, name }) => {
    await verifyListOwnership(ctx, listId);
    return await ctx.db.insert("items", {
      listId,
      name: name.trim(),
      qty: 1,
      done: false,
      imgStatus: "idle",
      createdAt: Date.now(),
    });
  },
});

export const deleteItem = mutation({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }) => {
    await verifyItemOwnership(ctx, itemId);
    await ctx.db.delete(itemId);
  },
});

export const toggleDone = mutation({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }) => {
    const item = await verifyItemOwnership(ctx, itemId);
    await ctx.db.patch(itemId, { done: !item.done });
  },
});

export const changeQty = mutation({
  args: { itemId: v.id("items"), delta: v.union(v.literal(-1), v.literal(1)) },
  handler: async (ctx, { itemId, delta }) => {
    const item = await verifyItemOwnership(ctx, itemId);
    const newQty = Math.max(1, item.qty + delta);
    await ctx.db.patch(itemId, { qty: newQty });
  },
});

export const updateImgUrl = mutation({
  args: {
    itemId: v.id("items"),
    imgUrl: v.optional(v.string()),
    imgStatus: v.union(
      v.literal("idle"),
      v.literal("loading"),
      v.literal("done"),
      v.literal("error")
    ),
  },
  handler: async (ctx, { itemId, imgUrl, imgStatus }) => {
    await verifyItemOwnership(ctx, itemId);
    await ctx.db.patch(itemId, { imgUrl, imgStatus });
  },
});

export const clearDone = mutation({
  args: { listId: v.id("lists") },
  handler: async (ctx, { listId }) => {
    await verifyListOwnership(ctx, listId);
    const doneItems = await ctx.db
      .query("items")
      .withIndex("by_list_done", (q: any) => q.eq("listId", listId).eq("done", true))
      .collect();
    await Promise.all(doneItems.map((item: { _id: Id<"items"> }) => ctx.db.delete(item._id)));
  },
});
