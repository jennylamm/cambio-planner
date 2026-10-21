import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Placed } from "@/lib/useDesign";
import { Canvas } from "./Canvas";

function renderCanvas(base: Placed | null, drops: Placed[][]) {
  const captureRef = { current: null as HTMLDivElement | null };
  const zoomRef = { current: null as HTMLDivElement | null };
  return render(
    <Canvas
      base={base}
      drops={drops}
      addBase={vi.fn()}
      addShade={vi.fn()}
      setColour={vi.fn()}
      removePlaced={vi.fn()}
      toggleFlip={vi.fn()}
      moveShade={vi.fn()}
      captureRef={captureRef}
      zoomRef={zoomRef}
    />,
  );
}

describe("Canvas", () => {
  it("shows a prompt when no base is selected", () => {
    renderCanvas(null, []);
    expect(screen.getByText("Drag a fixture or pendant here to start")).toBeInTheDocument();
  });

  it("renders the rod frame when a pendant is selected", () => {
    const base = { uid: "b1", itemId: "pendant-levia-a", colourName: "Black" };
    renderCanvas(base, [[], [], []]);
    expect(screen.getByLabelText("Levia A Pendant")).toBeInTheDocument();
  });

  it("renders a shade placed on a rod socket", () => {
    const base = { uid: "b1", itemId: "pendant-levia-a", colourName: "Black" };
    const shade = { uid: "s1", itemId: "shade-a", colourName: "Black" };
    renderCanvas(base, [[shade], [], []]);
    expect(screen.getAllByLabelText("Cambio Shade A")).toHaveLength(1);
  });
});
