"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ItemSheet, { DietTags } from "@/components/ItemSheet";
import { MacroLine, Segmented, StarIcon, Toast } from "@/components/ui";
import { prettyDate } from "@/lib/dates";
import { useClock } from "@/lib/useClock";
import { useFavorites, useHall } from "@/lib/storage";
import { useLogActions } from "@/lib/useLogActions";
import { useMenu } from "@/lib/useMenu";
import { HALLS, MEALS, type Item, type Meal } from "@/lib/types";

export default function MenuPage() {
  const clock = useClock();
  return clock ? <Menu today={clock.today} nowMeal={clock.meal} /> : (
    <main className="px-4">
      <Skeleton />
    </main>
  );
}

function Menu({ today, nowMeal }: { today: string; nowMeal: Meal }) {
  const state = useMenu();
  const menu = state.menu;
  const [hall, setHall] = useHall();
  const [favs, setFavs] = useFavorites();
  const { addEntry, toast } = useLogActions();

  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const [pickedMeal, setPickedMeal] = useState<Meal | null>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Item | null>(null);

  // Today and the days after it, in UT's order.
  const dates = menu ? menu.dates.slice(Math.max(0, menu.dates.indexOf(today))) : [];
  const date = pickedDate && dates.includes(pickedDate) ? pickedDate : menu?.dates.includes(today) ? today : null;
  const todayMissing = !!menu && !menu.dates.includes(today);

  const hallMeals = (date && menu?.days[date]?.[hall]) || {};
  const available = MEALS.filter((m) => hallMeals[m]?.length);
  const preferred = pickedMeal ?? nowMeal;
  const meal: Meal | null = available.includes(preferred)
    ? preferred
    : (available.find((m) => MEALS.indexOf(m) > MEALS.indexOf(preferred)) ?? available.at(-1) ?? null);
  const stations = meal ? (hallMeals[meal] ?? []) : [];

  const favIds = useMemo(() => new Set(favs.map((f) => f.itemId)), [favs]);
  const query = q.trim().toLowerCase();
  const visible = (() => {
    if (!menu) return [];
    const list = stations
      .map((s) => ({
        station: s.station,
        items: s.items.map((id) => menu.items[id]).filter((it) => it && (!query || it.name.toLowerCase().includes(query))),
      }))
      .filter((s) => s.items.length);
    const favHere = stations.flatMap((s) => s.items).filter((id, i, a) => favIds.has(id) && a.indexOf(id) === i);
    if (favHere.length && !query) list.unshift({ station: "★ Your favorites here", items: favHere.map((id) => menu.items[id]) });
    return list;
  })();

  const toggleFav = (it: Item) =>
    setFavs((prev) =>
      prev.some((f) => f.itemId === it.id)
        ? prev.filter((f) => f.itemId !== it.id)
        : [...prev, { itemId: it.id, name: it.name, portion: it.portion, per: it.m }],
    );

  return (
    <main className="px-4">
      <header className="flex items-baseline justify-between pb-3 pt-5">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Longhorn Macros <span className="align-middle text-xs font-semibold text-muted">(unofficial)</span>
        </h1>
      </header>

      <div className="sticky top-0 z-20 -mx-4 space-y-2 bg-bg/95 px-4 pb-3 pt-1 backdrop-blur">
        <Segmented options={HALLS} value={hall} onChange={setHall} />
        <Segmented
          options={MEALS}
          value={meal ?? preferred}
          onChange={setPickedMeal}
          disabled={MEALS.filter((m) => !available.includes(m))}
        />
        <div className="flex gap-2">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search this menu"
            className="h-11 min-w-0 flex-1 rounded-2xl bg-card px-4 text-base ring-1 ring-line outline-none focus:ring-2 focus:ring-accent"
          />
          {dates.length > 1 && date && (
            <select
              value={date}
              onChange={(e) => setPickedDate(e.target.value)}
              aria-label="Menu date"
              className="h-11 rounded-2xl bg-card px-3 text-sm font-semibold ring-1 ring-line"
            >
              {dates.map((d) => (
                <option key={d} value={d}>
                  {prettyDate(d, today)}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {state.status === "stale" && (
        <Banner>
          Couldn&apos;t reach UT&apos;s menu right now, so this is the last copy saved on your phone (updated {menu?.lastCached}).
        </Banner>
      )}
      {date && date !== today && <Banner>Showing the menu for {prettyDate(date, today)}. Anything you add still goes in today&apos;s log.</Banner>}

      {state.status === "loading" && <Skeleton />}

      {state.status === "error" && (
        <Empty title="Menu unavailable">
          We couldn&apos;t load UT&apos;s dining menu ({state.error}). You can still{" "}
          <Link href="/today" className="font-semibold text-accent underline">
            log custom foods and favorites
          </Link>
          .
        </Empty>
      )}

      {todayMissing && (
        <Empty title="Today isn't on the menu yet">
          UT&apos;s published menu covers {menu?.dates[0]} to {menu?.dates.at(-1)}. You can still{" "}
          <Link href="/today" className="font-semibold text-accent underline">
            log custom foods and favorites
          </Link>
          .
        </Empty>
      )}

      {menu && date && !meal && (
        <Empty title={`${hall} isn't serving ${prettyDate(date, today) === "Today" ? "today" : "that day"}`}>Try another dining hall.</Empty>
      )}

      {menu && meal && query && visible.length === 0 && <Empty title="No matches">Nothing at {hall} {meal.toLowerCase()} matches “{q}”.</Empty>}

      <div className="space-y-5 pt-2">
        {visible.map((s) => (
          <section key={s.station}>
            <h2 className="px-1 pb-1.5 text-xs font-bold uppercase tracking-wider text-muted">{s.station}</h2>
            <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-card ring-1 ring-line">
              {s.items.map((it) => (
                <li key={it.id}>
                  <button type="button" onClick={() => setOpen(it)} className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-bg">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold leading-snug">{it.name}</span>
                        {favIds.has(it.id) && <StarIcon filled className="h-3.5 w-3.5 shrink-0 text-amber-500" />}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                        <span className="text-muted">{it.portion}</span>
                        <MacroLine m={it.m} />
                        <DietTags codes={it.legends} labels={menu?.legends} dietOnly />
                      </div>
                    </div>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft text-xl font-bold text-accent">+</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <ItemSheet
        food={open && { name: open.name, portion: open.portion, per: open.m, legends: open.legends, extra: open, hall }}
        onClose={() => setOpen(null)}
        initialMeal={meal ?? nowMeal}
        showMealPicker
        legendLabels={menu?.legends}
        favorite={open ? { on: favIds.has(open.id), toggle: () => toggleFav(open) } : undefined}
        onConfirm={(servings, logMeal) => {
          if (!open) return;
          addEntry({ meal: logMeal, name: open.name, source: { kind: "menu", itemId: open.id, hall }, portion: open.portion, servings, per: open.m });
          setOpen(null);
        }}
      />
      <Toast message={toast?.msg ?? null} action={toast?.undo ? "Undo" : undefined} onAction={toast?.undo} />
    </main>
  );
}

function Banner({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 rounded-2xl bg-accent-soft px-4 py-3 text-sm text-fg">{children}</p>;
}

function Empty({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-2xl bg-card px-5 py-8 text-center ring-1 ring-line">
      <p className="font-bold">{title}</p>
      <p className="mt-1 text-sm text-muted">{children}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-2 pt-4" aria-label="Loading">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-2xl bg-card ring-1 ring-line" />
      ))}
    </div>
  );
}
