"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { BottomSheet } from "./BottomSheet";
import { Id } from "../../convex/_generated/dataModel";
import { Group } from "@/types";

interface CreateListSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, groupId?: Id<"groups">) => void;
  groups: Group[];
}

export function CreateListSheet({ isOpen, onClose, onCreate, groups }: CreateListSheetProps) {
  const [name, setName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<Id<"groups"> | null>(null);
  const [shareWithGroup, setShareWithGroup] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setName("");
      setShareWithGroup(false);
      setSelectedGroupId(groups[0]?._id ?? null);
    }
  }, [isOpen, groups]);

  function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed, shareWithGroup && selectedGroupId ? selectedGroupId : undefined);
    onClose();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleCreate();
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="New list">
      <div className="space-y-4">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Weekend shop, Quick run…"
          className={[
            "w-full min-h-[52px] px-4 rounded-2xl text-base font-medium",
            "bg-warm-bg dark:bg-gray-800 text-warm-text dark:text-gray-100",
            "placeholder:text-warm-subtle dark:placeholder:text-gray-500",
            "border-0 focus:outline-none focus:ring-2 focus:ring-warm-text/20 dark:focus:ring-gray-400/20",
          ].join(" ")}
          autoComplete="off"
        />

        {groups.length > 0 && (
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-semibold text-warm-text dark:text-gray-100">Share with household</p>
              <p className="text-xs text-warm-subtle dark:text-gray-500 mt-0.5">
                {shareWithGroup && selectedGroupId
                  ? groups.find((g) => g._id === selectedGroupId)?.name
                  : "Only you can see this list"}
              </p>
            </div>
            <button
              onClick={() => setShareWithGroup((v) => !v)}
              className={[
                "relative w-11 h-6 rounded-full transition-colors duration-200",
                shareWithGroup ? "bg-warm-text dark:bg-gray-200" : "bg-warm-muted dark:bg-gray-700",
              ].join(" ")}
              aria-label="Toggle sharing"
            >
              <span
                className={[
                  "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white dark:bg-gray-900 shadow-sm transition-transform duration-200",
                  shareWithGroup ? "translate-x-5" : "translate-x-0",
                ].join(" ")}
              />
            </button>
          </div>
        )}

        {groups.length === 0 && (
          <p className="text-xs text-warm-subtle dark:text-gray-500 text-center py-1">
            Create a household to share lists with your partner
          </p>
        )}

        <button
          onClick={handleCreate}
          disabled={!name.trim()}
          className={[
            "w-full h-14 rounded-2xl font-bold text-sm",
            "bg-warm-text dark:bg-gray-100 text-warm-card dark:text-gray-900",
            "transition-all duration-150 active:scale-[0.98]",
            "disabled:opacity-40 disabled:cursor-not-allowed",
          ].join(" ")}
        >
          Create list
        </button>
      </div>
    </BottomSheet>
  );
}
