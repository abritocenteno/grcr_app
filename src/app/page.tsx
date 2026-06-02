"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { useGroceryLists } from "@/hooks/useGroceryLists";
import { useItems } from "@/hooks/useItems";
import { StoreTabs } from "@/components/StoreTabs";
import { AddItemInput } from "@/components/AddItemInput";
import { ItemCard } from "@/components/ItemCard";
import { ListFooter } from "@/components/ListFooter";
import { Store } from "@/types";
import { Id } from "../../convex/_generated/dataModel";

function SkeletonCard() {
  return (
    <div className="flex items-center gap-3 px-3 py-3 border-b border-gray-100 dark:border-gray-800">
      <div className="w-[52px] h-[52px] rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-1/4" />
      </div>
    </div>
  );
}

export default function Home() {
  const [activeStore, setActiveStore] = useState<Store>("lidl");
  const { lidlListId, ahListId, isLoading: listsLoading } = useGroceryLists();

  const activeListId = activeStore === "lidl" ? lidlListId : ahListId;
  const lidlItems = useItems(lidlListId);
  const ahItems = useItems(ahListId);

  const activeListHook = activeStore === "lidl" ? lidlItems : ahItems;
  const { items, isLoading: itemsLoading, addItem, deleteItem, toggleDone, changeQty, clearDone } =
    activeListHook;

  const doneCount = items.filter((i) => i.done).length;
  const totalCount = items.length;

  const lidlUnchecked = lidlItems.items.filter((i) => !i.done).length;
  const ahUnchecked = ahItems.items.filter((i) => !i.done).length;

  const isLoading = listsLoading || (activeListId !== null && itemsLoading);

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white dark:bg-gray-950">
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 safe-top">
        <div className="flex items-center justify-between px-3 pt-3 pb-1">
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Groceries</h1>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
        <StoreTabs
          activeStore={activeStore}
          onSwitch={setActiveStore}
          lidlCount={lidlUnchecked}
          ahCount={ahUnchecked}
        />
        <AddItemInput onAdd={addItem} store={activeStore} />
      </header>

      <main className="flex-1 overflow-y-auto scroll-smooth">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-sm">Your list is empty</p>
            <p className="text-xs mt-1">Add your first item above</p>
          </div>
        ) : (
          items.map((item) => (
            <ItemCard
              key={item._id}
              item={item}
              store={activeStore}
              onToggle={(id: Id<"items">) => toggleDone(id)}
              onDelete={(id: Id<"items">) => deleteItem(id)}
              onQtyChange={(id: Id<"items">, delta: -1 | 1) => changeQty(id, delta)}
            />
          ))
        )}
      </main>

      {!isLoading && (
        <footer className="sticky bottom-0 bg-white dark:bg-gray-950 pb-[env(safe-area-inset-bottom)]">
          <ListFooter
            doneCount={doneCount}
            totalCount={totalCount}
            onClearDone={clearDone}
          />
        </footer>
      )}
    </div>
  );
}
