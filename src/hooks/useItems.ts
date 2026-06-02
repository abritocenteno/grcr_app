"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { GroceryItem } from "@/types";

export function useItems(listId: Id<"lists"> | null) {
  const items = useQuery(
    api.items.getItems,
    listId ? { listId } : "skip"
  ) as GroceryItem[] | undefined;

  const addItemMutation = useMutation(api.items.addItem);
  const deleteItemMutation = useMutation(api.items.deleteItem);
  const toggleDoneMutation = useMutation(api.items.toggleDone);
  const changeQtyMutation = useMutation(api.items.changeQty);
  const clearDoneMutation = useMutation(api.items.clearDone);

  return {
    items: items ?? [],
    isLoading: items === undefined,
    addItem: (name: string) => listId && addItemMutation({ listId, name }),
    deleteItem: (itemId: Id<"items">) => deleteItemMutation({ itemId }),
    toggleDone: (itemId: Id<"items">) => toggleDoneMutation({ itemId }),
    changeQty: (itemId: Id<"items">, delta: -1 | 1) =>
      changeQtyMutation({ itemId, delta }),
    clearDone: () => listId && clearDoneMutation({ listId }),
  };
}
