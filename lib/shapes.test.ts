import { describe, expect, it } from "vitest";
import { getItem, type Item } from "./catalog";
import {
  frameWidth,
  rodBodyTop,
  rodFrameGeometry,
  shadePath,
  shift,
} from "./shapes";

function base(overrides: Partial<Item>): Item {
  return {
    id: "test",
    category: "fixture",
    name: "Test",
    colours: [],
    sourceUrl: "",
    ...overrides,
  };
}

describe("shift", () => {
  it("returns the same colour at amt 0", () => {
    expect(shift("#000000", 0)).toBe("#000000");
    expect(shift("#ffffff", 0)).toBe("#ffffff");
  });

  it("lightens toward white for amt > 0", () => {
    expect(shift("#000000", 1)).toBe("#ffffff");
    expect(shift("#000000", 0.5)).toBe("#808080");
  });

  it("darkens toward black for amt < 0", () => {
    expect(shift("#ffffff", -1)).toBe("#000000");
    expect(shift("#808080", -0.5)).toBe("#404040");
  });

  it("expands 3-digit hex and clamps to [0,255]", () => {
    expect(shift("#f00", 0.5)).toBe("#ff8080");
    expect(shift("#ffffff", 1)).toBe("#ffffff"); // already white, no overflow
    expect(shift("#000000", -1)).toBe("#000000"); // already black, no underflow
  });
});

describe("frameWidth", () => {
  it("returns a fixed 40px for cord and flush", () => {
    expect(frameWidth(getItem("fixture-accord"), 0.3)).toBe(40);
    expect(frameWidth(getItem("fixture-ceiling"), 0.3)).toBe(40);
  });

  it("scales bar/dome/rod by lengthMm (min 36px)", () => {
    expect(frameWidth(getItem("fixture-linear-1200"), 0.3)).toBe(360);
    expect(frameWidth(getItem("pendant-levia-a"), 0.3)).toBe(318);
    expect(frameWidth(base({ fixtureType: "dome", lengthMm: 370 }), 0.3)).toBe(111);
    expect(frameWidth(base({ fixtureType: "bar", lengthMm: 50 }), 0.3)).toBe(36);
  });
});

describe("rodBodyTop", () => {
  it("is (canopy + gap + cable) scaled by k", () => {
    expect(rodBodyTop(1)).toBe(40);
    expect(rodBodyTop(0.6)).toBe(24);
  });
});

describe("rodFrameGeometry", () => {
  it("resolves Levia A sockets, legs and auto canopies", () => {
    const geo = rodFrameGeometry(getItem("pendant-levia-a"), 0.3, 1);
    expect(geo.width).toBe(366);
    expect(geo.height).toBe(219);
    expect(geo.bodyTop).toBe(40);
    expect(geo.rodLeft).toBe(24);
    expect(geo.rodRight).toBe(342);

    expect(geo.sockets).toEqual([
      { x: 24, y: 40, orient: "left" },
      { x: 54, y: 130, orient: "down" },
      { x: 248, y: 100, orient: "down" },
    ]);
    expect(geo.legs).toEqual([{ x: 188, y: 199 }]);
    // auto: canopy above the first down socket and each leg
    expect(geo.canopyX).toEqual([54, 188]);
  });

  it("uses explicit canopyXmm for Levia B and keeps the right socket", () => {
    const geo = rodFrameGeometry(getItem("pendant-levia-b"), 0.3, 1);
    expect(geo.width).toBe(441);
    expect(geo.height).toBe(264);

    const right = geo.sockets[2];
    expect(right).toEqual({ x: 417, y: 40, orient: "right" });
    expect(geo.canopyX).toEqual([69, 309]);
  });
});

describe("shadePath", () => {
  it("draws a cylinder as a rectangle", () => {
    expect(shadePath("cylinder", 100, 50, 6)).toBe("M 0 0 L 100 0 L 100 50 L 0 50 Z");
  });

  it("draws a cone as a frustum between the top hole and the rim", () => {
    expect(shadePath("cone", 100, 50, 6)).toBe("M 44 0 L 0 50 L 100 50 L 56 0 Z");
  });

  it("draws a dome as a half-ellipse", () => {
    expect(shadePath("dome", 100, 50, 6)).toBe("M 0 50 A 50 50 0 0 1 100 50 Z");
  });

  it("falls back to dome for unknown profiles", () => {
    expect(shadePath("unknown" as never, 100, 50, 6)).toBe("M 0 50 A 50 50 0 0 1 100 50 Z");
  });
});
