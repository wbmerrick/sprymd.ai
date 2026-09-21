# SpryMD

Telehealth platform for discreet men's health treatment (ED today; weight loss
behind a feature flag). Marketing site plus a multi-step medical intake quiz
that ends in Stripe checkout, with a lightweight provider review portal.

Deployed at [sprymd.ai](https://sprymd.ai).

## Stack

- **Frontend:** Vite + React 18 + TypeScript, Tailwind CSS, shadcn/ui, react-router
- **Backend:** Supabase (Postgres + RLS, Edge Functions) — hosted project `ytqjxmwhsfrboeycnhjo`
- **Payments:** Stripe Checkout (subscriptions) via Edge Functions, with Payment Link fallback
- **Email:** Resend (via the `send-notification` Edge Function)
- **Hosting:** Vercel (SPA rewrites + security headers in `vercel.json`)
- **Tooling:** Bun, Vitest (unit), Playwright (e2e)

## Local setup

```sh
bun install
cp .env.example .env   # then fill in values
bun run dev            # Vite dev server on http://localhost:8080
```

Other scripts:

```sh
bun run build      # production build
bun run lint       # eslint
bun run test       # vitest unit tests
```

Feature flags live in `src/lib/flags.ts` and are driven by `VITE_FEATURE_*`
env vars. Everything defaults off; only the exact string `true` enables a flag.

## Supabase setup

```sh
supabase link --project-ref ytqjxmwhsfrboeycnhjo
supabase db push
```

Deploy the Edge Functions:

```sh
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook --no-verify-jwt
supabase functions deploy send-notification
```

Set function secrets (server-only — never `VITE_`):

```sh
supabase secrets set \
  STRIPE_SECRET_KEY=sk_... \
  STRIPE_WEBHOOK_SECRET=whsec_... \
  STRIPE_PRICE_ED=price_... \
  STRIPE_PRICE_WEIGHT=price_... \
  SITE_URL=https://sprymd.ai \
  SUPABASE_SERVICE_ROLE_KEY=... \
  RESEND_API_KEY=re_...
```

## Stripe setup

1. Create products and recurring prices for each treatment line; put the price
   IDs in `STRIPE_PRICE_ED` and `STRIPE_PRICE_WEIGHT` (Supabase secrets).
2. Set the publishable key in `.env` as `VITE_STRIPE_PUBLISHABLE_KEY`.
3. Add a webhook endpoint pointing at the `stripe-webhook` Edge Function URL,
   subscribed to `checkout.session.completed` and
   `customer.subscription.deleted`; put its signing secret in
   `STRIPE_WEBHOOK_SECRET`.
4. Optionally create Payment Links as a fallback
   (`VITE_STRIPE_PAYMENT_LINK_ED` / `VITE_STRIPE_PAYMENT_LINK_WEIGHT`).

## Deploying to Vercel

- Import the repo; Vercel auto-detects Vite (`bun run build`, output `dist/`).
- Set all `VITE_*` variables from `.env.example` in the Vercel project settings.
- `vercel.json` provides the SPA rewrite, security headers (including a
  report-only CSP), and immutable caching for `/assets/`.

## Before going live

- [ ] Sign the Supabase BAA (HIPAA) for the hosted project.
- [ ] Attorney review of Terms of Service, Privacy Policy, and Notice of
      Privacy Practices.
- [ ] Swap Stripe test keys for live keys (publishable, secret, webhook).
- [ ] Confirm TN medical licensure and pharmacy partner agreements.
- [ ] Verify the sending domain in Resend and set `EMAIL_FROM`.
- [ ] Promote `Content-Security-Policy-Report-Only` to an enforced CSP after
      reviewing reports.
- [ ] Rotate the Supabase keys — the `.env` file was historically committed to
      this repository.
