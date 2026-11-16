import { HALLS, MEALS, type Hall, type Item, type Meal, type SlimMenu, type Station } from "./types";

// Loose types for UT's raw response: we only rely on the fields we read.
type RawRecipeRef = { number?: string; name?: string };
type RawNutrient = { name?: string; value?: string };
type RawRecipe = {
  name?: string;
  portionSize?: string;
  portionUnit?: string;
  legends?: string[] | null;
  nutrients?: RawNutrient[] | null;
};
export type RawMenu = {
  last_cached?: string;
  menuWindow?: { dates?: string[] };
  days?: Record<
    string,
    { locations?: { locationName?: string; meals?: { mealName?: string; recipes?: RawRecipeRef[] }[] }[] }
  >;
  data_object?: {
    recipes_data?: Record<string, RawRecipe>;
    global_data?: { legendInfo?: Record<string, string> };
  };
};

const num = (v: unknown) => {
  const n = parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : 0;
};

export function hallFromName(name = ""): Hall | null {
  const first = name.trim().split(/\s+/)[0]?.toLowerCase();
  return HALLS.find((h) => h.toLowerCase() === first) ?? null;
}

export function stationName(raw = ""): string {
  return raw.replace(/^[\s-]+|[\s-]+$/g, "").trim() || "Other";
}

export function slimRecipe(id: string, r: RawRecipe): Item {
  const n = (key: string) => num(r.nutrients?.find((x) => x.name === key)?.value);
  const portion = [r.portionSize, r.portionUnit].filter((s) => s && String(s).trim()).join(" ");
  return {
    id,
    name: (r.name ?? "").trim(),
    portion: portion || "1 serving",
    m: { cals: n("Cals"), protein: n("Prot"), carbs: n("Carb"), fat: n("Fat-T") },
    fiber: n("Fiber"),
    sugar: n("Sugar"),
    sodium: n("Sod"),
    legends: Array.isArray(r.legends) ? r.legends : [],
  };
}

/** Turn UT's ~2 MB response into just what the app needs. */
export function slimMenu(raw: RawMenu): SlimMenu {
  const recipes = raw.data_object?.recipes_data ?? {};
  const items: SlimMenu["items"] = {};
  const days: SlimMenu["days"] = {};

  for (const [date, day] of Object.entries(raw.days ?? {})) {
    const halls: SlimMenu["days"][string] = {};
    for (const loc of day.locations ?? []) {
      const hall = hallFromName(loc.locationName);
      if (!hall) continue;
      const meals: Partial<Record<Meal, Station[]>> = {};
      for (const meal of loc.meals ?? []) {
        const mealName = MEALS.find((m) => m === meal.mealName);
        if (!mealName) continue;
        const stations: Station[] = [];
        let current: Station | null = null;
        for (const rec of meal.recipes ?? []) {
          if (!rec.number) {
            current = { station: stationName(rec.name), items: [] };
            stations.push(current);
            continue;
          }
          const raw = recipes[rec.number];
          if (!raw) continue; // no nutrition data → can't log it
          if (!items[rec.number]) items[rec.number] = slimRecipe(rec.number, raw);
          if (!current) {
            current = { station: "Other", items: [] };
            stations.push(current);
          }
          if (!current.items.includes(rec.number)) current.items.push(rec.number);
        }
        const nonEmpty = stations.filter((s) => s.items.length > 0);
        if (nonEmpty.length) meals[mealName] = nonEmpty;
      }
      if (Object.keys(meals).length) halls[hall] = meals;
    }
    days[date] = halls;
  }

  const legends: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw.data_object?.global_data?.legendInfo ?? {})) {
    if (k.endsWith("_lbl")) legends[k.slice(0, -4)] = v;
  }

  return {
    lastCached: raw.last_cached ?? "",
    dates: raw.menuWindow?.dates ?? Object.keys(days),
    legends,
    items,
    days,
  };
}
