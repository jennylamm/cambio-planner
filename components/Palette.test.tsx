import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Palette } from "./Palette";

function setMatchMedia(matches: boolean) {
  window.matchMedia = ((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => setMatchMedia(false));

describe("Palette", () => {
  it("renders the three sections", () => {
    render(<Palette onAdd={() => {}} />);
    expect(screen.getByText("Fixtures")).toBeInTheDocument();
    expect(screen.getByText("Pendants")).toBeInTheDocument();
    expect(screen.getByText("Shades")).toBeInTheDocument();
  });

  it("renders fixture, pendant and shade cards", () => {
    render(<Palette onAdd={() => {}} />);
    expect(screen.getByText("Levia A Pendant")).toBeInTheDocument();
    expect(screen.getByText("Levia B Pendant")).toBeInTheDocument();
    expect(screen.getByText("Cambio Shade A")).toBeInTheDocument();
  });

  it("does not include the removed Belki range", () => {
    render(<Palette onAdd={() => {}} />);
    expect(screen.queryByText(/Belki/)).not.toBeInTheDocument();
  });

  it("collapses sections by default on mobile", () => {
    setMatchMedia(false);
    render(<Palette onAdd={() => {}} />);
    const boxes = Array.from(document.querySelectorAll<HTMLInputElement>("input[type=checkbox]"));
    expect(boxes).toHaveLength(3);
    expect(boxes.every((b) => !b.checked)).toBe(true);
  });

  it("keeps sections open on desktop", () => {
    setMatchMedia(true);
    render(<Palette onAdd={() => {}} />);
    const boxes = Array.from(document.querySelectorAll<HTMLInputElement>("input[type=checkbox]"));
    expect(boxes).toHaveLength(3);
    expect(boxes.every((b) => b.checked)).toBe(true);
  });

  it("calls onAdd with the item id when a card is clicked", () => {
    const onAdd = vi.fn();
    render(<Palette onAdd={onAdd} />);
    fireEvent.click(screen.getByText("Cambio Shade A"));
    expect(onAdd).toHaveBeenCalledWith("shade-a");
  });
});
