import { describe, expect, it } from "vitest";
import { currentMeal, lastNDays, todayKey } from "@/lib/dates";

// November = CST (UTC-6)
const at = (utc: string) => new Date(utc);

describe("dates (America/Chicago)", () => {
  it("uses Austin's date, not UTC", () => {
    expect(todayKey(at("2026-11-17T03:00:00Z"))).toBe("11/16/2026"); // 9pm Austin
    expect(todayKey(at("2026-11-17T06:30:00Z"))).toBe("11/17/2026"); // 12:30am Austin
  });

  it("picks the meal by Austin time", () => {
    expect(currentMeal(at("2026-11-16T16:29:00Z"))).toBe("Breakfast"); // 10:29
    expect(currentMeal(at("2026-11-16T16:30:00Z"))).toBe("Lunch"); // 10:30
    expect(currentMeal(at("2026-11-16T21:59:00Z"))).toBe("Lunch"); // 3:59pm
    expect(currentMeal(at("2026-11-16T22:00:00Z"))).toBe("Dinner"); // 4:00pm
  });

  it("lists past days across a month boundary", () => {
    expect(lastNDays("03/01/2026", 3)).toEqual(["03/01/2026", "02/28/2026", "02/27/2026"]);
  });
});
