import { akute, idOf, list } from "./client";

export type AkutePatientInput = {
  /** Always public.patients.id */
  externalId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex?: "male" | "female" | "other" | "unknown";
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressCity?: string;
  addressState?: string;
  addressZipcode?: string;
};

/**
 * Find by external_id first; create if missing. Exactly one Akute patient per patients.id.
 */
export async function ensureAkutePatient(
  input: AkutePatientInput,
): Promise<{ akutePatientId: string; created: boolean }> {
  const externalId = String(input.externalId || "").trim();
  if (!externalId) throw new Error("external_id required");

  const found = list(
    await akute(
      `/patients?${new URLSearchParams({ external_id: externalId, limit: "5" })}`,
    ),
  );
  const exact = found.find(
    (p) =>
      String((p as { external_id?: string })?.external_id || "") === externalId,
  );
  const existingId = idOf(exact);
  if (existingId) {
    return { akutePatientId: existingId, created: false };
  }

  const body: Record<string, unknown> = {
    external_id: externalId,
    first_name: input.firstName,
    last_name: input.lastName,
    date_of_birth: input.dateOfBirth,
    sex: input.sex || "unknown",
    status: "active",
  };
  if (input.email) body.email = input.email;
  if (input.phone) {
    body.primary_phone_number = input.phone.replace(/\D/g, "").slice(-10);
    body.primary_phone_type = "mobile";
  }
  if (input.addressLine1) body.address_line_1 = input.addressLine1;
  if (input.addressLine2) body.address_line_2 = input.addressLine2;
  if (input.addressCity) body.address_city = input.addressCity;
  if (input.addressState) body.address_state = input.addressState;
  if (input.addressZipcode) body.address_zipcode = input.addressZipcode;

  const created = await akute("/patients", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const akutePatientId = idOf(created);
  if (!akutePatientId) throw new Error("No patient id returned from Akute");
  return { akutePatientId, created: true };
}
