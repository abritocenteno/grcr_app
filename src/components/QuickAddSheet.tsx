"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { BottomSheet } from "./BottomSheet";
import { GroceryList, Store } from "@/types";
import type { SuggestionItem } from "./SuggestionsSection";

interface QuickAddSheetProps {
  item: SuggestionItem | null;
  lists: GroceryList[];
  onClose: () => void;
}

const STORE_LABEL: Record<Store, string> = { lidl: "Lidl", ah: "Albert Heijn" };
const STORE_ACTIVE: Record<Store, string> = {
  lidl: "bg-lidl text-white",
  ah: "bg-ah text-white",
};
const STORE_IDLE: Record<Store, string> = {
  lidl: "border border-warm-muted dark:border-gray-700 text-warm-subtle dark:text-gray-400",
  ah: "border border-warm-muted dark:border-gray-700 text-warm-subtle dark:text-gray-400",
};

export function QuickAddSheet({ item, lists, onClose }: QuickAddSheetProps) {
  const [name, setName] = useState("");
  const [store, setStore] = useState<Store>("ah");
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const addItem = useMutation(api.items.addItem);

  // Reset state when item changes
  useEffect(() => {
    if (item) {
      setName(item.name);
      setAdding(false);
      // Default to most recently created list
      if (lists.length > 0) setSelectedListId(lists[0]._id);
    }
  }, [item, lists]);

  async function handleAdd() {
    if (!name.trim() || !selectedListId) return;
    setAdding(true);
    try {
      await addItem({
        listId: selectedListId as any,
        name: name.trim(),
        store,
      });
      onClose();
    } catch {
      setAdding(false);
    }
  }

  const isOpen = item !== null;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Add to list">
      <div className="space-y-5">
        {/* Product preview */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-warm-bg dark:bg-gray-800 flex-shrink-0 overflow-hidden flex items-center justify-center">
            {item?.imgUrl ? (
              <Image
                src={item.imgUrl}
                alt={item.name}
                width={56}
                height={56}
                className="object-contain w-full h-full"
                unoptimized
              />
            ) : (
              <svg className="w-7 h-7 text-warm-muted dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M6 5.25h12A2.25 2.25 0 0120.25 7.5v9A2.25 2.25 0 0118 18.75H6A2.25 2.25 0 013.75 16.5v-9A2.25 2.25 0 016 5.25z" />
              </svg>
            )}
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={[
              "flex-1 min-h-[44px] px-3 rounded-xl text-sm font-semibold",
              "bg-warm-bg dark:bg-gray-800 text-warm-text dark:text-gray-100",
              "border-0 focus:outline-none focus:ring-2 focus:ring-warm-text/20",
            ].join(" ")}
          />
        </div>

        {/* Store selector */}
        <div>
          <p className="text-xs font-semibold text-warm-subtle dark:text-gray-500 uppercase tracking-wide mb-2">
            Store
          </p>
          <div className="flex gap-2">
            {(["ah", "lidl"] as Store[]).map((s) => (
              <button
                key={s}
                onClick={() => setStore(s)}
                className={[
                  "flex-1 h-11 rounded-xl text-sm font-semibold transition-all",
                  store === s ? STORE_ACTIVE[s] : STORE_IDLE[s],
                ].join(" ")}
              >
                {STORE_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        {/* List selector */}
        <div>
          <p className="text-xs font-semibold text-warm-subtle dark:text-gray-500 uppercase tracking-wide mb-2">
            List
          </p>
          {lists.length === 0 ? (
            <p className="text-sm text-warm-subtle dark:text-gray-500 py-2">
              No lists yet — create one first
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {lists.map((list) => (
                <button
                  key={list._id}
                  onClick={() => setSelectedListId(list._id)}
                  className={[
                    "flex items-center gap-3 w-full p-3 rounded-2xl text-left transition-all",
                    selectedListId === list._id
                      ? "bg-warm-text dark:bg-gray-100 text-warm-card dark:text-gray-900"
                      : "bg-warm-bg dark:bg-gray-800 text-warm-text dark:text-gray-100",
                  ].join(" ")}
                >
                  <svg
                    className={[
                      "w-4 h-4 flex-shrink-0",
                      selectedListId === list._id ? "opacity-100" : "opacity-40",
                    ].join(" ")}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{list.name}</p>
                    {list.groupName && (
                      <p className={[
                        "text-xs mt-0.5",
                        selectedListId === list._id ? "opacity-70" : "text-warm-subtle dark:text-gray-500",
                      ].join(" ")}>
                        {list.groupName}
                      </p>
                    )}
                  </div>
                  {selectedListId === list._id && (
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Add button */}
        <button
          onClick={handleAdd}
          disabled={!name.trim() || !selectedListId || adding}
          className={[
            "w-full h-14 rounded-2xl font-bold text-sm",
            "bg-warm-text dark:bg-gray-100 text-warm-card dark:text-gray-900",
            "transition-all duration-150 active:scale-[0.98]",
            "disabled:opacity-40 disabled:cursor-not-allowed",
          ].join(" ")}
        >
          {adding ? "Adding…" : "Add to list"}
        </button>
      </div>
    </BottomSheet>
  );
}
