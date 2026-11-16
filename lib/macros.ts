import type { LogEntry, Macros } from "./types";

export const ZERO: Macros = { cals: 0, protein: 0, carbs: 0, fat: 0 };

export function scale(per: Macros, servings: number): Macros {
  return {
    cals: per.cals * servings,
    protein: per.protein * servings,
    carbs: per.carbs * servings,
    fat: per.fat * servings,
  };
}

export function add(a: Macros, b: Macros): Macros {
  return { cals: a.cals + b.cals, protein: a.protein + b.protein, carbs: a.carbs + b.carbs, fat: a.fat + b.fat };
}

export function totalOf(entries: LogEntry[]): Macros {
  return entries.reduce((acc, e) => add(acc, scale(e.per, e.servings)), ZERO);
}

/** Display helpers: whole calories, grams to one decimal. Storage is never rounded. */
export const fmtCals = (n: number) => String(Math.round(n));
export const fmtG = (n: number) => {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
};

export function fmtServings(s: number) {
  return Number.isInteger(s) ? String(s) : s.toFixed(1);
}
