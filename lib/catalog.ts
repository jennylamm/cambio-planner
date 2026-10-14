export type ShadeProfile = "dome" | "cone" | "flat";

export type Colour = {
  name: string;
  hex: string;
  /** Current sale price in AUD */
  price: number;
  /** Recommended retail price (compare-at) in AUD */
  rrp: number;
};

export type FixtureType = "cord" | "flush" | "linear";

export type Item = {
  id: string;
  kind: "shade" | "fixture";
  name: string;
  /** Shades only */
  profile?: ShadeProfile;
  /** Shades only, millimetres */
  diameterMm?: number;
  /** Shades only, millimetres */
  heightMm?: number;
  /** Fixtures only */
  fixtureType?: FixtureType;
  /** Fixtures only — cord/rod drop length in mm */
  dropMm?: number;
  /** Fixtures only — linear rail length in mm */
  lengthMm?: number;
  colours: Colour[];
  sourceUrl: string;
};

const HEX: Record<string, string> = {
  Black: "#1c1c1e",
  Blue: "#3d6fd1",
  Green: "#3f9d5a",
  Pink: "#f3a7bd",
  White: "#f3f2ec",
  Yellow: "#f0c33b",
  Chocolate: "#5b3a29",
  Brass: "#c6a35a",
  "Burnt Orange": "#cf6a2e",
  "Forest Green": "#1f5136",
  "Matte Black": "#242426",
  Opal: "#e6ebf2",
};

function c(name: string, price: number, rrp: number): Colour {
  return { name, hex: HEX[name] ?? "#8a8a8a", price, rrp };
}

function shade(
  id: string,
  name: string,
  profile: ShadeProfile,
  diameterMm: number,
  heightMm: number,
  colours: Colour[],
  handle: string,
): Item {
  return {
    id,
    kind: "shade",
    name,
    profile,
    diameterMm,
    heightMm,
    colours,
    sourceUrl: `https://www.aboutspace.net.au/products/${handle}`,
  };
}

function fixture(
  id: string,
  name: string,
  fixtureType: FixtureType,
  colours: Colour[],
  handle: string,
  opts: { dropMm?: number; lengthMm?: number } = {},
): Item {
  return {
    id,
    kind: "fixture",
    name,
    fixtureType,
    dropMm: opts.dropMm,
    lengthMm: opts.lengthMm,
    colours,
    sourceUrl: `https://www.aboutspace.net.au/products/${handle}`,
  };
}

export const SHADES: Item[] = [
  shade("shade-a", "Cambio Shade A", "dome", 100, 75, [
    c("Black", 17.6, 44.0),
    c("Blue", 17.6, 44.0),
    c("Green", 17.6, 44.0),
    c("Pink", 17.6, 44.0),
    c("White", 17.6, 44.0),
    c("Yellow", 26.4, 66.0),
  ], "cambio-shade-a"),

  shade("shade-a-large", "Cambio Shade A Large", "dome", 200, 150, [
    c("Black", 26.4, 66.0),
    c("Blue", 26.4, 66.0),
    c("Green", 26.4, 66.0),
    c("White", 33.0, 66.0),
    c("Yellow", 26.4, 66.0),
  ], "cambio-shade-a-large"),

  shade("shade-b", "Cambio Shade B", "flat", 200, 57, [
    c("Black", 61.2, 72.0),
    c("Blue", 28.8, 72.0),
    c("Green", 28.8, 72.0),
    c("Pink", 28.8, 72.0),
    c("White", 50.4, 72.0),
    c("Yellow", 28.8, 72.0),
  ], "cambio-shade-b"),

  shade("shade-b-large", "Cambio Shade B Large", "flat", 400, 114, [
    c("Black", 73.5, 105.0),
    c("Blue", 42.0, 105.0),
    c("Green", 42.0, 105.0),
    c("Pink", 94.5, 105.0),
    c("White", 89.25, 105.0),
    c("Yellow", 42.0, 105.0),
  ], "cambio-shade-b-large"),

  shade("shade-b-acrylic", "Cambio Shade B Acrylic", "flat", 200, 57, [
    c("Opal", 26.4, 66.0),
  ], "cambio-acrylic-b"),

  shade("shade-c", "Cambio Shade C", "dome", 200, 100, [
    c("Black", 54.0, 72.0),
    c("Blue", 42.84, 50.4),
    c("Green", 64.8, 72.0),
    c("Pink", 61.2, 72.0),
    c("White", 64.8, 72.0),
    c("Yellow", 28.8, 72.0),
  ], "cambio-shade-c"),

  shade("shade-c-large", "Cambio Shade C Large", "dome", 400, 200, [
    c("Black", 42.0, 105.0),
    c("Blue", 42.0, 105.0),
    c("Chocolate", 117.9, 131.0),
    c("Green", 42.0, 105.0),
    c("Pink", 89.25, 105.0),
    c("White", 42.0, 105.0),
    c("Yellow", 42.0, 105.0),
  ], "cambio-shade-c-large"),

  shade("shade-d", "Cambio Shade D", "cone", 150, 140, [
    c("Black", 57.6, 72.0),
    c("Blue", 50.4, 72.0),
    c("Chocolate", 64.8, 72.0),
    c("Green", 50.4, 72.0),
    c("Pink", 46.2, 66.0),
    c("White", 46.8, 72.0),
    c("Yellow", 46.8, 72.0),
  ], "cambio-shade-d"),

  shade("shade-d-large", "Cambio Shade D Large", "cone", 300, 280, [
    c("Black", 39.6, 99.0),
    c("Blue", 39.6, 99.0),
    c("Green", 39.6, 99.0),
    c("White", 39.6, 99.0),
    c("Yellow", 39.6, 99.0),
  ], "cambio-shade-d-large"),

  shade("shade-e", "Cambio Shade E", "dome", 250, 200, [
    c("Black", 33.2, 83.0),
    c("Blue", 33.2, 83.0),
    c("Chocolate", 94.5, 105.0),
    c("Green", 62.25, 83.0),
    c("Pink", 33.2, 83.0),
    c("White", 53.95, 83.0),
    c("Yellow", 33.2, 83.0),
  ], "cambio-shade-e"),

  shade("shade-e-acrylic", "Cambio Shade E Acrylic", "dome", 250, 200, [
    c("Opal", 30.8, 77.0),
  ], "cambio-acrylic-e"),

  shade("shade-f", "Cambio Shade F", "cone", 160, 100, [
    c("Black", 50.8, 127.0),
    c("White", 50.8, 127.0),
  ], "cambio-shade-f"),

  shade("shade-g", "Cambio Shade G", "flat", 300, 60, [
    c("Black", 50.8, 127.0),
    c("Chocolate", 114.3, 127.0),
    c("White", 50.8, 127.0),
  ], "cambio-shade-g"),

  shade("shade-g-lrg", "Cambio Shade G Large", "flat", 500, 60, [
    c("Black", 105.6, 264.0),
    c("White", 158.4, 264.0),
  ], "cambio-shade-g-lrg"),

  shade("shade-h", "Cambio Shade H", "dome", 300, 100, [
    c("Black", 50.8, 127.0),
    c("White", 50.8, 127.0),
  ], "cambio-shade-h"),

  shade("shade-h-lrg", "Cambio Shade H Large", "dome", 600, 200, [
    c("Black", 105.6, 264.0),
    c("Chocolate", 237.6, 264.0),
    c("White", 105.6, 264.0),
  ], "cambio-shade-h-lrg"),
];

export const FIXTURES: Item[] = [
  fixture("fixture-accord", "Accord Suspension", "cord", [
    c("Black", 58.5, 65.0),
    c("Brass", 78.3, 87.0),
    c("Burnt Orange", 32.5, 65.0),
    c("Chocolate", 58.5, 65.0),
    c("Forest Green", 58.5, 65.0),
    c("Pink", 58.5, 65.0),
    c("White", 58.5, 65.0),
    c("Yellow", 32.5, 65.0),
  ], "accord", { dropMm: 1800 }),

  fixture("fixture-ceiling", "Cambio Ceiling", "flush", [
    c("Black", 30.1, 43.0),
    c("Brass", 36.6, 61.0),
    c("White", 23.4, 39.0),
  ], "cambio-ceiling-2"),

  fixture("fixture-wall", "Cambio Wall", "flush", [
    c("Black", 30.1, 43.0),
    c("Brass", 36.6, 61.0),
    c("White", 23.4, 39.0),
  ], "cambio-wall"),

  fixture("fixture-drop", "Cambio LED Drop", "cord", [
    c("Brass", 82.5, 165.0),
    c("Matte Black", 66.0, 165.0),
  ], "cambio-drop-led", { dropMm: 1800 }),

  fixture("fixture-linear-1200", "Cambio Linear Pendant — 1200mm", "linear", [
    c("Black", 104.0, 208.0),
    c("White", 104.0, 208.0),
  ], "cambio-linear-pendant", { lengthMm: 1200 }),

  fixture("fixture-linear-1500", "Cambio Linear Pendant — 1500mm", "linear", [
    c("Black", 124.0, 248.0),
    c("White", 124.0, 248.0),
  ], "cambio-linear-pendant", { lengthMm: 1500 }),

  fixture("fixture-linear-1800", "Cambio Linear Pendant — 1800mm", "linear", [
    c("Black", 151.5, 303.0),
    c("White", 151.5, 303.0),
  ], "cambio-linear-pendant", { lengthMm: 1800 }),
];

export const ITEMS: Item[] = [...FIXTURES, ...SHADES];

const byId = new Map(ITEMS.map((i) => [i.id, i]));

export function getItem(id: string): Item {
  const item = byId.get(id);
  if (!item) throw new Error(`Unknown item: ${id}`);
  return item;
}

export function getColour(item: Item, name: string): Colour {
  return item.colours.find((c) => c.name === name) ?? item.colours[0];
}

export function formatAUD(n: number): string {
  return "$" + n.toFixed(2);
}

/** Lowest sale price across an item's colours (for "From $" labels). */
export function fromPrice(item: Item): number {
  return Math.min(...item.colours.map((c) => c.price));
}
