import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useDesign } from "./useDesign";

beforeEach(() => {
  window.localStorage.clear();
});

describe("useDesign", () => {
  it("adds a base with the right number of empty drops", () => {
    const { result } = renderHook(() => useDesign());
    act(() => result.current.addBase("fixture-linear-1200"));
    expect(result.current.base?.itemId).toBe("fixture-linear-1200");
    expect(result.current.drops).toEqual([[], [], []]);
  });

  it("adds a shade to a specific drop", () => {
    const { result } = renderHook(() => useDesign());
    act(() => result.current.addBase("fixture-linear-1200"));
    act(() => result.current.addShade("shade-a", 1));
    expect(result.current.drops[1]).toHaveLength(1);
    expect(result.current.drops[1][0].itemId).toBe("shade-a");
    expect(result.current.drops[0]).toHaveLength(0);
  });

  it("moves a shade between drops", () => {
    const { result } = renderHook(() => useDesign());
    act(() => result.current.addBase("fixture-linear-1200"));
    act(() => result.current.addShade("shade-a", 0));
    const uid = result.current.drops[0][0].uid;
    act(() => result.current.moveShade(uid, 2));
    expect(result.current.drops[0]).toHaveLength(0);
    expect(result.current.drops[2][0].uid).toBe(uid);
  });

  it("reorders within a stack via an explicit index", () => {
    const { result } = renderHook(() => useDesign());
    act(() => result.current.addBase("fixture-linear-1200"));
    act(() => result.current.addShade("shade-a", 0));
    act(() => result.current.addShade("shade-b", 0));
    const [first, second] = result.current.drops[0];
    act(() => result.current.moveShade(first.uid, 0, 1));
    expect(result.current.drops[0].map((p) => p.uid)).toEqual([second.uid, first.uid]);
  });

  it("removes a shade and, separately, the base", () => {
    const { result } = renderHook(() => useDesign());
    act(() => result.current.addBase("fixture-accord"));
    act(() => result.current.addShade("shade-a", 0));
    const uid = result.current.drops[0][0].uid;
    act(() => result.current.removePlaced(uid));
    expect(result.current.drops[0]).toHaveLength(0);

    act(() => result.current.removePlaced(result.current.base!.uid));
    expect(result.current.base).toBeNull();
    expect(result.current.drops).toEqual([]);
  });

  it("toggles a shade's flipped flag", () => {
    const { result } = renderHook(() => useDesign());
    act(() => result.current.addBase("fixture-accord"));
    act(() => result.current.addShade("shade-a", 0));
    const uid = result.current.drops[0][0].uid;
    act(() => result.current.toggleFlip(uid));
    expect(result.current.drops[0][0].flipped).toBe(true);
    act(() => result.current.toggleFlip(uid));
    expect(result.current.drops[0][0].flipped).toBe(false);
  });

  it("changes a colour by uid", () => {
    const { result } = renderHook(() => useDesign());
    act(() => result.current.addBase("fixture-accord"));
    act(() => result.current.addShade("shade-a", 0));
    const uid = result.current.drops[0][0].uid;
    act(() => result.current.setColour(uid, "Yellow"));
    expect(result.current.drops[0][0].colourName).toBe("Yellow");
  });

  it("computes the tally lines and total", () => {
    const { result } = renderHook(() => useDesign());
    act(() => result.current.addBase("fixture-accord")); // Black $58.50
    act(() => result.current.addShade("shade-a", 0)); // Black $17.60
    expect(result.current.lines).toHaveLength(2);
    expect(result.current.totalSale).toBeCloseTo(76.1);
    expect(result.current.totalRrp).toBeCloseTo(65.0 + 44.0);
  });

  it("clears the design", () => {
    const { result } = renderHook(() => useDesign());
    act(() => result.current.addBase("fixture-accord"));
    act(() => result.current.clear());
    expect(result.current.base).toBeNull();
    expect(result.current.drops).toEqual([]);
  });
});
