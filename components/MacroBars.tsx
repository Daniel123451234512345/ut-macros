import { fmtCals, fmtG } from "@/lib/macros";
import type { Macros } from "@/lib/types";

const ROWS = [
  { key: "cals", label: "Calories", unit: "", bar: "bg-kcal", fmt: fmtCals },
  { key: "protein", label: "Protein", unit: "g", bar: "bg-prot", fmt: fmtG },
  { key: "carbs", label: "Carbs", unit: "g", bar: "bg-carb", fmt: fmtG },
  { key: "fat", label: "Fat", unit: "g", bar: "bg-fat", fmt: fmtG },
] as const;

export default function MacroBars({ total, goals }: { total: Macros; goals: Macros }) {
  return (
    <div className="space-y-3.5 rounded-3xl bg-card p-5 ring-1 ring-line">
      {ROWS.map((r) => {
        const val = total[r.key];
        const goal = goals[r.key] || 1;
        const pct = Math.min(100, (val / goal) * 100);
        const left = goal - val;
        return (
          <div key={r.key}>
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span className="font-semibold">{r.label}</span>
              <span className="tabular-nums">
                <span className="font-bold">{r.fmt(val)}</span>
                <span className="text-muted">
                  {" "}/ {r.fmt(goals[r.key])}
                  {r.unit} ·{" "}
                  {left >= 0 ? `${r.fmt(left)}${r.unit} left` : `${r.fmt(-left)}${r.unit} over`}
                </span>
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-bg" role="progressbar" aria-label={r.label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
              <div className={`h-full rounded-full ${r.bar} transition-[width] duration-300`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
