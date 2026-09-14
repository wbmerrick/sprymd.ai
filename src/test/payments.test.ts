import { beforeEach, describe, expect, it, vi } from "vitest";

const { invokeMock } = vi.hoisted(() => ({ invokeMock: vi.fn() }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: invokeMock } },
}));

import { isPaymentsLive, startCheckout } from "@/lib/payments";

const SESSION_KEY = "spry_session_id";
const ED_LINK = "https://buy.stripe.com/live-ed-link";
const WEIGHT_LINK = "https://buy.stripe.com/live-weight-link";

// jsdom marks window.location unforgeable, so replace the whole object with a
// spy-bearing copy instead of spying on location.assign directly.
const assignSpy = vi.fn();

const stubDemoMode = () => {
  vi.stubEnv("VITE_SUPABASE_URL", "");
  vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "");
};

const stubLiveSupabase = () => {
  vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "test-anon-key");
};

beforeEach(() => {
  localStorage.clear();
  vi.unstubAllEnvs();
  invokeMock.mockReset();
  assignSpy.mockReset();
  vi.stubEnv("VITE_STRIPE_PAYMENT_LINK_ED", "");
  vi.stubEnv("VITE_STRIPE_PAYMENT_LINK_WEIGHT", "");
  Object.defineProperty(window, "location", {
    value: { ...window.location, assign: assignSpy },
    writable: true,
    configurable: true,
  });
});

describe("startCheckout", () => {
  it("returns \"demo\" when neither Supabase nor a payment link is configured", async () => {
    stubDemoMode();
    const result = await startCheckout({ serviceLine: "ed", email: "pt@example.com" });
    expect(result).toBe("demo");
    expect(assignSpy).not.toHaveBeenCalled();
    expect(invokeMock).not.toHaveBeenCalled();
  });

  it("ignores .env.example placeholder links (containing \"your-\")", async () => {
    stubDemoMode();
    vi.stubEnv("VITE_STRIPE_PAYMENT_LINK_ED", "https://buy.stripe.com/your-ed-link");
    const result = await startCheckout({ serviceLine: "ed", email: "pt@example.com" });
    expect(result).toBe("demo");
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it("ignores non-https links", async () => {
    stubDemoMode();
    vi.stubEnv("VITE_STRIPE_PAYMENT_LINK_ED", "http://buy.stripe.com/insecure-link");
    const result = await startCheckout({ serviceLine: "ed", email: "pt@example.com" });
    expect(result).toBe("demo");
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it("redirects to the ED payment link when configured", async () => {
    stubDemoMode();
    vi.stubEnv("VITE_STRIPE_PAYMENT_LINK_ED", ED_LINK);
    const result = await startCheckout({ serviceLine: "ed", email: "pt@example.com" });
    expect(result).toBe("redirected");
    expect(assignSpy).toHaveBeenCalledWith(ED_LINK);
  });

  it("uses the per-service-line link (weight uses the weight link, not the ED link)", async () => {
    stubDemoMode();
    vi.stubEnv("VITE_STRIPE_PAYMENT_LINK_ED", ED_LINK);
    vi.stubEnv("VITE_STRIPE_PAYMENT_LINK_WEIGHT", WEIGHT_LINK);
    const result = await startCheckout({ serviceLine: "weight", email: "pt@example.com" });
    expect(result).toBe("redirected");
    expect(assignSpy).toHaveBeenCalledWith(WEIGHT_LINK);
  });

  it("stays in demo for a service line whose link is missing even if the other is set", async () => {
    stubDemoMode();
    vi.stubEnv("VITE_STRIPE_PAYMENT_LINK_ED", ED_LINK);
    const result = await startCheckout({ serviceLine: "weight", email: "pt@example.com" });
    expect(result).toBe("demo");
    expect(assignSpy).not.toHaveBeenCalled();
  });

  it("invokes the create-checkout-session edge function when Supabase is configured", async () => {
    stubLiveSupabase();
    localStorage.setItem(SESSION_KEY, "sess-fixed-123");
    invokeMock.mockResolvedValue({ data: { url: "https://checkout.stripe.com/pay/cs_123" }, error: null });

    const result = await startCheckout({ serviceLine: "ed", email: "pt@example.com" });

    expect(result).toBe("redirected");
    expect(invokeMock).toHaveBeenCalledWith("create-checkout-session", {
      body: { sessionId: "sess-fixed-123", serviceLine: "ed", email: "pt@example.com" },
    });
    expect(assignSpy).toHaveBeenCalledWith("https://checkout.stripe.com/pay/cs_123");
  });

  it("falls back to the payment link when the edge function fails", async () => {
    stubLiveSupabase();
    vi.stubEnv("VITE_STRIPE_PAYMENT_LINK_ED", ED_LINK);
    invokeMock.mockResolvedValue({ data: null, error: new Error("boom") });

    const result = await startCheckout({ serviceLine: "ed", email: "pt@example.com" });

    expect(result).toBe("redirected");
    expect(assignSpy).toHaveBeenCalledWith(ED_LINK);
  });

  it("treats a missing checkout URL as a failure and uses the fallback link", async () => {
    stubLiveSupabase();
    vi.stubEnv("VITE_STRIPE_PAYMENT_LINK_ED", ED_LINK);
    invokeMock.mockResolvedValue({ data: {}, error: null });

    const result = await startCheckout({ serviceLine: "ed", email: "pt@example.com" });

    expect(result).toBe("redirected");
    expect(assignSpy).toHaveBeenCalledWith(ED_LINK);
  });

  it("throws when the live rail fails and no fallback link exists", async () => {
    stubLiveSupabase();
    invokeMock.mockResolvedValue({ data: null, error: new Error("edge down") });

    await expect(startCheckout({ serviceLine: "ed", email: "pt@example.com" })).rejects.toThrow(
      "edge down",
    );
    expect(assignSpy).not.toHaveBeenCalled();
  });
});

describe("isPaymentsLive", () => {
  it("is false when nothing is configured", () => {
    stubDemoMode();
    expect(isPaymentsLive("ed")).toBe(false);
    expect(isPaymentsLive("weight")).toBe(false);
  });

  it("is false when only a placeholder or non-https link is set", () => {
    stubDemoMode();
    vi.stubEnv("VITE_STRIPE_PAYMENT_LINK_ED", "https://buy.stripe.com/your-ed-link");
    vi.stubEnv("VITE_STRIPE_PAYMENT_LINK_WEIGHT", "ftp://buy.stripe.com/weight");
    expect(isPaymentsLive("ed")).toBe(false);
    expect(isPaymentsLive("weight")).toBe(false);
  });

  it("is true per service line when a valid payment link is set", () => {
    stubDemoMode();
    vi.stubEnv("VITE_STRIPE_PAYMENT_LINK_ED", ED_LINK);
    expect(isPaymentsLive("ed")).toBe(true);
    expect(isPaymentsLive("weight")).toBe(false);
  });

  it("is true for all service lines when Supabase is configured", () => {
    stubLiveSupabase();
    expect(isPaymentsLive("ed")).toBe(true);
    expect(isPaymentsLive("weight")).toBe(true);
  });
});
