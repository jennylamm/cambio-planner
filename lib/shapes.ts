import type { Item, ShapeProfile, DropOrientation } from "./catalog";

// ---- scale constants ------------------------------------------------------

/** Unified px-per-mm for shade bodies AND bar/dome widths on the canvas. */
export const SCALE = 0.3;
/** Fixed visual cord length (px) for cord-type bases on the canvas. */
export const CORD_PX = 110;
/** Fixed visual stem length (px) for flush bases on the canvas. */
export const STEM_PX = 30;

/** px-per-mm for shade bodies in the palette previews. */
export const PALETTE_SCALE = 0.14;
/** px-per-mm for bar/dome widths in the palette previews. */
export const PALETTE_BAR_SCALE = 0.1;
export const PALETTE_CORD_PX = 26;
export const PALETTE_STEM_PX = 16;

// ---- colour helpers -------------------------------------------------------

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((ch) => ch + ch).join("") : h;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const to = (v: number) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** Shift a hex colour toward white (amt > 0) or black (amt < 0). */
export function shift(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  const t = amt > 0 ? 255 : 0;
  const f = Math.abs(amt);
  return rgbToHex(r + (t - r) * f, g + (t - g) * f, b + (t - b) * f);
}

// ---- frame geometry -------------------------------------------------------

/** Pixel width of a base's frame (bar/dome/rod) or plate (cord/flush). */
export function frameWidth(item: Item, pxPerMm: number): number {
  if (item.fixtureType === "bar" || item.fixtureType === "dome" || item.fixtureType === "rod") {
    return Math.max(36, Math.round((item.lengthMm ?? 300) * pxPerMm));
  }
  return 40;
}

// ---- rod (sculptural) frames ---------------------------------------------

export type DropPosition = {
  /** px from the left edge of the frame's layout box */
  x: number;
  /** px from the top of the frame's layout box (socket centre) */
  y: number;
  orient: DropOrientation;
};

/** Fixed visual sizes (px, scaled by `k`) for rod-type frames. */
export const ROD_CANOPY_H = 6;
export const ROD_GAP = 4;
/** "shortened" suspension cable length (px). */
export const ROD_CABLE_PX = 30;
/** E27 bulb-holder length (px, down or sideways) and width. */
export const ROD_BULB_LEN = 14;
export const ROD_BULB_W = 10;

/** y-offset (px) of the horizontal rod within a rod-frame layout. */
export function rodBodyTop(k = 1): number {
  return (ROD_CANOPY_H + ROD_GAP + ROD_CABLE_PX) * k;
}

/**
 * Full layout geometry of a rod frame (canvas coordinates). `rodLeft`/`bodyTop`
 * mark the horizontal rod's left end; sockets, legs and canopy positions are
 * resolved to px so the frame renderer and the canvas share one source of truth.
 */
export function rodFrameGeometry(item: Item, pxPerMm: number, k = 1) {
  const mm = (v: number) => Math.round(v * pxPerMm);
  const rodWidth = frameWidth(item, pxPerMm);
  const pad = Math.round(24 * k); // room for the sideways holder at the left
  const bodyTop = rodBodyTop(k);
  const rodLeft = pad;
  const rodRight = pad + rodWidth;

  const sockets: DropPosition[] = (item.dropLayout ?? []).map((d) => ({
    x: rodLeft + mm(d.xMm),
    y: bodyTop + mm(d.yMm),
    orient: d.orient,
  }));

  const legs = (item.legs ?? []).map((l) => ({
    x: rodLeft + mm(l.xMm),
    y: bodyTop + mm(l.yMm),
  }));

  // Canopies hang above the first downward socket (left rod) and each bare leg.
  const downSockets = sockets.filter((s) => s.orient === "down");
  const canopyX = [downSockets[0]?.x, ...legs.map((l) => l.x)].filter(
    (x): x is number => x !== undefined,
  );

  const lowest = [...sockets.map((s) => s.y), ...legs.map((l) => l.y)].reduce(
    (m, y) => Math.max(m, y),
    bodyTop,
  );
  const height = lowest + Math.round((ROD_BULB_LEN + 6) * k);

  return { width: rodRight + pad, height, bodyTop, rodLeft, rodRight, sockets, legs, canopyX };
}

// ---- shade silhouettes ----------------------------------------------------

/** Diameter of the mounting hole in the top of every shade (mm). */
export const HOLE_MM = 42;

/**
 * Returns an SVG path for a shade's elevation silhouette, drawn inside a
 * `0 0 W H` viewBox (W = diameter px, H = height px). `holeR` is the radius
 * (px) of the 42mm top opening, used as the small end of a cone frustum.
 */
export function shadePath(profile: ShapeProfile, W: number, H: number, holeR: number): string {
  const l = 0;
  const r = W;
  const cx = W / 2;

  switch (profile) {
    case "cylinder":
      // vertical sides — a rectangle from full-width top to full-width bottom
      return `M ${l} 0 L ${r} 0 L ${r} ${H} L ${l} ${H} Z`;
    case "cone":
      // frustum — straight sides from the 42mm top opening to the full rim
      return `M ${cx - holeR} 0 L ${l} ${H} L ${r} ${H} L ${cx + holeR} 0 Z`;
    case "dome":
    default:
      // half-ellipse bulging up (a hemisphere when H === W/2, a taller dome otherwise)
      return `M ${l} ${H} A ${W / 2} ${H} 0 0 1 ${r} ${H} Z`;
  }
}
