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
- Install: `bun install`
- Dev server: `bun run dev` — Vite serves on **port 8080** (host `::`, so reachable at
  `http://localhost:8080/`). This is the command to use for development.
- Build: `bun run build` (production) or `bun run build:dev` (development mode).
- Lint: `bun run lint`. Note: lint currently reports **pre-existing** errors/warnings in
  generated `src/components/ui/*` shadcn components and `tailwind.config.ts`; these are not
  caused by environment setup.
- Unit tests: `bun run test` (Vitest, jsdom). Test files: `src/**/*.{test,spec}.{ts,tsx}`.
- E2E: Playwright is configured via `lovable-agent-playwright-config` (`playwright.config.ts`).

### Environment
- `.env` holds hosted Supabase public keys (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`,
  `VITE_SUPABASE_PROJECT_ID`). These are required for the app to talk to the remote backend.
- `.env.example` documents optional OEM cloud OAuth client IDs (`VITE_*_CLIENT_ID`) and
  server-only OAuth secrets (non-`VITE_*`) for `/api/oauth/token`. Leave OEM vars unset to
  use SpryMD sandbox OAuth consent.

### App structure / core flow
- Routes are defined in `src/App.tsx` (react-router). Key pages live in `src/pages/`.
- Brand atmosphere / landing visuals: `src/components/brand/` (e.g. `AlpineAtmosphere.jsx`),
  assets under `src/assets/` and `public/brand/`.
- The core user flow is the multi-step medical intake quiz at `/quiz`
  (`src/pages/Quiz.tsx`), which ends on a treatment-plan screen with a Stripe checkout link.
