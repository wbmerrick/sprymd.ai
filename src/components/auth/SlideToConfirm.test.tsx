import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SlideToConfirm, { COMPLETE_RATIO } from "./SlideToConfirm";

describe("SlideToConfirm", () => {
  it("renders the slide label and stays idle until dragged far enough", () => {
    const onConfirm = vi.fn();
    render(<SlideToConfirm label="Slide to sign in" onConfirm={onConfirm} />);

    expect(screen.getByText("Slide to sign in")).toBeInTheDocument();
    const slider = screen.getByRole("slider", { name: "Slide to sign in" });
    expect(slider).toHaveAttribute("aria-valuenow", "0");
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("fires onConfirm when keyboard completes the slide", () => {
    const onConfirm = vi.fn();
    render(<SlideToConfirm label="Slide to sign in" onConfirm={onConfirm} />);

    const slider = screen.getByRole("slider", { name: "Slide to sign in" });
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("does not fire when disabled", () => {
    const onConfirm = vi.fn();
    render(<SlideToConfirm label="Slide to sign in" onConfirm={onConfirm} disabled />);

    const slider = screen.getByRole("slider", { name: "Slide to sign in" });
    fireEvent.keyDown(slider, { key: "Enter" });
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("shows loading label while loading", () => {
    render(
      <SlideToConfirm
        label="Slide to sign in"
        loadingLabel="Signing in…"
        loading
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText("Signing in…")).toBeInTheDocument();
  });

  it("exports a completion ratio under 1 so a full drag is required", () => {
    expect(COMPLETE_RATIO).toBeGreaterThan(0.8);
    expect(COMPLETE_RATIO).toBeLessThan(1);
  });
});
