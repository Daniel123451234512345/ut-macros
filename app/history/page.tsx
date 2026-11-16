"use client";

import { useState } from "react";
import LogList from "@/components/LogList";
import { MacroPills, Toast } from "@/components/ui";
import { lastNDays, prettyDate } from "@/lib/dates";
import { useClock } from "@/lib/useClock";
import { fmtCals, totalOf } from "@/lib/macros";
import { useGoals } from "@/lib/storage";
import { useLogActions } from "@/lib/useLogActions";

const DAYS = 14;

export default function HistoryPage() {
  const clock = useClock();
  return clock ? <History today={clock.today} /> : null;
}

function History({ today }: { today: string }) {
  const { log, updateEntry, deleteEntry, toast } = useLogActions();
  const [goals] = useGoals();
  const [open, setOpen] = useState<string | null>(null);

  const days = lastNDays(today, DAYS).map((d) => ({ date: d, entries: log[d] ?? [], total: totalOf(log[d] ?? []) }));
  const logged = days.filter((d) => d.entries.length);
  const avg = logged.length
    ? {
        cals: logged.reduce((s, d) => s + d.total.cals, 0) / logged.length,
        protein: logged.reduce((s, d) => s + d.total.protein, 0) / logged.length,
        carbs: logged.reduce((s, d) => s + d.total.carbs, 0) / logged.length,
        fat: logged.reduce((s, d) => s + d.total.fat, 0) / logged.length,
      }
    : null;
  const max = Math.max(goals.cals, ...days.map((d) => d.total.cals), 1);

  return (
    <main className="space-y-5 px-[18px] pt-6">
      <header>
        <p className="text-sm text-muted">Last {DAYS} days</p>
        <h1 className="font-display text-[32px] font-extrabold leading-tight tracking-tight">History</h1>
      </header>

      {avg && (
        <div className="rounded-[26px] bg-accent px-5 py-[18px] text-on-accent">
          <p className="text-[13px] text-head-soft">
            Daily average · {logged.length} day{logged.length > 1 ? "s" : ""} logged
          </p>
          <p className="mt-0.5 font-display text-[40px] font-extrabold leading-none tabular-nums">
            {fmtCals(avg.cals)}
            <span className="font-sans text-sm font-medium text-head-soft"> cal</span>
          </p>
          <div className="mt-3">
            <MacroPills m={avg} />
          </div>
        </div>
      )}

      <ul className="divide-y divide-line overflow-hidden rounded-[22px] bg-card shadow-[0_1px_0_var(--line)]">
        {days.map((d) => {
          const isOpen = open === d.date;
          const hitProtein = d.total.protein >= goals.protein;
          return (
            <li key={d.date}>
              <button
                type="button"
                disabled={!d.entries.length}
                onClick={() => setOpen(isOpen ? null : d.date)}
                className="w-full px-4 py-3 text-left active:bg-bg disabled:active:bg-transparent"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-display font-extrabold">{prettyDate(d.date, today)}</span>
                  {d.entries.length ? (
                    <span className="text-sm font-bold tabular-nums">
                      {fmtCals(d.total.cals)} <span className="font-normal text-muted">/ {fmtCals(goals.cals)}</span>
                    </span>
                  ) : (
                    <span className="text-sm text-muted">—</span>
                  )}
                </div>
                {d.entries.length > 0 && (
                  <>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${(d.total.cals / max) * 100}%` }} />
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <MacroPills m={d.total} />
                      {hitProtein && <span className="text-xs font-bold text-prot">Protein goal ✓</span>}
                    </div>
                  </>
                )}
              </button>
              {isOpen && (
                <div className="bg-bg px-3 pb-4 pt-3">
                  <LogList entries={d.entries} onUpdate={(id, p) => updateEntry(d.date, id, p)} onDelete={(id) => deleteEntry(d.date, id)} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <Toast message={toast?.msg ?? null} action={toast?.undo ? "Undo" : undefined} onAction={toast?.undo} />
    </main>
  );
}
