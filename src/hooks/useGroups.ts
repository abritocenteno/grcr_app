"use client";

import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Group } from "@/types";

export function useGroups() {
  const { isAuthenticated } = useConvexAuth();
  const groups = useQuery(api.groups.getUserGroups, isAuthenticated ? {} : "skip") as Group[] | undefined;
  const createGroupMutation = useMutation(api.groups.createGroup);
  const createInviteTokenMutation = useMutation(api.groups.createInviteToken);
  const joinByTokenMutation = useMutation(api.groups.joinByToken);
  const leaveGroupMutation = useMutation(api.groups.leaveGroup);

  return {
    groups: groups ?? [],
    isLoading: groups === undefined,
    createGroup: (name: string) => createGroupMutation({ name }),
    createInviteToken: (groupId: Id<"groups">) => createInviteTokenMutation({ groupId }),
    joinByToken: (token: string) => joinByTokenMutation({ token }),
    leaveGroup: (groupId: Id<"groups">) => leaveGroupMutation({ groupId }),
  };
}
