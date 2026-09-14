import type { ServiceLine } from "@/lib/encounters";
import { ensureSessionId, isSupabaseConfigured } from "@/lib/intake/persist";

export type CheckoutResult = "redirected" | "demo";

export interface StartCheckoutOptions {
  serviceLine: ServiceLine;
  email: string;
}

// Env is read at call time (not module scope) so tests can vi.stubEnv per case.
const getPaymentLink = (serviceLine: ServiceLine): string | null => {
  const link =
    serviceLine === "weight"
      ? import.meta.env.VITE_STRIPE_PAYMENT_LINK_WEIGHT
      : import.meta.env.VITE_STRIPE_PAYMENT_LINK_ED;

  if (typeof link !== "string" || !link.startsWith("https://")) return null;
  // Ignore the .env.example placeholders (e.g. https://buy.stripe.com/your-ed-link).
  if (link.includes("your-")) return null;
  return link;
};

export const isPaymentsLive = (serviceLine: ServiceLine): boolean =>
  isSupabaseConfigured() || getPaymentLink(serviceLine) !== null;

const redirectTo = (url: string): void => {
  window.location.assign(url);
};

const invokeCheckoutSession = async ({ serviceLine, email }: StartCheckoutOptions): Promise<string> => {
  // Lazy import so the Supabase client module is only evaluated when configured.
  const { supabase } = await import("@/integrations/supabase/client");

  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: { sessionId: ensureSessionId(), serviceLine, email },
  });

  if (error) throw error;

  const url = (data as { url?: string } | null)?.url;
  if (!url) throw new Error("create-checkout-session did not return a checkout URL");
  return url;
};

/**
 * Starts checkout with a three-tier fallback:
 *  1. Supabase configured → create-checkout-session edge function → redirect.
 *  2. Valid Stripe Payment Link for the service line → redirect.
 *  3. Neither → "demo" (caller navigates to /confirmed for the local demo flow).
 */
export const startCheckout = async (options: StartCheckoutOptions): Promise<CheckoutResult> => {
  if (isSupabaseConfigured()) {
    try {
      const url = await invokeCheckoutSession(options);
      redirectTo(url);
      return "redirected";
    } catch (err) {
      const fallbackLink = getPaymentLink(options.serviceLine);
      if (fallbackLink) {
        redirectTo(fallbackLink);
        return "redirected";
      }
      throw err;
    }
  }

  const link = getPaymentLink(options.serviceLine);
  if (link) {
    redirectTo(link);
    return "redirected";
  }

  return "demo";
};
