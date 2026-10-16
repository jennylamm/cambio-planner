"use client";

import { getColour, getItem, type Item } from "@/lib/catalog";
import { SCALE, CORD_PX, STEM_PX } from "@/lib/shapes";
import { ShadeSvg } from "./ShadeSvg";
import { BaseFrame } from "./BaseFrame";
import { UID_TYPE, type Placed } from "@/lib/useDesign";

/** The base (fixture/pendant) block. Click to select; outlined when selected. */
export function BaseBlock({
  placed,
  selected,
  onSelect,
}: {
  placed: Placed;
  selected: boolean;
  onSelect: () => void;
}) {
  const item = getItem(placed.itemId);
  const col = getColour(item, placed.colourName);

  return (
    <div
      onClick={onSelect}
      className="w-fit cursor-pointer"
      style={
        selected
          ? { outline: "2px dashed #ef4444", outlineOffset: 3, borderRadius: 4 }
          : undefined
      }
    >
      <BaseFrame item={item} hex={col.hex} pxPerMm={SCALE} cordPx={CORD_PX} stemPx={STEM_PX} />
    </div>
  );
}

/**
 * A shade placed on a drop. Draggable to reorder (the parent stack handles the
 * drop), clickable to select. `data-shade` lets the stack measure it for the
 * drop-position indicator.
 */
export function PlacedShade({
  placed,
  sideways = false,
  selfCenter = true,
  selected = false,
  onSelect,
  onDragEnd,
}: {
  placed: Placed;
  /** Mounted on a horizontal socket — shade is rotated 90°. */
  sideways?: boolean;
  /** When false the parent positions the shade (rod-frame stacks). */
  selfCenter?: boolean;
  selected?: boolean;
  onSelect: () => void;
  onDragEnd: () => void;
}) {
  const item = getItem(placed.itemId);
  const col = getColour(item, placed.colourName);

  const shade = sideways ? (
    <div className="flex items-center justify-center" style={{ width: H_PX(item), height: W_PX(item) }}>
      <ShadeSvg item={item} hex={col.hex} pxPerMm={SCALE} sideways />
    </div>
  ) : (
    <ShadeSvg item={item} hex={col.hex} pxPerMm={SCALE} flipped={placed.flipped} />
  );

  return (
    <div
      draggable
      data-shade
      onDragStart={(e) => {
        e.dataTransfer.setData(UID_TYPE, placed.uid);
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      className={
        sideways
          ? "cursor-grab active:cursor-grabbing"
          : "flex w-fit cursor-grab flex-col items-center active:cursor-grabbing"
      }
      style={{
        ...(!sideways && selfCenter
          ? { position: "relative" as const, left: "50%", transform: "translateX(-50%)" }
          : {}),
        ...(selected ? { outline: "2px dashed #ef4444", outlineOffset: 3, borderRadius: 4 } : {}),
      }}
    >
      {shade}
    </div>
  );
}

function W_PX(item: Item): number {
  return Math.max(1, Math.round((item.diameterMm ?? 100) * SCALE));
}
function H_PX(item: Item): number {
  return Math.max(1, Math.round((item.heightMm ?? 75) * SCALE));
}
