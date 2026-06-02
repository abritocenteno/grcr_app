"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { useGroceryLists } from "@/hooks/useGroceryLists";
import { useItems } from "@/hooks/useItems";
import { StoreTabs } from "@/components/StoreTabs";
import { AddItemInput } from "@/components/AddItemInput";
import { ItemCard } from "@/components/ItemCard";
import { ItemCardGrid } from "@/components/ItemCardGrid";
import { ListFooter } from "@/components/ListFooter";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";
import { Store } from "@/types";
import { Id } from "../../convex/_generated/dataModel";

function SkeletonList() {
  return (
    <div className="px-3 pt-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 mb-2.5 p-3 rounded-2xl bg-warm-card dark:bg-gray-900 shadow-card">
          <div className="w-[52px] h-[52px] rounded-xl bg-warm-bg dark:bg-gray-800 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-warm-bg dark:bg-gray-800 rounded-full animate-pulse w-3/4" />
            <div className="h-3 bg-warm-bg dark:bg-gray-800 rounded-full animate-pulse w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 px-3 pt-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl bg-warm-card dark:bg-gray-900 shadow-card overflow-hidden">
          <div className="aspect-square bg-warm-bg dark:bg-gray-800 animate-pulse" />
          <div className="p-2.5 space-y-2">
            <div className="h-3 bg-warm-bg dark:bg-gray-800 rounded-full animate-pulse w-3/4" />
            <div className="h-3 bg-warm-bg dark:bg-gray-800 rounded-full animate-pulse w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-20 h-20 rounded-3xl bg-warm-card dark:bg-gray-900 shadow-card flex items-center justify-center mb-4">
        <svg className="w-10 h-10 text-warm-muted dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-warm-text dark:text-gray-300">Your list is empty</p>
      <p className="text-xs text-warm-subtle dark:text-gray-500 mt-1">Add your first item above</p>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const [activeStore, setActiveStore] = useState<Store>("lidl");
  const [view, setView] = useState<ViewMode>("grid");

  // All hooks before any conditional returns
  const { lidlListId, ahListId, isLoading: listsLoading } = useGroceryLists();
  const lidlItems = useItems(lidlListId);
  const ahItems = useItems(ahListId);

  // Persist view preference
  useEffect(() => {
    const saved = localStorage.getItem("grocery-view") as ViewMode | null;
    if (saved === "list" || saved === "grid") setView(saved);
  }, []);

  function handleViewChange(v: ViewMode) {
    setView(v);
    localStorage.setItem("grocery-view", v);
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/sign-in");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-warm-bg dark:bg-gray-950">
        <div className="w-8 h-8 border-2 border-warm-muted border-t-warm-subtle rounded-full animate-spin" />
      </div>
    );
  }

  const activeListId = activeStore === "lidl" ? lidlListId : ahListId;
  const activeListHook = activeStore === "lidl" ? lidlItems : ahItems;
  const { items, isLoading: itemsLoading, addItem, deleteItem, toggleDone, changeQty, clearDone } =
    activeListHook;

  const doneCount = items.filter((i) => i.done).length;
  const totalCount = items.length;
  const lidlUnchecked = lidlItems.items.filter((i) => !i.done).length;
  const ahUnchecked = ahItems.items.filter((i) => !i.done).length;
  const isLoading = listsLoading || (activeListId !== null && itemsLoading);

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-warm-bg dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-warm-bg dark:bg-gray-950 pt-safe">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h1 className="text-2xl font-extrabold text-warm-text dark:text-gray-100 tracking-tight">
            Groceries
          </h1>
          <div className="flex items-center gap-2">
            <ViewToggle view={view} onChange={handleViewChange} />
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>

        <StoreTabs
          activeStore={activeStore}
          onSwitch={setActiveStore}
          lidlCount={lidlUnchecked}
          ahCount={ahUnchecked}
        />
        <AddItemInput onAdd={addItem} store={activeStore} />
      </header>

      {/* List */}
      <main className="flex-1 overflow-y-auto scroll-smooth pb-2">
        {isLoading ? (
          view === "grid" ? <SkeletonGrid /> : <SkeletonList />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 gap-3 px-3 pt-2">
            {items.map((item) => (
              <ItemCardGrid
                key={item._id}
                item={item}
                store={activeStore}
                onToggle={(id: Id<"items">) => toggleDone(id)}
                onDelete={(id: Id<"items">) => deleteItem(id)}
                onQtyChange={(id: Id<"items">, delta: -1 | 1) => changeQty(id, delta)}
              />
            ))}
          </div>
        ) : (
          <div className="pt-2">
            {items.map((item) => (
              <ItemCard
                key={item._id}
                item={item}
                store={activeStore}
                onToggle={(id: Id<"items">) => toggleDone(id)}
                onDelete={(id: Id<"items">) => deleteItem(id)}
                onQtyChange={(id: Id<"items">, delta: -1 | 1) => changeQty(id, delta)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      {!isLoading && (
        <footer className="sticky bottom-0 bg-warm-bg dark:bg-gray-950 pb-[env(safe-area-inset-bottom)]">
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
