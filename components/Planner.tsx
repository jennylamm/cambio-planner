"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  FIXTURES,
  SHADES,
  getColour,
  getItem,
  formatAUD,
  fromPrice,
  type Item,
} from "@/lib/catalog";
import { FixtureSvg, ShadeSvg, SCALE } from "./parts";

type Placed = { uid: string; itemId: string; colourName: string };

const STORAGE_KEY = "cambio-design-v1";
const REORDER_TYPE = "application/x-cambio-uid";

function makeUid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function loadDesign(): { fixture: Placed | null; shades: Placed[] } {
  if (typeof window === "undefined") return { fixture: null, shades: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { fixture: null, shades: [] };
    const p = JSON.parse(raw);
    return {
      fixture: p?.fixture?.itemId ? (p.fixture as Placed) : null,
      shades: Array.isArray(p?.shades) ? (p.shades as Placed[]) : [],
    };
  } catch {
    return { fixture: null, shades: [] };
  }
}

function naturalWidth(item: Item): number {
  if (item.kind === "shade") return (item.diameterMm ?? 100) * SCALE;
  return item.fixtureType === "linear" ? 150 : 40;
}

export default function Planner() {
  const [fixture, setFixture] = useState<Placed | null>(() => loadDesign().fixture);
  const [shades, setShades] = useState<Placed[]>(() => loadDesign().shades);
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Persist design.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ fixture, shades }));
    } catch {
      /* ignore quota errors */
    }
  }, [fixture, shades]);

  const addItem = useCallback((id: string) => {
    const item = getItem(id);
    const colourName = item.colours[0].name;
    if (item.kind === "fixture") {
      setFixture({ uid: makeUid(), itemId: id, colourName });
    } else {
      setShades((s) => [...s, { uid: makeUid(), itemId: id, colourName }]);
    }
  }, []);

  const setColour = useCallback(
    (target: Placed, name: string) => {
      const update = (p: Placed): Placed =>
        p.uid === target.uid ? { ...p, colourName: name } : p;
      if (fixture?.uid === target.uid) setFixture(update(fixture));
      else setShades((s) => s.map(update));
    },
    [fixture],
  );

  const removePlaced = useCallback(
    (target: Placed) => {
      if (fixture?.uid === target.uid) setFixture(null);
      else setShades((s) => s.filter((p) => p.uid !== target.uid));
    },
    [fixture],
  );

  const moveShade = useCallback((srcUid: string, targetUid: string) => {
    setShades((s) => {
      const from = s.findIndex((p) => p.uid === srcUid);
      const to = s.findIndex((p) => p.uid === targetUid);
      if (from < 0 || to < 0 || from === to) return s;
      const next = [...s];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  const moveToEnd = useCallback((srcUid: string) => {
    setShades((s) => {
      const from = s.findIndex((p) => p.uid === srcUid);
      if (from < 0) return s;
      const next = [...s];
      const [moved] = next.splice(from, 1);
      next.push(moved);
      return next;
    });
  }, []);

  const onCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const types = Array.from(e.dataTransfer.types);
    e.dataTransfer.dropEffect = types.includes(REORDER_TYPE) ? "move" : "copy";
  }, []);

  const onCanvasDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");
      if (id) {
        addItem(id);
        return;
      }
      const src = e.dataTransfer.getData(REORDER_TYPE);
      if (src) moveToEnd(src);
    },
    [addItem, moveToEnd],
  );

  const lines = useMemo(() => {
    const rows: { key: string; label: string; colour: string; price: number; rrp: number }[] = [];
    if (fixture) {
      const item = getItem(fixture.itemId);
      const col = getColour(item, fixture.colourName);
      rows.push({ key: fixture.uid, label: item.name, colour: col.name, price: col.price, rrp: col.rrp });
    }
    for (const s of shades) {
      const item = getItem(s.itemId);
      const col = getColour(item, s.colourName);
      rows.push({ key: s.uid, label: item.name, colour: col.name, price: col.price, rrp: col.rrp });
    }
    return rows;
  }, [fixture, shades]);

  const totalSale = lines.reduce((a, b) => a + b.price, 0);
  const totalRrp = lines.reduce((a, b) => a + b.rrp, 0);

  const download = useCallback(async () => {
    if (!canvasRef.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(canvasRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const a = document.createElement("a");
      a.download = "cambio-pendant-design.png";
      a.href = dataUrl;
      a.click();
    } catch (err) {
      console.error(err);
      alert("Sorry, the screenshot failed in this browser.");
    } finally {
      setBusy(false);
    }
  }, []);

  const clear = useCallback(() => {
    setFixture(null);
    setShades([]);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-100 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white px-5 py-3">
        <div className="mx-auto flex max-w-[1400px] items-baseline justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Cambio Pendant Planner</h1>
            <p className="text-xs text-neutral-500">
              Design an About Space Cambio pendant — drag shades onto a fixture.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={clear}
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-neutral-600 hover:bg-neutral-50"
            >
              Clear
            </button>
            <button
              onClick={download}
              disabled={busy || lines.length === 0}
              className="rounded-md bg-neutral-900 px-3 py-1.5 text-white hover:bg-neutral-700 disabled:opacity-40"
            >
              {busy ? "Saving…" : "Download PNG"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-4 p-4 lg:flex-row lg:items-stretch">
        {/* Palette */}
        <aside className="w-full shrink-0 lg:w-[280px]">
          <div className="rounded-xl border border-neutral-200 bg-white p-3">
            <SectionTitle>Fixtures</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              {FIXTURES.map((item) => (
                <PaletteCard key={item.id} item={item} onAdd={addItem} />
              ))}
            </div>
            <SectionTitle>Shades</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              {SHADES.map((item) => (
                <PaletteCard key={item.id} item={item} onAdd={addItem} />
              ))}
            </div>
          </div>
        </aside>

        {/* Canvas */}
        <main
          className="min-h-[520px] flex-1 overflow-auto rounded-xl border border-neutral-200 bg-white p-6"
          onDragOver={onCanvasDragOver}
          onDrop={onCanvasDrop}
        >
          <div
            ref={canvasRef}
            className="mx-auto flex w-full max-w-[560px] flex-col items-center"
            style={{ background: "#ffffff" }}
          >
            {/* ceiling */}
            <div
              style={{
                width: "100%",
                height: 6,
                background:
                  "repeating-linear-gradient(90deg, #d6d3d1 0 14px, transparent 14px 20px)",
              }}
            />
            <div className="flex flex-col items-center" style={{ paddingTop: 8, minHeight: 360 }}>
              {fixture ? (
                <PlacedFixture
                  placed={fixture}
                  onColour={(n) => setColour(fixture, n)}
                  onRemove={() => removePlaced(fixture)}
                />
              ) : (
                <div
                  className="flex h-16 flex-col items-center justify-center text-center text-sm"
                  style={{ color: "#a3a3a3" }}
                >
                  <span>Drag a fixture here to start</span>
                </div>
              )}

              {/* shades stack */}
              <div className="flex flex-col items-center">
                {shades.map((s) => (
                  <PlacedShade
                    key={s.uid}
                    placed={s}
                    onColour={(n) => setColour(s, n)}
                    onRemove={() => removePlaced(s)}
                    onReorder={(srcUid, targetUid) => moveShade(srcUid, targetUid)}
                  />
                ))}
              </div>

              {shades.length === 0 && (
                <div className="py-2 text-center text-sm" style={{ color: "#a3a3a3" }}>
                  …then drag shades onto the stack
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Tally */}
        <aside className="w-full shrink-0 lg:w-[280px]">
          <div className="rounded-xl border border-neutral-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold">Cost Tally</h2>
            {lines.length === 0 ? (
              <p className="text-sm text-neutral-400">Nothing added yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {lines.map((l) => (
                  <li key={l.key} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-neutral-800">{l.label}</div>
                      <div className="text-xs text-neutral-400">{l.colour}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-neutral-900">{formatAUD(l.price)}</div>
                      <div className="text-xs text-neutral-400 line-through">{formatAUD(l.rrp)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 border-t border-neutral-200 pt-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-neutral-500">Total</span>
                <span className="text-xl font-semibold">{formatAUD(totalSale)}</span>
              </div>
              <div className="flex items-baseline justify-between text-sm text-neutral-400">
                <span>Full retail</span>
                <span className="line-through">{formatAUD(totalRrp)}</span>
              </div>
              {totalSale < totalRrp && (
                <div className="mt-1 text-right text-xs font-medium text-emerald-600">
                  You save {formatAUD(totalRrp - totalSale)}
                </div>
              )}
            </div>

            <p className="mt-4 text-[11px] leading-relaxed text-neutral-400">
              Prices in AUD from aboutspace.net.au. Sale prices change often — check the site
              before ordering.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 mt-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-400 first:mt-0">
      {children}
    </h2>
  );
}

function PaletteCard({ item, onAdd }: { item: Item; onAdd: (id: string) => void }) {
  const first = item.colours[0];
  const fit = Math.min(1, 56 / naturalWidth(item));
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
      className="flex flex-col items-center rounded-lg border border-neutral-200 p-2 text-center transition hover:border-neutral-400 hover:bg-neutral-50"
    >
      <span className="flex h-14 items-end justify-center">
        {item.kind === "shade" ? (
          <ShadeSvg item={item} hex={first.hex} scale={fit} />
        ) : (
          <FixtureSvg item={item} hex={first.hex} scale={fit} />
        )}
      </span>
      <span className="mt-1 line-clamp-2 text-[11px] leading-tight text-neutral-700">
        {item.name}
      </span>
      <span className="text-[11px] font-medium text-neutral-500">
        From {formatAUD(fromPrice(item))}
      </span>
    </button>
  );
}

function PlacedFixture({
  placed,
  onColour,
  onRemove,
}: {
  placed: Placed;
  onColour: (name: string) => void;
  onRemove: () => void;
}) {
  const item = getItem(placed.itemId);
  const col = getColour(item, placed.colourName);
  return (
    <PlacedShell
      name={item.name}
      label={col.name + (item.dropMm ? ` · Drop ${item.dropMm}mm` : "")}
      colours={item.colours}
      active={placed.colourName}
      onColour={onColour}
      onRemove={onRemove}
    >
      <FixtureSvg item={item} hex={col.hex} />
    </PlacedShell>
  );
}

function PlacedShade({
  placed,
  onColour,
  onRemove,
  onReorder,
}: {
  placed: Placed;
  onColour: (name: string) => void;
  onRemove: () => void;
  onReorder: (srcUid: string, targetUid: string) => void;
}) {
  const item = getItem(placed.itemId);
  const col = getColour(item, placed.colourName);
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(REORDER_TYPE, placed.uid);
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(e) => {
        const types = Array.from(e.dataTransfer.types);
        if (types.includes(REORDER_TYPE)) {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const src = e.dataTransfer.getData(REORDER_TYPE);
        if (src) onReorder(src, placed.uid);
      }}
      className="flex cursor-grab flex-col items-center active:cursor-grabbing"
    >
      <PlacedShell
        name={item.name}
        label={`${col.name} · Ø${item.diameterMm} × H${item.heightMm}mm`}
        colours={item.colours}
        active={placed.colourName}
        onColour={onColour}
        onRemove={onRemove}
      >
        <ShadeSvg item={item} hex={col.hex} />
      </PlacedShell>
    </div>
  );
}

function PlacedShell({
  children,
  name,
  label,
  colours,
  active,
  onColour,
  onRemove,
}: {
  children: React.ReactNode;
  name: string;
  label: string;
  colours: { name: string; hex: string }[];
  active: string;
  onColour: (name: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="group/row relative flex flex-col items-center px-3 py-1">
      {children}
      {/* hover controls */}
      <div className="absolute inset-x-0 -top-1 hidden justify-center group-hover/row:flex">
        <div className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-2 py-1 shadow-sm">
          {colours.map((c) => (
            <button
              key={c.name}
              type="button"
              title={c.name}
              onClick={() => onColour(c.name)}
              className="h-4 w-4 rounded-full border border-black/10"
              style={{
                background: c.hex,
                outline: c.name === active ? "2px solid #171717" : "none",
                outlineOffset: 1,
              }}
            />
          ))}
          <button
            type="button"
            onClick={onRemove}
            title="Remove"
            className="ml-1 rounded-full px-1.5 text-xs font-semibold text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          >
            ×
          </button>
        </div>
      </div>
      <div className="mt-1 flex flex-col items-center text-center leading-tight">
        <span className="text-[11px]" style={{ color: "#525252" }}>
          {name}
        </span>
        <span className="text-[10px]" style={{ color: "#a3a3a3" }}>
          {label}
        </span>
      </div>
    </div>
  );
}
