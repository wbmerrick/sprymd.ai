import { PHARMACY_PAY_DISCLOSURE } from "@/data/program";
import type { PreferredPharmacy } from "@/lib/pharmacyFulfillment";

type Props = {
  value: PreferredPharmacy;
  onChange: (next: PreferredPharmacy) => void;
};

const emptyAddress = {
  line1: "",
  line2: "",
  city: "",
  state: "",
  zip: "",
};

export function emptyPreferredPharmacy(): PreferredPharmacy {
  return {
    name: "",
    address: { ...emptyAddress },
    phone: "",
    ncpdp: "",
    npi: "",
    medicationType: "brand_name",
  };
}

export default function PreferredPharmacyFields({ value, onChange }: Props) {
  const set = (patch: Partial<PreferredPharmacy>) =>
    onChange({ ...value, ...patch });
  const setAddr = (patch: Partial<PreferredPharmacy["address"]>) =>
    onChange({
      ...value,
      address: { ...value.address, ...patch },
    });

  return (
    <fieldset className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
      <legend className="px-1 text-sm font-semibold text-foreground">
        Your pharmacy
      </legend>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {PHARMACY_PAY_DISCLOSURE}
      </p>

      <label className="block text-xs font-medium">
        Medication type
        <select
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          value={value.medicationType}
          onChange={(e) =>
            set({
              medicationType: e.target.value as PreferredPharmacy["medicationType"],
            })
          }
        >
          <option value="brand_name">Brand-name</option>
          <option value="compounded">Compounded</option>
        </select>
      </label>
      <p className="text-[11px] text-muted-foreground">
        {value.medicationType === "compounded"
          ? "Compounded medication requires a compounding pharmacy."
          : "Brand-name can go to a retail pharmacy or a manufacturer self-pay program."}
      </p>

      <label className="block text-xs font-medium">
        Pharmacy name
        <input
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          value={value.name}
          onChange={(e) => set({ name: e.target.value })}
          autoComplete="organization"
          required
        />
      </label>

      <label className="block text-xs font-medium">
        Street address
        <input
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          value={value.address.line1}
          onChange={(e) => setAddr({ line1: e.target.value })}
          required
        />
      </label>
      <label className="block text-xs font-medium">
        Address line 2 (optional)
        <input
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          value={value.address.line2 || ""}
          onChange={(e) => setAddr({ line2: e.target.value })}
        />
      </label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <label className="block text-xs font-medium col-span-2 sm:col-span-1">
          City
          <input
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={value.address.city}
            onChange={(e) => setAddr({ city: e.target.value })}
            required
          />
        </label>
        <label className="block text-xs font-medium">
          State
          <input
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={value.address.state}
            onChange={(e) => setAddr({ state: e.target.value.toUpperCase() })}
            maxLength={2}
            required
          />
        </label>
        <label className="block text-xs font-medium">
          ZIP
          <input
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={value.address.zip}
            onChange={(e) => setAddr({ zip: e.target.value })}
            required
          />
        </label>
      </div>

      <label className="block text-xs font-medium">
        Pharmacy phone
        <input
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          value={value.phone}
          onChange={(e) => set({ phone: e.target.value })}
          inputMode="tel"
          required
        />
      </label>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="block text-xs font-medium">
          NCPDP (if known)
          <input
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={value.ncpdp || ""}
            onChange={(e) => set({ ncpdp: e.target.value })}
          />
        </label>
        <label className="block text-xs font-medium">
          Pharmacy NPI (if known)
          <input
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={value.npi || ""}
            onChange={(e) => set({ npi: e.target.value })}
          />
        </label>
      </div>
    </fieldset>
  );
}
