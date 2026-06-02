"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Store } from "@/types";

interface AddItemInputProps {
  onAdd: (name: string) => void;
  store: Store;
}

const STORE_BUTTON: Record<Store, string> = {
  lidl: "bg-lidl hover:bg-[#003d85] active:bg-[#003d85]",
  ah: "bg-ah hover:bg-[#0080b5] active:bg-[#0080b5]",
};

export function AddItemInput({ onAdd, store }: AddItemInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const storeName = store === "lidl" ? "Lidl" : "Albert Heijn";

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") submit();
  }

  return (
    <div className="flex gap-2 px-4 pb-4">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`Add to ${storeName}…`}
        className={[
          "flex-1 min-h-[48px] px-4 rounded-2xl",
          "bg-warm-card dark:bg-gray-800 shadow-card",
          "text-warm-text dark:text-gray-100",
          "placeholder:text-warm-subtle dark:placeholder:text-gray-500",
          "border-0 focus:outline-none focus:ring-2",
          store === "lidl" ? "focus:ring-lidl/40" : "focus:ring-ah/40",
          "text-base font-medium",
        ].join(" ")}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
      <button
        onClick={submit}
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
  );
}
