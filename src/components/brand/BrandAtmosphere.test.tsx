import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BrandAtmosphere from "./BrandAtmosphere";

describe("BrandAtmosphere", () => {
  it("renders the requested catalog plate", () => {
    const { container } = render(<BrandAtmosphere plate="care" variant="panel" />);
    const root = container.querySelector("[data-brand-plate='care']");
    const img = container.querySelector("img");
    expect(root).toBeTruthy();
    expect(img?.getAttribute("src") || "").toMatch(/sprymd-care-dawn/);
  });
});
