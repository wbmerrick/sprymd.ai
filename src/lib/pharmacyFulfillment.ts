/**
 * Pharmacy transmit stubs removed — see archive/empower/pharmacyFulfillment.ts.
 * Prescriptions are written in Akute e-prescribe to the patient's chosen pharmacy.
 */

export type PreferredPharmacy = {
  name: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
  };
  phone: string;
  ncpdp?: string | null;
  npi?: string | null;
  medicationType: "compounded" | "brand_name";
};

export function hasUsablePreferredPharmacy(
  pharmacy: PreferredPharmacy | null | undefined,
): boolean {
  if (!pharmacy) return false;
  const name = String(pharmacy.name || "").trim();
  const phone = String(pharmacy.phone || "").replace(/\D/g, "");
  const line1 = String(pharmacy.address?.line1 || "").trim();
  const city = String(pharmacy.address?.city || "").trim();
  const state = String(pharmacy.address?.state || "").trim();
  const zip = String(pharmacy.address?.zip || "").trim();
  return Boolean(name && phone.length >= 10 && line1 && city && state && zip);
}

/** @deprecated No-op — site never transmits Rx. Kept so old imports fail loudly. */
export async function dispatchPrescriptionToPharmacy(): Promise<never> {
  throw new Error(
    "dispatchPrescriptionToPharmacy removed — e-prescribe in Akute to the patient pharmacy",
  );
}
