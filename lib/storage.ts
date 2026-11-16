"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { CustomFood, Favorite, Hall, LogEntry, Macros } from "./types";

/**
 * Tiny localStorage-backed store. Everything personal lives on this device only.
 * Reads are wrapped in try/catch (private mode, blocked storage) and fall back to defaults.
 */
const PREFIX = "lm:v1:";
const listeners = new Set<() => void>();
const parsed = new Map<string, { raw: string | null; value: unknown }>();

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

function read<T>(key: string, fallback: T): T {
  const raw = readRaw(key);
  const hit = parsed.get(key);
  if (hit && hit.raw === raw) return (hit.value ?? fallback) as T;
  let value: unknown = null;
  try {
    value = raw == null ? null : JSON.parse(raw);
  } catch {
    value = null;
  }
  parsed.set(key, { raw, value });
  return (value ?? fallback) as T;
}

export function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // storage full or blocked: keep going in memory for this session
    parsed.set(key, { raw: "__mem__" + Math.random(), value });
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (!e.key || e.key.startsWith(PREFIX)) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

const NOT_READY = Symbol("not-ready");

/** Returns [value, setValue, ready]. `ready` is false during server render / first paint. */
export function useStored<T>(key: string, fallback: T) {
  const v = useSyncExternalStore(
    subscribe,
    () => read<T>(key, fallback),
    () => NOT_READY as unknown as T,
  );
  const ready = (v as unknown) !== NOT_READY;
  const value = ready ? v : fallback;
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = read<T>(key, fallback);
      write(key, typeof next === "function" ? (next as (p: T) => T)(prev) : next);
    },
    // fallback is a constant default per call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  return [value, set, ready] as const;
}

export const DEFAULT_GOALS: Macros = { cals: 2500, protein: 180, carbs: 280, fat: 70 };
const EMPTY_LOG: Record<string, LogEntry[]> = {};
const EMPTY_FAVS: Favorite[] = [];
const EMPTY_CUSTOM: CustomFood[] = [];

export const useLog = () => useStored("log", EMPTY_LOG);
export const useGoals = () => useStored("goals", DEFAULT_GOALS);
export const useFavorites = () => useStored("favorites", EMPTY_FAVS);
export const useCustomFoods = () => useStored("customFoods", EMPTY_CUSTOM);
export const useHall = () => useStored<Hall>("hall", "J2");

export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function clearAll() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
  parsed.clear();
  listeners.forEach((l) => l());
}
