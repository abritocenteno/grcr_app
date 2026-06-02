import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function requireAuth(ctx: { auth: { getUserIdentity: () => Promise<{ subject: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  return identity.subject;
}

async function requireGroupOwner(ctx: any, groupId: any) {
  const userId = await requireAuth(ctx);
  const group = await ctx.db.get(groupId);
  if (!group) throw new Error("Group not found");
  if (group.ownerId !== userId) throw new Error("Forbidden");
  return userId;
}

export const createGroup = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const userId = await requireAuth(ctx);
    const now = Date.now();
    const groupId = await ctx.db.insert("groups", {
      name: name.trim(),
      ownerId: userId,
      createdAt: now,
    });
    await ctx.db.insert("groupMembers", {
      groupId,
      userId,
      role: "owner",
      joinedAt: now,
    });
    return groupId;
  },
});

export const getUserGroups = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const groups = await Promise.all(memberships.map((m) => ctx.db.get(m.groupId)));
    return groups.filter(Boolean).sort((a, b) => (b?.createdAt ?? 0) - (a?.createdAt ?? 0));
  },
});

export const getGroupMembers = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, { groupId }) => {
    await requireAuth(ctx);
    return await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", groupId))
      .collect();
  },
});

export const createInviteToken = mutation({
  args: { groupId: v.id("groups") },
  handler: async (ctx, { groupId }) => {
    const userId = await requireAuth(ctx);
    const group = await ctx.db.get(groupId);
    if (!group) throw new Error("Group not found");
    // Only members can invite
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) => q.eq("groupId", groupId).eq("userId", userId))
      .first();
    if (!membership) throw new Error("Forbidden");

    const existing = await ctx.db
      .query("groupInvites")
      .filter((q) => q.eq(q.field("groupId"), groupId))
      .first();

    if (existing) return existing.token;

    const token = crypto.randomUUID();
    await ctx.db.insert("groupInvites", {
      groupId,
      token,
      createdAt: Date.now(),
    });
    return token;
  },
});

export const getGroupByToken = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const invite = await ctx.db
      .query("groupInvites")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();
    if (!invite) return null;
    const group = await ctx.db.get(invite.groupId);
    if (!group) return null;
    const memberCount = (
      await ctx.db
        .query("groupMembers")
        .withIndex("by_group", (q) => q.eq("groupId", invite.groupId))
        .collect()
    ).length;
    return { ...group, memberCount };
  },
});

export const joinByToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const userId = await requireAuth(ctx);
    const invite = await ctx.db
      .query("groupInvites")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();
    if (!invite) throw new Error("Invalid invite link");

    const existing = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) =>
        q.eq("groupId", invite.groupId).eq("userId", userId)
      )
      .first();
    if (existing) return invite.groupId; // already a member, idempotent

    await ctx.db.insert("groupMembers", {
      groupId: invite.groupId,
      userId,
      role: "member",
      joinedAt: Date.now(),
    });
    return invite.groupId;
  },
});

export const leaveGroup = mutation({
  args: { groupId: v.id("groups") },
  handler: async (ctx, { groupId }) => {
    const userId = await requireAuth(ctx);
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_user", (q) => q.eq("groupId", groupId).eq("userId", userId))
      .first();
    if (!membership) throw new Error("Not a member");
    if (membership.role === "owner") throw new Error("Owner cannot leave; delete the group instead");
    await ctx.db.delete(membership._id);
  },
});
