"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ItemSheet, { DietTags } from "@/components/ItemSheet";
import { MacroPills, SectionTitle, StarIcon, Toast } from "@/components/ui";
import { fmtCals } from "@/lib/macros";
import { prettyDate } from "@/lib/dates";
import { useClock } from "@/lib/useClock";
import { useFavorites, useHall } from "@/lib/storage";
import { useLogActions } from "@/lib/useLogActions";
import { useMenu } from "@/lib/useMenu";
import { HALLS, MEALS, type Item, type Meal } from "@/lib/types";

export default function MenuPage() {
  const clock = useClock();
  return clock ? <Menu today={clock.today} nowMeal={clock.meal} /> : (
    <main className="px-[18px]">
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

  const greeting = nowMeal === "Breakfast" ? "Good morning" : nowMeal === "Lunch" ? "Good afternoon" : "Good evening";

  return (
    <main>
      <header className="rounded-b-[28px] bg-accent px-[18px] pb-4 pt-6 text-on-accent">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-head-soft">{greeting}</p>
            <h1 className="font-display text-[32px] font-extrabold leading-[1.1] tracking-tight">
              {meal ? `What\u2019s for ${meal.toLowerCase()}?` : "What\u2019s cooking?"}
            </h1>
          </div>
          {dates.length > 1 && date && (
            <select
              value={date}
              onChange={(e) => setPickedDate(e.target.value)}
              aria-label="Menu date"
              className="mb-1 h-9 shrink-0 rounded-full bg-white/15 px-3 text-sm font-semibold text-white outline-none ring-1 ring-head-line"
            >
              {dates.map((d) => (
                <option key={d} value={d} className="text-black">
                  {prettyDate(d, today)}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="mt-3.5 grid grid-cols-3 gap-2" role="group" aria-label="Dining hall">
          {HALLS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHall(h)}
              aria-pressed={hall === h}
              className={`h-[52px] rounded-[18px] font-display text-lg ${
                hall === h ? "bg-white font-extrabold text-accent" : "font-semibold text-white ring-[1.5px] ring-head-line ring-inset"
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </header>

      <div className="sticky top-0 z-20 space-y-2.5 bg-bg/95 px-[18px] pb-3 pt-3.5 backdrop-blur">
        <div className="flex gap-1.5" role="group" aria-label="Meal">
          {MEALS.map((m) => {
            const isOn = (meal ?? preferred) === m;
            return (
              <button
                key={m}
                type="button"
                disabled={!available.includes(m)}
                onClick={() => setPickedMeal(m)}
                aria-pressed={isOn}
                className={`h-9 rounded-full px-4 text-sm disabled:opacity-35 ${isOn ? "bg-fg font-bold text-bg" : "font-semibold text-muted"}`}
              >
                {m}
              </button>
            );
          })}
        </div>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Search ${hall}${meal ? ` ${meal.toLowerCase()}` : ""}`}
          aria-label="Search this menu"
          className="h-11 w-full rounded-2xl bg-card px-4 text-base shadow-[0_1px_0_var(--line)] outline-none ring-1 ring-line focus:ring-2 focus:ring-accent"
        />
      </div>

      <div className="px-[18px]">
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
            <Link href="/today" className="font-semibold text-ink underline">
              log custom foods and favorites
            </Link>
            .
          </Empty>
        )}

        {todayMissing && (
          <Empty title="Today isn't on the menu yet">
            UT&apos;s published menu covers {menu?.dates[0]} to {menu?.dates.at(-1)}. You can still{" "}
            <Link href="/today" className="font-semibold text-ink underline">
              log custom foods and favorites
            </Link>
            .
          </Empty>
        )}

        {menu && date && !meal && (
          <Empty title={`${hall} isn't serving ${prettyDate(date, today) === "Today" ? "today" : "that day"}`}>Try another dining hall.</Empty>
        )}

        {menu && meal && query && visible.length === 0 && <Empty title="No matches">Nothing at {hall} {meal.toLowerCase()} matches “{q}”.</Empty>}

        <div className="space-y-5 pt-1">
          {visible.map((s) => (
            <section key={s.station}>
              <SectionTitle>{s.station}</SectionTitle>
              <ul className="grid grid-cols-2 gap-2.5">
                {s.items.map((it) => (
                  <li key={it.id} className="flex">
                    <button
                      type="button"
                      onClick={() => setOpen(it)}
                      className="flex w-full flex-col gap-2 rounded-[22px] bg-card p-3.5 text-left shadow-[0_1px_0_var(--line)] active:scale-[0.98]"
                    >
                      <span className="flex items-start gap-1">
                        <span className="min-h-[2.5rem] flex-1 text-[15px] font-bold leading-tight">{it.name}</span>
                        {favIds.has(it.id) && <StarIcon filled className="mt-0.5 h-4 w-4 shrink-0 text-ink" />}
                      </span>
                      <span className="mt-auto font-display text-[26px] font-extrabold leading-none text-ink tabular-nums">
                        {fmtCals(it.m.cals)}
                        <span className="font-sans text-xs font-medium text-muted"> cal · {it.portion}</span>
                      </span>
                      <MacroPills m={it.m} />
                      <DietTags codes={it.legends} labels={menu?.legends} dietOnly />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
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
  return <p className="mb-3 rounded-[18px] bg-accent-soft px-4 py-3 text-sm text-fg">{children}</p>;
}

function Empty({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-[22px] bg-card px-5 py-8 text-center shadow-[0_1px_0_var(--line)]">
      <p className="font-display text-lg font-extrabold">{title}</p>
      <p className="mt-1 text-sm text-muted">{children}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid grid-cols-2 gap-2.5 pt-4" aria-label="Loading">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="h-36 animate-pulse rounded-[22px] bg-card" />
      ))}
    </div>
  );
}
