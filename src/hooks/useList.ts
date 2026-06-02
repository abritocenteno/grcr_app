"use client";

import { useQuery, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useList(listId: Id<"lists"> | null) {
  const { isAuthenticated } = useConvexAuth();
  const list = useQuery(
    api.lists.getList,
    isAuthenticated && listId ? { listId } : "skip"
  );
  return { list: list ?? null, isLoading: list === undefined };
}
