import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getItem } from "@/lib/catalog";
import { ShadeSvg } from "./ShadeSvg";

const shadeA = getItem("shade-a"); // cylinder Ø100 × H75mm

describe("ShadeSvg", () => {
  it("renders a vertical shade at the scaled size", () => {
    const { container } = render(<ShadeSvg item={shadeA} hex="#000000" pxPerMm={0.3} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "30");
    expect(svg).toHaveAttribute("height", "23");
  });

  it("draws the profile path inside the viewBox", () => {
    const { container } = render(<ShadeSvg item={shadeA} hex="#000000" pxPerMm={0.3} />);
    const path = container.querySelector("path");
    expect(path).toHaveAttribute("d", "M 0 0 L 30 0 L 30 23 L 0 23 Z");
  });

  it("swaps dimensions and applies a rotation matrix when sideways", () => {
    const { container } = render(<ShadeSvg item={shadeA} hex="#000000" pxPerMm={0.3} sideways />);
    const svg = container.querySelector("svg");
    const g = container.querySelector("g");
    expect(svg).toHaveAttribute("width", "23");
    expect(svg).toHaveAttribute("height", "30");
    expect(g).toHaveAttribute("transform", "matrix(0 1 -1 0 23 0)");
  });

  it("mirrors a sideways shade so the opening faces left", () => {
    const { container } = render(
      <ShadeSvg item={shadeA} hex="#000000" pxPerMm={0.3} sideways mirror />,
    );
    expect(container.querySelector("g")).toHaveAttribute("transform", "matrix(0 1 1 0 0 0)");
  });

  it("rotates 180° when flipped", () => {
    const { container } = render(<ShadeSvg item={shadeA} hex="#000000" pxPerMm={0.3} flipped />);
    expect(container.querySelector("svg")!.style.transform).toBe("rotate(180deg)");
  });
});
