"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { getStoreColor, storeLabel } from "@/lib/storeColors";

export interface ToastInput {
  title: string;
  subtitle?: string;
  store?: string;
  listId?: string;
}

interface Toast extends ToastInput {
  id: number;
}

interface ToastContextValue {
  showToast: (t: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

const DURATION = 4500; // ms a toast stays before auto-dismissing

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((t: ToastInput) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { ...t, id }].slice(-3)); // cap at 3 on screen
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed inset-x-0 top-0 z-50 flex flex-col items-center gap-2 px-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] pointer-events-none">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const router = useRouter();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // Trigger the slide-in on next frame, then schedule auto-dismiss.
    const raf = requestAnimationFrame(() => setShown(true));
    const timer = setTimeout(() => {
      setShown(false);
      setTimeout(onDismiss, 200); // wait for slide-out before unmounting
    }, DURATION);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [onDismiss]);

  const color = toast.store ? getStoreColor(toast.store) : null;

  return (
    <button
      onClick={() => {
        if (toast.listId) router.push(`/list/${toast.listId}`);
        onDismiss();
      }}
      className={[
        "pointer-events-auto w-full max-w-md flex items-center gap-3 p-3 rounded-2xl text-left",
        "bg-warm-card dark:bg-gray-900 shadow-card border border-black/5 dark:border-white/10",
        "transition-all duration-200 ease-out active:scale-[0.98]",
        shown ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3",
      ].join(" ")}
    >
      <div
        className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
        style={color ? { backgroundColor: color.bg } : { backgroundColor: "#e5e7eb" }}
      >
        <svg
          className="w-5 h-5"
          style={{ color: color ? color.text : "#6b7280" }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-warm-text dark:text-gray-100 truncate">
          {toast.title}
        </p>
        {toast.subtitle && (
          <p className="text-xs text-warm-subtle dark:text-gray-500 truncate mt-0.5">
            {toast.subtitle}
            {toast.store ? ` · ${storeLabel(toast.store)}` : ""}
          </p>
        )}
      </div>
    </button>
  );
}
