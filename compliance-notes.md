# Compliance notes — billing & pharmacy

## Physician evaluation fee

SpryMD charges a flat **$100 physician evaluation** through Stripe for clinical
review of the intake. This is payment for a physician evaluation — never for a
prescription.

Approved framing:

> $100 physician evaluation. Prescription only if medically appropriate. Full refund if not.

Banned phrasing anywhere on the site:

- "Buy a prescription"
- "$100 Rx"
- "guaranteed prescription"

Full refund of the evaluation fee when the intake hard-stops or the clinician
marks the case **Not clinically appropriate**.

Stripe metadata must not contain PHI. Use `patients.id` only.

## Pharmacy neutrality (hard rule)

SpryMD **never** recommends, steers to, or receives anything from any pharmacy.

- The patient chooses their pharmacy at intake (name, address, phone, NCPDP/NPI if known).
- The patient chooses compounded vs brand-name medication type.
- If clinically appropriate, the clinician e-prescribes in Akute to that pharmacy.
- The patient pays the pharmacy directly for medication. SpryMD does not sell,
  price, or handle medication.
