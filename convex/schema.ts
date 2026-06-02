import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  lists: defineTable({
    ownerId: v.string(),
    name: v.string(),
    groupId: v.optional(v.id("groups")),
    createdAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_group", ["groupId"]),

  items: defineTable({
    listId: v.id("lists"),
    store: v.union(v.literal("lidl"), v.literal("ah")),
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
    .index("by_list_done", ["listId", "done"])
    .index("by_list_store", ["listId", "store"]),

  groups: defineTable({
    name: v.string(),
    ownerId: v.string(),
    createdAt: v.number(),
  }).index("by_owner", ["ownerId"]),

  groupMembers: defineTable({
    groupId: v.id("groups"),
    userId: v.string(),
    role: v.union(v.literal("owner"), v.literal("member")),
    joinedAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_group_user", ["groupId", "userId"]),

  groupInvites: defineTable({
    groupId: v.id("groups"),
    token: v.string(),
    createdAt: v.number(),
  }).index("by_token", ["token"]),

  imgCache: defineTable({
    productName: v.string(),
    imgUrl: v.optional(v.string()),
    fetchedAt: v.number(),
  }).index("by_name", ["productName"]),
});
