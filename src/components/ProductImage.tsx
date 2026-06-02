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
    currentImgStatus: item.imgStatus,
  });

  const size = 52;

  if (item.imgStatus === "loading") {
    return (
      <div
        className="flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-gray-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (item.imgStatus === "done" && item.imgUrl) {
    return (
      <div className="flex-shrink-0 rounded-lg overflow-hidden" style={{ width: size, height: size }}>
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
      className="flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-6 h-6 text-gray-400 dark:text-gray-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 9.75h.008v.008H3V9.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM6 5.25h12A2.25 2.25 0 0120.25 7.5v9A2.25 2.25 0 0118 18.75H6A2.25 2.25 0 013.75 16.5v-9A2.25 2.25 0 016 5.25z"
        />
      </svg>
    </div>
  );
}
