/**
 * Mirrored for Vercel API bundling — keep in sync with src/data/program.ts.
 */
export const fees = {
  evaluation: 10000,
} as const;

export const EVALUATION_PRODUCT = {
  id: "evaluation" as const,
  name: "Physician GLP-1 Evaluation",
  description:
    "$100 physician evaluation. Prescription only if medically appropriate. Full refund if not.",
  amountCents: fees.evaluation,
  currency: "usd" as const,
};

export const EVALUATION_FEE_COPY =
  "$100 physician evaluation. Prescription only if medically appropriate. Full refund if not.";

export const PHARMACY_PAY_DISCLOSURE =
  "You pay your pharmacy directly for your medication. Prices vary by pharmacy. SpryMD does not sell or set the price of medication.";
