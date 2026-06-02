"use client";

interface ListFooterProps {
  doneCount: number;
  totalCount: number;
  onClearDone: () => void;
}

export function ListFooter({ doneCount, totalCount, onClearDone }: ListFooterProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {doneCount}/{totalCount} checked
      </span>
      {doneCount > 0 && (
        <button
          onClick={onClearDone}
          className="text-sm text-red-500 dark:text-red-400 font-medium min-h-[44px] px-2 active:opacity-70"
        >
          Clear checked
        </button>
      )}
    </div>
  );
}
