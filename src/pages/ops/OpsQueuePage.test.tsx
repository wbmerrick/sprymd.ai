import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OpsQueuePage from "./OpsQueuePage";
import type { OpsOutletContext } from "./OpsLayout";

const outlet: OpsOutletContext = {
  accessToken: "test-token",
  email: "wbmerrick@gmail.com",
};

function OpsShell() {
  return <Outlet context={outlet} />;
}

function renderQueue(search = "") {
  return render(
    <MemoryRouter initialEntries={[`/ops${search}`]}>
      <Routes>
        <Route path="/ops" element={<OpsShell />}>
          <Route index element={<OpsQueuePage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      Response.json({
        items: [
          {
            id: "11111111-1111-4111-8111-111111111111",
            status: "paid",
            serviceTier: "protocol",
            amountCents: 7900,
            currency: "usd",
            paidAt: "2026-09-24T12:00:00Z",
            createdAt: "2026-09-24T11:00:00Z",
            patient: {
              id: "p1",
              email: "patient@example.com",
              fullName: "Alex Patient",
              state: "TN",
            },
          },
        ],
        staff: { email: outlet.email, providerId: null },
      }),
    ),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("OpsQueuePage", () => {
  it("renders the staff queue with patient rows", async () => {
    renderQueue();

    expect(screen.getByRole("heading", { name: /cases & orders/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Alex Patient")).toBeInTheDocument();
    });

    expect(screen.getByText("patient@example.com · TN")).toBeInTheDocument();
    expect(screen.getByText("$79.00")).toBeInTheDocument();
    expect(screen.getByText("protocol")).toBeInTheDocument();

    const link = screen.getByRole("link", { name: /alex patient/i });
    expect(link).toHaveAttribute(
      "href",
      "/ops/11111111-1111-4111-8111-111111111111",
    );

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/ops/queue?"),
      expect.objectContaining({
        headers: { Authorization: "Bearer test-token" },
      }),
    );
  });

  it("shows staff_required guidance when the API rejects non-staff", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({ error: "staff_required" }, { status: 403 }),
      ),
    );

    renderQueue();

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/staff_required/i);
    });
    expect(screen.getByRole("alert")).toHaveTextContent(/OPS_STAFF_EMAILS/i);
  });
});
