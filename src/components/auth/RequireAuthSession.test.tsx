import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RequireAuthSession from "./RequireAuthSession";

const resolveClinicalAuthSession = vi.fn();

vi.mock("@/lib/clinicalSession", () => ({
  resolveClinicalAuthSession: (...args: unknown[]) =>
    resolveClinicalAuthSession(...args),
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/"
          element={<div data-testid="home-auth">Sign-in home</div>}
        />
        <Route element={<RequireAuthSession />}>
          <Route
            path="/provider/notes"
            element={<h1>SOAP note</h1>}
          />
          <Route
            path="/visit/:appointmentId"
            element={<p>SpryMD visit</p>}
          />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("RequireAuthSession", () => {
  beforeEach(() => {
    resolveClinicalAuthSession.mockReset();
  });

  it("redirects anonymous visitors away from /provider/notes", async () => {
    resolveClinicalAuthSession.mockResolvedValue(null);
    renderAt("/provider/notes");

    await waitFor(() => {
      expect(screen.getByTestId("home-auth")).toBeInTheDocument();
    });
    expect(screen.queryByRole("heading", { name: /soap note/i })).not.toBeInTheDocument();
  });

  it("redirects anonymous visitors away from /visit/upcoming", async () => {
    resolveClinicalAuthSession.mockResolvedValue(null);
    renderAt("/visit/upcoming");

    await waitFor(() => {
      expect(screen.getByTestId("home-auth")).toBeInTheDocument();
    });
    expect(screen.queryByText(/sprymd visit/i)).not.toBeInTheDocument();
  });

  it("allows a signed-in session through to provider notes", async () => {
    resolveClinicalAuthSession.mockResolvedValue({
      email: "clinician@sprymd.ai",
      userId: "u-staff",
    });
    renderAt("/provider/notes?appointmentId=appt-1");

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /soap note/i })).toBeInTheDocument();
    });
    expect(resolveClinicalAuthSession).toHaveBeenCalled();
  });

  it("allows a signed-in session through to the visit room", async () => {
    resolveClinicalAuthSession.mockResolvedValue({
      email: "patient@example.com",
      userId: "u-patient",
    });
    renderAt("/visit/appt-9");

    await waitFor(() => {
      expect(screen.getByText(/sprymd visit/i)).toBeInTheDocument();
    });
  });

  it("allows ?demo=1 without a live session (ops dress rehearsal)", async () => {
    resolveClinicalAuthSession.mockResolvedValue(null);
    renderAt("/visit/upcoming?demo=1&role=provider");

    await waitFor(() => {
      expect(screen.getByText(/sprymd visit/i)).toBeInTheDocument();
    });
    expect(resolveClinicalAuthSession).not.toHaveBeenCalled();
  });

  it("allows ?demo=1 on provider notes", async () => {
    resolveClinicalAuthSession.mockResolvedValue(null);
    renderAt("/provider/notes?demo=1&appointmentId=demo-appt");

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /soap note/i })).toBeInTheDocument();
    });
  });
});
