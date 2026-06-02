"use client";

import Image from "next/image";

interface SuggestionCardProps {
  name: string;
  imgUrl: string | null;
  isPersonal?: boolean; // came from user history
  onTap: () => void;
}

export function SuggestionCard({ name, imgUrl, isPersonal, onTap }: SuggestionCardProps) {
  return (
    <button
      onClick={onTap}
      className={[
        "flex flex-col rounded-2xl overflow-hidden",
        "bg-warm-card dark:bg-gray-900 shadow-card",
        "transition-all duration-150 active:scale-[0.95] active:shadow-none",
        "text-left w-full",
      ].join(" ")}
    >
      {/* Image area */}
      <div className="relative w-full aspect-square bg-warm-bg dark:bg-gray-800 flex items-center justify-center">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={name}
            fill
            className="object-contain p-2"
            unoptimized
          />
        ) : (
          <svg
            className="w-10 h-10 text-warm-muted dark:text-gray-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M6 5.25h12A2.25 2.25 0 0120.25 7.5v9A2.25 2.25 0 0118 18.75H6A2.25 2.25 0 013.75 16.5v-9A2.25 2.25 0 016 5.25z"
            />
          </svg>
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

      {/* Name */}
      <div className="px-2 pt-1.5 pb-2.5">
        <p className="text-xs font-semibold text-warm-text dark:text-gray-100 leading-tight line-clamp-2">
          {name}
        </p>
      </div>
    </button>
  );
}
