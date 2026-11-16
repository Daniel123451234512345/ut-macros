import { describe, expect, it } from "vitest";
import { slimMenu, stationName, type RawMenu } from "@/lib/slim";

// Trimmed from the real UT response on 11/16/2026.
const raw: RawMenu = {
  last_cached: "2026-11-16 00:23:10",
  menuWindow: { dates: ["11/16/2026"] },
  days: {
    "11/16/2026": {
      locations: [
        {
          locationName: "J2 Dining",
          meals: [
            {
              mealName: "Breakfast",
              recipes: [
                { number: "999", name: "Item before any header" },
                { number: "", name: "-- Breakfast Plant Based --" },
                { number: "111473", name: "Lentil and Mushroom Ragu" },
                { number: "000000", name: "Missing from recipes_data" },
                { number: "", name: "-- Empty Station --" },
              ],
            },
          ],
        },
        { locationName: "JCL Dining", meals: [{ mealName: "Breakfast", recipes: [] }] },
      ],
    },
  },
  data_object: {
    recipes_data: {
      "111473": {
        name: "Lentil and Mushroom Ragu",
        portionSize: "4",
        portionUnit: "oz",
        legends: ["VGN"],
        nutrients: [
          { name: "Cals", value: "105.595" },
          { name: "Fat-T", value: "3.990" },
          { name: "Carb", value: "14.694" },
          { name: "Prot", value: "4.441" },
          { name: "Fiber", value: "2.611" },
        ],
      },
      "999": { name: "Mystery", portionSize: "1", portionUnit: "each", nutrients: [] },
    },
    global_data: { legendInfo: { VGN: "Vegan.png", VGN_lbl: "Vegan", HAL_lbl: "Halal Friendly" } },
  },
};

describe("slimMenu", () => {
  const menu = slimMenu(raw);

  it("groups items under station headers and drops empty stations/missing recipes", () => {
    expect(menu.days["11/16/2026"].J2?.Breakfast).toEqual([
      { station: "Other", items: ["999"] },
      { station: "Breakfast Plant Based", items: ["111473"] },
    ]);
  });

  it("drops meals and halls with no items", () => {
    expect(menu.days["11/16/2026"].JCL).toBeUndefined();
  });

  it("parses nutrients as numbers and builds the portion label", () => {
    expect(menu.items["111473"]).toMatchObject({
      portion: "4 oz",
      m: { cals: 105.595, protein: 4.441, carbs: 14.694, fat: 3.99 },
      fiber: 2.611,
      sugar: 0,
      legends: ["VGN"],
    });
    expect(menu.items["999"].m).toEqual({ cals: 0, protein: 0, carbs: 0, fat: 0 });
  });

  it("reads legend labels from *_lbl keys", () => {
    expect(menu.legends).toEqual({ VGN: "Vegan", HAL: "Halal Friendly" });
  });

  it("strips dashes from station names", () => {
    expect(stationName("-- Breakfast Bakery --")).toBe("Breakfast Bakery");
  });
});
