"use client";

import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { GroceryItem, Store } from "@/types";

export function useItems(listId: Id<"lists"> | null, store?: Store) {
  const { isAuthenticated } = useConvexAuth();

  const items = useQuery(
    api.items.getItems,
    isAuthenticated && listId ? { listId, store } : "skip"
  ) as GroceryItem[] | undefined;

  const addItemMutation = useMutation(api.items.addItem);
  const deleteItemMutation = useMutation(api.items.deleteItem);
  const toggleDoneMutation = useMutation(api.items.toggleDone);
  const changeQtyMutation = useMutation(api.items.changeQty);
  const clearDoneMutation = useMutation(api.items.clearDone);

  return {
    items: items ?? [],
    isLoading: items === undefined,
    addItem: (name: string, itemStore: Store) =>
      listId ? addItemMutation({ listId, name, store: itemStore }) : Promise.resolve(null),
    deleteItem: (itemId: Id<"items">) => deleteItemMutation({ itemId }),
    toggleDone: (itemId: Id<"items">) => toggleDoneMutation({ itemId }),
    changeQty: (itemId: Id<"items">, delta: -1 | 1) => changeQtyMutation({ itemId, delta }),
    clearDone: () => listId ? clearDoneMutation({ listId }) : Promise.resolve(null),
  };
}
