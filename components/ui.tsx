"use client";

import { useEffect, type ReactNode } from "react";
import { fmtCals, fmtG } from "@/lib/macros";
import type { Macros } from "@/lib/types";

/** Bottom sheet modal. Tap the backdrop to close. */
export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="sheet-up max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-line" />
        {children}
      </div>
    </div>
  );
}

export function Stepper({ value, onChange, min = 0.5, max = 20 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  const btn = "h-14 w-14 rounded-2xl bg-bg text-2xl font-semibold active:scale-95 disabled:opacity-30";
  return (
    <div className="flex items-center justify-center gap-4">
      <button type="button" aria-label="Fewer servings" className={btn} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 0.5))}>
        −
      </button>
      <div className="w-24 text-center">
        <div className="text-3xl font-bold tabular-nums">{Number.isInteger(value) ? value : value.toFixed(1)}</div>
        <div className="text-xs text-muted">{value === 1 ? "serving" : "servings"}</div>
      </div>
      <button type="button" aria-label="More servings" className={btn} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 0.5))}>
        +
      </button>
    </div>
  );
}

/** Four macro tiles. */
export function MacroGrid({ m }: { m: Macros }) {
  const cell = (label: string, val: string, unit: string, color: string) => (
    <div className="rounded-2xl bg-bg px-2 py-3 text-center">
      <div className={`text-xl font-bold tabular-nums ${color}`}>
        {val}
        <span className="text-xs font-medium text-muted">{unit}</span>
      </div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
  return (
    <div className="grid grid-cols-4 gap-2">
      {cell("Calories", fmtCals(m.cals), "", "text-kcal")}
      {cell("Protein", fmtG(m.protein), "g", "text-prot")}
      {cell("Carbs", fmtG(m.carbs), "g", "text-carb")}
      {cell("Fat", fmtG(m.fat), "g", "text-fat")}
    </div>
  );
}

/** Compact one-line macros, e.g. "320 cal · 24P 30C 9F". */
export function MacroLine({ m, className = "" }: { m: Macros; className?: string }) {
  return (
    <span className={`tabular-nums text-muted ${className}`}>
      {fmtCals(m.cals)} cal · <span className="text-prot">{fmtG(m.protein)}P</span>{" "}
      <span className="text-carb">{fmtG(m.carbs)}C</span> <span className="text-fat">{fmtG(m.fat)}F</span>
    </span>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  disabled = [],
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  disabled?: T[];
}) {
  return (
    <div className="flex rounded-2xl bg-card p-1 shadow-sm ring-1 ring-line">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          disabled={disabled.includes(o)}
          onClick={() => onChange(o)}
          className={`h-10 flex-1 rounded-xl text-sm font-semibold transition-colors disabled:opacity-35 ${
            value === o ? "bg-accent text-on-accent" : "text-fg"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function StarIcon({ filled, className = "h-6 w-6" }: { filled: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" aria-hidden>
      <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1-4.5-4.2 6.1-.8L12 3Z" />
    </svg>
  );
}

export function Toast({ message, action, onAction }: { message: string | null; action?: string; onAction?: () => void }) {
  if (!message) return null;
  return (
    <div className="fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-4">
      <div className="flex max-w-xl items-center gap-4 rounded-2xl bg-fg px-4 py-3 text-sm text-bg shadow-lg">
        <span>{message}</span>
        {action && (
          <button type="button" className="font-bold underline underline-offset-2" onClick={onAction}>
            {action}
          </button>
        )}
      </div>
    </div>
  );
}
