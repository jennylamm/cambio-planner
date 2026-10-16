"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { dropsOf, getColour, getItem } from "./catalog";

export type Placed = { uid: string; itemId: string; colourName: string; flipped?: boolean };
export type Base = Placed;
export type Design = { base: Base | null; drops: Placed[][] };
export type TallyLine = {
  key: string;
  label: string;
  colour: string;
  price: number;
  rrp: number;
};

/** Custom drag-and-drop MIME type used to identify a shade being reordered. */
export const UID_TYPE = "application/x-cambio-uid";

const STORAGE_KEY = "cambio-design-v2";

function makeUid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function loadDesign(): Design {
  if (typeof window === "undefined") return { base: null, drops: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { base: null, drops: [] };
    const p = JSON.parse(raw);
    return {
      base: p?.base?.itemId ? (p.base as Base) : null,
      drops: Array.isArray(p?.drops)
        ? p.drops.filter((s: unknown) => Array.isArray(s)).map((s: unknown) => s as Placed[])
        : [],
    };
  } catch {
    return { base: null, drops: [] };
  }
}

export function useDesign() {
  const [design, setDesign] = useState<Design>(() => loadDesign());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(design));
    } catch {
      /* ignore quota errors */
    }
  }, [design]);

  const addBase = useCallback((id: string) => {
    const item = getItem(id);
    const drops = Array.from({ length: dropsOf(item) }, () => [] as Placed[]);
    setDesign({
      base: { uid: makeUid(), itemId: id, colourName: item.colours[0].name },
      drops,
    });
  }, []);

  const addShade = useCallback((id: string, dropIndex: number) => {
    const item = getItem(id);
    setDesign((d) => {
      const drops = d.drops.map((stack, i) =>
        i === dropIndex
          ? [...stack, { uid: makeUid(), itemId: id, colourName: item.colours[0].name }]
          : stack,
      );
      return { ...d, drops };
    });
  }, []);

  const setColour = useCallback((uid: string, name: string) => {
    setDesign((d) => {
      if (d.base?.uid === uid) return { ...d, base: { ...d.base, colourName: name } };
      return {
        ...d,
        drops: d.drops.map((stack) =>
          stack.map((p) => (p.uid === uid ? { ...p, colourName: name } : p)),
        ),
      };
    });
  }, []);

  const removePlaced = useCallback((uid: string) => {
    setDesign((d) => {
      if (d.base?.uid === uid) return { base: null, drops: [] };
      return { ...d, drops: d.drops.map((stack) => stack.filter((p) => p.uid !== uid)) };
    });
  }, []);

  /** Flip a shade 180° (upside down). */
  const toggleFlip = useCallback((uid: string) => {
    setDesign((d) => ({
      ...d,
      drops: d.drops.map((stack) =>
        stack.map((p) => (p.uid === uid ? { ...p, flipped: !p.flipped } : p)),
      ),
    }));
  }, []);

  /**
   * Move a shade (found by uid) into `toDrop` at absolute position `atIndex`,
   * relative to the target stack after the source is removed — so `atIndex`
   * equals the shade's final index within the stack. Omit to append.
   */
  const moveShade = useCallback((uid: string, toDrop: number, atIndex?: number) => {
    setDesign((d) => {
      let fromDrop = -1;
      let source: Placed | null = null;
      for (let i = 0; i < d.drops.length; i++) {
        const found = d.drops[i].find((p) => p.uid === uid);
        if (found) {
          fromDrop = i;
          source = found;
          break;
        }
      }
      if (!source || fromDrop < 0) return d;

      const drops = d.drops.map((stack) => [...stack]);
      drops[fromDrop] = drops[fromDrop].filter((p) => p.uid !== uid);
      const target = drops[toDrop] ?? [];
      const idx =
        atIndex === undefined ? target.length : Math.min(Math.max(atIndex, 0), target.length);
      target.splice(idx, 0, source);
      drops[toDrop] = target;
      return { ...d, drops };
    });
  }, []);

  const clear = useCallback(() => setDesign({ base: null, drops: [] }), []);

  const lines = useMemo<TallyLine[]>(() => {
    const rows: TallyLine[] = [];
    if (design.base) {
      const item = getItem(design.base.itemId);
      const col = getColour(item, design.base.colourName);
      rows.push({ key: design.base.uid, label: item.name, colour: col.name, price: col.price, rrp: col.rrp });
    }
    for (const stack of design.drops) {
      for (const p of stack) {
        const item = getItem(p.itemId);
        const col = getColour(item, p.colourName);
        rows.push({ key: p.uid, label: item.name, colour: col.name, price: col.price, rrp: col.rrp });
      }
    }
    return rows;
  }, [design]);

  const totalSale = lines.reduce((a, b) => a + b.price, 0);
  const totalRrp = lines.reduce((a, b) => a + b.rrp, 0);

  return {
    base: design.base,
    drops: design.drops,
    lines,
    totalSale,
    totalRrp,
    addBase,
    addShade,
    setColour,
    removePlaced,
    toggleFlip,
    moveShade,
    clear,
  };
}
