"use client";

import { FIXTURES, PENDANTS, SHADES, formatAUD, fromPrice, type Item } from "@/lib/catalog";
import {
  PALETTE_BAR_SCALE,
  PALETTE_CORD_PX,
  PALETTE_SCALE,
  PALETTE_STEM_PX,
} from "@/lib/shapes";
import { ShadeSvg } from "./ShadeSvg";
import { BaseFrame } from "./BaseFrame";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="collapse collapse-arrow border-b border-base-200 last:border-0">
      <input type="checkbox" defaultChecked />
      <div className="collapse-title px-1 py-2 text-[11px] font-semibold uppercase tracking-wide text-base-content/60">
        {title}
      </div>
      <div className="collapse-content px-1 pb-2">{children}</div>
    </div>
  );
}

function PaletteCard({ item, onAdd }: { item: Item; onAdd: (id: string) => void }) {
  const first = item.colours[0];
  const isShade = item.category === "shade";
  const sub = isShade
    ? `Ø${item.diameterMm} × H${item.heightMm}mm`
    : item.drops && item.drops > 1
      ? `${item.drops} lights`
      : item.dropMm
        ? `${item.dropMm}mm drop`
        : undefined;

  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", item.id);
        e.dataTransfer.effectAllowed = "copy";
      }}
      onClick={() => onAdd(item.id)}
      title={`${item.name} — ${item.colours.length} colour${item.colours.length > 1 ? "s" : ""}`}
      className="flex flex-col items-center rounded-box border border-base-300 bg-base-200 p-2 text-center transition hover:border-primary hover:bg-base-300"
    >
      <span className="flex h-16 w-full items-end justify-center overflow-visible">
        {isShade ? (
          <ShadeSvg item={item} hex={first.hex} pxPerMm={PALETTE_SCALE} />
        ) : (
          <BaseFrame
            item={item}
            hex={first.hex}
            pxPerMm={PALETTE_BAR_SCALE}
            cordPx={PALETTE_CORD_PX}
            stemPx={PALETTE_STEM_PX}
            k={0.6}
          />
        )}
      </span>
      <span className="mt-1 line-clamp-2 text-[11px] leading-tight text-base-content">
        {item.name}
      </span>
      <span className="text-[10px] text-base-content/50">{sub}</span>
      <span className="text-[11px] font-semibold text-base-content/70">
        From {formatAUD(fromPrice(item))}
      </span>
    </button>
  );
}

export function Palette({ onAdd }: { onAdd: (id: string) => void }) {
  return (
    <aside className="w-full shrink-0 lg:w-[300px] lg:min-h-0 lg:overflow-y-auto">
      <div className="rounded-box border border-base-300 bg-base-100 p-3">
        <Section title="Fixtures">
          <div className="grid grid-cols-1 gap-2">
            {FIXTURES.map((item) => (
              <PaletteCard key={item.id} item={item} onAdd={onAdd} />
            ))}
          </div>
        </Section>

        <Section title="Pendants">
          <div className="grid grid-cols-1 gap-2">
            {PENDANTS.map((item) => (
              <PaletteCard key={item.id} item={item} onAdd={onAdd} />
            ))}
          </div>
        </Section>

        <Section title="Shades">
          <div className="grid grid-cols-2 gap-2">
            {SHADES.map((item) => (
              <PaletteCard key={item.id} item={item} onAdd={onAdd} />
            ))}
          </div>
        </Section>
      </div>
    </aside>
  );
}
