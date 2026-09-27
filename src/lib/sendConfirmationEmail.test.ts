import { afterEach, describe, expect, it, vi } from "vitest";

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };

afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env = { ...originalEnv };
  vi.resetModules();
});

describe("sendConfirmationEmail", () => {
  it("skips when RESEND_API_KEY is missing", async () => {
    delete process.env.RESEND_API_KEY;
    const { sendConfirmationEmail } = await import(
      "../../api/_lib/sendConfirmationEmail"
    );
    const result = await sendConfirmationEmail({ to: "patient@example.com" });
    expect(result).toEqual({ ok: true, skipped: true });
  });

  it("sends with configured from address", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.CHECKOUT_FROM_EMAIL = "SpryMD <noreply@sprymd.ai>";
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "",
    }) as unknown as typeof fetch;

    const { sendConfirmationEmail } = await import(
      "../../api/_lib/sendConfirmationEmail"
    );
    const result = await sendConfirmationEmail({
      to: "patient@example.com",
      amountCents: 7500,
    });

    expect(result.ok).toBe(true);
    expect(result.from).toBe("SpryMD <noreply@sprymd.ai>");
    expect(globalThis.fetch).toHaveBeenCalledOnce();
    const body = JSON.parse(
      (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mock
        .calls[0][1].body,
    );
    expect(body.from).toBe("SpryMD <noreply@sprymd.ai>");
    expect(body.to).toEqual(["patient@example.com"]);
  });

  it("falls back to onboarding@resend.dev when domain is unverified", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.CHECKOUT_FROM_EMAIL = "SpryMD <noreply@sprymd.ai>";
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () =>
          JSON.stringify({
            message: "The sprymd.ai domain is not verified.",
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => "",
      }) as unknown as typeof fetch;

    const { sendConfirmationEmail } = await import(
      "../../api/_lib/sendConfirmationEmail"
    );
    const result = await sendConfirmationEmail({ to: "patient@example.com" });

    expect(result.ok).toBe(true);
    expect(result.from).toBe("SpryMD <onboarding@resend.dev>");
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    const fallbackBody = JSON.parse(
      (globalThis.fetch as unknown as ReturnType<typeof vi.fn>).mock
        .calls[1][1].body,
    );
    expect(fallbackBody.from).toBe("SpryMD <onboarding@resend.dev>");
  });
});
