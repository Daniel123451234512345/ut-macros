import { describe, expect, it } from "vitest";
import { fmtCals, fmtG, scale, totalOf } from "@/lib/macros";
import type { LogEntry } from "@/lib/types";

const ragu = { cals: 105.595, protein: 4.441, carbs: 14.694, fat: 3.99 };

describe("macros", () => {
  it("scales a real item by 1.5 servings", () => {
    const m = scale(ragu, 1.5);
    expect(fmtCals(m.cals)).toBe("158");
    expect(fmtG(m.protein)).toBe("6.7");
    expect(fmtG(m.carbs)).toBe("22");
    expect(fmtG(m.fat)).toBe("6");
    expect(m.cals).toBeCloseTo(158.3925, 4);
  });

  it("totals logged entries from their snapshots", () => {
    const e = (servings: number, per = ragu): LogEntry => ({
      id: String(servings), date: "11/16/2026", meal: "Lunch", name: "x",
      source: { kind: "custom" }, portion: "4 oz", servings, per, addedAt: 0,
    });
    const shake = { cals: 160, protein: 30, carbs: 5, fat: 2 };
    const t = totalOf([e(2), e(1, shake)]);
    expect(t.cals).toBeCloseTo(371.19, 2);
    expect(t.protein).toBeCloseTo(38.882, 3);
  });
});
