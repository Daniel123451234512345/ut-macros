"use client";

import { useState } from "react";
import { fmtCals, fmtServings, scale, totalOf } from "@/lib/macros";
import { LOG_MEALS, type LogEntry } from "@/lib/types";
import ItemSheet from "./ItemSheet";
import { MacroLine } from "./ui";

type Props = {
  entries: LogEntry[];
  onUpdate: (id: string, patch: Partial<LogEntry>) => void;
  onDelete: (id: string) => void;
};

/** A day's log grouped by meal. Tap an entry to change servings/meal or delete it. */
export default function LogList({ entries, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState<LogEntry | null>(null);

  return (
    <div className="space-y-4">
      {LOG_MEALS.map((meal) => {
        const list = entries.filter((e) => e.meal === meal);
        if (!list.length) return null;
        return (
          <section key={meal}>
            <div className="flex items-baseline justify-between px-1 pb-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">{meal}</h3>
              <span className="text-xs tabular-nums text-muted">{fmtCals(totalOf(list).cals)} cal</span>
            </div>
            <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-card ring-1 ring-line">
              {list.map((e) => (
                <li key={e.id} className="flex items-center">
                  <button type="button" onClick={() => setEditing(e)} className="min-w-0 flex-1 px-4 py-3 text-left active:bg-bg">
                    <div className="truncate font-semibold">{e.name}</div>
                    <div className="mt-0.5 text-sm">
                      <span className="text-muted">
                        {fmtServings(e.servings)} × {e.portion} ·{" "}
                      </span>
                      <MacroLine m={scale(e.per, e.servings)} />
                    </div>
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${e.name}`}
                    onClick={() => onDelete(e.id)}
                    className="grid h-14 w-12 shrink-0 place-items-center text-muted active:text-red-600"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <ItemSheet
        food={editing && { name: editing.name, portion: editing.portion, per: editing.per }}
        mode="edit"
        initialServings={editing?.servings}
        initialMeal={editing?.meal ?? "Lunch"}
        showMealPicker
        onClose={() => setEditing(null)}
        onConfirm={(servings, meal) => {
          if (editing) onUpdate(editing.id, { servings, meal });
          setEditing(null);
        }}
        onDelete={() => {
          if (editing) onDelete(editing.id);
          setEditing(null);
        }}
      />
    </div>
  );
}
