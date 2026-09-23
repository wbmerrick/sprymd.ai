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
    const byUser = await supabase
      .from("patients")
      .select("id")
      .eq("user_id", input.userId)
      .maybeSingle();
    if (byUser.data?.id) {
      return { patientId: byUser.data.id as string, linkedGuest: false };
    }

    const byEmail = await supabase
      .from("patients")
      .select("id, user_id")
      .ilike("email", email)
      .maybeSingle();

    if (byEmail.data?.id && !byEmail.data.user_id) {
      const { data, error } = await supabase
        .from("patients")
        .update({
          user_id: input.userId,
          full_name: input.fullName || undefined,
          date_of_birth: input.dateOfBirth || undefined,
          phone: input.phone || undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", byEmail.data.id)
        .select("id")
        .single();
      if (!error && data?.id) {
        return { patientId: data.id as string, linkedGuest: true };
      }
    }

    if (byEmail.data?.id && byEmail.data.user_id === input.userId) {
      return { patientId: byEmail.data.id as string, linkedGuest: false };
    }

    const { data, error } = await supabase
      .from("patients")
      .insert({
        user_id: input.userId,
        email,
        full_name: input.fullName || "",
        date_of_birth: input.dateOfBirth || null,
        phone: input.phone || "",
      })
      .select("id")
      .single();

    if (error) return { patientId: null, linkedGuest: false };
    return { patientId: (data?.id as string) || null, linkedGuest: false };
  } catch {
    return { patientId: null, linkedGuest: false };
  }
}
