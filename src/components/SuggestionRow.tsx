"use client";

import { PopularCard } from "@/components/PopularCard";
import type { SuggestionItem } from "@/types";

interface SuggestionRowProps {
  title: string;
  /** small coloured dot before the title (store accent) */
  accent?: string;
  /** right-aligned subtitle, e.g. "popular picks" */
  hint?: string;
  items: SuggestionItem[];
  isLoading: boolean;
  onSelect: (item: SuggestionItem) => void;
}

function SkeletonCard() {
  return (
    <div className="flex flex-col rounded-2xl overflow-hidden flex-shrink-0 w-32 bg-warm-card dark:bg-gray-900 shadow-card">
      <div className="aspect-square bg-warm-bg dark:bg-gray-800 animate-pulse" />
      <div className="p-2.5 space-y-1.5">
        <div className="h-3 bg-warm-bg dark:bg-gray-800 rounded-full animate-pulse w-3/4" />
        <div className="h-3 bg-warm-bg dark:bg-gray-800 rounded-full animate-pulse w-1/2" />
      </div>
    </div>
  );
}

export function SuggestionRow({ title, accent, hint, items, isLoading, onSelect }: SuggestionRowProps) {
  if (!isLoading && items.length === 0) return null;

  return (
    <section className="px-4 pb-5">
      <div className="flex items-baseline justify-between pb-3">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-warm-text dark:text-gray-100 tracking-tight">
          {accent && (
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
          )}
          {title}
        </h2>
        {hint && <span className="text-xs text-warm-subtle dark:text-gray-500">{hint}</span>}
      </div>

      <div className="flex gap-3 overflow-x-auto snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : items.map((item) => (
              <PopularCard
                key={item.name}
                name={item.name}
                imgUrl={item.imgUrl}
                price={item.price}
                unit={item.unit}
                isPersonal={item.isPersonal}
                onTap={() => onSelect(item)}
              />
            ))}
      </div>
    </section>
  );
}
