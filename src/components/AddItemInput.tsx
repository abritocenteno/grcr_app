"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import Image from "next/image";
import { Store } from "@/types";
import type { Suggestion } from "@/app/api/suggestions/route";

interface AddItemInputProps {
  onAdd: (name: string) => void;
  store: Store;
}

const STORE_RING: Record<Store, string> = {
  lidl: "focus:ring-lidl/40",
  ah: "focus:ring-ah/40",
};

const STORE_BUTTON: Record<Store, string> = {
  lidl: "bg-lidl hover:bg-[#003d85] active:bg-[#003d85]",
  ah: "bg-ah hover:bg-[#0080b5] active:bg-[#0080b5]",
};

export function AddItemInput({ onAdd, store }: AddItemInputProps) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const storeName = store === "lidl" ? "Lidl" : "Albert Heijn";

  // Debounced suggestions fetch
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

  // Close dropdown on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setShowDropdown(false);
      }
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

  function pickSuggestion(s: Suggestion) {
    submit(s.name);
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
          placeholder={`Add to ${storeName}…`}
          className={[
            "flex-1 min-h-[48px] px-4 rounded-2xl",
            "bg-warm-card dark:bg-gray-800 shadow-card",
            "text-warm-text dark:text-gray-100",
            "placeholder:text-warm-subtle dark:placeholder:text-gray-500",
            "border-0 focus:outline-none focus:ring-2",
            STORE_RING[store],
            "text-base font-medium",
          ].join(" ")}
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
            STORE_BUTTON[store],
          ].join(" ")}
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
              onPointerDown={(e) => { e.preventDefault(); pickSuggestion(s); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 active:bg-warm-bg dark:active:bg-gray-800 transition-colors text-left"
            >
              {/* Tiny thumbnail */}
              <div className="w-8 h-8 rounded-lg bg-warm-bg dark:bg-gray-800 flex-shrink-0 overflow-hidden flex items-center justify-center">
                {s.imgUrl ? (
                  <Image
                    src={s.imgUrl}
                    alt={s.name}
                    width={32}
                    height={32}
                    className="object-contain w-full h-full"
                    unoptimized
                  />
                ) : (
                  <svg className="w-4 h-4 text-warm-muted dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M6 5.25h12A2.25 2.25 0 0120.25 7.5v9A2.25 2.25 0 0118 18.75H6A2.25 2.25 0 013.75 16.5v-9A2.25 2.25 0 016 5.25z" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium text-warm-text dark:text-gray-100 truncate">
                {s.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
