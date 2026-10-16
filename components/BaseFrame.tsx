"use client";

import { useId } from "react";
import type { Item } from "@/lib/catalog";
import {
  frameWidth,
  shift,
  rodFrameGeometry,
  ROD_CANOPY_H,
  ROD_BULB_LEN,
  ROD_BULB_W,
} from "@/lib/shapes";
import { dropsOf } from "@/lib/catalog";

/**
 * Renders the frame (ceiling plate + body + cords) of a fixture or pendant,
 * with `drops` mount points evenly spaced across its width. Shade stacks are
 * rendered separately below, aligned to the same width, so their centres line
 * up with the mount points.
 */
export function BaseFrame({
  item,
  hex,
  pxPerMm,
  cordPx,
  stemPx,
  k = 1,
}: {
  item: Item;
  hex: string;
  pxPerMm: number;
  cordPx: number;
  stemPx: number;
  /** scales the small fixed elements (plate, bar, nub thickness) */
  k?: number;
}) {
  const gid = useId().replace(/:/g, "");
  const type = item.fixtureType ?? "cord";
  if (type === "rod") {
    return <RodFrame item={item} hex={hex} pxPerMm={pxPerMm} k={k} />;
  }
  const drops = dropsOf(item);
  const width = frameWidth(item, pxPerMm);

  const plateW = Math.max(14 * k, Math.min(30 * k, width * 0.25));
  const plateH = 6 * k;
  const gap = 6 * k;
  const barH = 6 * k;
  const domeH = 26 * k;
  const nubH = 10 * k;
  const nubW = 8 * k;
  const cordW = 2 * k;
  const stemW = 4 * k;

  const dropX = (i: number) => (drops === 1 ? width / 2 : ((i + 0.5) * width) / drops);

  let bodyBottom: number;
  let height: number;
  if (type === "bar") {
    bodyBottom = plateH + gap + barH;
    height = bodyBottom + cordPx + nubH;
  } else if (type === "dome") {
    bodyBottom = plateH + gap + domeH;
    height = bodyBottom + cordPx + nubH;
  } else if (type === "flush") {
    bodyBottom = plateH;
    height = plateH + stemPx + nubH;
  } else {
    bodyBottom = plateH;
    height = plateH + cordPx + nubH;
  }

  const light = shift(hex, 0.2);
  const dark = shift(hex, -0.28);
  const cordColour = "#2a2a2c";

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
          <stop offset="0%" stopColor={light} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
      </defs>

      {/* ceiling plate */}
      <rect
        x={width / 2 - plateW / 2}
        y={0}
        width={plateW}
        height={plateH}
        rx={1.5 * k}
        fill={`url(#fx-${gid})`}
        stroke={dark}
        strokeWidth={1}
      />

      {type === "bar" && (
        <rect
          x={0}
          y={plateH + gap}
          width={width}
          height={barH}
          rx={barH / 2}
          fill={hex}
          stroke={dark}
          strokeWidth={1}
        />
      )}

      {type === "dome" && (
        <path
          d={`M 0 ${bodyBottom} Q ${width / 2} ${bodyBottom - domeH} ${width} ${bodyBottom} Z`}
          fill={hex}
          stroke={dark}
          strokeWidth={1}
        />
      )}

      {/* cords / stems */}
      {type === "flush" ? (
        <line
          x1={width / 2}
          y1={plateH}
          x2={width / 2}
          y2={plateH + stemPx}
          stroke={cordColour}
          strokeWidth={stemW}
        />
      ) : (
        Array.from({ length: drops }).map((_, i) => {
          const x = dropX(i);
          const top = type === "cord" ? plateH : bodyBottom;
          const bottom = top + cordPx;
          return (
            <line
              key={i}
              x1={x}
              y1={top}
              x2={x}
              y2={bottom}
              stroke={cordColour}
              strokeWidth={cordW}
            />
          );
        })
      )}

      {/* mount nubs */}
      {Array.from({ length: drops }).map((_, i) => {
        const x = dropX(i);
        const top = height - nubH;
        return (
          <rect
            key={i}
            x={x - nubW / 2}
            y={top}
            width={nubW}
            height={nubH}
            rx={2 * k}
            fill={hex}
            stroke={dark}
            strokeWidth={1}
          />
        );
      })}
    </svg>
  );
}

/**
 * Asymmetric rod frame (e.g. Levia A): two canopies, two shortened cables, a
 * horizontal rod, vertical rods and a bare leg, with a bulb holder at each
 * socket (down or sideways).
 */
function RodFrame({
  item,
  hex,
  pxPerMm,
  k = 1,
}: {
  item: Item;
  hex: string;
  pxPerMm: number;
  k?: number;
}) {
  const gid = useId().replace(/:/g, "");
  const geo = rodFrameGeometry(item, pxPerMm, k);
  const { width, height, bodyTop, rodLeft, rodRight, sockets, legs, canopyX } = geo;

  const light = shift(hex, 0.2);
  const dark = shift(hex, -0.28);
  const cableColour = "#2a2a2c";
  const rodW = Math.max(1.5, 2.5 * k);
  const canopyW = Math.max(10, Math.round(80 * pxPerMm));
  const canopyH = ROD_CANOPY_H * k;
  const bulbW = ROD_BULB_W * k;
  const bulbL = ROD_BULB_LEN * k;

  const downSockets = sockets.filter((s) => s.orient === "down");
  const junctionXs = [...downSockets.map((s) => s.x), ...legs.map((l) => l.x)];

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
          <stop offset="0%" stopColor={light} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
      </defs>

      {/* ceiling canopies */}
      {canopyX.map((x, i) => (
        <rect
          key={`cp-${i}`}
          x={x - canopyW / 2}
          y={0}
          width={canopyW}
          height={canopyH}
          rx={2 * k}
          fill={`url(#fx-${gid})`}
          stroke={dark}
          strokeWidth={1}
        />
      ))}

      {/* suspension cables */}
      {canopyX.map((x, i) => (
        <line
          key={`cb-${i}`}
          x1={x}
          y1={canopyH}
          x2={x}
          y2={bodyTop}
          stroke={cableColour}
          strokeWidth={Math.max(1, 2 * k)}
        />
      ))}

      {/* horizontal rod */}
      <line
        x1={rodLeft}
        y1={bodyTop}
        x2={rodRight}
        y2={bodyTop}
        stroke={hex}
        strokeWidth={rodW}
        strokeLinecap="round"
      />

      {/* downward rods (socket rods) */}
      {downSockets.map((s, i) => (
        <line
          key={`rod-${i}`}
          x1={s.x}
          y1={bodyTop}
          x2={s.x}
          y2={s.y}
          stroke={hex}
          strokeWidth={rodW}
          strokeLinecap="round"
        />
      ))}

      {/* bare legs */}
      {legs.map((l, i) => (
        <line
          key={`leg-${i}`}
          x1={l.x}
          y1={bodyTop}
          x2={l.x}
          y2={l.y}
          stroke={hex}
          strokeWidth={rodW}
          strokeLinecap="round"
        />
      ))}

      {/* cable connectors */}
      {canopyX.map((x, i) => (
        <circle
          key={`ct-${i}`}
          cx={x}
          cy={bodyTop}
          r={3 * k}
          fill={hex}
          stroke={dark}
          strokeWidth={1}
        />
      ))}

      {/* rod junctions */}
      {junctionXs.map((x, i) => (
        <circle
          key={`jn-${i}`}
          cx={x}
          cy={bodyTop}
          r={2.5 * k}
          fill={hex}
          stroke={dark}
          strokeWidth={1}
        />
      ))}

      {/* bulb holders (sockets) */}
      {sockets.map((s, i) =>
        s.orient === "down" ? (
          <rect
            key={`bk-${i}`}
            x={s.x - bulbW / 2}
            y={s.y}
            width={bulbW}
            height={bulbL}
            rx={2 * k}
            fill={hex}
            stroke={dark}
            strokeWidth={1}
          />
        ) : (
          <rect
            key={`bk-${i}`}
            x={s.x - bulbL}
            y={s.y - bulbW / 2}
            width={bulbL}
            height={bulbW}
            rx={2 * k}
            fill={hex}
            stroke={dark}
            strokeWidth={1}
          />
        ),
      )}
    </svg>
  );
}
