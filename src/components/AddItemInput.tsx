"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Store } from "@/types";

interface AddItemInputProps {
  onAdd: (name: string) => void;
  store: Store;
}

const STORE_BUTTON_COLOR: Record<Store, string> = {
  lidl: "bg-[#0050AA] hover:bg-[#003d85] active:bg-[#003d85]",
  ah: "bg-[#00A0E2] hover:bg-[#0080b5] active:bg-[#0080b5]",
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
    <div className="flex gap-2 px-3 pb-3">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`Add to ${storeName}…`}
        className={[
          "flex-1 min-h-[44px] px-4 rounded-xl border",
          "border-gray-200 dark:border-gray-700",
          "bg-gray-50 dark:bg-gray-900",
          "text-gray-900 dark:text-gray-100",
          "placeholder:text-gray-400 dark:placeholder:text-gray-600",
          "focus:outline-none focus:ring-2 focus:ring-offset-1",
          store === "lidl" ? "focus:ring-[#0050AA]" : "focus:ring-[#00A0E2]",
          "text-base",
        ].join(" ")}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
      <button
        onClick={submit}
        disabled={!value.trim()}
        className={[
          "min-h-[44px] px-5 rounded-xl text-white font-semibold text-sm",
          "transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
          STORE_BUTTON_COLOR[store],
        ].join(" ")}
      >
        Add
      </button>
    </div>
  );
}
