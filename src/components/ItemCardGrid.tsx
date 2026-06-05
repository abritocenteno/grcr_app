"use client";

import Image from "next/image";
import { GroceryItem, Store } from "@/types";
import { useProductImage } from "@/hooks/useProductImage";
import { categoryForName } from "@/lib/categoryIcon";
import { Id } from "../../convex/_generated/dataModel";

interface ItemCardGridProps {
  item: GroceryItem;
  store: Store;
  onToggle: (itemId: Id<"items">) => void;
  onDelete: (itemId: Id<"items">) => void;
  onQtyChange: (itemId: Id<"items">, delta: -1 | 1) => void;
}

const STORE_OVERLAY: Record<Store, string> = {
  lidl: "bg-lidl/90",
  ah: "bg-ah/90",
};

const STORE_QTY_BG: Record<Store, string> = {
  lidl: "bg-lidl",
  ah: "bg-ah",
};

const STORE_BTN: Record<Store, string> = {
  lidl: "bg-lidl hover:bg-[#003d85]",
  ah: "bg-ah hover:bg-[#0080b5]",
};

function GridProductImage({ item }: { item: GroceryItem }) {
  useProductImage({
    itemId: item._id,
    name: item.name,
    store: item.store,
    currentImgStatus: item.imgStatus,
  });

  if (item.imgStatus === "loading") {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-warm-muted border-t-warm-subtle rounded-full animate-spin" />
      </div>
    );
  }

  if (item.imgStatus === "done" && item.imgUrl) {
    return (
      <Image
        src={item.imgUrl}
        alt={item.name}
        fill
        className="object-contain p-2"
        unoptimized
      />
    );
  }

  // No real photo — fall back to a category icon inferred from the name.
  const category = categoryForName(item.name);
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      role="img"
      aria-label={category.label}
      title={category.label}
    >
      <span className="text-4xl leading-none select-none" aria-hidden="true">
        {category.emoji}
      </span>
    </div>
  );
}

export function ItemCardGrid({ item, store, onToggle, onDelete, onQtyChange }: ItemCardGridProps) {
  return (
    <div
      onClick={() => onToggle(item._id)}
      className={[
        "relative flex flex-col rounded-2xl overflow-hidden",
        "bg-warm-card dark:bg-gray-900 shadow-card cursor-pointer",
        "transition-all duration-150 active:scale-[0.96] active:shadow-none",
        item.done ? "opacity-55" : "",
      ].join(" ")}
    >
      {/* Image area */}
      <div className="relative w-full aspect-square bg-warm-bg dark:bg-gray-800">
        <GridProductImage item={item} />

        {/* Qty badge */}
        {item.qty > 1 && (
          <span
            className={`absolute top-2 left-2 ${STORE_QTY_BG[store]} text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center`}
          >
            {item.qty}
          </span>
        )}

        {/* Done overlay */}
        {item.done && (
          <div className={`absolute inset-0 ${STORE_OVERLAY[store]} flex items-center justify-center`}>
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}

        {/* Delete button */}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(item._id); }}
          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-warm-text/10 dark:bg-white/10 flex items-center justify-center text-warm-subtle dark:text-gray-400 active:bg-red-500 active:text-white transition-colors"
          aria-label="Delete"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Name + qty controls */}
      <div className="px-2.5 pt-2 pb-2.5">
        <p className={[
          "text-xs font-semibold truncate text-warm-text dark:text-gray-100 leading-tight mb-1.5",
          item.done ? "line-through text-warm-subtle" : "",
        ].join(" ")}>
          {item.name}
        </p>

        <div
          className="flex items-center justify-between"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1">
            <button
              onClick={() => onQtyChange(item._id, -1)}
              className="w-5 h-5 rounded-full flex items-center justify-center text-warm-subtle bg-warm-muted dark:bg-gray-800 text-xs leading-none select-none active:opacity-60"
              aria-label="Decrease"
            >
              −
            </button>
            <span className="text-xs font-bold w-4 text-center tabular-nums text-warm-text dark:text-gray-200">
              {item.qty}
            </span>
            <button
              onClick={() => onQtyChange(item._id, 1)}
              className="w-5 h-5 rounded-full flex items-center justify-center text-warm-subtle bg-warm-muted dark:bg-gray-800 text-xs leading-none select-none active:opacity-60"
              aria-label="Increase"
            >
              +
            </button>
          </div>

          <button
            onClick={() => onToggle(item._id)}
            className={[
              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
              item.done
                ? `${STORE_QTY_BG[store]} border-transparent`
                : "border-warm-muted dark:border-gray-700",
            ].join(" ")}
            aria-label={item.done ? "Uncheck" : "Check"}
          >
            {item.done && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
