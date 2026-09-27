import { supabase } from "@/integrations/supabase/client";

/**
 * Ensure a `patients` chart row exists for this auth user.
 * Links a prior guest checkout row (same email, null user_id) when present.
 */
export async function bootstrapClinicalPatient(input: {
  userId: string;
  email: string;
  fullName?: string;
  dateOfBirth?: string;
  phone?: string;
}): Promise<{ patientId: string | null; linkedGuest: boolean }> {
  const email = String(input.email || "").trim().toLowerCase();
  if (!input.userId || !email) return { patientId: null, linkedGuest: false };

  try {
    const before = await supabase
      .from("patients")
      .select("id")
      .eq("user_id", input.userId)
      .maybeSingle();

    const { data: claimedId, error } = await supabase.rpc("claim_or_create_patient", {
      p_email: email,
      p_full_name: input.fullName || "",
      p_date_of_birth: input.dateOfBirth || null,
      p_phone: input.phone || "",
    });

    if (error || !claimedId) {
      return { patientId: before.data?.id ? String(before.data.id) : null, linkedGuest: false };
    }

    return {
      patientId: String(claimedId),
      linkedGuest: !before.data?.id,
    };
  } catch {
    return { patientId: null, linkedGuest: false };
  }
}
