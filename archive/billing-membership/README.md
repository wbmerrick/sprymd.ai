# Multi-tier visit / membership billing archive

Former `shared/serviceTiers.ts` ($75 / $99 / $149 visit tiers).

**Superseded by:** single Stripe product — Physician GLP-1 Evaluation at
`fees.evaluation = 10000` cents in `src/data/program.ts` (and `shared/program.ts`
for API bundling). No medication pass-through, no monthly membership product.
