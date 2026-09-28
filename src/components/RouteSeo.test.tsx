import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import RouteSeo from "./RouteSeo";

describe("RouteSeo", () => {
  it("applies the route title, canonical URL and robots directive for the current location", () => {
    render(
      <MemoryRouter initialEntries={["/checkout"]}>
        <RouteSeo />
      </MemoryRouter>,
    );
    expect(document.title).toBe("Checkout | SpryMD");
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe("https://www.sprymd.ai/checkout");
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe("noindex, nofollow");
  });

  it("marks unknown routes as not found and public routes as indexable", () => {
    render(
      <MemoryRouter initialEntries={["/nope"]}>
        <RouteSeo />
      </MemoryRouter>,
    );
    expect(document.title).toBe("Page not found | SpryMD");

    render(
      <MemoryRouter initialEntries={["/faq"]}>
        <RouteSeo />
      </MemoryRouter>,
    );
    expect(document.title).toBe("Frequently Asked Questions | SpryMD");
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
  });

  it("injects organization JSON-LD on the homepage", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <RouteSeo />
      </MemoryRouter>,
    );
    const ld = document.getElementById("seo-page-jsonld");
    expect(ld?.textContent).toMatch(/MedicalBusiness/);
    expect(ld?.textContent).toMatch(/Tennessee/);
  });
});
