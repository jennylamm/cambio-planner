"use client";

import { useId } from "react";
import type { Item, ShadeProfile } from "@/lib/catalog";

/** pixels per millimetre for shade/fixture bodies */
export const SCALE = 0.55;

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
function shift(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  const t = amt > 0 ? 255 : 0;
  const f = Math.abs(amt);
  return rgbToHex(r + (t - r) * f, g + (t - g) * f, b + (t - b) * f);
}

function shadePath(profile: ShadeProfile, W: number, H: number): string {
  const cx = W / 2;
  const l = 0;
  const r = W;
  const hn = Math.max(6, W * 0.1);
  const tl = cx - hn;
  const tr = cx + hn;
  switch (profile) {
    case "dome":
      return `M ${tl} 0 C ${tl} ${H * 0.45}, ${l} ${H * 0.18}, ${l} ${H} L ${r} ${H} C ${r} ${H * 0.18}, ${tr} ${H * 0.45}, ${tr} 0 Z`;
    case "cone":
      return `M ${tl} 0 L ${l} ${H} L ${r} ${H} L ${tr} 0 Z`;
    case "flat":
    default:
      return `M ${tl} 0 C ${l + W * 0.08} ${H * 0.1}, ${l} ${H * 0.75}, ${l} ${H} L ${r} ${H} C ${r} ${H * 0.75}, ${r - W * 0.08} ${H * 0.1}, ${tr} 0 Z`;
  }
}

export function ShadeSvg({ item, hex, scale = 1 }: { item: Item; hex: string; scale?: number }) {
  const gid = useId().replace(/:/g, "");
  const W = Math.round((item.diameterMm ?? 100) * SCALE * scale);
  const H = Math.round((item.heightMm ?? 75) * SCALE * scale);
  const profile = item.profile ?? "dome";
  const d = shadePath(profile, W, H);
  const light = shift(hex, 0.25);
  const dark = shift(hex, -0.28);
  const holeR = Math.max(4, W * 0.1);

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: "block" }}
      aria-label={item.name}
    >
      <defs>
        <linearGradient id={`shade-${gid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={light} />
          <stop offset="45%" stopColor={hex} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
      </defs>
      <path d={d} fill={`url(#shade-${gid})`} stroke={dark} strokeWidth={1} />
      <ellipse
        cx={W / 2}
        cy={0}
        rx={holeR}
        ry={Math.max(2, holeR * 0.4)}
        fill={shift(hex, -0.55)}
      />
      <ellipse
        cx={W / 2}
        cy={0}
        rx={holeR * 0.55}
        ry={Math.max(1.4, holeR * 0.22)}
        fill={shift(hex, -0.35)}
      />
    </svg>
  );
}

export function FixtureSvg({ item, hex, scale = 1 }: { item: Item; hex: string; scale?: number }) {
  const gid = useId().replace(/:/g, "");
  const dark = shift(hex, -0.28);
  const type = item.fixtureType ?? "cord";

  const plateW = Math.round(22 * scale);
  const plateH = Math.round(8 * scale);
  const cordColour = "#2a2a2c";
  const cordLen = Math.round((type === "cord" ? 118 : type === "linear" ? 96 : 34) * scale);
  const barLen = Math.round(150 * scale);

  const width = Math.max(plateW, type === "linear" ? barLen : plateW);
  const height = plateH + cordLen + 12;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block" }}
      aria-label={item.name}
    >
      <defs>
        <linearGradient id={`fx-${gid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={shift(hex, 0.2)} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
      </defs>

      {/* ceiling plate */}
      <rect
        x={width / 2 - plateW / 2}
        y={0}
        width={plateW}
        height={plateH}
        rx={2}
        fill={`url(#fx-${gid})`}
        stroke={dark}
        strokeWidth={1}
      />

      {type === "linear" ? (
        <>
          {/* rail */}
          <rect
            x={width / 2 - barLen / 2}
            y={plateH + 4}
            width={barLen}
            height={6}
            rx={3}
            fill={hex}
            stroke={dark}
            strokeWidth={1}
          />
          {/* cord from rail centre */}
          <line
            x1={width / 2}
            y1={plateH + 10}
            x2={width / 2}
            y2={height - 12}
            stroke={cordColour}
            strokeWidth={2}
          />
        </>
      ) : (
        <line
          x1={width / 2}
          y1={plateH}
          x2={width / 2}
          y2={height - 12}
          stroke={cordColour}
          strokeWidth={type === "flush" ? 4 : 2}
        />
      )}

      {/* mount nub where shades attach */}
      <rect
        x={width / 2 - 4}
        y={height - 12}
        width={8}
        height={12}
        rx={2}
        fill={hex}
        stroke={dark}
        strokeWidth={1}
      />
    </svg>
  );
}
