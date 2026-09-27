import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { StaffInboxPanel } from "@/components/dashboard/pro/StaffInboxPanel";

vi.mock("@/lib/messaging", () => ({
  isStaffSession: vi.fn(async () => true),
  listStaffInbox: vi.fn(async () => []),
  getThreadMessages: vi.fn(async () => []),
  markThreadRead: vi.fn(async () => undefined),
  replyToThread: vi.fn(async () => ({ ok: true })),
  ensureProviderRow: vi.fn(async () => null),
}));

vi.mock("@/lib/masterAccount", () => ({
  isClinicianEmail: vi.fn(() => true),
}));

describe("StaffInboxPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty staff inbox state", async () => {
    render(<StaffInboxPanel userEmail="wbmerrick@gmail.com" />);
    expect(await screen.findByText(/Patient Messaging Inbox/i)).toBeInTheDocument();
    expect(await screen.findByText(/No open patient threads yet/i)).toBeInTheDocument();
  });
});
