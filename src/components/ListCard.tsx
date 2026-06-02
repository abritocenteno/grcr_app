"use client";

import { useRouter } from "next/navigation";
import { GroceryList } from "@/types";
import { Id } from "../../convex/_generated/dataModel";

interface ListCardProps {
  list: GroceryList;
  onDelete?: (listId: Id<"lists">) => void;
}

export function ListCard({ list, onDelete }: ListCardProps) {
  const router = useRouter();
  const hasItems = list.totalCount > 0;

  return (
    <div
      onClick={() => router.push(`/list/${list._id}`)}
      className={[
        "flex items-center gap-4 mx-4 mb-3 p-4 rounded-2xl",
        "bg-warm-card dark:bg-gray-900 shadow-card cursor-pointer",
        "transition-all duration-150 active:scale-[0.98] active:shadow-none",
      ].join(" ")}
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-2xl bg-warm-bg dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
        <svg className="w-6 h-6 text-warm-subtle dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-warm-text dark:text-gray-100 truncate">{list.name}</p>

        {/* Store counts */}
        {hasItems ? (
          <div className="flex items-center gap-2 mt-1">
            {list.lidlCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-warm-subtle dark:text-gray-500">
                <span className="w-2 h-2 rounded-full bg-lidl inline-block" />
                {list.lidlCount}
              </span>
            )}
            {list.ahCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-warm-subtle dark:text-gray-500">
                <span className="w-2 h-2 rounded-full bg-ah inline-block" />
                {list.ahCount}
              </span>
            )}
            {list.lidlCount === 0 && list.ahCount === 0 && (
              <span className="text-xs text-warm-subtle dark:text-gray-500">All checked</span>
            )}
          </div>
        ) : (
          <p className="text-xs text-warm-subtle dark:text-gray-500 mt-0.5">Empty list</p>
        )}

        {/* Group badge */}
        {list.groupName && (
          <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-warm-subtle dark:text-gray-500 bg-warm-muted dark:bg-gray-800 px-2 py-0.5 rounded-full">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {list.groupName}
          </span>
        )}
      </div>

      {/* Chevron / delete */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {onDelete && list.isOwner && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(list._id); }}
            className="w-8 h-8 flex items-center justify-center text-warm-muted dark:text-gray-700 active:text-red-400 transition-colors rounded-xl"
            aria-label="Delete list"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
        <svg className="w-4 h-4 text-warm-muted dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}
