import { afterEach, describe, expect, it, vi } from "vitest";
import { ensureAkutePatient } from "./patients";

describe("ensureAkutePatient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("creates exactly one Akute patient per external_id (patients.id)", async () => {
    process.env.AKUTE_API_KEY = "test-key";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    // First call: search — empty
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: async () => "[]",
    });
    // Second: create
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ id: "akute_p1" }),
    });

    const a = await ensureAkutePatient({
      externalId: "supa-patient-1",
      firstName: "Sam",
      lastName: "Patient",
      dateOfBirth: "1990-01-01",
      email: "sam@example.com",
    });
    expect(a.created).toBe(true);
    expect(a.akutePatientId).toBe("akute_p1");

    // Second ensure: search returns existing
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: async () =>
        JSON.stringify([{ id: "akute_p1", external_id: "supa-patient-1" }]),
    });

    const b = await ensureAkutePatient({
      externalId: "supa-patient-1",
      firstName: "Sam",
      lastName: "Patient",
      dateOfBirth: "1990-01-01",
    });
    expect(b.created).toBe(false);
    expect(b.akutePatientId).toBe("akute_p1");

    const createCalls = fetchMock.mock.calls.filter(
      (c) => String(c[1]?.method || "GET").toUpperCase() === "POST",
    );
    expect(createCalls.length).toBe(1);
  });
});
