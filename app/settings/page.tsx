"use client";

import { useState } from "react";
import { MacroLine } from "@/components/ui";
import { clearAll, DEFAULT_GOALS, useCustomFoods, useFavorites, useGoals } from "@/lib/storage";
import type { Macros } from "@/lib/types";

const FIELDS: { key: keyof Macros; label: string; unit: string }[] = [
  { key: "cals", label: "Calories", unit: "kcal" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "carbs", label: "Carbs", unit: "g" },
  { key: "fat", label: "Fat", unit: "g" },
];

export default function SettingsPage() {
  const [goals, setGoals, ready] = useGoals();
  const [favs, setFavs] = useFavorites();
  const [customs, setCustoms] = useCustomFoods();
  const [formKey, setFormKey] = useState(0); // bump to reload the form after "Clear all data"

  return (
    <main className="space-y-6 px-4 pt-5">
      <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>

      <section>
        <h2 className="px-1 pb-1.5 text-xs font-bold uppercase tracking-wider text-muted">Daily goals</h2>
        {ready && <GoalsForm key={formKey} goals={goals} onSave={setGoals} />}
      </section>

      <ListSection
        title="Favorites"
        empty="Tap the ☆ on any menu item to add it here."
        items={favs.map((f) => ({ id: f.itemId, name: f.name, sub: f.portion, m: f.per }))}
        onRemove={(id) => setFavs((p) => p.filter((f) => f.itemId !== id))}
      />
      <ListSection
        title="My foods"
        empty="Custom foods you save show up here and in Today → Quick add."
        items={customs.map((c) => ({ id: c.id, name: c.name, sub: c.portion, m: c.per }))}
        onRemove={(id) => setCustoms((p) => p.filter((c) => c.id !== id))}
      />

      <section className="space-y-3 rounded-2xl bg-card p-4 text-sm ring-1 ring-line">
        <p>
          <span className="font-bold">Your data stays on this device.</span> Your log, goals, favorites and foods are saved in this browser only. No account, nothing uploaded. Deleting the home-screen app or clearing Safari website data erases it.
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm("Delete your whole log, goals, favorites and custom foods from this device? This can't be undone.")) {
              clearAll();
              setFormKey((k) => k + 1);
            }
          }}
          className="h-11 w-full rounded-xl font-semibold text-red-600 ring-1 ring-line"
        >
          Clear all data
        </button>
      </section>

      <p className="px-1 text-xs text-muted">
        Longhorn Macros is an unofficial student project. It isn&apos;t affiliated with or endorsed by UT Austin. Menu nutrition comes from UT Housing &amp; Dining&apos;s public menu and may not be exact.
      </p>
    </main>
  );
}

function GoalsForm({ goals, onSave }: { goals: Macros; onSave: (g: Macros) => void }) {
  const [vals, setVals] = useState(() => Object.fromEntries(FIELDS.map((f) => [f.key, String(goals[f.key])])) as Record<keyof Macros, string>);
  const [saved, setSaved] = useState(false);
  const parsed = Object.fromEntries(FIELDS.map((f) => [f.key, parseFloat(vals[f.key])])) as Macros;
  const valid = FIELDS.every((f) => Number.isFinite(parsed[f.key]) && parsed[f.key] > 0);
  const macroCals = parsed.protein * 4 + parsed.carbs * 4 + parsed.fat * 9;

  return (
    <form
      className="space-y-3 rounded-2xl bg-card p-4 ring-1 ring-line"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        onSave(parsed);
        setSaved(true);
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="text-xs font-semibold text-muted">
              {f.label} ({f.unit})
            </span>
            <input
              type="number"
              inputMode="decimal"
              min={1}
              step="any"
              value={vals[f.key]}
              onChange={(e) => {
                setVals({ ...vals, [f.key]: e.target.value });
                setSaved(false);
              }}
              className="mt-1 h-12 w-full rounded-xl bg-bg px-3 text-lg font-semibold tabular-nums outline-none ring-1 ring-line focus:ring-2 focus:ring-accent"
            />
          </label>
        ))}
      </div>
      {valid && (
        <p className="text-xs text-muted">
          Your protein, carbs and fat add up to about {Math.round(macroCals)} kcal (4/4/9 per gram).
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={!valid} className="h-12 flex-1 rounded-xl bg-accent font-bold text-on-accent disabled:opacity-40">
          {saved ? "Saved ✓" : "Save goals"}
        </button>
        <button
          type="button"
          onClick={() => setVals(Object.fromEntries(FIELDS.map((f) => [f.key, String(DEFAULT_GOALS[f.key])])) as Record<keyof Macros, string>)}
          className="h-12 rounded-xl px-4 text-sm font-semibold text-muted ring-1 ring-line"
        >
          Reset
        </button>
      </div>
    </form>
  );
}

function ListSection({ title, empty, items, onRemove }: { title: string; empty: string; items: { id: string; name: string; sub: string; m: Macros }[]; onRemove: (id: string) => void }) {
  return (
    <section>
      <h2 className="px-1 pb-1.5 text-xs font-bold uppercase tracking-wider text-muted">{title}</h2>
      {items.length === 0 ? (
        <p className="rounded-2xl bg-card px-4 py-4 text-sm text-muted ring-1 ring-line">{empty}</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-card ring-1 ring-line">
          {items.map((it) => (
            <li key={it.id} className="flex items-center gap-2 py-2.5 pl-4 pr-2">
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{it.name}</div>
                <div className="text-xs">
                  <span className="text-muted">{it.sub} · </span>
                  <MacroLine m={it.m} />
                </div>
              </div>
              <button type="button" onClick={() => onRemove(it.id)} className="h-10 rounded-lg px-3 text-sm font-semibold text-red-600">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
