"use client";

import { useState } from "react";
import { LOG_MEALS, type LogMeal, type Macros } from "@/lib/types";
import { Sheet } from "./ui";

export type CustomFoodInput = { name: string; portion: string; per: Macros; servings: number; meal: LogMeal; save: boolean };

/** Form for food that isn't on a dining hall menu (protein shake, snacks, etc.). */
export default function CustomFoodSheet({ open, onClose, initialMeal, onSubmit }: { open: boolean; onClose: () => void; initialMeal: LogMeal; onSubmit: (f: CustomFoodInput) => void }) {
  return (
    <Sheet open={open} onClose={onClose}>
      {open && <Form initialMeal={initialMeal} onSubmit={onSubmit} />}
    </Sheet>
  );
}

function Form({ initialMeal, onSubmit }: { initialMeal: LogMeal; onSubmit: (f: CustomFoodInput) => void }) {
  const [name, setName] = useState("");
  const [portion, setPortion] = useState("");
  const [vals, setVals] = useState({ cals: "", protein: "", carbs: "", fat: "" });
  const [servings, setServings] = useState("1");
  const [meal, setMeal] = useState<LogMeal>(initialMeal);
  const [save, setSave] = useState(true);

  const n = (s: string) => {
    const v = parseFloat(s);
    return Number.isFinite(v) && v >= 0 ? v : 0;
  };
  const valid = name.trim() && n(servings) > 0 && Object.values(vals).some((v) => n(v) > 0);

  const field = (key: keyof typeof vals, label: string, unit: string) => (
    <label className="block">
      <span className="text-xs font-semibold text-muted">
        {label} {unit && `(${unit})`}
      </span>
      <input
        inputMode="decimal"
        type="number"
        min={0}
        step="any"
        value={vals[key]}
        onChange={(e) => setVals({ ...vals, [key]: e.target.value })}
        className="mt-1 h-12 w-full rounded-xl bg-bg px-3 text-lg font-semibold tabular-nums outline-none ring-1 ring-line focus:ring-2 focus:ring-accent"
        placeholder="0"
      />
    </label>
  );

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        onSubmit({
          name: name.trim(),
          portion: portion.trim() || "1 serving",
          per: { cals: n(vals.cals), protein: n(vals.protein), carbs: n(vals.carbs), fat: n(vals.fat) },
          servings: n(servings),
          meal,
          save,
        });
      }}
    >
      <h2 className="text-xl font-bold">Add custom food</h2>
      <label className="block">
        <span className="text-xs font-semibold text-muted">Name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Whey protein shake"
          className="mt-1 h-12 w-full rounded-xl bg-bg px-3 text-base outline-none ring-1 ring-line focus:ring-2 focus:ring-accent"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold text-muted">Serving size (optional)</span>
        <input
          value={portion}
          onChange={(e) => setPortion(e.target.value)}
          placeholder="e.g. 1 scoop"
          className="mt-1 h-12 w-full rounded-xl bg-bg px-3 text-base outline-none ring-1 ring-line focus:ring-2 focus:ring-accent"
        />
      </label>
      <p className="pt-1 text-sm font-semibold">Macros per serving</p>
      <div className="grid grid-cols-2 gap-3">
        {field("cals", "Calories", "")}
        {field("protein", "Protein", "g")}
        {field("carbs", "Carbs", "g")}
        {field("fat", "Fat", "g")}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-semibold text-muted">Servings</span>
          <input
            inputMode="decimal"
            type="number"
            min={0.25}
            step="any"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            className="mt-1 h-12 w-full rounded-xl bg-bg px-3 text-lg font-semibold outline-none ring-1 ring-line focus:ring-2 focus:ring-accent"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted">Meal</span>
          <select
            value={meal}
            onChange={(e) => setMeal(e.target.value as LogMeal)}
            className="mt-1 h-12 w-full rounded-xl bg-bg px-3 text-base font-semibold ring-1 ring-line"
          >
            {LOG_MEALS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex items-center gap-3 py-1 text-sm">
        <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} className="h-5 w-5 accent-[var(--accent)]" />
        Save to My Foods for quick re-adding
      </label>
      <button type="submit" disabled={!valid} className="h-14 w-full rounded-2xl bg-accent text-lg font-bold text-on-accent disabled:opacity-40">
        Add to {meal}
      </button>
    </form>
  );
}
