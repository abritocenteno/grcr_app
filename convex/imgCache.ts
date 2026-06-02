import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getCached = query({
  args: { productName: v.string() },
  handler: async (ctx, { productName }) => {
    const key = productName.toLowerCase().trim();
    return await ctx.db
      .query("imgCache")
      .withIndex("by_name", (q) => q.eq("productName", key))
      .first();
  },
});

export const setCached = mutation({
  args: { productName: v.string(), imgUrl: v.optional(v.string()) },
  handler: async (ctx, { productName, imgUrl }) => {
    const key = productName.toLowerCase().trim();
    const existing = await ctx.db
      .query("imgCache")
      .withIndex("by_name", (q) => q.eq("productName", key))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { imgUrl, fetchedAt: Date.now() });
    } else {
      await ctx.db.insert("imgCache", { productName: key, imgUrl, fetchedAt: Date.now() });
    }
  },
});
