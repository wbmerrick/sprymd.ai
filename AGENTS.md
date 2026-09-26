# AGENTS.md

## Cursor Cloud specific instructions

This is a Vite + React + TypeScript single-page app (a "SpryMD" telehealth/ED-treatment
marketing + intake site) using shadcn/ui, Tailwind, and a **remote, hosted Supabase**
backend. There is no local backend/database to run — Supabase credentials are committed
in `.env` (`VITE_SUPABASE_*`) and point at a hosted project.

### Package manager: Bun (not npm)
- The in-sync lockfile is `bun.lock`. The committed `package-lock.json` is **stale/out of
  sync** with `package.json`, so `npm ci` fails. Use Bun.
- Bun is installed at `~/.bun/bin/bun` (the startup update script runs `bun install`).
- If invoking Bun manually in a fresh non-login shell, use the full path
  `~/.bun/bin/bun` or ensure `~/.bun/bin` is on `PATH` (the installer added it to
  `~/.bashrc`).

### Commands (see `package.json` `scripts`)
- Dev server: `bun run dev` — Vite serves on **port 8080** (host `::`, so reachable at
  `http://localhost:8080/`). This is the command to use for development.
- Build: `bun run build` (production) or `bun run build:dev` (development mode).
- Lint: `bun run lint`. Note: lint currently reports **pre-existing** errors/warnings in
  generated `src/components/ui/*` shadcn components and `tailwind.config.ts`; these are not
  caused by environment setup.
- Unit tests: `bun run test` (Vitest, jsdom). Test files: `src/**/*.{test,spec}.{ts,tsx}`.
- E2E: Playwright is configured via `lovable-agent-playwright-config` (`playwright.config.ts`).

### App structure / core flow
- Routes are defined in `src/App.tsx` (react-router). Key pages live in `src/pages/`.
- The core user flow is the homepage intake funnel in `src/SpryApp.jsx` (`Intake` → `Plan`;
 questions and plans live in `src/data/careCatalog.ts`, logic in `src/lib/intakeFlow.ts`),
 deep-linkable as `/?view=intake&condition=<id>`. `/quiz` redirects to the homepage care
 options. "Continue to checkout" hands off to `/checkout` (`src/pages/CashPayCheckout.tsx`),
 which starts a hosted Stripe Checkout via `/api/create-checkout-session` — card details are
 never collected in-app.

### Clinical DB migrations (hosted Supabase)
Apply in SQL editor (or `supabase db push`) in order when launching cash-pay visits:
1. `supabase/migrations/20260921_telehealth_clinical.sql`
2. `supabase/migrations/20260921_intake_and_visits.sql`
3. `supabase/migrations/20260923_guest_patients_payment_ledger.sql`
4. `supabase/migrations/20260926_appointments_pharmacy_handoff.sql` (ops pharmacy checklist)

Until the first three are applied, chart writes return `PGRST205` and checkout still works via Stripe-only
(with appointment provisioning skipped). Stripe webhook events to enable: `checkout.session.completed`,
`charge.refunded`, `payment_intent.payment_failed`.

### Ops / clinician console
- UI: `/ops` (queue) and `/ops/:appointmentId` (case detail) under `src/pages/ops/`.
- Demo (no auth): `/ops?demo=1`.
- APIs: `GET /api/ops/queue`, `GET|PATCH /api/ops/appointment`,
  `POST /api/ops/reconcile` (staff-gated; `{ appointmentId }` or `{ allAwaiting: true }`),
  `GET /api/ops/status` (staff launch snapshot: paid/awaiting counts, payment_events).
- Success page `GET /api/checkout/session` also reconciles **only** when status is
  `awaiting_payment` (never revives cancelled/refunded rows).
- Auth: Supabase Bearer session must be on `OPS_STAFF_EMAILS` / `MASTER_EMAILS`, or an
  active `providers` row (`api/_lib/staffAuth.ts`). Allowlisted staff auto-provision a
  `providers` row on first ops API call. Set `OPS_STAFF_EMAILS` on Vercel for additional
  clinician emails.
- After Supabase cutover, staff must **sign up / sign in once** on the clinical project
  (auth.users was empty post-cutover until first login). Ops requires a live Supabase
  session (Bearer token) — local-only fallback accounts cannot call `/api/ops/*`.
  Open `/ops` → redirected to auth (defaults to **Create account** for ops return).
  Confirm email if the project requires it, then sign in with the allowlisted address
  (built-in: owner email; extras via `OPS_STAFF_EMAILS`).
  Alternate bootstrap: create any Auth user, confirm email, insert an active
  `providers` row for that `user_id` — `requireStaff` accepts active providers without
  allowlist. Verified live: `GET /api/ops/queue` returns 200 with staff Bearer on www.

### Launch checklist
1. ~~Merge PR that adds `POST /api/ops/reconcile` + success-page poll~~ (done).
2. ~~Complete one live Stripe Checkout ($75 `visit_basic`) → `status=paid` + `payment_events`~~ (done; re-smoke before public open).
3. Staff: open `/ops` with allowlisted Supabase login; optional `Sync N awaiting`.
4. **Care model (launch):** asynchronous chart review. Video (`DAILY_API_KEY` / Twilio) is optional — do not block soft launch.
5. Legal: NPP draft shipped; Terms scope updated for full catalog — **counsel review before calling final**. Card statement text is `SPRYMD` (see `shared/statementDescriptor.ts` + FAQ).
6. Clinical dry-run: paid → **Complete medical intake** on success page (`/intake?appointmentId=&session_id=`) → chart row in `patient_intakes` → `/ops` claim → SOAP → **Pharmacy handoff** **or** Decline + refund. Follow `docs/ops/empower-fulfillment-sop.md` and `docs/ops/dress-rehearsal-checklist.md`.
7. Smoke: `node scripts/launch-check.mjs` and
   `node scripts/watch-paid-appointment.mjs <sessionId> <appointmentId>`.
8. Contact: `/contact` and in-app contact forms POST `/api/contact` (Resend → `SUPPORT_INBOX` / support@sprymd.ai).
9. Conversion: success page pushes `checkout_completed` to `window.dataLayer` (wire GTM container when ads budget exists).
