import { supabase } from "@/integrations/supabase/client";
import { restoreCustomerSession } from "@/lib/customerAccounts";

export type ClinicalAuthSession = {
  email: string;
  userId: string;
};

/**
 * Staff/master clinical tools need a live Supabase Auth session (RLS).
 * Local-only customerAccounts fallbacks can open the shell UI but cannot
 * write providers / staff_threads / message_threads.
 */
export async function resolveClinicalAuthSession(): Promise<ClinicalAuthSession | null> {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (session?.user?.id && session.user.email) {
    return {
      email: session.user.email.trim().toLowerCase(),
      userId: session.user.id,
    };
  }

  // May refresh a persisted Supabase session into the client.
  await restoreCustomerSession();
  const again = await supabase.auth.getSession();
  const s2 = again.data.session;
  if (s2?.user?.id && s2.user.email) {
    return {
      email: s2.user.email.trim().toLowerCase(),
      userId: s2.user.id,
    };
  }

  return null;
}
