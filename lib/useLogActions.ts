"use client";

import { useCallback, useRef, useState } from "react";
import { todayKey } from "./dates";
import { newId, useLog } from "./storage";
import type { LogEntry } from "./types";

/** Add / edit / delete log entries, plus a short-lived toast with Undo. */
export function useLogActions() {
  const [log, setLog, ready] = useLog();
  const [toast, setToast] = useState<{ msg: string; undo?: () => void } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const flash = useCallback((msg: string, undo?: () => void) => {
    clearTimeout(timer.current);
    setToast({ msg, undo });
    timer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const addEntry = useCallback(
    (e: Omit<LogEntry, "id" | "date" | "addedAt"> & { date?: string }) => {
      const entry: LogEntry = { ...e, id: newId(), date: e.date ?? todayKey(), addedAt: Date.now() };
      setLog((prev) => ({ ...prev, [entry.date]: [...(prev[entry.date] ?? []), entry] }));
      flash(`Added ${entry.name}`, () => {
        setLog((prev) => ({ ...prev, [entry.date]: (prev[entry.date] ?? []).filter((x) => x.id !== entry.id) }));
        setToast(null);
      });
    },
    [setLog, flash],
  );

  const updateEntry = useCallback(
    (date: string, id: string, patch: Partial<LogEntry>) =>
      setLog((prev) => ({ ...prev, [date]: (prev[date] ?? []).map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
    [setLog],
  );

  const deleteEntry = useCallback(
    (date: string, id: string) => {
      let removed: LogEntry | undefined;
      let index = -1;
      setLog((prev) => {
        const list = prev[date] ?? [];
        index = list.findIndex((x) => x.id === id);
        removed = list[index];
        return { ...prev, [date]: list.filter((x) => x.id !== id) };
      });
      if (removed) {
        const r = removed;
        flash(`Deleted ${r.name}`, () => {
          setLog((prev) => {
            const list = [...(prev[date] ?? [])];
            list.splice(Math.max(0, index), 0, r);
            return { ...prev, [date]: list };
          });
          setToast(null);
        });
      }
    },
    [setLog, flash],
  );

  return { log, ready, addEntry, updateEntry, deleteEntry, toast, dismissToast: () => setToast(null) };
}
