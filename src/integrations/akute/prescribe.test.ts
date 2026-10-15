import { describe, expect, it } from "vitest";
import {
  canPrescribeInAkute,
  compoundingRationaleRequired,
  formatPrescribeClipboard,
} from "./prescribe";
import type { PreferredPharmacy } from "@/lib/pharmacyFulfillment";

const pharmacy: PreferredPharmacy = {
  name: "Main Street Pharmacy",
  phone: "6155550100",
  address: {
    line1: "100 Main",
    city: "Nashville",
    state: "TN",
    zip: "37201",
  },
  medicationType: "brand_name",
  ncpdp: "1234567",
};

describe("Prescribe in Akute gates", () => {
  it("requires preferred pharmacy", () => {
    const r = canPrescribeInAkute({
      pharmacy: null,
      compoundingRationale: "",
      akutePatientId: "ak1",
    });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/pharmacy/i);
  });

  it("requires compounding rationale only when compounded", () => {
    expect(compoundingRationaleRequired(pharmacy)).toBe(false);
    expect(
      compoundingRationaleRequired({ ...pharmacy, medicationType: "compounded" }),
    ).toBe(true);

    const brand = canPrescribeInAkute({
      pharmacy,
      compoundingRationale: "",
      akutePatientId: "ak1",
    });
    expect(brand.ok).toBe(true);

    const compound = canPrescribeInAkute({
      pharmacy: { ...pharmacy, medicationType: "compounded" },
      compoundingRationale: "",
      akutePatientId: "ak1",
    });
    expect(compound.ok).toBe(false);

    const compoundOk = canPrescribeInAkute({
      pharmacy: { ...pharmacy, medicationType: "compounded" },
      compoundingRationale: "Patient needs liquid form due to dysphagia.",
      akutePatientId: "ak1",
    });
    expect(compoundOk.ok).toBe(true);
  });

  it("clipboard includes patient pharmacy", () => {
    const text = formatPrescribeClipboard({
      drug: "Semaglutide",
      dose: "0.25 mg",
      quantity: "1",
      sig: "Inject weekly",
      pharmacy,
    });
    expect(text).toMatch(/Main Street Pharmacy/);
    expect(text).toMatch(/NCPDP: 1234567/);
    expect(text).toMatch(/Semaglutide/);
  });
});
