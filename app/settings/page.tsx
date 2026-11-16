"use client";

import { useState } from "react";
import { MacroLine, SectionTitle } from "@/components/ui";
import { clearAll, DEFAULT_GOALS, useCustomFoods, useFavorites, useGoals, useThemePref } from "@/lib/storage";
import { applyTheme, type ThemePref } from "@/lib/theme";
import type { Macros } from "@/lib/types";

const FIELDS: { key: keyof Macros; label: string; unit: string }[] = [
  { key: "cals", label: "Calories", unit: "kcal" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "carbs", label: "Carbs", unit: "g" },
  { key: "fat", label: "Fat", unit: "g" },
];

const THEMES: { value: ThemePref; label: string; icon: React.ReactNode }[] = [
  {
    value: "auto",
    label: "Auto",
    icon: (
      <>
        <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
        <path d="M11 18.5h2" />
      </>
    ),
  },
  {
    value: "light",
    label: "Light",
    icon: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
      </>
    ),
  },
  { value: "dark", label: "Dark", icon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" /> },
];

export default function SettingsPage() {
  const [goals, setGoals, ready] = useGoals();
  const [favs, setFavs] = useFavorites();
  const [customs, setCustoms] = useCustomFoods();
  const [formKey, setFormKey] = useState(0); // bump to reload the form after "Clear all data"
  const [theme, setTheme, themeReady] = useThemePref();

  return (
    <main className="space-y-6 px-[18px] pt-6">
      <h1 className="font-display text-[32px] font-extrabold leading-tight tracking-tight">Settings</h1>

      <section>
        <SectionTitle>Daily goals</SectionTitle>
        {ready && <GoalsForm key={formKey} goals={goals} onSave={setGoals} />}
      </section>

      <section>
        <SectionTitle>Appearance</SectionTitle>
        <div className="grid grid-cols-3 gap-1.5 rounded-[22px] bg-card p-1.5 shadow-[0_1px_0_var(--line)]" role="group" aria-label="Appearance">
          {THEMES.map((t) => {
            const on = themeReady && theme === t.value;
            return (
              <button
                key={t.value}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setTheme(t.value);
                  applyTheme(t.value);
                }}
                className={`flex h-14 flex-col items-center justify-center gap-0.5 rounded-[16px] text-sm ${on ? "bg-accent font-bold text-on-accent" : "font-semibold text-muted"}`}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {t.icon}
                </svg>
                {t.label}
              </button>
            );
          })}
        </div>
        <p className="px-1 pt-2 text-xs text-muted">Auto matches your phone&apos;s Light or Dark Mode.</p>
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

      <section className="space-y-3 rounded-[22px] bg-card p-4 text-sm shadow-[0_1px_0_var(--line)]">
        <p>
          <span className="font-bold">Your data stays on this device.</span> Your log, goals, favorites and foods are saved in this browser only. No account, nothing uploaded. Deleting the home-screen app or clearing Safari website data erases it.
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm("Delete your whole log, goals, favorites and custom foods from this device? This can't be undone.")) {
              clearAll();
              applyTheme("auto");
              setFormKey((k) => k + 1);
            }
          }}
          className="h-11 w-full rounded-full font-semibold text-red-600 ring-1 ring-line dark:text-red-400"
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
      className="space-y-3 rounded-[22px] bg-card p-4 shadow-[0_1px_0_var(--line)]"
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
        <button type="submit" disabled={!valid} className="h-12 flex-1 rounded-full bg-accent font-bold text-on-accent disabled:opacity-40">
          {saved ? "Saved ✓" : "Save goals"}
        </button>
        <button
          type="button"
          onClick={() => setVals(Object.fromEntries(FIELDS.map((f) => [f.key, String(DEFAULT_GOALS[f.key])])) as Record<keyof Macros, string>)}
          className="h-12 rounded-full px-4 text-sm font-semibold text-muted ring-1 ring-line"
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
      <SectionTitle>{title}</SectionTitle>
      {items.length === 0 ? (
        <p className="rounded-[22px] bg-card px-4 py-4 text-sm text-muted shadow-[0_1px_0_var(--line)]">{empty}</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-[22px] bg-card shadow-[0_1px_0_var(--line)]">
          {items.map((it) => (
            <li key={it.id} className="flex items-center gap-2 py-2.5 pl-4 pr-2">
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{it.name}</div>
                <div className="text-xs">
                  <span className="text-muted">{it.sub} · </span>
                  <MacroLine m={it.m} />
                </div>
              </div>
              <button type="button" onClick={() => onRemove(it.id)} className="h-10 rounded-full px-3 text-sm font-semibold text-red-600 dark:text-red-400">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
