import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  lists: defineTable({
    userId: v.string(),
    store: v.union(v.literal("lidl"), v.literal("ah")),
    name: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  items: defineTable({
    listId: v.id("lists"),
    name: v.string(),
    qty: v.number(),
    done: v.boolean(),
    imgUrl: v.optional(v.string()),
    imgStatus: v.union(
      v.literal("idle"),
      v.literal("loading"),
      v.literal("done"),
      v.literal("error")
    ),
    note: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_list", ["listId"])
    .index("by_list_done", ["listId", "done"]),

  imgCache: defineTable({
    productName: v.string(),
    imgUrl: v.optional(v.string()),
    fetchedAt: v.number(),
  }).index("by_name", ["productName"]),
});
