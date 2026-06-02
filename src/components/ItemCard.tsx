"use client";

import { GroceryItem, Store } from "@/types";
import { ProductImage } from "./ProductImage";
import { Id } from "../../convex/_generated/dataModel";

interface ItemCardProps {
  item: GroceryItem;
  store: Store;
  onToggle: (itemId: Id<"items">) => void;
  onDelete: (itemId: Id<"items">) => void;
  onQtyChange: (itemId: Id<"items">, delta: -1 | 1) => void;
}

const STORE_CHECK_ACTIVE: Record<Store, string> = {
  lidl: "bg-lidl border-lidl",
  ah: "bg-ah border-ah",
};

const STORE_CHECK_IDLE: Record<Store, string> = {
  lidl: "border-warm-muted hover:border-lidl/50 dark:border-gray-600",
  ah: "border-warm-muted hover:border-ah/50 dark:border-gray-600",
};

const STORE_QTY: Record<Store, string> = {
  lidl: "text-lidl dark:text-blue-400",
  ah: "text-ah dark:text-sky-400",
};

export function ItemCard({ item, store, onToggle, onDelete, onQtyChange }: ItemCardProps) {
  return (
    <div
      onClick={() => onToggle(item._id)}
      className={[
        "flex items-center gap-3 mx-3 mb-2.5 p-3 rounded-2xl",
        "bg-warm-card dark:bg-gray-900 shadow-card cursor-pointer",
        "transition-all duration-150 active:scale-[0.98] active:shadow-none",
        item.done ? "opacity-55" : "",
      ].join(" ")}
    >
      {/* Product image */}
      <div className="flex-shrink-0">
        <ProductImage item={item} />
      </div>

      {/* Name + qty controls */}
      <div className="flex-1 min-w-0">
        <p
          className={[
            "text-sm font-semibold leading-snug truncate text-warm-text dark:text-gray-100",
            item.done ? "line-through text-warm-subtle dark:text-gray-500" : "",
          ].join(" ")}
        >
          {item.name}
        </p>

        <div
          className="flex items-center gap-1.5 mt-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onQtyChange(item._id, -1)}
            className="w-6 h-6 rounded-full flex items-center justify-center text-warm-subtle dark:text-gray-400 bg-warm-muted dark:bg-gray-800 text-sm leading-none select-none active:opacity-60"
            aria-label="Decrease"
          >
            −
          </button>
          <span className={`text-xs font-bold w-5 text-center tabular-nums ${STORE_QTY[store]}`}>
            {item.qty}
          </span>
          <button
            onClick={() => onQtyChange(item._id, 1)}
            className="w-6 h-6 rounded-full flex items-center justify-center text-warm-subtle dark:text-gray-400 bg-warm-muted dark:bg-gray-800 text-sm leading-none select-none active:opacity-60"
            aria-label="Increase"
          >
            +
          </button>
        </div>
      </div>

      {/* Check + delete */}
      <div
        className="flex items-center gap-2 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onToggle(item._id)}
          className={[
            "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-150",
            item.done ? STORE_CHECK_ACTIVE[store] : STORE_CHECK_IDLE[store],
          ].join(" ")}
          aria-label={item.done ? "Uncheck" : "Check"}
        >
          {item.done && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <button
          onClick={() => onDelete(item._id)}
          className="w-8 h-8 flex items-center justify-center text-warm-muted dark:text-gray-700 active:text-red-400 transition-colors"
          aria-label="Delete"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
