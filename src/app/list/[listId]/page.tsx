"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { useList } from "@/hooks/useList";
import { useItems } from "@/hooks/useItems";
import { useGroups } from "@/hooks/useGroups";
import { StoreTabs } from "@/components/StoreTabs";
import { AddItemInput } from "@/components/AddItemInput";
import { ItemCard } from "@/components/ItemCard";
import { ItemCardGrid } from "@/components/ItemCardGrid";
import { ListFooter } from "@/components/ListFooter";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";
import { ShareSheet } from "@/components/ShareSheet";
import { Store } from "@/types";
import { Id } from "../../../../convex/_generated/dataModel";

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

export default function ListPage() {
  const router = useRouter();
  const params = useParams();
  const listId = params.listId as Id<"lists">;

  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const [activeStore, setActiveStore] = useState<Store>("lidl");
  const [view, setView] = useState<ViewMode>("grid");
  const [shareOpen, setShareOpen] = useState(false);

  const { list, isLoading: listLoading } = useList(isAuthenticated ? listId : null);
  const { items, isLoading: itemsLoading, addItem, deleteItem, toggleDone, changeQty, clearDone, resetList } =
    useItems(isAuthenticated ? listId : null, activeStore);
  const { groups } = useGroups();

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

  // Count unchecked items per store for badges
  const lidlUnchecked = activeStore === "lidl" ? items.filter((i) => !i.done).length : 0;
  const ahUnchecked = activeStore === "ah" ? items.filter((i) => !i.done).length : 0;

  const doneCount = items.filter((i) => i.done).length;
  const totalCount = items.length;
  const isLoading = listLoading || itemsLoading;

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-warm-bg dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-warm-bg dark:bg-gray-950 pt-safe">
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-warm-card dark:bg-gray-900 shadow-card flex items-center justify-center flex-shrink-0"
            aria-label="Back"
          >
            <svg className="w-4 h-4 text-warm-text dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 className="flex-1 text-lg font-extrabold text-warm-text dark:text-gray-100 truncate">
            {listLoading ? "…" : list?.name ?? "List"}
          </h1>

          <ViewToggle view={view} onChange={handleViewChange} />

          <button
            onClick={() => setShareOpen(true)}
            className="w-9 h-9 rounded-xl bg-warm-card dark:bg-gray-900 shadow-card flex items-center justify-center flex-shrink-0"
            aria-label="Share"
          >
            <svg className="w-4 h-4 text-warm-text dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>

        <StoreTabs
          activeStore={activeStore}
          onSwitch={setActiveStore}
          lidlCount={lidlUnchecked}
          ahCount={ahUnchecked}
        />
        <AddItemInput onAdd={(name) => addItem(name, activeStore)} store={activeStore} />
      </header>

      {/* Items */}
      <main className="flex-1 overflow-y-auto scroll-smooth pb-2">
        {isLoading ? (
          view === "grid" ? <SkeletonGrid /> : <SkeletonList />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-20 h-20 rounded-3xl bg-warm-card dark:bg-gray-900 shadow-card flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-warm-muted dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-warm-text dark:text-gray-300">Nothing here yet</p>
            <p className="text-xs text-warm-subtle dark:text-gray-500 mt-1">
              Add items to your {activeStore === "lidl" ? "Lidl" : "Albert Heijn"} list
            </p>
          </div>
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
            onResetList={resetList}
          />
        </footer>
      )}

      {list && (
        <ShareSheet
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          listId={listId}
          listName={list.name}
          currentGroupId={list.groupId}
          currentGroupName={list.groupName}
          groups={groups}
          isOwner={list.isOwner}
        />
      )}
    </div>
  );
}
