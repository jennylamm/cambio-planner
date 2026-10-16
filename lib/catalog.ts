export type ShapeProfile = "cylinder" | "dome" | "cone";
export type FixtureType = "cord" | "flush" | "bar" | "dome" | "rod";

export type DropOrientation = "down" | "left" | "right";

/**
 * Per-socket geometry for rod-type bases, relative to the frame's horizontal
 * rod (origin at its left end; y measured downward from the rod).
 */
export type DropLayout = {
  /** socket x offset from the rod's left end (mm) */
  xMm: number;
  /** socket centre below the rod (mm) */
  yMm: number;
  orient: DropOrientation;
};

/** A bare rod leg of a rod frame (no socket). */
export type RodLeg = { xMm: number; yMm: number };

export type Colour = {
  name: string;
  hex: string;
  /** Current sale price in AUD */
  price: number;
  /** Recommended retail price (compare-at) in AUD */
  rrp: number;
};

export type Item = {
  id: string;
  category: "shade" | "fixture" | "pendant";
  name: string;
  /** Shades only */
  profile?: ShapeProfile;
  /** Shades only, millimetres */
  diameterMm?: number;
  /** Shades only, millimetres */
  heightMm?: number;
  /** Shades only — top opening diameter in mm (defaults to 42 mount hole) */
  topDiameterMm?: number;
  /** Bases (fixtures + pendants) only */
  fixtureType?: FixtureType;
  /** Bases only — cord/rod drop length in mm */
  dropMm?: number;
  /** Bases only — body/rail width in mm (bar and dome bodies) */
  lengthMm?: number;
  /** Bases only — number of shade mount points (defaults to 1) */
  drops?: number;
  /** Bases only — per-socket geometry (rod frames) */
  dropLayout?: DropLayout[];
  /** Bases only — bare rod legs with no socket (rod frames) */
  legs?: RodLeg[];
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
  profile: ShapeProfile,
  diameterMm: number,
  heightMm: number,
  colours: Colour[],
  handle: string,
  topDiameterMm?: number,
): Item {
  return {
    id,
    category: "shade",
    name,
    profile,
    diameterMm,
    heightMm,
    topDiameterMm,
    colours,
    sourceUrl: `https://www.aboutspace.net.au/products/${handle}`,
  };
}

type BaseOpts = {
  dropMm?: number;
  lengthMm?: number;
  drops?: number;
  dropLayout?: DropLayout[];
  legs?: RodLeg[];
};

function base(
  id: string,
  name: string,
  fixtureType: FixtureType,
  colours: Colour[],
  handle: string,
  opts: BaseOpts = {},
): Item {
  return {
    id,
    category: "fixture",
    name,
    fixtureType,
    dropMm: opts.dropMm,
    lengthMm: opts.lengthMm,
    drops: opts.drops ?? opts.dropLayout?.length ?? 1,
    dropLayout: opts.dropLayout,
    legs: opts.legs,
    colours,
    sourceUrl: `https://www.aboutspace.net.au/products/${handle}`,
  };
}

function pendant(
  id: string,
  name: string,
  fixtureType: FixtureType,
  colours: Colour[],
  handle: string,
  opts: BaseOpts = {},
): Item {
  return { ...base(id, name, fixtureType, colours, handle, opts), category: "pendant" };
}

export const SHADES: Item[] = [
  shade("shade-a", "Cambio Shade A", "cylinder", 100, 75, [
    c("Black", 17.6, 44.0),
    c("Blue", 17.6, 44.0),
    c("Green", 17.6, 44.0),
    c("Pink", 17.6, 44.0),
    c("White", 17.6, 44.0),
    c("Yellow", 26.4, 66.0),
  ], "cambio-shade-a"),

  shade("shade-a-large", "Cambio Shade A Large", "cylinder", 200, 150, [
    c("Black", 26.4, 66.0),
    c("Blue", 26.4, 66.0),
    c("Green", 26.4, 66.0),
    c("White", 33.0, 66.0),
    c("Yellow", 26.4, 66.0),
  ], "cambio-shade-a-large"),

  shade("shade-b", "Cambio Shade B", "cylinder", 200, 57, [
    c("Black", 61.2, 72.0),
    c("Blue", 28.8, 72.0),
    c("Green", 28.8, 72.0),
    c("Pink", 28.8, 72.0),
    c("White", 50.4, 72.0),
    c("Yellow", 28.8, 72.0),
  ], "cambio-shade-b"),

  shade("shade-b-large", "Cambio Shade B Large", "cylinder", 400, 114, [
    c("Black", 73.5, 105.0),
    c("Blue", 42.0, 105.0),
    c("Green", 42.0, 105.0),
    c("Pink", 94.5, 105.0),
    c("White", 89.25, 105.0),
    c("Yellow", 42.0, 105.0),
  ], "cambio-shade-b-large"),

  shade("shade-b-acrylic", "Cambio Shade B Acrylic", "cylinder", 200, 57, [
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
  ], "cambio-shade-f", 100),

  shade("shade-g", "Cambio Shade G", "cone", 300, 60, [
    c("Black", 50.8, 127.0),
    c("Chocolate", 114.3, 127.0),
    c("White", 50.8, 127.0),
  ], "cambio-shade-g", 200),

  shade("shade-g-lrg", "Cambio Shade G Large", "cone", 500, 60, [
    c("Black", 105.6, 264.0),
    c("White", 158.4, 264.0),
  ], "cambio-shade-g-lrg", 200),

  shade("shade-h", "Cambio Shade H", "cone", 300, 100, [
    c("Black", 50.8, 127.0),
    c("White", 50.8, 127.0),
  ], "cambio-shade-h", 60),

  shade("shade-h-lrg", "Cambio Shade H Large", "cone", 600, 200, [
    c("Black", 105.6, 264.0),
    c("Chocolate", 237.6, 264.0),
    c("White", 105.6, 264.0),
  ], "cambio-shade-h-lrg", 60),
];

export const FIXTURES: Item[] = [
  base("fixture-accord", "Accord Suspension — 1800mm", "cord", [
    c("Black", 58.5, 65.0),
    c("Brass", 78.3, 87.0),
    c("Burnt Orange", 32.5, 65.0),
    c("Chocolate", 58.5, 65.0),
    c("Forest Green", 58.5, 65.0),
    c("Pink", 58.5, 65.0),
    c("White", 58.5, 65.0),
    c("Yellow", 32.5, 65.0),
  ], "accord", { dropMm: 1800, drops: 1 }),

  base("fixture-ceiling", "Cambio Ceiling", "flush", [
    c("Black", 30.1, 43.0),
    c("Brass", 36.6, 61.0),
    c("White", 23.4, 39.0),
  ], "cambio-ceiling-2", { drops: 1 }),

  base("fixture-wall", "Cambio Wall", "flush", [
    c("Black", 30.1, 43.0),
    c("Brass", 36.6, 61.0),
    c("White", 23.4, 39.0),
  ], "cambio-wall", { drops: 1 }),

  base("fixture-drop", "Cambio LED Drop — 1800mm", "cord", [
    c("Brass", 82.5, 165.0),
    c("Matte Black", 66.0, 165.0),
  ], "cambio-drop-led", { dropMm: 1800, drops: 1 }),

  base("fixture-linear-1200", "Cambio Linear Pendant — 1200mm", "bar", [
    c("Black", 104.0, 208.0),
    c("White", 104.0, 208.0),
  ], "cambio-linear-pendant", { lengthMm: 1200, dropMm: 1800, drops: 3 }),

  base("fixture-linear-1500", "Cambio Linear Pendant — 1500mm", "bar", [
    c("Black", 124.0, 248.0),
    c("White", 124.0, 248.0),
  ], "cambio-linear-pendant", { lengthMm: 1500, dropMm: 1800, drops: 4 }),

  base("fixture-linear-1800", "Cambio Linear Pendant — 1800mm", "bar", [
    c("Black", 151.5, 303.0),
    c("White", 151.5, 303.0),
  ], "cambio-linear-pendant", { lengthMm: 1800, dropMm: 1800, drops: 5 }),
];

export const PENDANTS: Item[] = [
  pendant("pendant-levia-a", "Levia A Pendant", "rod", [
    c("Black", 212.0, 424.0),
  ], "levia-a-pendant-light", {
    lengthMm: 1060,
    dropMm: 2194,
    dropLayout: [
      { xMm: 0, yMm: 0, orient: "left" },
      { xMm: 100, yMm: 300, orient: "down" },
      { xMm: 745, yMm: 200, orient: "down" },
    ],
    legs: [{ xMm: 545, yMm: 530 }],
  }),

  pendant("pendant-levia-b", "Levia B Pendant", "bar", [
    c("Black", 184.5, 369.0),
  ], "levia-b-pendant-1", { lengthMm: 1310, dropMm: 2310, drops: 3 }),

  pendant("pendant-belki", "Belki Pendant", "dome", [
    c("Black", 98.5, 197.0),
  ], "belki-pendant-light", { lengthMm: 370, dropMm: 1800, drops: 1 }),

  pendant("pendant-belki-duo", "Belki Duo Pendant", "dome", [
    c("Black", 109.5, 219.0),
  ], "belki-duo-pendant-light", { lengthMm: 730, dropMm: 1800, drops: 2 }),
];

export const ITEMS: Item[] = [...FIXTURES, ...PENDANTS, ...SHADES];

const byId = new Map(ITEMS.map((i) => [i.id, i]));

export function getItem(id: string): Item {
  const item = byId.get(id);
  if (!item) throw new Error(`Unknown item: ${id}`);
  return item;
}

export function getColour(item: Item, name: string): Colour {
  return item.colours.find((col) => col.name === name) ?? item.colours[0];
}

export function dropsOf(item: Item): number {
  return item.dropLayout?.length ?? item.drops ?? 1;
}

export function formatAUD(n: number): string {
  return "$" + n.toFixed(2);
}

/** Lowest sale price across an item's colours (for "From $" labels). */
export function fromPrice(item: Item): number {
  return Math.min(...item.colours.map((col) => col.price));
}
