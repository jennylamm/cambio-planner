"use client";

import { getItem, getColour, dropsOf, formatAUD } from "@/lib/catalog";
import type { Placed } from "@/lib/useDesign";

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function RotateIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}

function UpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

function DownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function BinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

/**
 * Detail card for the currently selected shade or base, pinned to the
 * bottom-right of the canvas. Lets the user change colour, rotate (shades),
 * move up/down within a stack (shades) and delete.
 */
export function DetailCard({
  placed,
  canFlip,
  canMoveUp,
  canMoveDown,
  onColour,
  onFlip,
  onMoveUp,
  onMoveDown,
  onRemove,
  onClose,
}: {
  placed: Placed;
  canFlip: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onColour: (name: string) => void;
  onFlip: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const item = getItem(placed.itemId);
  const col = getColour(item, placed.colourName);
  const isShade = item.category === "shade";

  const dims = isShade
    ? `Ø${item.diameterMm} × H${item.heightMm}mm`
    : [
        item.dropMm ? `Drop ${item.dropMm}mm` : null,
        dropsOf(item) > 1 ? `${dropsOf(item)} lights` : "1 light",
      ]
        .filter(Boolean)
        .join(" · ");

  return (
    <div className="w-64 overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-xl">
      {/* header */}
      <div className="flex items-start justify-between gap-2 border-b border-base-200 px-4 py-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-base-content" title={item.name}>
            {item.name}
          </div>
          <div className="text-xs text-base-content/60">{dims}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          title="Close"
          className="btn btn-ghost btn-square btn-xs shrink-0 -mr-1 text-base-content/60 hover:text-base-content"
        >
          <CloseIcon />
        </button>
      </div>

      {/* colour list */}
      <div className="px-4 py-3">
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-base-content/50">
          Colour
        </div>
        <div className="flex flex-col gap-1">
          {item.colours.map((c) => {
            const active = c.name === col.name;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => onColour(c.name)}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition ${
                  active ? "bg-base-200 ring-1 ring-primary" : "hover:bg-base-200"
                }`}
              >
                <span
                  className="h-4 w-4 shrink-0 rounded-full"
                  style={{ background: c.hex, border: "1px solid rgba(0,0,0,0.15)" }}
                />
                <span className="flex-1 truncate text-base-content">{c.name}</span>
                <span className="shrink-0 text-xs text-base-content/60">
                  {formatAUD(c.price)}
                  {c.rrp > c.price && (
                    <span className="ml-1 text-base-content/40 line-through">{formatAUD(c.rrp)}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* actions */}
      <div className="flex items-center gap-1 border-t border-base-200 px-3 py-2.5">
        {canFlip && (
          <button
            type="button"
            onClick={onFlip}
            title="Rotate 180°"
            className="btn btn-ghost btn-sm btn-square"
          >
            <RotateIcon />
          </button>
        )}
        {isShade && (
          <>
            <button
              type="button"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              title="Move up"
              className="btn btn-ghost btn-sm btn-square"
            >
              <UpIcon />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              title="Move down"
              className="btn btn-ghost btn-sm btn-square"
            >
              <DownIcon />
            </button>
          </>
        )}
        <div className="flex-1" />
        <button
          type="button"
          onClick={onRemove}
          title="Delete"
          className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
        >
          <BinIcon />
        </button>
      </div>
    </div>
  );
}
