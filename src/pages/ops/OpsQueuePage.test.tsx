import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OpsQueuePage from "./OpsQueuePage";
import type { OpsOutletContext } from "./OpsLayout";

const outlet: OpsOutletContext = {
  accessToken: "test-token",
  email: "wbmerrick@gmail.com",
  demo: false,
  providerId: null,
};

function OpsShell() {
  return <Outlet context={outlet} />;
}

function renderQueue(search = "?view=todo") {
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
            providerId: null,
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
  it("renders the staff queue with patient rows and start CTA", async () => {
    renderQueue();

    expect(screen.getByRole("heading", { name: /patient queue/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Alex Patient")).toBeInTheDocument();
    });

    expect(screen.getByText(/patient@example.com · TN/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /claim & start/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /details/i })).toHaveAttribute(
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
    expect(screen.getByRole("link", { name: /preview with demo data/i })).toHaveAttribute(
      "href",
      "/ops?demo=1",
    );
  });

  it("loads demo fixtures without calling the API", async () => {
    const demoOutlet: OpsOutletContext = {
      ...outlet,
      accessToken: "demo",
      demo: true,
      providerId: "11111111-1111-4111-8111-111111111111",
    };

    function DemoShell() {
      return <Outlet context={demoOutlet} />;
    }

    render(
      <MemoryRouter initialEntries={["/ops?demo=1&view=todo"]}>
        <Routes>
          <Route path="/ops" element={<DemoShell />}>
            <Route index element={<OpsQueuePage />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Jordan Demo")).toBeInTheDocument();
    });
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByText(/demo mode/i)).toBeInTheDocument();
  });
});
