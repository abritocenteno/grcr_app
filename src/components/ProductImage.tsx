"use client";

import Image from "next/image";
import { GroceryItem } from "@/types";
import { useProductImage } from "@/hooks/useProductImage";

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

  return (
    <div
      className="flex-shrink-0 rounded-xl bg-warm-bg dark:bg-gray-800 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 text-warm-muted dark:text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M6 5.25h12A2.25 2.25 0 0120.25 7.5v9A2.25 2.25 0 0118 18.75H6A2.25 2.25 0 013.75 16.5v-9A2.25 2.25 0 016 5.25z"
        />
      </svg>
    </div>
  );
}
