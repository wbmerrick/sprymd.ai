import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AlpineAtmosphere from "./AlpineAtmosphere";

describe("AlpineAtmosphere", () => {
  it("renders the PeakMD mountain peak atmosphere image", () => {
    const { container } = render(<AlpineAtmosphere variant="hero" />);
    const img = container.querySelector("img");
    expect(img).toBeTruthy();
    expect(img?.getAttribute("alt")).toBe("");
    expect(img?.getAttribute("src") || "").toMatch(/peakmd-mountain-peak/);
  });
});
