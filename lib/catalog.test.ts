import { describe, expect, it } from "vitest";
import {
  FIXTURES,
  ITEMS,
  PENDANTS,
  SHADES,
  dropsOf,
  formatAUD,
  fromPrice,
  getColour,
  getItem,
} from "./catalog";

describe("getItem", () => {
  it("returns the expected shade", () => {
    const shade = getItem("shade-a");
    expect(shade.category).toBe("shade");
    expect(shade.profile).toBe("cylinder");
    expect(shade.diameterMm).toBe(100);
    expect(shade.heightMm).toBe(75);
  });

  it("returns rod pendants with their layout", () => {
    const leviaA = getItem("pendant-levia-a");
    expect(leviaA.category).toBe("pendant");
    expect(leviaA.fixtureType).toBe("rod");
    expect(leviaA.dropLayout).toHaveLength(3);
  });

  it("throws for an unknown id", () => {
    expect(() => getItem("does-not-exist")).toThrow("Unknown item: does-not-exist");
  });

  it("round-trips every catalog id", () => {
    for (const item of ITEMS) {
      expect(getItem(item.id).id).toBe(item.id);
    }
  });
});

describe("getColour", () => {
  const item = getItem("shade-a");

  it("finds a colour by name", () => {
    expect(getColour(item, "Blue").name).toBe("Blue");
  });

  it("falls back to the first colour", () => {
    expect(getColour(item, "nonexistent")).toEqual(item.colours[0]);
  });
});

describe("dropsOf", () => {
  it("uses dropLayout length for rod frames", () => {
    expect(dropsOf(getItem("pendant-levia-a"))).toBe(3);
  });

  it("uses the drops count for bars", () => {
    expect(dropsOf(getItem("fixture-linear-1200"))).toBe(3);
  });

  it("defaults to 1", () => {
    expect(dropsOf(getItem("shade-a"))).toBe(1);
    expect(dropsOf(getItem("fixture-ceiling"))).toBe(1);
  });
});

describe("formatAUD", () => {
  it("formats to two decimal places", () => {
    expect(formatAUD(104)).toBe("$104.00");
    expect(formatAUD(17.6)).toBe("$17.60");
    expect(formatAUD(0)).toBe("$0.00");
  });
});

describe("fromPrice", () => {
  it("returns the lowest sale price across colours", () => {
    expect(fromPrice(getItem("shade-a"))).toBe(17.6);
  });
});

describe("catalog data integrity", () => {
  it("has unique ids", () => {
    const ids = ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("is the union of fixtures, pendants and shades", () => {
    expect(ITEMS).toEqual([...FIXTURES, ...PENDANTS, ...SHADES]);
  });

  it("gives every item at least one colour", () => {
    for (const item of ITEMS) {
      expect(item.colours.length).toBeGreaterThan(0);
    }
  });

  it("gives every shade a profile and dimensions", () => {
    for (const item of SHADES) {
      expect(item.category).toBe("shade");
      expect(item.profile).toBeTruthy();
      expect(item.diameterMm).toBeGreaterThan(0);
      expect(item.heightMm).toBeGreaterThan(0);
    }
  });

  it("gives every fixture/pendant a fixtureType", () => {
    for (const item of [...FIXTURES, ...PENDANTS]) {
      expect(item.fixtureType).toBeTruthy();
    }
  });
});
