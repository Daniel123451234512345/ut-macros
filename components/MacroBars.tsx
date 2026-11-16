import { fmtCals, fmtG } from "@/lib/macros";
import type { Macros } from "@/lib/types";

const pct = (v: number, goal: number) => `${Math.min(100, (v / (goal || 1)) * 100)}%`;

const TILES = [
  { key: "protein", label: "Protein", tile: "bg-prot-bg text-prot", bar: "bg-prot" },
  { key: "carbs", label: "Carbs", tile: "bg-carb-bg text-carb", bar: "bg-carb" },
  { key: "fat", label: "Fat", tile: "bg-fat-bg text-fat", bar: "bg-fat" },
] as const;

/** Orange calories card plus three tinted macro tiles, each with progress toward its goal. */
export default function MacroBars({ total, goals }: { total: Macros; goals: Macros }) {
  const left = goals.cals - total.cals;
  return (
    <div className="space-y-2.5">
      <div className="rounded-[26px] bg-accent px-5 py-[18px] text-on-accent">
        <div className="text-[13px] text-head-soft">Calories</div>
        <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
          <span className="font-display text-[44px] font-extrabold leading-none tabular-nums">{fmtCals(total.cals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
          <span className="text-sm text-head-soft tabular-nums">
            / {fmtCals(goals.cals)} · {left >= 0 ? `${fmtCals(left)} left` : `${fmtCals(-left)} over`}
          </span>
        </div>
        <div
          className="mt-3 h-2.5 overflow-hidden rounded-full bg-black/25"
          role="progressbar"
          aria-label="Calories"
          aria-valuenow={Math.round((total.cals / (goals.cals || 1)) * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full rounded-full bg-white transition-[width] duration-300" style={{ width: pct(total.cals, goals.cals) }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {TILES.map((t) => (
          <div key={t.key} className={`rounded-[20px] p-3 ${t.tile}`}>
            <div className="text-xs font-bold">{t.label}</div>
            <div className="mt-0.5 font-display text-[26px] font-extrabold leading-tight tabular-nums">
              {fmtG(total[t.key])}
              <span className="text-sm">g</span>
            </div>
            <div className="text-[11px]">of {fmtG(goals[t.key])}g</div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10" role="progressbar" aria-label={t.label}>
              <div className={`h-full rounded-full ${t.bar} transition-[width] duration-300`} style={{ width: pct(total[t.key], goals[t.key]) }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
