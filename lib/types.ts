export const HALLS = ["J2", "Kins", "JCL"] as const;
export type Hall = (typeof HALLS)[number];

export const MEALS = ["Breakfast", "Lunch", "Dinner"] as const;
export type Meal = (typeof MEALS)[number];
export type LogMeal = Meal | "Snack";
export const LOG_MEALS: LogMeal[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

export type Macros = { cals: number; protein: number; carbs: number; fat: number };

/** One menu item, macros are for ONE portion (e.g. "4 oz"). */
export type Item = {
  id: string;
  name: string;
  portion: string;
  m: Macros;
  fiber: number;
  sugar: number;
  sodium: number;
  legends: string[];
};

export type Station = { station: string; items: string[] };

export type SlimMenu = {
  lastCached: string;
  dates: string[]; // "MM/DD/YYYY"
  legends: Record<string, string>;
  items: Record<string, Item>;
  days: Record<string, Partial<Record<Hall, Partial<Record<Meal, Station[]>>>>>;
};

export type LogEntry = {
  id: string;
  date: string; // "MM/DD/YYYY"
  meal: LogMeal;
  name: string;
  source: { kind: "menu"; itemId: string; hall?: Hall } | { kind: "custom" };
  portion: string;
  servings: number;
  per: Macros; // snapshot of macros per ONE serving
  addedAt: number;
};

export type Favorite = { itemId: string; name: string; portion: string; per: Macros };
export type CustomFood = { id: string; name: string; portion: string; per: Macros };
