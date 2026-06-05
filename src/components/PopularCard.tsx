"use client";

import { useState } from "react";
import Image from "next/image";
import { categoryForName } from "@/lib/categoryIcon";
import { CategoryIcon } from "@/components/CategoryIcon";

interface PopularCardProps {
  name: string;
  imgUrl: string | null;
  price?: number | null;
  unit?: string | null;
  isPersonal?: boolean;
  onTap: () => void;
}

function formatPrice(price: number): string {
  return `€ ${price.toFixed(2).replace(".", ",")}`;
}

export function PopularCard({ name, imgUrl, price, unit, isPersonal, onTap }: PopularCardProps) {
  const category = categoryForName(name);
  // Safety net: if a URL that passed server-side checks still fails to load
  // (e.g. a CDN hiccup), drop to the category icon instead of a broken glyph.
  const [imgFailed, setImgFailed] = useState(false);
  const showImg = imgUrl && !imgFailed;

  return (
    <button
      onClick={onTap}
      className={[
        "flex flex-col rounded-2xl overflow-hidden flex-shrink-0 w-32",
        "bg-warm-card dark:bg-gray-900 shadow-card snap-start",
        "transition-all duration-150 active:scale-[0.95] active:shadow-none",
        "text-left",
      ].join(" ")}
    >
      {/* Image area */}
      <div className="relative w-full aspect-square bg-warm-bg dark:bg-gray-800 flex items-center justify-center">
        {showImg ? (
          <Image
            src={imgUrl}
            alt={name}
            fill
            className="object-contain p-2.5"
            unoptimized
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            role="img"
            aria-label={category.label}
            title={category.label}
          >
            <CategoryIcon icon={category.icon} className="w-12 h-12 text-warm-muted dark:text-gray-600" strokeWidth={1.25} />
          </div>
        )}

        {/* Price chip */}
        {price != null && (
          <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-lg bg-warm-text/85 dark:bg-gray-100/90 text-white dark:text-gray-900 text-[11px] font-bold tabular-nums">
            {formatPrice(price)}
          </span>
        )}

        {/* Personal badge */}
        {isPersonal && (
          <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-warm-text/80 dark:bg-gray-200/80 flex items-center justify-center">
            <svg className="w-3 h-3 text-white dark:text-gray-900" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
          </span>
        )}
      </div>

      {/* Name + unit */}
      <div className="px-2.5 pt-2 pb-2.5">
        <p className="text-sm font-semibold text-warm-text dark:text-gray-100 leading-tight line-clamp-2">
          {name}
        </p>
        {unit && (
          <p className="text-[11px] text-warm-subtle dark:text-gray-500 mt-0.5 truncate">{unit}</p>
        )}
      </div>
    </button>
  );
}
