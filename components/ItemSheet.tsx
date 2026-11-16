"use client";

import { useState } from "react";
import { fmtG, scale } from "@/lib/macros";
import { LOG_MEALS, type LogMeal, type Macros } from "@/lib/types";
import { MacroGrid, Sheet, StarIcon, Stepper } from "./ui";

export type SheetFood = {
  name: string;
  portion: string;
  per: Macros;
  legends?: string[];
  extra?: { fiber: number; sugar: number; sodium: number };
  hall?: string;
};

type Props = {
  food: SheetFood | null;
  onClose: () => void;
  /** "add" logs a new entry; "edit" changes servings of an existing one. */
  mode?: "add" | "edit";
  initialServings?: number;
  initialMeal: LogMeal;
  showMealPicker?: boolean;
  legendLabels?: Record<string, string>;
  favorite?: { on: boolean; toggle: () => void };
  onConfirm: (servings: number, meal: LogMeal) => void;
  onDelete?: () => void;
};

export default function ItemSheet(props: Props) {
  return (
    <Sheet open={!!props.food} onClose={props.onClose}>
      {props.food && <Body key={props.food.name + props.initialServings} {...props} food={props.food} />}
    </Sheet>
  );
}

function Body({ food, mode = "add", initialServings = 1, initialMeal, showMealPicker, legendLabels, favorite, onConfirm, onDelete }: Props & { food: SheetFood }) {
  const [servings, setServings] = useState(initialServings);
  const [meal, setMeal] = useState<LogMeal>(initialMeal);
  const m = scale(food.per, servings);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-2xl font-extrabold leading-tight">{food.name}</h2>
          <p className="mt-1 text-sm text-muted">
            1 serving = <span className="font-semibold text-fg">{food.portion}</span>
            {food.hall && <> · {food.hall}</>}
          </p>
          {!!food.legends?.length && <DietTags codes={food.legends} labels={legendLabels} className="mt-2" />}
        </div>
        {favorite && (
          <button
            type="button"
            onClick={favorite.toggle}
            aria-label={favorite.on ? "Remove from favorites" : "Add to favorites"}
            className={`-mr-1 grid h-12 w-12 place-items-center rounded-full ${favorite.on ? "text-ink" : "text-muted"}`}
          >
            <StarIcon filled={favorite.on} className="h-7 w-7" />
          </button>
        )}
      </div>

      <Stepper value={servings} onChange={setServings} />

      <div>
        <MacroGrid m={m} />
        {food.extra && (
          <p className="mt-2 text-center text-xs text-muted">
            Fiber {fmtG(food.extra.fiber * servings)}g · Sugar {fmtG(food.extra.sugar * servings)}g · Sodium{" "}
            {Math.round(food.extra.sodium * servings)}mg
          </p>
        )}
      </div>

      {showMealPicker && (
        <div className="flex gap-2">
          {LOG_MEALS.map((x) => (
            <button
              key={x}
              type="button"
              onClick={() => setMeal(x)}
              aria-pressed={meal === x}
              className={`h-10 flex-1 rounded-full text-xs ${meal === x ? "bg-fg font-bold text-bg" : "font-semibold text-muted ring-1 ring-line"}`}
            >
              {x}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        {onDelete && (
          <button type="button" onClick={onDelete} className="h-14 rounded-full px-5 font-semibold text-red-600 ring-1 ring-line dark:text-red-400">
            Delete
          </button>
        )}
        <button
          type="button"
          onClick={() => onConfirm(servings, meal)}
          className="h-14 flex-1 rounded-full bg-accent text-lg font-bold text-on-accent active:scale-[0.98]"
        >
          {mode === "edit" ? "Save" : `Add to ${meal}`}
        </button>
      </div>
    </div>
  );
}

const TAG_STYLE: Record<string, string> = {
  VGN: "bg-fat-bg text-fat",
  VGT: "bg-fat-bg text-fat",
  HAL: "bg-prot-bg text-prot",
};
/** Only diet tags get chips in lists; allergens show in the sheet. */
export const DIET_CODES = ["VGN", "VGT", "HAL"];

export function DietTags({ codes, labels, className = "", dietOnly = false }: { codes: string[]; labels?: Record<string, string>; className?: string; dietOnly?: boolean }) {
  const shown = dietOnly ? codes.filter((c) => DIET_CODES.includes(c)) : codes;
  if (!shown.length) return null;
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {shown.map((c) => (
        <span
          key={c}
          title={labels?.[c] ?? c}
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${TAG_STYLE[c] ?? "bg-bg text-muted"}`}
        >
          {dietOnly ? c : (labels?.[c] ?? c)}
        </span>
      ))}
    </div>
  );
}
