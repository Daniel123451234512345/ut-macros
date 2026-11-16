"use client";

import Link from "next/link";
import { useState } from "react";
import CustomFoodSheet from "@/components/CustomFoodSheet";
import ItemSheet, { type SheetFood } from "@/components/ItemSheet";
import LogList from "@/components/LogList";
import MacroBars from "@/components/MacroBars";
import { Toast } from "@/components/ui";
import { keyToDate } from "@/lib/dates";
import { useClock } from "@/lib/useClock";
import { fmtCals, totalOf } from "@/lib/macros";
import { newId, useCustomFoods, useFavorites, useGoals } from "@/lib/storage";
import { useLogActions } from "@/lib/useLogActions";
import type { LogEntry, Meal } from "@/lib/types";

type Quick = SheetFood & { source: LogEntry["source"]; key: string };

export default function TodayPage() {
  const clock = useClock();
  return clock ? <Today today={clock.today} meal={clock.meal} /> : null;
}

function Today({ today, meal }: { today: string; meal: Meal }) {
  const { log, ready, addEntry, updateEntry, deleteEntry, toast } = useLogActions();
  const [goals] = useGoals();
  const [favs] = useFavorites();
  const [customs, setCustoms] = useCustomFoods();
  const [quick, setQuick] = useState<Quick | null>(null);
  const [customOpen, setCustomOpen] = useState(false);

  const entries = log[today] ?? [];
  const total = totalOf(entries);

  const quickItems: Quick[] = [
    ...favs.map((f) => ({ key: "f" + f.itemId, name: f.name, portion: f.portion, per: f.per, source: { kind: "menu" as const, itemId: f.itemId } })),
    ...customs.map((c) => ({ key: "c" + c.id, name: c.name, portion: c.portion, per: c.per, source: { kind: "custom" as const } })),
  ];

  return (
    <main className="space-y-5 px-4 pt-5">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Today</h1>
          <p className="text-sm text-muted">{keyToDate(today).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" })}</p>
        </div>
        <button type="button" onClick={() => setCustomOpen(true)} className="h-11 rounded-2xl bg-accent px-4 text-sm font-bold text-on-accent">
          + Custom food
        </button>
      </header>

      <MacroBars total={total} goals={goals} />

      {quickItems.length > 0 && (
        <section>
          <h2 className="px-1 pb-1.5 text-xs font-bold uppercase tracking-wider text-muted">Quick add</h2>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {quickItems.map((q) => (
              <button
                key={q.key}
                type="button"
                onClick={() => setQuick(q)}
                className="shrink-0 rounded-2xl bg-card px-3.5 py-2 text-left ring-1 ring-line active:bg-bg"
              >
                <div className="max-w-40 truncate text-sm font-semibold">
                  {q.key.startsWith("f") ? "★ " : ""}
                  {q.name}
                </div>
                <div className="text-xs text-muted">
                  {fmtCals(q.per.cals)} cal · {Math.round(q.per.protein)}g P
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {ready && entries.length === 0 ? (
        <div className="rounded-2xl bg-card px-5 py-8 text-center ring-1 ring-line">
          <p className="font-bold">Nothing logged yet today</p>
          <p className="mt-1 text-sm text-muted">
            Pick something from the{" "}
            <Link href="/" className="font-semibold text-accent underline">
              menu
            </Link>{" "}
            or add a custom food.
          </p>
        </div>
      ) : (
        <LogList entries={entries} onUpdate={(id, p) => updateEntry(today, id, p)} onDelete={(id) => deleteEntry(today, id)} />
      )}

      <ItemSheet
        food={quick}
        initialMeal={meal}
        showMealPicker
        onClose={() => setQuick(null)}
        onConfirm={(servings, m) => {
          if (!quick) return;
          addEntry({ meal: m, name: quick.name, source: quick.source, portion: quick.portion, servings, per: quick.per });
          setQuick(null);
        }}
      />
      <CustomFoodSheet
        open={customOpen}
        initialMeal={meal}
        onClose={() => setCustomOpen(false)}
        onSubmit={(f) => {
          addEntry({ meal: f.meal, name: f.name, source: { kind: "custom" }, portion: f.portion, servings: f.servings, per: f.per });
          if (f.save && !customs.some((c) => c.name.toLowerCase() === f.name.toLowerCase())) {
            setCustoms((prev) => [...prev, { id: newId(), name: f.name, portion: f.portion, per: f.per }]);
          }
          setCustomOpen(false);
        }}
      />
      <Toast message={toast?.msg ?? null} action={toast?.undo ? "Undo" : undefined} onAction={toast?.undo} />
    </main>
  );
}
