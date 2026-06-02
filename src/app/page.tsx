"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { useLists } from "@/hooks/useLists";
import { useGroups } from "@/hooks/useGroups";
import { ListCard } from "@/components/ListCard";
import { FAB } from "@/components/FAB";
import { CreateListSheet } from "@/components/CreateListSheet";
import { Id } from "../../convex/_generated/dataModel";

function SkeletonListCard() {
  return (
    <div className="flex items-center gap-4 mx-4 mb-3 p-4 rounded-2xl bg-warm-card dark:bg-gray-900 shadow-card">
      <div className="w-12 h-12 rounded-2xl bg-warm-bg dark:bg-gray-800 animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-warm-bg dark:bg-gray-800 rounded-full animate-pulse w-1/2" />
        <div className="h-3 bg-warm-bg dark:bg-gray-800 rounded-full animate-pulse w-1/3" />
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { lists, isLoading: listsLoading, createList, deleteList } = useLists();
  const { groups } = useGroups();

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

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-warm-bg dark:bg-gray-950">
      {/* Header */}
      <header className="px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-warm-text dark:text-gray-100 tracking-tight">
              Groceries
            </h1>
            <p className="text-sm text-warm-subtle dark:text-gray-500 mt-0.5">
              {lists.length === 0 ? "No lists yet" : `${lists.length} list${lists.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </header>

      {/* Lists */}
      <main className="flex-1 overflow-y-auto pb-28">
        {listsLoading ? (
          <>
            <SkeletonListCard />
            <SkeletonListCard />
          </>
        ) : lists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="w-24 h-24 rounded-3xl bg-warm-card dark:bg-gray-900 shadow-card flex items-center justify-center mb-5">
              <svg className="w-12 h-12 text-warm-muted dark:bg-gray-800 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-base font-bold text-warm-text dark:text-gray-200">No lists yet</p>
            <p className="text-sm text-warm-subtle dark:text-gray-500 mt-1 max-w-[200px]">
              Tap + New list to create your first shopping list
            </p>
          </div>
        ) : (
          lists.map((list) => (
            <ListCard
              key={list._id}
              list={list}
              onDelete={(id: Id<"lists">) => deleteList(id)}
            />
          ))
        )}
      </main>

      <FAB onPress={() => setSheetOpen(true)} />

      <CreateListSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCreate={(name, groupId) => createList(name, groupId)}
        groups={groups}
      />
    </div>
  );
}
