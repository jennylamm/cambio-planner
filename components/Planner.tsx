"use client";

import { useRef, useState } from "react";
import { toCanvas } from "html-to-image";
import { getItem, formatAUD } from "@/lib/catalog";
import { useDesign } from "@/lib/useDesign";
import { Palette } from "./Palette";
import { Canvas } from "./Canvas";
import { Tally } from "./Tally";

/**
 * Capture `el` at its full rendered extent, including absolutely-positioned
 * children (e.g. shades hanging below a rod frame) that overflow its box.
 */
async function captureNode(el: HTMLElement): Promise<HTMLCanvasElement> {
  const own = el.getBoundingClientRect();
  let minX = own.left;
  let minY = own.top;
  let maxX = own.right;
  let maxY = own.bottom;
  el.querySelectorAll("*").forEach((child) => {
    const r = (child as HTMLElement).getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    minX = Math.min(minX, r.left);
    minY = Math.min(minY, r.top);
    maxX = Math.max(maxX, r.right);
    maxY = Math.max(maxY, r.bottom);
  });

  // Nothing overflows the element's own box — capture it as-is.
  const overflows =
    minX < own.left || minY < own.top || maxX > own.right || maxY > own.bottom;
  if (!overflows) {
    return toCanvas(el, { backgroundColor: "#ffffff" });
  }

  // The design (e.g. shades hanging below a rod frame, or a sideways shade
  // extending left) overflows the container. Temporarily size the container so
  // its box covers the full rendered extent, capture, then restore.
  const width = Math.ceil(maxX - minX);
  const height = Math.ceil(maxY - minY);
  const padLeft = Math.ceil(own.left - minX);
  const padTop = Math.ceil(own.top - minY);

  const prev = {
    width: el.style.width,
    height: el.style.height,
    paddingLeft: el.style.paddingLeft,
    paddingTop: el.style.paddingTop,
  };

  el.style.width = `${width}px`;
  el.style.height = `${height}px`;
  el.style.paddingLeft = `${padLeft}px`;
  el.style.paddingTop = `${padTop}px`;

  try {
    return await toCanvas(el, { backgroundColor: "#ffffff" });
  } finally {
    el.style.width = prev.width;
    el.style.height = prev.height;
    el.style.paddingLeft = prev.paddingLeft;
    el.style.paddingTop = prev.paddingTop;
  }
}

export default function Planner() {
  const d = useDesign();
  const designRef = useRef<HTMLDivElement | null>(null);
  const tallyRef = useRef<HTMLDivElement | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleAdd = (id: string) => {
    const item = getItem(id);
    if (item.category === "shade") d.addShade(id, 0);
    else d.addBase(id);
  };

  const handleDownload = async () => {
    const designEl = designRef.current;
    const tallyEl = tallyRef.current;
    if (!designEl || !tallyEl || exporting) return;
    setExporting(true);
    try {
      const [design, tally] = await Promise.all([
        captureNode(designEl),
        toCanvas(tallyEl, { backgroundColor: "#ffffff" }),
      ]);

      const PAD = 24;
      const gap = 24;
      const out = document.createElement("canvas");
      out.width = PAD + design.width + gap + tally.width + PAD;
      out.height = PAD + Math.max(design.height, tally.height) + PAD;
      const ctx = out.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, out.width, out.height);
      ctx.drawImage(design, PAD, PAD);
      ctx.drawImage(tally, PAD + design.width + gap, PAD);

      const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, "image/png"));
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cambio-pendant.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PNG export failed", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-base-200 text-base-content lg:h-screen lg:overflow-hidden">
      <header className="shrink-0 border-b border-base-300 bg-base-100 px-5 py-3">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Cambio Pendant Planner</h1>
            <p className="text-xs text-base-content/60">
              Drag shades onto a fixture or pendant to build your light.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-sm">
              <div className="font-semibold">{formatAUD(d.totalSale)}</div>
              <div className="text-xs text-base-content/40 line-through">
                {formatAUD(d.totalRrp)}
              </div>
            </div>
            <button onClick={d.clear} className="btn btn-outline btn-sm">
              Clear
            </button>
            <button
              onClick={handleDownload}
              disabled={exporting || !d.base}
              className="btn btn-primary btn-sm"
            >
              {exporting ? "Exporting…" : "Download PNG"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-4 p-4 lg:min-h-0 lg:flex-row lg:items-stretch">
        <Palette onAdd={handleAdd} />

        <Canvas
          base={d.base}
          drops={d.drops}
          addBase={d.addBase}
          addShade={d.addShade}
          setColour={d.setColour}
          removePlaced={d.removePlaced}
          toggleFlip={d.toggleFlip}
          moveShade={d.moveShade}
          captureRef={designRef}
        />

        <aside className="w-full shrink-0 lg:w-[280px] lg:min-h-0 lg:overflow-y-auto">
          <div ref={tallyRef} className="rounded-box border border-base-300 bg-base-100 p-4">
            <h2 className="mb-3 text-sm font-semibold">Cost Tally</h2>
            <Tally lines={d.lines} totalSale={d.totalSale} totalRrp={d.totalRrp} />
          </div>
        </aside>
      </div>
    </div>
  );
}
