"use client";

import { Store } from "@/types";

interface StoreTabsProps {
  activeStore: Store;
  onSwitch: (store: Store) => void;
  lidlCount: number;
  ahCount: number;
}

const STORE_CONFIG = {
  lidl: { label: "Lidl", activeBg: "bg-lidl", activeText: "text-white" },
  ah: { label: "Albert Heijn", activeBg: "bg-ah", activeText: "text-white" },
} as const;

export function StoreTabs({ activeStore, onSwitch, lidlCount, ahCount }: StoreTabsProps) {
  const counts: Record<Store, number> = { lidl: lidlCount, ah: ahCount };

  return (
    <div className="flex gap-2 px-4 pb-3">
      {(["lidl", "ah"] as Store[]).map((store) => {
        const { label, activeBg, activeText } = STORE_CONFIG[store];
        const isActive = activeStore === store;
        const count = counts[store];

        return (
          <button
            key={store}
            onClick={() => onSwitch(store)}
            className={[
              "relative flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold",
              "transition-all duration-200 select-none min-h-[44px]",
              isActive
                ? `${activeBg} ${activeText} shadow-card`
                : "bg-warm-card text-warm-subtle dark:bg-gray-800 dark:text-gray-400 shadow-card",
            ].join(" ")}
          >
            {label}
            {count > 0 && (
              <span
                className={[
                  "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold",
                  isActive
                    ? "bg-white/25 text-white"
                    : "bg-warm-muted text-warm-subtle dark:bg-gray-700 dark:text-gray-400",
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
