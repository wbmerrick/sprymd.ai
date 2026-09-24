import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import OpsAppointmentPage from "./OpsAppointmentPage";
import type { OpsOutletContext } from "./OpsLayout";

const APPT_ID = "22222222-2222-4222-8222-222222222222";

const outlet: OpsOutletContext = {
  accessToken: "test-token",
  email: "wbmerrick@gmail.com",
};

function OpsShell() {
  return <Outlet context={outlet} />;
}

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={[`/ops/${APPT_ID}`]}>
      <Routes>
        <Route path="/ops" element={<OpsShell />}>
          <Route path=":appointmentId" element={<OpsAppointmentPage />} />
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
        appointment: {
          id: APPT_ID,
          status: "paid",
          serviceTier: "protocol",
          amountCents: 9900,
          currency: "usd",
          paidAt: "2026-09-24T12:00:00Z",
          createdAt: "2026-09-24T11:00:00Z",
          updatedAt: "2026-09-24T12:00:00Z",
          providerId: null,
          stripeCheckoutSessionId: "cs_test_123",
          patient: {
            id: "p1",
            email: "casey@example.com",
            fullName: "Casey Patient",
            phone: "6155550100",
            state: "TN",
            dateOfBirth: "1990-01-15",
          },
        },
        payments: [
          {
            id: "pay1",
            event_type: "checkout.session.completed",
            status: "paid",
            amount_cents: 9900,
            created_at: "2026-09-24T12:00:00Z",
          },
        ],
        intakes: [
          {
            id: "in1",
            status: "submitted",
            summary: "Erectile dysfunction for 6 months",
            updatedAt: "2026-09-24T10:00:00Z",
          },
        ],
      }),
    ),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("OpsAppointmentPage", () => {
  it("shows guided next steps and deep links for a paid case", async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /casey patient/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/assign yourself, then start/i)).toBeInTheDocument();
    const visitLinks = screen.getAllByRole("link", { name: /visit room/i });
    expect(visitLinks[0]).toHaveAttribute("href", `/visit/${APPT_ID}`);
    const soapLinks = screen.getAllByRole("link", { name: /soap note/i });
    expect(soapLinks[0]).toHaveAttribute(
      "href",
      `/provider/notes?appointmentId=${encodeURIComponent(APPT_ID)}`,
    );
    expect(screen.getByText(/erectile dysfunction for 6 months/i)).toBeInTheDocument();
    expect(screen.getByText("checkout.session.completed")).toBeInTheDocument();
  });
});
