import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { StaffInboxPanel } from "@/components/dashboard/pro/StaffInboxPanel";
import * as messaging from "@/lib/messaging";
import * as masterAccount from "@/lib/masterAccount";

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
    vi.mocked(messaging.isStaffSession).mockResolvedValue(true);
    vi.mocked(messaging.listStaffInbox).mockResolvedValue([]);
    vi.mocked(masterAccount.isClinicianEmail).mockReturnValue(true);
  });

  it("renders empty staff inbox state", async () => {
    render(<StaffInboxPanel userEmail="wbmerrick@gmail.com" />);
    expect(await screen.findByText(/Patient Messaging Inbox/i)).toBeInTheDocument();
    // Empty copy only mounts after load() finishes (loading=false).
    expect(
      await screen.findByText(/No open patient threads yet/i, {}, { timeout: 3000 }),
    ).toBeInTheDocument();
  });
});
