"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useGroceryLists(): {
  lidlListId: Id<"lists"> | null;
  ahListId: Id<"lists"> | null;
  isLoading: boolean;
} {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const lists = useQuery(api.lists.getUserLists, isAuthenticated ? {} : "skip");
  const ensureLists = useMutation(api.lists.ensureUserLists);

  useEffect(() => {
    if (isAuthenticated) ensureLists();
  }, [isAuthenticated, ensureLists]);

  if (authLoading || lists === undefined) {
    return { lidlListId: null, ahListId: null, isLoading: true };
  }

  return {
    lidlListId: lists.lidl,
    ahListId: lists.ah,
    isLoading: false,
  };
}
