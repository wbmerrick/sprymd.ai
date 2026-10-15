import type { PreferredPharmacy } from "@/lib/pharmacyFulfillment";
import { hasUsablePreferredPharmacy } from "@/lib/pharmacyFulfillment";

export type PrescribeSummaryInput = {
  drug: string;
  dose: string;
  quantity: string;
  supplies?: string;
  sig: string;
  compoundingRationale?: string;
  pharmacy: PreferredPharmacy | null | undefined;
};

export function akuteChartUrl(akutePatientId: string): string {
  const base = (
    import.meta.env.VITE_AKUTE_APP_BASE_URL ||
    "https://app.akutehealth.com"
  ).replace(/\/$/, "");
  return `${base}/patients/${encodeURIComponent(akutePatientId)}`;
}

export function compoundingRationaleRequired(
  pharmacy: PreferredPharmacy | null | undefined,
): boolean {
  return pharmacy?.medicationType === "compounded";
}

export function canPrescribeInAkute(opts: {
  pharmacy: PreferredPharmacy | null | undefined;
  compoundingRationale: string;
  akutePatientId?: string | null;
}): { ok: boolean; reason?: string } {
  if (!opts.akutePatientId) {
    return { ok: false, reason: "Patient is not linked to Akute yet." };
  }
  if (!hasUsablePreferredPharmacy(opts.pharmacy)) {
    return { ok: false, reason: "Patient must choose a pharmacy at intake." };
  }
  if (
    compoundingRationaleRequired(opts.pharmacy) &&
    !String(opts.compoundingRationale || "").trim()
  ) {
    return {
      ok: false,
      reason: "Compounding rationale is required for compounded medication.",
    };
  }
  return { ok: true };
}

export function formatPrescribeClipboard(input: PrescribeSummaryInput): string {
  const p = input.pharmacy;
  const addr = p?.address;
  const pharmacyBlock = p
    ? [
        "PATIENT PHARMACY",
        `Name: ${p.name}`,
        `Address: ${[addr?.line1, addr?.line2, addr?.city, addr?.state, addr?.zip]
          .filter(Boolean)
          .join(", ")}`,
        `Phone: ${p.phone}`,
        p.ncpdp ? `NCPDP: ${p.ncpdp}` : null,
        p.npi ? `NPI: ${p.npi}` : null,
        `Medication type: ${p.medicationType}`,
      ]
        .filter(Boolean)
        .join("\n")
    : "PATIENT PHARMACY\n(not on file)";

  const lines = [
    "SPRYMD — Prescribe in Akute (clipboard summary)",
    "",
    `Drug: ${input.drug}`,
    `Dose: ${input.dose}`,
    `Quantity: ${input.quantity}`,
    input.supplies ? `Supplies: ${input.supplies}` : null,
    `Sig: ${input.sig}`,
    "",
    pharmacyBlock,
  ];

  if (
    compoundingRationaleRequired(input.pharmacy) &&
    input.compoundingRationale?.trim()
  ) {
    lines.push(
      "",
      "COMPOUNDING RATIONALE (patient-specific — required)",
      input.compoundingRationale.trim(),
    );
  }

  return lines.filter((l) => l != null).join("\n");
}
