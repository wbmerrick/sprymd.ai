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

### Base44 dev environment (docker-compose.base44.yml)
- Runs the Vite dev server from source via `oven/bun:1.1` with the repo bind-mounted at `/app`.
- `bun install` runs at container start, then `bun run dev --host 0.0.0.0 --port 8080`.
- Host port 3000 maps to container port 8080 (the preview entry point).
- No external secrets required — Supabase credentials are in the committed `.env`.
- Optional OEM OAuth client secrets (`*_CLIENT_SECRET`) are server-only and not needed
  for the marketing/intake site to render; the `/api/oauth/token` endpoint runs in sandbox
  mode without them.

### App structure / core flow
- Routes are defined in `src/App.tsx` (react-router). Key pages live in `src/pages/`.
- The core user flow is the multi-step medical intake quiz at `/quiz`
  (`src/pages/Quiz.tsx`), which ends on a treatment-plan screen with a Stripe checkout link.
