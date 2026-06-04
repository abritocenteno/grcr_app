"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { BottomSheet } from "./BottomSheet";
import { storeLabel } from "@/lib/storeColors";
import type { Suggestion } from "@/app/api/suggestions/route";

interface SearchResultsSheetProps {
  isOpen: boolean;
  query: string;
  store: string;
  onClose: () => void;
  onAdd: (name: string) => void;
}

function PlaceholderIcon() {
  return (
    <svg className="w-8 h-8 text-warm-muted dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.25}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M6 5.25h12A2.25 2.25 0 0120.25 7.5v9A2.25 2.25 0 0118 18.75H6A2.25 2.25 0 013.75 16.5v-9A2.25 2.25 0 016 5.25z" />
    </svg>
  );
}

export function SearchResultsSheet({ isOpen, query, store, onClose, onAdd }: SearchResultsSheetProps) {
  const [results, setResults] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isOpen || !query.trim()) return;
    setAdded(new Set());
    setLoading(true);
    const ctrl = new AbortController();
    fetch(
      `/api/suggestions?q=${encodeURIComponent(query.trim())}&store=${encodeURIComponent(store)}&limit=30`,
      { signal: ctrl.signal }
    )
      .then((r) => r.json())
      .then((d: { suggestions: Suggestion[] }) => setResults(d.suggestions))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [isOpen, query, store]);

  function handleAdd(name: string) {
    if (added.has(name)) return;
    onAdd(name);
    setAdded((prev) => new Set(prev).add(name));
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`${storeLabel(store)} · “${query.trim()}”`}
    >
      <div className="max-h-[68vh] overflow-y-auto -mx-1 px-1">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-warm-bg dark:bg-gray-800 overflow-hidden">
                <div className="aspect-square animate-pulse" />
                <div className="p-2 space-y-1.5">
                  <div className="h-2.5 bg-warm-muted/60 dark:bg-gray-700 rounded-full animate-pulse w-3/4" />
                  <div className="h-2.5 bg-warm-muted/60 dark:bg-gray-700 rounded-full animate-pulse w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-warm-text dark:text-gray-300">No results</p>
            <p className="text-xs text-warm-subtle dark:text-gray-500 mt-1">Try a different search</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-2">
            {results.map((r, i) => {
              const isAdded = added.has(r.name);
              return (
                <button
                  key={i}
                  onClick={() => handleAdd(r.name)}
                  className={[
                    "relative flex flex-col rounded-2xl overflow-hidden text-left",
                    "bg-warm-bg dark:bg-gray-800 transition-all duration-150",
                    isAdded ? "ring-2 ring-warm-text dark:ring-gray-300" : "active:scale-[0.97]",
                  ].join(" ")}
                >
                  <div className="relative w-full aspect-square bg-warm-card dark:bg-gray-900 flex items-center justify-center">
                    {r.imgUrl ? (
                      <Image src={r.imgUrl} alt={r.name} fill className="object-contain p-2" unoptimized />
                    ) : (
                      <PlaceholderIcon />
                    )}
                    {/* Add / added badge */}
                    <span
                      className={[
                        "absolute bottom-1.5 right-1.5 flex items-center justify-center w-7 h-7 rounded-full shadow-card transition-colors",
                        isAdded
                          ? "bg-green-500 text-white"
                          : "bg-warm-card dark:bg-gray-700 text-warm-text dark:text-gray-100",
                      ].join(" ")}
                    >
                      {isAdded ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      )}
                    </span>
                  </div>
                  <div className="px-2 pt-1.5 pb-2">
                    <p className="text-xs font-semibold text-warm-text dark:text-gray-100 leading-tight line-clamp-2">
                      {r.name}
                    </p>
                    <div className="flex items-baseline justify-between gap-1 mt-0.5">
                      {r.unit && (
                        <span className="text-[11px] text-warm-subtle dark:text-gray-500 truncate">{r.unit}</span>
                      )}
                      {r.price != null && (
                        <span className="text-xs font-bold text-warm-text dark:text-gray-100 tabular-nums flex-shrink-0 ml-auto">
                          €{r.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Done */}
      <button
        onClick={onClose}
        className="w-full h-12 mt-3 rounded-2xl font-bold text-sm bg-warm-text dark:bg-gray-100 text-warm-card dark:text-gray-900 transition-all duration-150 active:scale-[0.98]"
      >
        {added.size > 0 ? `Done · ${added.size} added` : "Done"}
      </button>
    </BottomSheet>
  );
}
