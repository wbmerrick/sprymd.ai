import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import OpsAppointmentPage from "./OpsAppointmentPage";
import type { OpsOutletContext } from "./OpsLayout";

const APPT_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

const outlet: OpsOutletContext = {
  accessToken: "demo",
  email: "demo@ops.local",
  demo: true,
  providerId: "11111111-1111-4111-8111-111111111111",
};

function OpsShell() {
  return <Outlet context={outlet} />;
}

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={[`/ops/${APPT_ID}?demo=1`]}>
      <Routes>
        <Route path="/ops" element={<OpsShell />}>
          <Route path=":appointmentId" element={<OpsAppointmentPage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("OpsAppointmentPage", () => {
  it("shows checklist and claim & start for an unpaid-assigned paid demo case", async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /jordan demo/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/claim this case, then start/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /claim & start visit/i })).toBeInTheDocument();
    expect(screen.getByText(/visit checklist/i)).toBeInTheDocument();
    expect(screen.getByText(/erectile dysfunction for ~8 months/i)).toBeInTheDocument();
    expect(screen.getByText(/age 38|age \d+/i)).toBeInTheDocument();
  });
});
