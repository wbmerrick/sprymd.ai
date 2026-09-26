# Soft-launch dress rehearsal (STAR-6)

Run this once on **production** (or a Stripe live-mode sandbox you trust) before inviting real patients.

Companion SOP: [empower-fulfillment-sop.md](./empower-fulfillment-sop.md)

## Preconditions (already verified in code/env)

- [x] `GET /api/health` → `ok: true` (Stripe secret + webhook secret + Supabase service role)
- [x] Clinical migrations applied (`telehealth_clinical`, `intake_and_visits`, `guest_patients_payment_ledger`)
- [x] Pharmacy handoff columns applied (`appointments.pharmacy_status|notes|sent_at`)
- [x] Resend key present (`resendApiKey: true`)
- [x] Launch smoke: `node scripts/launch-check.mjs` → `asyncLaunchOk: true` (video optional)
- [ ] Staff can sign into `/ops` with allowlisted Supabase email
- [ ] Empower / pharmacy transmit channel agreed (portal login, fax, phone) — even if manual
- [ ] Ship guest post-pay intake API (`POST /api/intake/guest`) — PR #62; prod returns 404 until merge/deploy

## Script (happy path)

1. **Incognito browser** on `https://www.sprymd.ai`
2. Open **Care options** → **Erectile dysfunction** (`/care/ed`) → confirm Wingman page loads
3. **Start Your SpryMD Consultation** → complete intake as a TN adult (use real test demographics you control)
4. Pick a plan → land on `/checkout` → confirm copy says **visit fee only** (meds not auto-charged)
5. Pay with a **real card you own** (visit_basic $75 or protocol_start $99)
6. Confirm:
   - Success page loads
   - Confirmation email arrives (Resend)
   - `/ops` shows the case as **paid**
7. On success page: **Complete medical intake** (`/intake?appointmentId=&session_id=`) → confirm `patient_intakes` row in ops
8. Staff: **Claim** → review chart → write brief SOAP note → set **Pharmacy handoff** (`queued` / `sent` / notes)
9. Either:
   - **Approve** → transmit Rx via manual Empower channel → paste tracking into ops note when available, **or**
   - **Decline** → full refund via Stripe deep link → mark cancelled

## Script (decline / refund)

Repeat steps 1–6 with answers that should fail clinical screen (e.g. nitrate use on ED if asked). Confirm decline + refund path works without leaving a “paid forever” appointment.

## Smoke commands

```bash
node scripts/launch-check.mjs https://www.sprymd.ai
# After a paid session:
node scripts/watch-paid-appointment.mjs <sessionId> <appointmentId>
```

## Pass criteria

| Check | Pass |
|-------|------|
| Money | Stripe shows paid visit; statement descriptor `SPRYMD` |
| Chart | Ops can open case with intake context |
| Email | Patient got payment confirmation |
| Clinical | Approve→pharmacy handoff **or** decline→refund completed |
| Honesty | No medication auto-charge appeared on the card |

## After pass

- Soft-open to a small TN circle (friends/family first)
- Keep Empower SOP as the fulfillment bible until pharmacy API ships
- Do **not** turn on shop / wearables / med subscriptions until those MOON items are real
