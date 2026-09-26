# Hard open — master checklist

Public launch for **Tennessee cash-pay async telehealth** (visit fee → clinician chart review → pharmacy handoff or decline+refund).  
This is **not** a friends-and-family soft open: when the gates below are green, anyone in TN who finds the site can pay and get care under published SLAs.

Companion docs: [dress-rehearsal-checklist.md](./dress-rehearsal-checklist.md), [empower-fulfillment-sop.md](./empower-fulfillment-sop.md).

## Scope (in)

| In scope at hard open | Out of scope (stay off / deferred) |
|-----------------------|-------------------------------------|
| Care catalog cash-pay visits (TN) | Shop / marketplace (`FEATURES.enableShop`) |
| Async chart review (no required video) | Device / wearables dashboard |
| Stripe visit fee + refunds | Multi-state expansion |
| Ops queue + pharmacy handoff fields | Empower e-Rx API automation |
| Contact → Resend support inbox | GTM / paid ads (optional growth) |
| Manual Empower / partner pharmacy fulfill | Live video (optional after BAA) |

## Master todo

| # | Gate | Owner | Status | Notes |
|---|------|-------|--------|-------|
| H1 | Cash-pay stack live (Stripe secret, webhook, Supabase service role, Resend) | Eng | **Done** | `GET /api/health` → `ok: true` |
| H2 | Clinical + guest + pharmacy DB migrations applied | Eng | **Done** | Incl. `20260926_appointments_pharmacy_handoff` |
| H3 | Ops reconcile + success-page poll + decline/refund deep links | Eng | **Done** | Merged #58–#60 |
| H4 | Guest post-pay intake → `patient_intakes` (`POST /api/intake/guest`) | Eng | **Done** | #62 merged; prod returns 400 on bad body (not 404) |
| H5 | Ops pharmacy handoff UI (`pharmacy_status` / notes / sent_at) | Eng | **Done** | #62 |
| H6 | Statement descriptor `SPRYMD` + honest checkout/FAQ copy | Eng | **Done** | Visit fee only; meds not auto-charged |
| H7 | Public SEO crawlable (robots allow marketing; sitemap) | Eng | **Done** | Funnel routes disallowed (correct) |
| H8 | `node scripts/launch-check.mjs` → `asyncLaunchOk` | Eng | **Done** | Video keys optional |
| H9 | Staff can sign into `/ops` with allowlisted Supabase email | Founder | **Open** | Builtin allowlist live; confirm your login once |
| H10 | Named pharmacy transmit channel ready (Empower portal/fax/phone) | Founder | **Open** | Even if manual — must work same day as approve |
| H11 | Support coverage: `support@sprymd.ai` monitored on launch days | Founder | **Open** | Resend wired; humans must answer |
| H12 | End-to-end dress rehearsal **passed** on production | Founder + clinician | **Open** | Pay → intake CTA → claim → SOAP → pharmacy **or** decline+refund |
| H13 | Decline+refund dress rehearsal **passed** | Founder + clinician | **Open** | No “paid forever” stuck cases |
| H14 | Counsel review of NPP + Terms — **cleared for public use** | Counsel | **Open** | Hard legal gate for hard open |
| H15 | Published SLA commitment matches ops capacity | Founder | **Open** | FAQ already says ~1 business day; staff must hit it |
| H16 | Re-smoke one live paid visit after any deploy | Eng / Founder | **Open** | Prior smoke done; one more after hard-open cut |
| H17 | Soft-open / invite-only posture retired | Founder | **N/A → Hard open** | No TN friends-only gate — site is the front door |
| H18 | Live video (Daily/Twilio) | Eng | Deferred | Not required; async is the care model |
| H19 | GTM / ads conversion container | Eng | Deferred | `dataLayer` already pushes; wire when ads budget exists |
| H20 | Shop, wearables, med subscriptions, Empower API | Eng | Deferred | Flip `FEATURES` / build MOON work after open |

## Hard-open decision

**Flip to hard open when H9–H16 are Done.**  
Engineering (H1–H8) is already green. Remaining work is founder ops, pharmacy access, counsel, and one clean production dress rehearsal.

## Day-of cutover

1. Confirm H9–H16 in this table.
2. Run `node scripts/launch-check.mjs https://www.sprymd.ai`.
3. Complete one live `$75` visit end-to-end (H12) and optionally a decline path (H13).
4. Announce / leave site as-is — no feature flag for “soft vs hard”; marketing pages are already public.
5. Keep [empower-fulfillment-sop.md](./empower-fulfillment-sop.md) as fulfillment law until pharmacy API ships.
