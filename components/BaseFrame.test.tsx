import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getItem } from "@/lib/catalog";
import { BaseFrame } from "./BaseFrame";

const pxPerMm = 0.3;
const cordPx = 110;
const stemPx = 30;

describe("BaseFrame", () => {
  it("renders a cord base with a fixed 40px width", () => {
    const { container } = render(
      <BaseFrame item={getItem("fixture-accord")} hex="#000000" pxPerMm={pxPerMm} cordPx={cordPx} stemPx={stemPx} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-label", "Accord Suspension — 1800mm");
    expect(svg).toHaveAttribute("width", "40");
    expect(svg).toHaveAttribute("height", "126"); // plate 6 + cord 110 + nub 10
  });

  it("renders a bar base scaled by its length", () => {
    const { container } = render(
      <BaseFrame item={getItem("fixture-linear-1200")} hex="#000000" pxPerMm={pxPerMm} cordPx={cordPx} stemPx={stemPx} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "360"); // 1200mm × 0.3
    expect(svg).toHaveAttribute("height", "138"); // plate 6 + gap 6 + bar 6 + cord 110 + nub 10
  });

  it("renders a rod frame at its full geometry", () => {
    const { container } = render(
      <BaseFrame item={getItem("pendant-levia-a")} hex="#000000" pxPerMm={pxPerMm} cordPx={cordPx} stemPx={stemPx} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "366");
    expect(svg).toHaveAttribute("height", "219");
  });

  it("scales a rod frame down to fit a target height", () => {
    const { container } = render(
      <BaseFrame
        item={getItem("pendant-levia-a")}
        hex="#000000"
        pxPerMm={pxPerMm}
        cordPx={cordPx}
        stemPx={stemPx}
        fitHeight={64}
      />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("height", "64");
    expect(svg).toHaveAttribute("width", "107"); // 366 × 64/219
  });
});
