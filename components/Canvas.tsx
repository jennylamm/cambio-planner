"use client";

import { useState } from "react";
import type { CSSProperties, DragEvent, RefObject } from "react";
import { getItem } from "@/lib/catalog";
import { frameWidth, SCALE, rodFrameGeometry, ROD_BULB_LEN, type DropPosition } from "@/lib/shapes";
import { UID_TYPE, type Placed } from "@/lib/useDesign";
import { BaseBlock, PlacedShade } from "./PlacedItem";
import { DetailCard } from "./DetailCard";

function isReorder(e: DragEvent) {
  return Array.from(e.dataTransfer.types).includes(UID_TYPE);
}

type Props = {
  base: Placed | null;
  drops: Placed[][];
  addBase: (id: string) => void;
  addShade: (id: string, dropIndex: number) => void;
  setColour: (uid: string, name: string) => void;
  removePlaced: (uid: string) => void;
  toggleFlip: (uid: string) => void;
  moveShade: (uid: string, toDrop: number, atIndex?: number) => void;
  captureRef: RefObject<HTMLDivElement | null>;
};

function findPlaced(base: Placed | null, drops: Placed[][], uid: string) {
  if (base?.uid === uid) return { placed: base, dropIndex: -1, index: -1 };
  for (let i = 0; i < drops.length; i++) {
    const idx = drops[i].findIndex((x) => x.uid === uid);
    if (idx >= 0) return { placed: drops[i][idx], dropIndex: i, index: idx };
  }
  return null;
}

type DropTarget = { drop: number; pos: number; axis: "y" | "x" };

/**
 * Insertion boundary (and its pixel offset within `container`) for a vertical
 * stack, from the pointer Y vs each shade's midpoint. `index` counts shades
 * whose midpoint sits above the pointer (0..n).
 */
function verticalInsert(container: HTMLElement, clientY: number) {
  const shades = Array.from(container.querySelectorAll<HTMLElement>("[data-shade]"));
  const cTop = container.getBoundingClientRect().top;
  let index = 0;
  for (const s of shades) {
    const r = s.getBoundingClientRect();
    if (clientY > r.top + r.height / 2) index++;
  }
  let pos: number;
  if (shades.length === 0) {
    pos = 0;
  } else if (index === 0) {
    pos = shades[0].getBoundingClientRect().top - cTop;
  } else if (index >= shades.length) {
    pos = shades[shades.length - 1].getBoundingClientRect().bottom - cTop;
  } else {
    const above = shades[index - 1].getBoundingClientRect();
    const below = shades[index].getBoundingClientRect();
    pos = (above.bottom + below.top) / 2 - cTop;
  }
  return { index, pos };
}

/**
 * Same as `verticalInsert`, but for the leftward (sideways) stack: counts
 * shades whose midpoint sits to the right of the pointer.
 */
function horizontalInsert(container: HTMLElement, clientX: number) {
  const shades = Array.from(container.querySelectorAll<HTMLElement>("[data-shade]"));
  const cLeft = container.getBoundingClientRect().left;
  let index = 0;
  for (const s of shades) {
    const r = s.getBoundingClientRect();
    if (r.left + r.width / 2 > clientX) index++;
  }
  let pos: number;
  if (shades.length === 0) {
    pos = 0;
  } else if (index === 0) {
    pos = shades[0].getBoundingClientRect().right - cLeft;
  } else if (index >= shades.length) {
    pos = shades[shades.length - 1].getBoundingClientRect().left - cLeft;
  } else {
    const right = shades[index - 1].getBoundingClientRect();
    const left = shades[index].getBoundingClientRect();
    pos = (right.left + left.right) / 2 - cLeft;
  }
  return { index, pos };
}

function InsertLine({ axis, pos }: { axis: "y" | "x"; pos: number }) {
  const base: CSSProperties = {
    position: "absolute",
    background: "var(--color-primary)",
    borderRadius: 2,
    pointerEvents: "none",
    zIndex: 10,
  };
  if (axis === "y") {
    return <div style={{ ...base, top: pos, left: 0, right: 0, height: 3 }} />;
  }
  return <div style={{ ...base, left: pos, top: 0, bottom: 0, width: 3 }} />;
}

export function Canvas({
  base,
  drops,
  addBase,
  addShade,
  setColour,
  removePlaced,
  toggleFlip,
  moveShade,
  captureRef,
}: Props) {
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  const baseItem = base ? getItem(base.itemId) : null;
  const width = baseItem ? frameWidth(baseItem, SCALE) : 0;
  const isRod = baseItem?.fixtureType === "rod";
  const rodGeo = isRod && baseItem ? rodFrameGeometry(baseItem, SCALE, 1) : null;

  const sel = selectedUid ? findPlaced(base, drops, selectedUid) : null;
  const selPlaced = sel?.placed ?? null;
  const selItem = selPlaced ? getItem(selPlaced.itemId) : null;
  const selIsShade = selItem?.category === "shade";
  const selSideways = !!(
    sel &&
    sel.dropIndex >= 0 &&
    rodGeo &&
    rodGeo.sockets[sel.dropIndex]?.orient !== "down"
  );
  const canFlip = !!selIsShade && !selSideways;
  const canMoveUp = !!selIsShade && !!sel && sel.index > 0;
  const canMoveDown =
    !!selIsShade && !!sel && sel.index < (drops[sel.dropIndex]?.length ?? 0) - 1;

  const clearDropTarget = () => setDropTarget(null);

  const handleHover = (drop: number, pos: number, axis: "y" | "x") => {
    setDropTarget({ drop, pos, axis });
  };

  const handleDrop = (drop: number, reorder: boolean, overIndex: number, e: DragEvent) => {
    if (reorder) {
      const uid = e.dataTransfer.getData(UID_TYPE);
      const src = findPlaced(base, drops, uid);
      let finalIndex = overIndex;
      if (src && src.dropIndex === drop && overIndex > src.index) finalIndex = overIndex - 1;
      moveShade(uid, drop, finalIndex);
    } else {
      const id = e.dataTransfer.getData("text/plain");
      if (id) {
        const item = getItem(id);
        if (item.category === "shade") addShade(id, drop);
        else addBase(id);
      }
    }
    clearDropTarget();
  };

  function dropOnCanvas(e: DragEvent) {
    e.preventDefault();
    const uid = e.dataTransfer.getData(UID_TYPE);
    if (uid) {
      moveShade(uid, 0);
      clearDropTarget();
      return;
    }
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    const item = getItem(id);
    if (item.category === "shade") addShade(id, 0);
    else addBase(id);
    clearDropTarget();
  }

  return (
    <div className="relative min-h-[400px] flex-1 lg:min-h-0">
      <main className="absolute inset-0 overflow-auto rounded-box border border-base-300 bg-base-100 p-6">
        <div className="mx-auto flex w-full max-w-[600px] flex-col items-center bg-base-100">
          {/* drop target area for the design */}
          <div
            className="flex w-full flex-col items-center"
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = isReorder(e) ? "move" : "copy";
            }}
            onDrop={dropOnCanvas}
          >
            {/* ceiling */}
            <div
              style={{
                width: "100%",
                height: 6,
                background:
                  "repeating-linear-gradient(90deg, var(--color-base-300) 0 14px, transparent 14px 20px)",
              }}
            />

            {base && baseItem ? (
              isRod && rodGeo ? (
                <div ref={captureRef} className="relative" style={{ width: rodGeo.width, height: rodGeo.height, marginTop: 10 }}>
                  {/* frame */}
                  <div className="absolute left-0 top-0">
                    <BaseBlock
                      placed={base}
                      selected={selectedUid === base.uid}
                      onSelect={() => setSelectedUid(base.uid)}
                    />
                  </div>
                  {/* shade stacks, positioned at their sockets */}
                  {drops.map((stack, i) => (
                    <RodStack
                      key={i}
                      stack={stack}
                      socket={rodGeo.sockets[i]}
                      dropIndex={i}
                      selectedUid={selectedUid}
                      onSelect={setSelectedUid}
                      onDragEnd={clearDropTarget}
                      dropTarget={dropTarget}
                      onHover={handleHover}
                      onDrop={handleDrop}
                    />
                  ))}
                </div>
              ) : (
                <div ref={captureRef} className="flex flex-col items-center" style={{ paddingTop: 10 }}>
                  <BaseBlock
                    placed={base}
                    selected={selectedUid === base.uid}
                    onSelect={() => setSelectedUid(base.uid)}
                  />
                  <div className="flex items-start" style={{ width }}>
                    {drops.map((stack, i) => (
                      <DropColumn
                        key={i}
                        stack={stack}
                        dropIndex={i}
                        selectedUid={selectedUid}
                        onSelect={setSelectedUid}
                        onDragEnd={clearDropTarget}
                        dropTarget={dropTarget}
                        onHover={handleHover}
                        onDrop={handleDrop}
                      />
                    ))}
                  </div>
                </div>
              )
            ) : (
              <div className="flex min-h-[180px] flex-col items-center justify-center text-center text-sm text-base-content/40">
                <span>Drag a fixture or pendant here to start</span>
                <span className="mt-1 text-xs">…then drop shades onto it</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* detail card — pinned bottom-right */}
      {selPlaced && sel && (
        <div className="absolute bottom-4 right-4 z-20">
          <DetailCard
            placed={selPlaced}
            canFlip={canFlip}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onColour={(name) => setColour(selPlaced.uid, name)}
            onFlip={() => toggleFlip(selPlaced.uid)}
            onMoveUp={() => moveShade(selPlaced.uid, sel.dropIndex, sel.index - 1)}
            onMoveDown={() => moveShade(selPlaced.uid, sel.dropIndex, sel.index + 1)}
            onRemove={() => {
              removePlaced(selPlaced.uid);
              setSelectedUid(null);
            }}
            onClose={() => setSelectedUid(null)}
          />
        </div>
      )}
    </div>
  );
}

function DropColumn({
  stack,
  dropIndex,
  selectedUid,
  onSelect,
  onDragEnd,
  dropTarget,
  onHover,
  onDrop,
}: {
  stack: Placed[];
  dropIndex: number;
  selectedUid: string | null;
  onSelect: (uid: string) => void;
  onDragEnd: () => void;
  dropTarget: DropTarget | null;
  onHover: (drop: number, pos: number, axis: "y" | "x") => void;
  onDrop: (drop: number, reorder: boolean, overIndex: number, e: DragEvent) => void;
}) {
  return (
    <div
      className="relative flex flex-1 flex-col items-start"
      onDragOver={(e) => {
        e.preventDefault();
        const reorder = isReorder(e);
        e.dataTransfer.dropEffect = reorder ? "move" : "copy";
        if (reorder) {
          const { pos } = verticalInsert(e.currentTarget, e.clientY);
          onHover(dropIndex, pos, "y");
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const reorder = isReorder(e);
        const index = reorder ? verticalInsert(e.currentTarget, e.clientY).index : 0;
        onDrop(dropIndex, reorder, index, e);
      }}
    >
      {stack.map((p) => (
        <PlacedShade
          key={p.uid}
          placed={p}
          selected={p.uid === selectedUid}
          onSelect={() => onSelect(p.uid)}
          onDragEnd={onDragEnd}
        />
      ))}
      {stack.length === 0 && <PlusDot />}
      {dropTarget && dropTarget.drop === dropIndex && (
        <InsertLine axis={dropTarget.axis} pos={dropTarget.pos} />
      )}
    </div>
  );
}

function PlusDot() {
  return (
    <div
      className="my-1 flex h-6 w-6 items-center justify-center self-center rounded-full border border-dashed border-base-300 text-base-content/30"
      style={{ fontSize: 14 }}
    >
      +
    </div>
  );
}

/**
 * A shade stack anchored to a rod frame's socket. Downward sockets stack
 * shades vertically; sideways sockets stack them horizontally (extending left).
 */
function RodStack({
  stack,
  socket,
  dropIndex,
  selectedUid,
  onSelect,
  onDragEnd,
  dropTarget,
  onHover,
  onDrop,
}: {
  stack: Placed[];
  socket: DropPosition;
  dropIndex: number;
  selectedUid: string | null;
  onSelect: (uid: string) => void;
  onDragEnd: () => void;
  dropTarget: DropTarget | null;
  onHover: (drop: number, pos: number, axis: "y" | "x") => void;
  onDrop: (drop: number, reorder: boolean, overIndex: number, e: DragEvent) => void;
}) {
  const sideways = socket.orient !== "down";

  const shadeProps = (p: Placed) => ({
    placed: p,
    sideways,
    selfCenter: false,
    selected: p.uid === selectedUid,
    onSelect: () => onSelect(p.uid),
    onDragEnd,
  });

  const dragHandlers = {
    onDragOver: (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const reorder = isReorder(e);
      e.dataTransfer.dropEffect = reorder ? "move" : "copy";
      if (reorder) {
        const { pos } = sideways
          ? horizontalInsert(e.currentTarget, e.clientX)
          : verticalInsert(e.currentTarget, e.clientY);
        onHover(dropIndex, pos, sideways ? "x" : "y");
      }
    },
    onDrop: (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const reorder = isReorder(e);
      const index = reorder
        ? (sideways
            ? horizontalInsert(e.currentTarget, e.clientX).index
            : verticalInsert(e.currentTarget, e.clientY).index)
        : 0;
      onDrop(dropIndex, reorder, index, e);
    },
  };

  if (sideways) {
    // horizontal stack, extending leftward from the socket
    return (
      <div
        className="absolute flex items-center"
        style={{
          left: socket.x - ROD_BULB_LEN,
          top: socket.y,
          transform: "translate(-100%, -50%)",
        }}
        {...dragHandlers}
      >
        <div className="flex flex-row-reverse items-center">
          {stack.map((p) => (
            <PlacedShade key={p.uid} {...shadeProps(p)} />
          ))}
          {stack.length === 0 && <PlusDot />}
        </div>
        {dropTarget && dropTarget.drop === dropIndex && (
          <InsertLine axis={dropTarget.axis} pos={dropTarget.pos} />
        )}
      </div>
    );
  }

  // vertical (downward) stack
  return (
    <div
      className="absolute flex flex-col items-center"
      style={{ left: socket.x, top: socket.y + ROD_BULB_LEN, transform: "translateX(-50%)" }}
      {...dragHandlers}
    >
      {stack.map((p) => (
        <PlacedShade key={p.uid} {...shadeProps(p)} />
      ))}
      {stack.length === 0 && <PlusDot />}
      {dropTarget && dropTarget.drop === dropIndex && (
        <InsertLine axis={dropTarget.axis} pos={dropTarget.pos} />
      )}
    </div>
  );
}
