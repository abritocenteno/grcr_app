"use client";

import { useEffect, useState } from "react";
import { SuggestionRow } from "@/components/SuggestionRow";
import { getStoreColor, storeLabel } from "@/lib/storeColors";
import type { SuggestionItem } from "@/types";
import type { StorePopularProduct } from "@/app/api/store-popular/route";

interface StorePopularRowProps {
  store: string;
  onSelect: (item: SuggestionItem) => void;
}

// One home-page row of popular products for a single store. Self-fetches from
// /api/store-popular so each store row loads independently.
export function StorePopularRow({ store, onSelect }: StorePopularRowProps) {
  const [items, setItems] = useState<SuggestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetch(`/api/store-popular?store=${encodeURIComponent(store)}`)
      .then((r) => r.json())
      .then((d: { products: StorePopularProduct[] }) => {
        if (cancelled) return;
        setItems(
          d.products.map((p) => ({
            name: p.name,
            imgUrl: p.imgUrl,
            price: p.price,
            unit: p.unit,
            store,
          }))
        );
      })
      .catch(() => {})
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [store]);

  return (
    <SuggestionRow
      title={storeLabel(store)}
      accent={getStoreColor(store).bg}
      items={items}
      isLoading={isLoading}
      onSelect={onSelect}
    />
  );
}
