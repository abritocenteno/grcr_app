"use client";

import Image from "next/image";
import { GroceryItem } from "@/types";
import { useProductImage } from "@/hooks/useProductImage";
import { categoryForName } from "@/lib/categoryIcon";
import { CategoryIcon } from "@/components/CategoryIcon";

interface ProductImageProps {
  item: GroceryItem;
}

export function ProductImage({ item }: ProductImageProps) {
  useProductImage({
    itemId: item._id,
    name: item.name,
    store: item.store,
    currentImgStatus: item.imgStatus,
  });

  const size = 52;

  if (item.imgStatus === "loading") {
    return (
      <div
        className="flex-shrink-0 rounded-xl bg-warm-bg dark:bg-gray-800 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <div className="w-4 h-4 border-2 border-warm-muted border-t-warm-subtle rounded-full animate-spin" />
      </div>
    );
  }

  if (item.imgStatus === "done" && item.imgUrl) {
    return (
      <div
        className="flex-shrink-0 rounded-xl overflow-hidden bg-warm-bg dark:bg-gray-800"
        style={{ width: size, height: size }}
      >
        <Image
          src={item.imgUrl}
          alt={item.name}
          width={size}
          height={size}
          className="object-contain w-full h-full"
          unoptimized
        />
      </div>
    );
  }

  // No real photo — fall back to a category icon inferred from the name.
  const category = categoryForName(item.name);
  return (
    <div
      className="flex-shrink-0 rounded-xl bg-warm-bg dark:bg-gray-800 flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={category.label}
      title={category.label}
    >
      <CategoryIcon icon={category.icon} className="w-6 h-6 text-warm-muted dark:text-gray-500" />
    </div>
  );
}
