"use client";

import { useSyncExternalStore } from "react";
import { currentMeal, todayKey } from "./dates";
import type { Meal } from "./types";

/**
 * Austin "today" + current meal, read only in the browser (never during prerender).
 * Re-checks every minute and whenever the app comes back to the foreground,
 * so the day rolls over correctly if the app is left open overnight.
 */
function subscribe(cb: () => void) {
  const id = setInterval(cb, 60_000);
  document.addEventListener("visibilitychange", cb);
  return () => {
    clearInterval(id);
    document.removeEventListener("visibilitychange", cb);
  };
}
const snapshot = () => `${todayKey()}|${currentMeal()}`;

export function useClock(): { today: string; meal: Meal } | null {
  const s = useSyncExternalStore(subscribe, snapshot, () => null);
  if (!s) return null;
  const [today, meal] = s.split("|");
  return { today, meal: meal as Meal };
}
