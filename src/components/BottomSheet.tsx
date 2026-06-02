"use client";

import { useEffect, useRef } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <div
      className={[
        "fixed inset-0 z-50 flex items-end justify-center transition-all duration-300",
        isOpen ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className={[
          "absolute inset-0 bg-black/40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={[
          "relative w-full max-w-md bg-warm-card dark:bg-gray-900 rounded-t-3xl shadow-card-lg",
          "transition-transform duration-300 ease-out",
          "pb-[env(safe-area-inset-bottom)]",
          isOpen ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-warm-muted dark:bg-gray-700" />
        </div>

        {title && (
          <div className="flex items-center justify-between px-5 pt-2 pb-4">
            <h2 className="text-base font-bold text-warm-text dark:text-gray-100">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-warm-muted dark:bg-gray-800 flex items-center justify-center text-warm-subtle dark:text-gray-400"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="px-5 pb-6">{children}</div>
      </div>
    </div>
  );
}
