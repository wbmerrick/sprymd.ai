import { supabase } from "@/integrations/supabase/client";
import { isSupabaseConfigured } from "@/lib/intake/persist";

export interface NotificationResult {
  sent: boolean;
  skipped?: boolean;
  reason?: string;
}

/**
 * Asks the send-notification edge function to email the patient about a
 * clinical decision. Best-effort: never throws — failures are logged and
 * reported in the result so the provider flow is never blocked by email.
 */
export async function notifyEncounterDecision(
  encounterId: string,
  decision: "prescribed" | "declined",
): Promise<NotificationResult> {
  if (!isSupabaseConfigured()) {
    return { sent: false, skipped: true };
  }

  try {
    const { data, error } = await supabase.functions.invoke("send-notification", {
      body: { encounterId, event: `decision_${decision}` },
    });

    if (error) {
      console.warn("[notifications] send-notification failed:", error.message);
      return { sent: false, reason: error.message };
    }

    return (data as NotificationResult | null) ?? { sent: false };
  } catch (err) {
    console.warn("[notifications] send-notification threw:", err);
    return { sent: false, reason: err instanceof Error ? err.message : String(err) };
  }
}
