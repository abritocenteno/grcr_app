"use client";

interface FABProps {
  onPress: () => void;
  label?: string;
}

export function FAB({ onPress, label = "New list" }: FABProps) {
  return (
    <button
      onClick={onPress}
      aria-label={label}
      className={[
        "fixed bottom-6 right-4 z-40",
        "flex items-center gap-2 px-5 h-14 rounded-2xl",
        "bg-warm-text dark:bg-gray-100 text-warm-card dark:text-gray-900",
        "shadow-card-lg font-bold text-sm",
        "transition-all duration-150 active:scale-95",
        "pb-[env(safe-area-inset-bottom)]",
      ].join(" ")}
      style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      {label}
    </button>
  );
}
