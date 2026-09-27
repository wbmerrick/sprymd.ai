import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
// @ts-ignore — JSX marketing app
import SpryApp from "./SpryApp.jsx";
import { careEduPages } from "./data/careEduPages";
import { metaForPath, NOT_FOUND_META } from "./seo/routes";

describe("/care/:slug unknown slug 404", () => {
  it("known edu slug is still a real care page key", () => {
    expect(careEduPages.ed).toBeTruthy();
  });

  it("metaForPath treats unknown /care/* as not-found (noindex)", () => {
    expect(metaForPath("/care/not-real")).toBe(NOT_FOUND_META);
    expect(metaForPath("/care/ed").indexable).toBe(true);
  });

  it("renders NotFound for an unknown care slug instead of the homepage", async () => {
    render(
      <MemoryRouter initialEntries={["/care/not-real"]}>
        <Routes>
          <Route path="/care/:slug" element={<SpryApp />} />
          <Route path="/" element={<SpryApp />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(
      () => {
        expect(screen.getByRole("heading", { name: /page not found/i })).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    expect(screen.getByText(/404/i)).toBeInTheDocument();
    expect(screen.queryByText(/Telehealth, built for Tennessee/i)).not.toBeInTheDocument();
  });
});
