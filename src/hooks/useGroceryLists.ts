"use client";

import { useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useGroceryLists(): {
  lidlListId: Id<"lists"> | null;
  ahListId: Id<"lists"> | null;
  isLoading: boolean;
} {
  const lists = useQuery(api.lists.getUserLists);
  const ensureLists = useMutation(api.lists.ensureUserLists);

  useEffect(() => {
    ensureLists();
  }, [ensureLists]);

  if (lists === undefined) {
    return { lidlListId: null, ahListId: null, isLoading: true };
  }

  return {
    lidlListId: lists.lidl,
    ahListId: lists.ah,
    isLoading: false,
  };
}
