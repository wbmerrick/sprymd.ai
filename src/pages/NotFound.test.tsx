import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import NotFound from "./NotFound";

describe("NotFound", () => {
  it("renders a single H1, the missing path, recovery links and a noindex head", () => {
    render(
      <MemoryRouter initialEntries={["/old-page"]}>
        <NotFound />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Page not found");
    expect(screen.getByText("/old-page")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Start your visit" })).toHaveAttribute("href", "/#landing-conditions");
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
    expect(document.title).toBe("Page not found | SpryMD");
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute("content")).toBe("noindex, nofollow");
  });
});
