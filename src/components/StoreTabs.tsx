"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { getStoreColor, storeLabel } from "@/lib/storeColors";

interface StoreTabsProps {
  stores: string[];                    // ordered list of store keys
  activeStore: string;
  onSwitch: (store: string) => void;
  onAddStore: (store: string) => void;
  onRemoveStore: (store: string) => void;
  countMap: Record<string, number>;    // unchecked item count per store
}

export function StoreTabs({ stores, activeStore, onSwitch, onAddStore, onRemoveStore, countMap }: StoreTabsProps) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding) setTimeout(() => inputRef.current?.focus(), 50);
  }, [adding]);

  function commitAdd() {
    const trimmed = draft.trim();
    if (trimmed && !stores.map((s) => s.toLowerCase()).includes(trimmed.toLowerCase())) {
      onAddStore(trimmed);
    }
    setDraft("");
    setAdding(false);
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") commitAdd();
    if (e.key === "Escape") { setDraft(""); setAdding(false); }
  }

  return (
    <div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
      {stores.map((store) => {
        const isActive = store === activeStore;
        const color = getStoreColor(store);
        const count = countMap[store] ?? 0;
        const label = storeLabel(store);

        return (
          <button
            key={store}
            onClick={() => onSwitch(store)}
            className={[
              "flex items-center gap-2 pl-4 py-2.5 rounded-2xl text-sm font-semibold",
              "transition-all duration-150 select-none min-h-[44px] flex-shrink-0",
              "shadow-card",
              isActive ? "pr-2" : "pr-4",
            ].join(" ")}
            style={
              isActive
                ? { backgroundColor: color.bg, color: color.text }
                : undefined
            }
            data-inactive={!isActive || undefined}
          >
            <span className={!isActive ? "text-warm-subtle dark:text-gray-400" : ""}>
              {label}
            </span>
            {/* Always show badge — dim when inactive */}
            <span
              className={[
                "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold",
                isActive
                  ? "bg-white/25"
                  : "bg-warm-muted dark:bg-gray-700 text-warm-subtle dark:text-gray-400",
              ].join(" ")}
              style={isActive ? { color: color.text } : undefined}
            >
              {count}
            </span>
            {/* Remove button — only on the active tab */}
            {isActive && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); onRemoveStore(store); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); onRemoveStore(store); }
                }}
                className="flex items-center justify-center w-5 h-5 rounded-full bg-white/25 active:bg-white/40 transition-colors"
                style={{ color: color.text }}
                aria-label={`Remove ${label}`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            )}
          </button>
        );
      })}

      {/* Add store */}
      {adding ? (
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKey}
            onBlur={commitAdd}
            placeholder="Store name…"
            className={[
              "w-32 h-[44px] px-3 rounded-2xl text-sm font-medium",
              "bg-warm-card dark:bg-gray-800 shadow-card",
              "text-warm-text dark:text-gray-100",
              "placeholder:text-warm-subtle dark:placeholder:text-gray-500",
              "border-0 focus:outline-none focus:ring-2 focus:ring-warm-text/20",
            ].join(" ")}
            autoComplete="off"
          />
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className={[
            "flex items-center justify-center w-11 h-11 rounded-2xl flex-shrink-0",
            "bg-warm-card dark:bg-gray-800 shadow-card",
            "text-warm-subtle dark:text-gray-500",
            "transition-all duration-150 active:scale-95",
          ].join(" ")}
          aria-label="Add store"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      )}
    </div>
  );
}
