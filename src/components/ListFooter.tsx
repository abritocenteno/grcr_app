"use client";

interface ListFooterProps {
  doneCount: number;
  totalCount: number;
  onClearDone: () => void;
}

export function ListFooter({ doneCount, totalCount, onClearDone }: ListFooterProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-warm-muted/60 dark:border-gray-800">
      <span className="text-xs font-medium text-warm-subtle dark:text-gray-500">
        {doneCount} of {totalCount} checked
      </span>
      {doneCount > 0 && (
        <button
          onClick={onClearDone}
          className="text-xs font-semibold text-red-400 dark:text-red-400 min-h-[36px] px-3 rounded-xl active:bg-red-50 dark:active:bg-red-950/30 transition-colors"
        >
          Clear checked
        </button>
      )}
    </div>
  );
}
