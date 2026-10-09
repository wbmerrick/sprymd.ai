import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { StaffInboxPanel } from "@/components/dashboard/pro/StaffInboxPanel";
import * as messaging from "@/lib/messaging";
import * as masterAccount from "@/lib/masterAccount";

vi.mock("@/lib/messaging", () => ({
  isStaffSession: vi.fn(async () => true),
  listStaffInbox: vi.fn(async () => []),
  listPatientContacts: vi.fn(async () => [
    {
      id: "pat-1",
      email: "jane@example.com",
      fullName: "Jane Doe",
      phone: "615-555-0100",
      state: "TN",
      createdAt: "2026-01-01T00:00:00Z",
      openThreadCount: 0,
    },
  ]),
  getThreadMessages: vi.fn(async () => []),
  markThreadRead: vi.fn(async () => undefined),
  replyToThread: vi.fn(async () => ({ ok: true })),
  createStaffOutboundThread: vi.fn(async () => ({ ok: true, threadId: "thr-1" })),
  ensureProviderRow: vi.fn(async () => null),
  urgencyLabel: (u: string) => (u === "soon" ? "Soon" : u === "urgent" ? "Urgent" : "Routine"),
  MESSAGE_URGENCY_OPTIONS: [
    { value: "routine", label: "Routine", description: "", responseTarget: "24h" },
    { value: "soon", label: "Soon", description: "", responseTarget: "same day" },
    { value: "urgent", label: "Urgent", description: "", responseTarget: "asap" },
  ],
}));

vi.mock("@/lib/masterAccount", () => ({
  isClinicianEmail: vi.fn(() => true),
}));

describe("StaffInboxPanel", () => {
  beforeEach(() => {
    vi.mocked(messaging.isStaffSession).mockResolvedValue(true);
    vi.mocked(messaging.listStaffInbox).mockResolvedValue([]);
    vi.mocked(messaging.listPatientContacts).mockResolvedValue([
      {
        id: "pat-1",
        email: "jane@example.com",
        fullName: "Jane Doe",
        phone: "615-555-0100",
        state: "TN",
        createdAt: "2026-01-01T00:00:00Z",
        openThreadCount: 0,
      },
    ]);
    vi.mocked(masterAccount.isClinicianEmail).mockReturnValue(true);
  });

  it("renders empty staff inbox state with All contacts CTA", async () => {
    render(<StaffInboxPanel userEmail="wbmerrick@gmail.com" />);
    expect(await screen.findByText(/Patient Messaging Inbox/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/No open patient threads yet/i, {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /All contacts/i }).length).toBeGreaterThan(0);
  });

  it("opens All contacts and lets staff select a patient to message", async () => {
    render(<StaffInboxPanel userEmail="wbmerrick@gmail.com" initialView="contacts" />);
    expect(await screen.findByText(/All contacts/i)).toBeInTheDocument();
    expect(await screen.findByText("Jane Doe")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("option", { name: /Jane Doe/i }));
    expect(await screen.findByText(/Message patient/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Relay information/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/Relay information/i), {
      target: { value: "Your refill ships tomorrow." },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send to patient/i }));

    await waitFor(() => {
      expect(messaging.createStaffOutboundThread).toHaveBeenCalledWith(
        expect.objectContaining({
          patientId: "pat-1",
          body: "Your refill ships tomorrow.",
        }),
      );
    });
  });

  it("keeps inbox threads selectable", async () => {
    vi.mocked(messaging.listStaffInbox).mockResolvedValue([
      {
        id: "thr-1",
        subject: "Refill question",
        preview: "Can I refill?",
        updatedAt: "2026-01-02T00:00:00Z",
        status: "action_required",
        urgency: "soon",
        patientId: "pat-1",
        patientEmail: "jane@example.com",
        patientName: "Jane Doe",
        staffUnread: true,
        patientUnread: false,
        dbStatus: "awaiting_staff",
      },
    ]);
    render(<StaffInboxPanel userEmail="wbmerrick@gmail.com" />);
    const option = await screen.findByRole("option", { name: /Refill question/i });
    fireEvent.click(option);
    expect(option).toHaveAttribute("aria-selected", "true");
    expect(await screen.findByPlaceholderText(/Reply to patient/i)).toBeInTheDocument();
  });
});
