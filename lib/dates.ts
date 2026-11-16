import type { Meal } from "./types";

const TZ = "America/Chicago";

function parts(d: Date) {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return { y: get("year"), m: get("month"), d: get("day"), h: Number(get("hour")), min: Number(get("minute")) };
}

/** Today's date in Austin, formatted like UT's keys: "MM/DD/YYYY". */
export function todayKey(now = new Date()): string {
  const { y, m, d } = parts(now);
  return `${m}/${d}/${y}`;
}

/** Breakfast before 10:30, Lunch before 4:00 pm, Dinner after (Austin time). */
export function currentMeal(now = new Date()): Meal {
  const { h, min } = parts(now);
  const t = h * 60 + min;
  if (t < 10 * 60 + 30) return "Breakfast";
  if (t < 16 * 60) return "Lunch";
  return "Dinner";
}

/** "MM/DD/YYYY" → Date at noon UTC (safe for day arithmetic and labels). */
export function keyToDate(key: string): Date {
  const [m, d, y] = key.split("/").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

export function dateToKey(d: Date): string {
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getUTCFullYear()}`;
}

/** The last `n` day keys ending with `from`, newest first. */
export function lastNDays(from: string, n: number): string[] {
  const base = keyToDate(from);
  return Array.from({ length: n }, (_, i) => dateToKey(new Date(base.getTime() - i * 86400000)));
}

export function prettyDate(key: string, today = todayKey()): string {
  if (key === today) return "Today";
  if (key === lastNDays(today, 2)[1]) return "Yesterday";
  return keyToDate(key).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
