import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import Planner from "./Planner";

beforeEach(() => {
  window.localStorage.clear();
});

describe("Planner", () => {
  it("renders the header, canvas and tally", () => {
    render(<Planner />);
    expect(screen.getByText("Cambio Pendant Planner")).toBeInTheDocument();
    expect(screen.getByText("Cost Tally")).toBeInTheDocument();
    expect(screen.getByText("Drag a fixture or pendant here to start")).toBeInTheDocument();
  });

  it("adds a fixture to the canvas when its card is clicked", () => {
    render(<Planner />);
    fireEvent.click(screen.getByText("Cambio Ceiling"));
    expect(screen.queryByText("Drag a fixture or pendant here to start")).not.toBeInTheDocument();
    expect(screen.getAllByLabelText("Cambio Ceiling").length).toBeGreaterThan(0);
  });
});
