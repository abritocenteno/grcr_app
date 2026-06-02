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

const STORE_DONE_COLOR: Record<Store, string> = {
  lidl: "bg-[#0050AA] border-[#0050AA]",
  ah: "bg-[#00A0E2] border-[#00A0E2]",
};

const STORE_CHECK_COLOR: Record<Store, string> = {
  lidl: "text-[#0050AA] border-[#0050AA]",
  ah: "text-[#00A0E2] border-[#00A0E2]",
};

const STORE_QTY_COLOR: Record<Store, string> = {
  lidl: "text-[#0050AA] dark:text-[#6699cc]",
  ah: "text-[#00A0E2] dark:text-[#66c4f0]",
};

export function ItemCard({ item, store, onToggle, onDelete, onQtyChange }: ItemCardProps) {
  return (
    <div
      className={[
        "flex items-center gap-3 px-3 py-3 bg-white dark:bg-gray-900",
        "border-b border-gray-100 dark:border-gray-800",
        "transition-opacity cursor-pointer active:bg-gray-50 dark:active:bg-gray-800",
        item.done ? "opacity-50" : "opacity-100",
      ].join(" ")}
      onClick={() => onToggle(item._id)}
    >
      <ProductImage item={item} />

      <div className="flex-1 min-w-0">
        <p
          className={[
            "text-sm font-medium truncate text-gray-900 dark:text-gray-100",
            item.done ? "line-through text-gray-400 dark:text-gray-600" : "",
          ].join(" ")}
        >
          {item.name}
        </p>

        <div
          className="flex items-center gap-1 mt-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onQtyChange(item._id, -1)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 text-base leading-none select-none active:bg-gray-100 dark:active:bg-gray-800"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className={`text-sm font-semibold w-6 text-center ${STORE_QTY_COLOR[store]}`}>
            {item.qty}
          </span>
          <button
            onClick={() => onQtyChange(item._id, 1)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 text-base leading-none select-none active:bg-gray-100 dark:active:bg-gray-800"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div
        className="flex items-center gap-2 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onToggle(item._id)}
          className={[
            "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors",
            item.done
              ? STORE_DONE_COLOR[store]
              : `border-gray-300 dark:border-gray-600 ${STORE_CHECK_COLOR[store]}`,
          ].join(" ")}
          aria-label={item.done ? "Mark incomplete" : "Mark done"}
        >
          {item.done && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <button
          onClick={() => onDelete(item._id)}
          className="w-8 h-8 flex items-center justify-center text-gray-400 dark:text-gray-600 active:text-red-500"
          aria-label="Delete item"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
