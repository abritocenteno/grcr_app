"use client";

import { Store } from "@/types";

interface StoreTabsProps {
  activeStore: Store;
  onSwitch: (store: Store) => void;
  lidlCount: number;
  ahCount: number;
}

const STORE_CONFIG = {
  lidl: { label: "Lidl", color: "#0050AA", bg: "bg-[#0050AA]" },
  ah: { label: "Albert Heijn", color: "#00A0E2", bg: "bg-[#00A0E2]" },
} as const;

export function StoreTabs({ activeStore, onSwitch, lidlCount, ahCount }: StoreTabsProps) {
  const counts: Record<Store, number> = { lidl: lidlCount, ah: ahCount };

  return (
    <div className="flex gap-2 p-3">
      {(["lidl", "ah"] as Store[]).map((store) => {
        const { label, bg } = STORE_CONFIG[store];
        const isActive = activeStore === store;
        const count = counts[store];

        return (
          <button
            key={store}
            onClick={() => onSwitch(store)}
            className={[
              "relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all",
              "min-h-[44px] select-none",
              isActive
                ? `${bg} text-white shadow-sm`
                : "bg-transparent text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700",
            ].join(" ")}
          >
            {label}
            {count > 0 && (
              <span
                className={[
                  "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold",
                  isActive
                    ? "bg-white/30 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
                ].join(" ")}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
