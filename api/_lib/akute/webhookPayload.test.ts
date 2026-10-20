import { describe, expect, it } from "vitest";
import { canonicalJson, eventIdOf, eventOf, resourceOf, signatureAgeSec } from "./webhookPayload";
import { patientIdFromWebhook } from "./intakeSync";

// Trimmed from Akute's documented "Search for Webhooks" example payload.
const AKUTE_TASK_CREATE = {
  event_id: "evt-56aa280848754dc3ac9ba67dbe807833",
  event_type: "create",
  resource_type: "Task",
  id: "657ba43e80e1df0c4179f721",
  task: "Review new diagnostic report & sync to patient chart",
  patient_id: "pt_1",
  status: "not-started",
};

describe("Akute webhook payload envelope", () => {
  it("reads the documented flat envelope", () => {
    expect(eventIdOf(AKUTE_TASK_CREATE)).toBe("evt-56aa280848754dc3ac9ba67dbe807833");
    expect(resourceOf(AKUTE_TASK_CREATE)).toBe("task");
    expect(eventOf(AKUTE_TASK_CREATE)).toBe("create");
    expect(patientIdFromWebhook(resourceOf(AKUTE_TASK_CREATE), AKUTE_TASK_CREATE)).toBe("pt_1");
  });

  it("maps a Patient event to the patient's own id", () => {
    const body = { event_id: "evt-1", event_type: "update", resource_type: "Patient", id: "pt_9" };
    expect(resourceOf(body)).toBe("patient");
    expect(patientIdFromWebhook(resourceOf(body), body)).toBe("pt_9");
  });

  it("still accepts the older resource/event/type guesses", () => {
    expect(resourceOf({ resource: "Appointment" })).toBe("appointment");
    expect(resourceOf({ type: "Note" })).toBe("note");
    expect(eventOf({ event: "Update" })).toBe("update");
    expect(resourceOf({})).toBe("unknown");
    expect(eventIdOf({})).toBeNull();
    expect(eventIdOf({ id: " x1 " })).toBe("x1");
  });
});

describe("canonicalJson", () => {
  it("returns the compact form only when it differs from the raw body", () => {
    expect(canonicalJson('{"a":1,"b":"x"}')).toBeNull();
    expect(canonicalJson('{ "a": 1,\n  "b": "x" }')).toBe('{"a":1,"b":"x"}');
    expect(canonicalJson("not json")).toBeNull();
  });
});

describe("signatureAgeSec", () => {
  it("reads seconds and milliseconds timestamps", () => {
    const now = 1_700_000_000_000;
    expect(signatureAgeSec("t=1699999940,v1=abc", now)).toBe(60);
    expect(signatureAgeSec("t=1699999940000,v1=abc", now)).toBe(60);
    expect(signatureAgeSec("v1=abc", now)).toBeNull();
    expect(signatureAgeSec(undefined, now)).toBeNull();
  });
});
