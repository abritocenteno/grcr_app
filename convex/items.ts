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

  if (list.ownerId === userId) return userId;

  if (list.groupId) {
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q: any) =>
        q.eq("groupId", list.groupId).eq("userId", userId)
      )
      .first();
    if (membership) return userId;
  }

  throw new Error("Forbidden");
}

async function canAccessItem(ctx: any, itemId: Id<"items">) {
  const item = await ctx.db.get(itemId);
  if (!item) throw new Error("Item not found");
  await canAccessList(ctx, item.listId);
  return item;
}

export const getItems = query({
  args: { listId: v.id("lists") },
  handler: async (ctx, { listId }) => {
    await canAccessList(ctx, listId);
    return await ctx.db
      .query("items")
      .withIndex("by_list", (q: any) => q.eq("listId", listId))
      .order("desc")
      .collect();
  },
});

export const addItem = mutation({
  args: {
    listId: v.id("lists"),
    name: v.string(),
    store: v.string(),
    imgUrl: v.optional(v.string()), // exact image when picked from a search result
  },
  handler: async (ctx, { listId, name, store, imgUrl }) => {
    await canAccessList(ctx, listId);
    // If the caller already knows the image (picked a specific product), store
    // it directly as "done" so we don't re-derive a possibly-wrong image from
    // the name. Typed-in items have no image yet → "idle" triggers a lookup.
    const hasImg = typeof imgUrl === "string" && imgUrl.trim() !== "";
    return await ctx.db.insert("items", {
      listId,
      store,
      name: name.trim(),
      qty: 1,
      done: false,
      imgUrl: hasImg ? imgUrl : undefined,
      imgStatus: hasImg ? "done" : "idle",
      createdAt: Date.now(),
    });
  },
});

export const deleteItem = mutation({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }) => {
    await canAccessItem(ctx, itemId);
    await ctx.db.delete(itemId);
  },
});

export const toggleDone = mutation({
  args: { itemId: v.id("items") },
  handler: async (ctx, { itemId }) => {
    const item = await canAccessItem(ctx, itemId);
    await ctx.db.patch(itemId, { done: !item.done });
  },
});

export const deleteByStore = mutation({
  args: { listId: v.id("lists"), store: v.string() },
  handler: async (ctx, { listId, store }) => {
    await canAccessList(ctx, listId);
    const key = store.toLowerCase().trim();
    const items = await ctx.db
      .query("items")
      .withIndex("by_list", (q: any) => q.eq("listId", listId))
      .collect();
    const toDelete = items.filter((i: any) => i.store.toLowerCase().trim() === key);
    await Promise.all(toDelete.map((i: any) => ctx.db.delete(i._id)));
    return toDelete.length;
  },
});

export const changeQty = mutation({
  args: { itemId: v.id("items"), delta: v.union(v.literal(-1), v.literal(1)) },
  handler: async (ctx, { itemId, delta }) => {
    const item = await canAccessItem(ctx, itemId);
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
    await canAccessItem(ctx, itemId);
    await ctx.db.patch(itemId, { imgUrl, imgStatus });
  },
});

export const clearDone = mutation({
  args: { listId: v.id("lists") },
  handler: async (ctx, { listId }) => {
    await canAccessList(ctx, listId);
    const doneItems = await ctx.db
      .query("items")
      .withIndex("by_list_done", (q: any) => q.eq("listId", listId).eq("done", true))
      .collect();
    await Promise.all(doneItems.map((item: { _id: Id<"items"> }) => ctx.db.delete(item._id)));
  },
});

export const resetList = mutation({
  args: { listId: v.id("lists") },
  handler: async (ctx, { listId }) => {
    await canAccessList(ctx, listId);
    const doneItems = await ctx.db
      .query("items")
      .withIndex("by_list_done", (q: any) => q.eq("listId", listId).eq("done", true))
      .collect();
    await Promise.all(
      doneItems.map((item: { _id: Id<"items"> }) =>
        ctx.db.patch(item._id, { done: false })
      )
    );
  },
});
