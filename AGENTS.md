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

### Base44 dev environment
- `docker-compose.base44.yml` runs the Vite dev server via Bun (`oven/bun:1`), bind-mounting
  the repo at `/app` and mapping host port 3000 → container port 8080.
- `bun install` runs on every container start (fast, ~4s). Dependencies live in an anonymous
  volume at `/app/node_modules`.
- `vite.config.ts` has `allowedHosts: true` so the preview proxy's external hostname is accepted.
- Supabase credentials (`VITE_SUPABASE_*`) are in the committed `.env` and loaded automatically by
  Vite — no external secrets are required to boot. Optional wearable OAuth client secrets
  (`*_CLIENT_SECRET` in `.env.example`) are server-only and not needed for the marketing/intake flow.
- Start: `docker compose -f docker-compose.base44.yml up -d`
- Verify: `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/` → 200

### App structure / core flow
- Routes are defined in `src/App.tsx` (react-router). Key pages live in `src/pages/`.
- The core user flow is the multi-step medical intake quiz at `/quiz`
  (`src/pages/Quiz.tsx`), which ends on a treatment-plan screen with a Stripe checkout link.
