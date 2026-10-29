# GLPTN.com deploy (weight-loss practice)

Same codebase as SpryMD. Brand is selected at build time:

```bash
VITE_SITE_BRAND=glptn
```

## What changes for GLPTN

- Site name / SEO / statement descriptor → **GLPTN** / `www.glptn.com`
- Care grid + footer → **weight loss only**
- Hero CTA → weight-loss evaluation (`/care/weight-loss` → intake)
- PCP section and audience filters hidden
- Non–weight-loss `/care/*` routes are `noindex`

SpryMD (`sprymd.ai`) is unchanged when `VITE_SITE_BRAND` is unset or `sprymd`.

## Vercel project

1. Create a **second** Vercel project (e.g. `glptn`) from `wbmerrick/sprymd.ai`.
2. Set env (Production + Preview):
   - `VITE_SITE_BRAND=glptn`
   - Copy Stripe / Supabase / Akute secrets as needed (separate practice → prefer separate Stripe + Supabase).
3. Add domains: `glptn.com` and `www.glptn.com` (apex → www redirect recommended).
4. At the registrar DNS for `glptn.com`, point to Vercel:
   - Apex: A `76.76.21.21` (or Vercel nameservers)
   - `www`: CNAME `cname.vercel-dns.com`
5. Redeploy production after DNS verifies.

## Local preview

```bash
VITE_SITE_BRAND=glptn bun run dev
```
