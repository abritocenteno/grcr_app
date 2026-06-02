"use client";

interface ListFooterProps {
  doneCount: number;
  totalCount: number;
  onClearDone: () => void;
  onResetList: () => void;
}

export function ListFooter({ doneCount, totalCount, onClearDone, onResetList }: ListFooterProps) {
  if (totalCount === 0) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-warm-muted/60 dark:border-gray-800">
      <span className="text-xs font-medium text-warm-subtle dark:text-gray-500">
        {doneCount} of {totalCount} checked
      </span>

      {doneCount > 0 && (
        <div className="flex items-center gap-1">
          {/* New shop — uncheck all, keep items */}
          <button
            onClick={onResetList}
            className="flex items-center gap-1.5 text-xs font-semibold text-warm-text dark:text-gray-200 min-h-[36px] px-3 rounded-xl bg-warm-muted/60 dark:bg-gray-800 active:bg-warm-muted dark:active:bg-gray-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            New shop
          </button>

          {/* Clear checked — delete done items */}
          <button
            onClick={onClearDone}
            className="text-xs font-semibold text-red-400 dark:text-red-400 min-h-[36px] px-3 rounded-xl active:bg-red-50 dark:active:bg-red-950/30 transition-colors"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
