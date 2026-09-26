# Empower + shipping fulfillment SOP (manual hard open)

> **Status:** Public-launch playbook — use until Empower API / e-Rx automation ships (MOON).  
> **Owner:** Founding clinician + whoever is covering `/ops` that day.  
> **Goal:** Every paid TN visit either gets a clinically appropriate Rx + ship path, or a clear decline + Stripe refund.

## When this applies

Patient completed intake → paid visit fee (Stripe) → appointment `status=paid` in `/ops`.

<<<<<<< HEAD
Async chart review is the launch care model for specialty protocols (ED, weight loss, hair, skin, peptides, NAD+). **Live video is for PCP visits only.**
=======
Async chart review is the launch care model for specialty protocols. **Live video is for PCP visits only.**
>>>>>>> fb40025 (docs(launch): note PCP-only video in Empower SOP)

## Roles

| Role | Duty |
|------|------|
| Clinician (ops) | Claim case, review intake/SOAP, approve or decline |
| Fulfillment | Transmit Rx to Empower (or partner pharmacy), confirm ship |
| Support | Patient email (`support@sprymd.ai`), tracking questions |

## Happy path (approve + ship)

1. Open `/ops` → claim paid case → **Review chart**.
2. Confirm: TN physical location at time of care, age 18+, no hard contraindications, plan matches intake.
3. Document SOAP / decision in ops note (why this agent/dose).
4. **Approve** in ops when clinically appropriate.
5. Transmit prescription to Empower Pharmacy (current: **manual** portal / phone / agreed channel — do not invent an API step that does not exist yet).
6. Record in ops note: Rx sent at `<time>`, drug/strength/qty, Empower confirmation id if any.
7. When pharmacy confirms ship: paste tracking into ops note + reply to patient email (or confirmation thread).
8. Cold-chain meds: confirm overnight / insulated packaging before promising next-day TN delivery copy.

## Decline path (do not prescribe)

1. Document clinical reason in SOAP.
2. Use ops **decline / refund** Stripe deep links (full refund of visit fee when policy says so).
3. Mark appointment cancelled / declined per ops UI.
4. Email patient plainly: not appropriate via telehealth; seek in-person care if needed; 911 for emergencies.

## SLAs (hard open — public)

| Step | Target |
|------|--------|
| First clinician open of paid case | Same calendar day if paid before 2pm CT weekday; else next business day |
| Decision (approve/decline) | Within 1 business day of claim |
| Rx transmit after approve | Same day as approve |
| Patient “what’s next” email | Within 24h of payment (Resend confirmation already fires; clinical follow-up is human) |

These SLAs are the public promise (FAQ ~1 business day). Do not hard-open without staff coverage that can hit them.

## Exceptions

- **Nitrates / ED contraindication** → decline, no Rx.
- **GLP-1 cold chain unavailable to ZIP** → delay ship or switch form; tell patient honestly.
- **Missing labs when required by protocol** → message patient; do not guess.
- **Out of TN / under 18** → should have been blocked at intake/checkout; if slipped through, refund + cancel.

## What not to promise in patient copy

- Do not say “e-Rx transmitted automatically” until Empower API is live.
- Do not charge medication `$/mo` in Stripe until subscription + approve-to-charge flow ships.
- Card statement shows `SPRYMD` only.

## Audit crumbs

Keep in each case note: decision, drug, transmit time, tracking, refund id if any. This is the temporary chart of record alongside Supabase appointment rows.

## Exit criteria to retire this SOP

MOON: Empower API e-Rx + status webhooks + tracking sync + med subscription charge-after-approve. Until then, this document is law.
