"use client";

import { useId } from "react";
import type { Item } from "@/lib/catalog";
import { shadePath, shift, HOLE_MM, SCALE } from "@/lib/shapes";

export function ShadeSvg({
  item,
  hex,
  pxPerMm = SCALE,
  flipped = false,
  sideways = false,
  mirror = false,
}: {
  item: Item;
  hex: string;
  pxPerMm?: number;
  flipped?: boolean;
  sideways?: boolean;
  /** flip the sideways shade so the opening faces left (body extends right) */
  mirror?: boolean;
}) {
  const gid = useId().replace(/:/g, "");
  const W = Math.max(1, Math.round((item.diameterMm ?? 100) * pxPerMm));
  const H = Math.max(1, Math.round((item.heightMm ?? 75) * pxPerMm));
  const holeR = Math.max(1.5, ((item.topDiameterMm ?? HOLE_MM) / 2) * pxPerMm);
  const d = shadePath(item.profile ?? "dome", W, H, holeR);
  const light = shift(hex, 0.25);
  const dark = shift(hex, -0.28);
  const sw = Math.max(0.5, pxPerMm * 2);

  if (sideways) {
    // Mounted on a horizontal socket. By default the shade's top opening faces
    // right and the body extends left (a left-pointing socket); mirror flips it
    // so the opening faces left and the body extends right (right-pointing).
    const matrix = mirror ? `matrix(0 1 1 0 0 0)` : `matrix(0 1 -1 0 ${H} 0)`;
    return (
      <svg width={H} height={W} viewBox={`0 0 ${H} ${W}`} style={{ display: "block" }} aria-label={item.name}>
        <defs>
          <linearGradient id={`shade-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={light} />
            <stop offset="45%" stopColor={hex} />
            <stop offset="100%" stopColor={dark} />
          </linearGradient>
        </defs>
        <g transform={matrix}>
          <path d={d} fill={`url(#shade-${gid})`} stroke={dark} strokeWidth={sw} />
        </g>
      </svg>
    );
  }

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: "block", transform: flipped ? "rotate(180deg)" : undefined }}
      aria-label={item.name}
    >
      <defs>
        <linearGradient id={`shade-${gid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={light} />
          <stop offset="45%" stopColor={hex} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
      </defs>
      <path d={d} fill={`url(#shade-${gid})`} stroke={dark} strokeWidth={sw} />
    </svg>
  );
}
