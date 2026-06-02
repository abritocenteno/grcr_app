"use client";

import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { GroceryList } from "@/types";

export function useLists() {
  const { isAuthenticated } = useConvexAuth();
  const router = useRouter();
  const lists = useQuery(api.lists.getUserLists, isAuthenticated ? {} : "skip") as GroceryList[] | undefined;
  const createListMutation = useMutation(api.lists.createList);
  const deleteListMutation = useMutation(api.lists.deleteList);

  async function createList(name: string, groupId?: Id<"groups">) {
    const listId = await createListMutation({ name, groupId });
    router.push(`/list/${listId}`);
    return listId;
  }

  return {
    lists: lists ?? [],
    isLoading: lists === undefined,
    createList,
    deleteList: (listId: Id<"lists">) => deleteListMutation({ listId }),
  };
}
