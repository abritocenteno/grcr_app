"use client";

export type ViewMode = "list" | "grid";

interface ViewToggleProps {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-0.5 bg-warm-muted dark:bg-gray-800 rounded-xl p-0.5">
      <button
        onClick={() => onChange("list")}
        aria-label="List view"
        className={[
          "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150",
          view === "list"
            ? "bg-warm-card dark:bg-gray-700 shadow-card text-warm-text dark:text-gray-100"
            : "text-warm-subtle dark:text-gray-500",
        ].join(" ")}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      </button>
      <button
        onClick={() => onChange("grid")}
        aria-label="Grid view"
        className={[
          "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150",
          view === "grid"
            ? "bg-warm-card dark:bg-gray-700 shadow-card text-warm-text dark:text-gray-100"
            : "text-warm-subtle dark:text-gray-500",
        ].join(" ")}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      </button>
    </div>
  );
}
