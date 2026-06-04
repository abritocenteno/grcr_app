"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import Image from "next/image";
import { getStoreColor, storeLabel } from "@/lib/storeColors";
import { SearchResultsSheet } from "./SearchResultsSheet";
import type { Suggestion } from "@/app/api/suggestions/route";

interface AddItemInputProps {
  onAdd: (name: string) => void;
  store: string;
}

export function AddItemInput({ onAdd, store }: AddItemInputProps) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allResultsOpen, setAllResultsOpen] = useState(false);
  const [allResultsQuery, setAllResultsQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const color = getStoreColor(store);
  const label = storeLabel(store);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      setLoading(true);
      try {
        const res = await fetch(
          `/api/suggestions?q=${encodeURIComponent(value.trim())}&store=${store}`,
          { signal: abortRef.current.signal }
        );
        const data: { suggestions: Suggestion[] } = await res.json();
        setSuggestions(data.suggestions);
        setShowDropdown(data.suggestions.length > 0);
      } catch {
        // aborted or network error — ignore
      } finally {
        setLoading(false);
      }
    }, 380);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value, store]);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setShowDropdown(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function submit(name?: string) {
    const trimmed = (name ?? value).trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue("");
    setSuggestions([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") submit();
    if (e.key === "Escape") { setShowDropdown(false); setSuggestions([]); }
  }

  function openAllResults() {
    const q = value.trim();
    if (!q) return;
    setAllResultsQuery(q);
    setShowDropdown(false);
    setAllResultsOpen(true);
  }

  return (
    <div ref={containerRef} className="relative flex flex-col px-4 pb-4">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={`Add to ${label}…`}
          className={[
            "flex-1 min-h-[48px] px-4 rounded-2xl",
            "bg-warm-card dark:bg-gray-800 shadow-card",
            "text-warm-text dark:text-gray-100",
            "placeholder:text-warm-subtle dark:placeholder:text-gray-500",
            "border-0 focus:outline-none focus:ring-2 focus:ring-offset-0",
            "text-base font-medium",
          ].join(" ")}
          style={{ "--tw-ring-color": color.bg + "66" } as React.CSSProperties}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <button
          onClick={() => submit()}
          disabled={!value.trim()}
          className={[
            "min-h-[48px] min-w-[48px] px-5 rounded-2xl text-white font-bold text-lg",
            "transition-all duration-150 shadow-card",
            "disabled:opacity-40 disabled:cursor-not-allowed",
          ].join(" ")}
          style={{ backgroundColor: color.bg, color: color.text }}
          aria-label="Add item"
        >
          +
        </button>
      </div>

      {/* Suggestions dropdown */}
      {showDropdown && (
        <div className="absolute left-4 right-4 top-[56px] z-50 rounded-2xl bg-warm-card dark:bg-gray-900 shadow-card-lg overflow-hidden border border-warm-muted/40 dark:border-gray-700">
          {loading && suggestions.length === 0 && (
            <div className="flex items-center justify-center py-3">
              <div className="w-4 h-4 border-2 border-warm-muted border-t-warm-subtle rounded-full animate-spin" />
            </div>
          )}
          {suggestions.map((s, i) => (
            <button
              key={i}
              onPointerDown={(e) => { e.preventDefault(); submit(s.name); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 active:bg-warm-bg dark:active:bg-gray-800 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-warm-bg dark:bg-gray-800 flex-shrink-0 overflow-hidden flex items-center justify-center">
                {s.imgUrl ? (
                  <Image src={s.imgUrl} alt={s.name} width={32} height={32} className="object-contain w-full h-full" unoptimized />
                ) : (
                  <svg className="w-4 h-4 text-warm-muted dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M6 5.25h12A2.25 2.25 0 0120.25 7.5v9A2.25 2.25 0 0118 18.75H6A2.25 2.25 0 013.75 16.5v-9A2.25 2.25 0 016 5.25z" />
                  </svg>
                )}
              </div>
              <span className="flex-1 text-sm font-medium text-warm-text dark:text-gray-100 truncate">{s.name}</span>
              {s.price != null && (
                <span className="flex-shrink-0 text-sm font-bold text-warm-text dark:text-gray-100 tabular-nums">
                  €{s.price.toFixed(2)}
                </span>
              )}
            </button>
          ))}

          {/* View all results */}
          {suggestions.length > 0 && (
            <button
              onPointerDown={(e) => { e.preventDefault(); openAllResults(); }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-3 border-t border-warm-muted/40 dark:border-gray-700 text-sm font-bold text-warm-text dark:text-gray-100 active:bg-warm-bg dark:active:bg-gray-800 transition-colors"
              style={{ color: color.bg }}
            >
              View all results
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}

      <SearchResultsSheet
        isOpen={allResultsOpen}
        query={allResultsQuery}
        store={store}
        onClose={() => setAllResultsOpen(false)}
        onAdd={onAdd}
      />
    </div>
  );
}
