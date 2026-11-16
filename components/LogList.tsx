"use client";

import { useState } from "react";
import { fmtCals, fmtG, fmtServings, scale, totalOf } from "@/lib/macros";
import { LOG_MEALS, type LogEntry } from "@/lib/types";
import ItemSheet from "./ItemSheet";
import { MacroPills } from "./ui";

type Props = {
  entries: LogEntry[];
  onUpdate: (id: string, patch: Partial<LogEntry>) => void;
  onDelete: (id: string) => void;
};

/** A day's log grouped by meal. Tap an entry to change servings/meal or delete it. */
export default function LogList({ entries, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState<LogEntry | null>(null);

  return (
    <div className="space-y-3">
      {LOG_MEALS.map((meal) => {
        const list = entries.filter((e) => e.meal === meal);
        if (!list.length) return null;
        return (
          <section key={meal} className="rounded-[22px] bg-card px-4 py-1.5 shadow-[0_1px_0_var(--line)]">
            <div className="flex items-baseline justify-between pb-1 pt-2">
              <h3 className="font-display text-base font-extrabold">{meal}</h3>
              <span className="text-[13px] tabular-nums text-muted">{fmtCals(totalOf(list).cals)} cal</span>
            </div>
            <ul>
              {list.map((e) => {
                const m = scale(e.per, e.servings);
                return (
                  <li key={e.id} className="flex items-center gap-1 border-t border-line">
                    <button type="button" onClick={() => setEditing(e)} className="flex min-w-0 flex-1 items-center gap-2.5 py-2.5 text-left">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold">{e.name}</span>
                        <span className="block text-xs text-muted">
                          {fmtServings(e.servings)} × {e.portion} · {fmtG(m.carbs)}C {fmtG(m.fat)}F
                        </span>
                      </span>
                      <MacroPills m={m} only="protein" />
                      <span className="w-10 text-right text-[15px] font-bold tabular-nums">{fmtCals(m.cals)}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${e.name}`}
                      onClick={() => onDelete(e.id)}
                      className="-mr-2 grid h-11 w-10 shrink-0 place-items-center text-muted active:text-red-600"
                    >
                      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                      </svg>
                    </button>
                  </li>
                );
              })}
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
