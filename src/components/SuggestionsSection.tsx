"use client";

import { useEffect, useState } from "react";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SuggestionCard } from "./SuggestionCard";
import type { PopularProduct } from "@/app/api/popular-products/route";
import type { FrequentItem } from "../../convex/suggestions";

export interface SuggestionItem {
  name: string;
  imgUrl: string | null;
  isPersonal: boolean;
}

interface SuggestionsSectionProps {
  onSelect: (item: SuggestionItem) => void;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-warm-card dark:bg-gray-900 shadow-card overflow-hidden">
      <div className="aspect-square bg-warm-bg dark:bg-gray-800 animate-pulse" />
      <div className="p-2 space-y-1">
        <div className="h-2.5 bg-warm-bg dark:bg-gray-800 rounded-full animate-pulse w-3/4" />
        <div className="h-2.5 bg-warm-bg dark:bg-gray-800 rounded-full animate-pulse w-1/2" />
      </div>
    </div>
  );
}

export function SuggestionsSection({ onSelect }: SuggestionsSectionProps) {
  const { isAuthenticated } = useConvexAuth();
  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);

  const frequentItems = useQuery(
    api.suggestions.getFrequentItems,
    isAuthenticated ? {} : "skip"
  ) as FrequentItem[] | undefined;

  // Fetch popular Dutch staples once
  useEffect(() => {
    fetch("/api/popular-products")
      .then((r) => r.json())
      .then((d: { products: PopularProduct[] }) => setPopularProducts(d.products))
      .catch(() => {})
      .finally(() => setLoadingPopular(false));
  }, []);

  // Merge: personal history first, then staples to fill remaining slots
  const merged: SuggestionItem[] = [];

  if (frequentItems) {
    for (const item of frequentItems) {
      merged.push({ name: item.name, imgUrl: item.imgUrl ?? null, isPersonal: true });
    }
  }

  const personalNames = new Set(merged.map((i) => i.name.toLowerCase()));
  for (const p of popularProducts) {
    if (!personalNames.has(p.name.toLowerCase()) && merged.length < 16) {
      merged.push({ name: p.name, imgUrl: p.imgUrl, isPersonal: false });
    }
  }

  const isLoading = loadingPopular && merged.length === 0;
  const hasPersonal = (frequentItems?.length ?? 0) > 0;

  if (!isLoading && merged.length === 0) return null;

  return (
    <section className="pb-4">
      <div className="flex items-baseline justify-between px-4 pb-3">
        <h2 className="text-base font-extrabold text-warm-text dark:text-gray-100 tracking-tight">
          {hasPersonal ? "Your favourites" : "Popular items"}
        </h2>
        {hasPersonal && (
          <span className="text-xs text-warm-subtle dark:text-gray-500">
            + popular picks
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2.5 px-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : merged.slice(0, 16).map((item) => (
              <SuggestionCard
                key={item.name}
                name={item.name}
                imgUrl={item.imgUrl}
                isPersonal={item.isPersonal}
                onTap={() => onSelect(item)}
              />
            ))}
      </div>
    </section>
  );
}
