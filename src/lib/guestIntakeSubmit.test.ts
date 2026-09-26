import { describe, expect, it, vi, afterEach } from "vitest";
import { saveGuestIntakeDraft } from "./guestIntakeSubmit";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("saveGuestIntakeDraft", () => {
  it("posts appointment + session and reports database location", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({
        ok: true,
        message: "Intake saved to the chart for your clinician.",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await saveGuestIntakeDraft(
      {
        id: "11111111-1111-4111-8111-111111111111",
        appointmentId: "22222222-2222-4222-8222-222222222222",
        answers: {
          chief_complaints: ["ed"],
          chief_complaint_detail: "ED for 6 months",
          allergy_status: "none",
        },
        status: "submitted",
        updatedAt: new Date().toISOString(),
      },
      "cs_live_test_session",
    );

    expect(result.location).toBe("database");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/intake/guest",
      expect.objectContaining({
        method: "POST",
      }),
    );
    const body = JSON.parse(
      (fetchMock.mock.calls[0][1] as RequestInit).body as string,
    );
    expect(body.sessionId).toBe("cs_live_test_session");
    expect(body.appointmentId).toBe("22222222-2222-4222-8222-222222222222");
    expect(body.chiefComplaints).toEqual(["ed"]);
  });

  it("stays on device when session id is missing", async () => {
    const result = await saveGuestIntakeDraft(
      {
        id: "d1",
        appointmentId: "22222222-2222-4222-8222-222222222222",
        answers: {},
        status: "draft",
        updatedAt: new Date().toISOString(),
      },
      "",
    );
    expect(result.location).toBe("device");
    expect(result.message).toMatch(/missing stripe session/i);
  });
});
