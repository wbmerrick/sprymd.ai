# Implementation Plan — Wearables + Kraken-like Vitals Dashboard

> **Status:** R&D phased plan (file-by-file).  
> **Goal:** Merge `cursor/wearable-dashboard-toolbar-012b` into a feature branch off `main`, then build purchase-gated, uploadable, realtime-feeling multi-panel vitals on the existing auth-gated `DashboardLayout` — without breaking session restore or care checkout flows.  
> **Companion:** [realtime-vitals-architecture.md](./realtime-vitals-architecture.md)

## Guardrails (do not break)

1. **Auth:** `DashboardLayout` must keep `ready` gate + `Navigate` to `/?auth=1&returnTo=…` when `!isAuthenticated`.
2. **Session:** `useDashboardData` continues to call `restoreCustomerSession()` then `getSignedInEmail()`.
3. **Care writes:** `recordSubscriptionCheckout` / `recordCartCheckout` / `recordRefillCheckout` remain the only checkout writers unless extended carefully.
4. **UI chrome:** Keep dark `#050505` / Syne / `#1EC8A5` language; wearables dock already matches — extend, don’t restyle the whole app.
5. **No Supabase requirement for MVP** — client exists at `src/integrations/supabase/client.ts`; use later.

---

## Phase 0 — Branch & merge wearable toolbar

**Branch:** e.g. `cursor/vitals-dashboard-panels-<suffix>` off latest `main`.

| Step | Action |
|------|--------|
| 0.1 | `git merge origin/cursor/wearable-dashboard-toolbar-012b` (or cherry-pick `8827273`) |
| 0.2 | Resolve conflicts in `patientCareStore.ts`, `useDashboardData.ts`, `DashboardLayout.tsx`, `HomePage.tsx`, `types/dashboard.ts` |
| 0.3 | Smoke: login → `/dashboard` shows toolbar + readings section; cart checkout still works |

### Files landing from wearable branch

| File | Role |
|------|------|
| `src/data/wearables.ts` | Catalog, images map, `metricDefaults`, `defaultWearableDevices` |
| `src/types/dashboard.ts` | `WearableKind`, `WearableDevice`, `WearableReading`, extend `DashboardData` |
| `src/lib/patientCareStore.ts` | Wearable fields + `setWearableSyncMode` / `syncWearableDevice` / `recordWearableReading` / `importWearableUpload` |
| `src/hooks/useDashboardData.ts` | Wearable actions + empty dashboard defaults |
| `src/components/dashboard/WearableToolbar.tsx` | Floating dock: modes, upload, manual, sync |
| `src/components/dashboard/WearableReadings.tsx` | Recent readings list |
| `src/pages/dashboard/DashboardLayout.tsx` | Mount `<WearableToolbar />` (post-auth only) |
| `src/pages/dashboard/HomePage.tsx` | Render `<WearableReadings />` |

**Exit:** Wearable branch behavior green on current `main`.

---

## Phase 1 — Types & store: ownership, profile, quiet continuous ticks

### 1.1 `src/types/dashboard.ts`

Add / adjust:

```ts
interface WearableDevice {
  // existing fields…
  owned?: boolean;                 // purchase-gated
  marketplaceProductId?: string;   // "p8" | "p9" | "p10"
}

interface PatientVitalsProfile {
  heightCm: number | null;
  weightLb: number | null;
  targetWeightLb?: number | null;
  updatedAt: string;
}

interface DashboardData {
  // existing…
  wearableDevices: WearableDevice[];
  wearableReadings: WearableReading[];
  vitalsProfile: PatientVitalsProfile;
}
```

Optional: extend `WearableKind` later for CGM / ring — keep MVP to catalog kinds.

### 1.2 `src/data/wearables.ts`

| Change | Detail |
|--------|--------|
| `MARKETPLACE_DEVICE_MAP` | `{ p8: "bp_monitor", p9: "pulse_oximeter", p10: "smart_scale" }` |
| `defaultWearableDevices()` | Start with `owned: false` (or keep demo-owned behind `import.meta.env.DEV` flag) |
| Export tick intervals | `CONTINUOUS_TICK_MS: Record<WearableKind, number>` |

### 1.3 `src/lib/patientCareStore.ts`

Extend `PatientCareRecord`:

```ts
wearableDevices: WearableDevice[];
wearableReadings: WearableReading[];
vitalsProfile: PatientVitalsProfile;
```

Backfill in `getPatientCare` (same pattern as wearable devices).

**New exports (concrete sequence for implementers):**

| # | Function | Notes |
|---|----------|-------|
| 1 | `emptyVitalsProfile()` | Defaults `null` height/weight |
| 2 | `getVitalsProfile(email)` | |
| 3 | `updateVitalsProfile(email, patch)` | Persist; if `weightLb` set, optional notification |
| 4 | `unlockWearableDevice(email, kind, meta?)` | `owned: true`, `enabled: true`, `status: "paired"` |
| 5 | `setWearableEnabled(email, kind, enabled)` | Management |
| 6 | `getOwnedWearableKinds(email)` | |
| 7 | `linkMarketplacePurchaseToWearables(email, items)` | Map SKUs → unlock |
| 8 | `appendContinuousTick(email, kind)` | Like `syncWearableDevice` sample but `source: "continuous"`; **skip** notification spam (or throttle 1/min) |
| 9 | `clearWearableReadings(email, kind?)` | |
| 10 | `listLatestReadingsByDevice(email)` | `Record<WearableKind, WearableReading \| undefined>` |

**Modify:**

| Function | Change |
|----------|--------|
| `recordCartCheckout` | Accept optional `productId` on items; call `linkMarketplacePurchaseToWearables` |
| `recordWearableReading` | If `deviceId === "smart_scale"` and metric is Weight → `vitalsProfile.weightLb = value` |
| `buildDashboardForEmail` | Include `vitalsProfile` |
| `importWearableUpload` | Soft-cap rows (500); clearer errors |

### 1.4 `src/lib/vitalsBus.ts` (new)

Thin BroadcastChannel wrapper:

- `publishVitalsEvent(event)`
- `subscribeVitalsEvents(handler) => unsubscribe`
- Channel: `sprymd-vitals-v1`

Call publish from store save paths (or only from stream hook — prefer store so uploads fan out too).

### 1.5 Tests

| File | Coverage |
|------|----------|
| `src/lib/patientCareStore.wearables.test.ts` (new) | parse CSV/JSON, unlock map, profile BMI inputs, continuous append without notification flood |

**Exit:** Store APIs usable from Node/jsdom tests; no UI yet beyond merged toolbar.

---

## Phase 2 — Wire marketplace purchase → owned devices

### 2.1 `src/SpryApp.jsx`

| Location | Change |
|----------|--------|
| Cart line items | Ensure `id` / `productId` (`p8`…) survives `addToCart` → checkout |
| Checkout success path calling `recordCartCheckout` | Pass `{ name, qty, price, productId: p.id }` |

Keep marketplace UX; only enrich payload.

### 2.2 Optional: Devices filter deep-link

Dashboard CTA: navigate home app to marketplace with `Devices` filter (existing `Marketplace` `initialFilter`).

**Exit:** Buy `p8` while signed in → refresh dashboard → BP device `owned: true` in toolbar (locked devices hidden or badged “Buy to unlock”).

---

## Phase 3 — Realtime stream controller (browser)

### 3.1 `src/hooks/useWearableStream.ts` (new)

```
inputs: email, wearableDevices, refresh (or record via store)
behavior:
  - On mount / device change: for each owned+enabled+continuous → start interval
  - tick → appendContinuousTick → refresh OR rely on BroadcastChannel + local tick state for snappy UI
  - Pause on document.hidden
  - Single-tab leader optional (document in architecture)
  - Cleanup intervals on unmount / mode change
```

### 3.2 `src/pages/dashboard/DashboardLayout.tsx`

```tsx
// Inside authenticated Provider tree only:
<WearableToolbar />
<WearableStreamHost />  // calls useWearableStream(); renders null
```

Do **not** mount stream host before auth succeeds.

### 3.3 `src/hooks/useDashboardData.ts`

Expose new store methods; on `storage` / bus events from other tabs, `refresh()`.

**Exit:** Toggle Monitor → readings list gains new rows every few seconds without upload.

---

## Phase 4 — Kraken-like multi-panel vitals UI

### 4.1 New components

| File | Responsibility |
|------|----------------|
| `src/components/dashboard/vitals/VitalsBoard.tsx` | Grid of owned-device panels; empty CTA |
| `src/components/dashboard/vitals/VitalsPanel.tsx` | Header (brand/name/status), big number, sparkline, actions |
| `src/components/dashboard/vitals/VitalsSparkline.tsx` | recharts `LineChart` from last N readings for kind |
| `src/components/dashboard/vitals/VitalsBoard.module` or Tailwind only | Prefer existing utility classes; avoid new design system |

Layout sketch (desktop):

```
┌─────────────┬─────────────┬─────────────┐
│ BP Monitor  │ Pulse Ox    │ Smart Scale │
│ 122/78      │ 98% · 72    │ 168.4 lb    │
│ ~sparkline~ │ ~sparkline~ │ ~sparkline~ │
└─────────────┴─────────────┴─────────────┘
│ Management · Goals strip · Height/Weight │
```

Mobile: single column stack; keep toolbar dock + `pb-24` clearance (already on `WearableReadings`).

Optional: `react-resizable-panels` for drag resize — nice-to-have after static grid works.

### 4.2 Page integration

| File | Change |
|------|--------|
| `src/pages/dashboard/HomePage.tsx` | Insert `<VitalsBoard />` above or replacing dense `WearableReadings` list; keep shipments/management |
| `src/components/dashboard/WearableReadings.tsx` | Either fold into board “History” drawer or keep as secondary section (max 8) |
| `src/App.tsx` | Optional route `dashboard/vitals` → same board (deep link); **not required** for MVP |

### 4.3 `src/components/dashboard/CurrentManagement.tsx` / Goals

Light touch only:

- Goals page unchanged for protocols.
- Optional vitals targets row on Home under board (read `vitalsProfile.targetWeightLb`, BP goal copy) — skip if scope creep.

**Exit:** Owned devices show live panels; unowned hidden; continuous updates animate numbers.

---

## Phase 5 — Height / weight management UI

### 5.1 `src/pages/dashboard/ProfilePage.tsx` (or new `VitalsProfileCard.tsx`)

Form fields: height (cm or ft/in toggle), weight (lb), target weight.  
Submit → `updateVitalsProfile` → `refresh()`.

Show computed BMI when both present.

### 5.2 Scale linkage

Already handled in store when weight readings arrive; Profile should re-read `vitalsProfile` after sync/upload.

### 5.3 `src/components/dashboard/DashboardNav.tsx`

No new top-level nav required if vitals live on Home; optional “Vitals” link only if Phase 4 adds route.

**Exit:** User can set height/weight; scale data updates weight; goals/treatments unaffected.

---

## Phase 6 — Polish, safety, docs

| Task | File(s) |
|------|---------|
| Upload size/row limits + user-visible errors | `WearableToolbar.tsx`, parser |
| Label continuous as “Live simulation” in UI | `VitalsPanel`, toolbar |
| Disable continuous when `!owned` | store + toolbar |
| Vitest for parser edge cases | `*.test.ts` |
| Playwright smoke (optional) | login → unlock → upload fixture CSV → assert panel text |
| Update README or `docs/rd` with “how to demo” | this folder |

---

## Phase 7 — Production path (explicitly later)

Do **not** block MVP:

1. Migration: `wearable_devices`, `wearable_readings`, `patient_vitals_profile` + RLS.
2. Dual-write adapter: localStorage → Supabase when session is Auth UUID.
3. Replace `useWearableStream` internals with `SupabaseVitalsTransport` (postgres_changes).
4. Vendor OAuth (Withings / Omron) via Edge Functions.

---

## Concrete implementation sequence (checklist)

Execute in this order to minimize auth risk:

1. Merge wearable toolbar branch; fix conflicts; verify login redirect still works.  
2. Extend types + `patientCareStore` (profile, owned, unlock, `appendContinuousTick`, cart link).  
3. Add unit tests for parser + unlock map.  
4. Pass `productId` through `SpryApp` cart checkout.  
5. Add `vitalsBus` + `useWearableStream`; mount in `DashboardLayout` **after** auth.  
6. Build `VitalsBoard` / `VitalsPanel` / sparkline; place on `HomePage`.  
7. Gate toolbar devices by `owned` (with marketplace CTA).  
8. Profile height/weight form + BMI.  
9. Throttle continuous notifications; visibility pause; multi-tab bus.  
10. Manual QA matrix (below).  
11. (Later) Supabase Realtime transport swap.

---

## QA matrix (auth must stay green)

| Case | Expect |
|------|--------|
| Logged out → `/dashboard` | Redirect `/?auth=1&returnTo=…` |
| Logged in → `/dashboard` | Home + toolbar; no crash if no wearables owned |
| Buy p9 → dashboard | Pulse ox panel appears |
| Upload valid CSV | Rows in history + panel |
| Upload garbage | Error string; no partial corrupt store |
| Monitor on | Ticks while tab visible; pauses when hidden |
| Goals / subscriptions / orders | Unchanged behavior |
| Sign out | Session cleared; dashboard blocked |

---

## Key `patientCareStore` API summary

```ts
// Merge from wearable branch
setWearableSyncMode(email, deviceId, syncMode)
syncWearableDevice(email, deviceId)
recordWearableReading(email, input)
importWearableUpload(email, deviceId, fileName, text)

// Add for vitals MVP
unlockWearableDevice(email, kind, meta?)
setWearableEnabled(email, kind, enabled)
getOwnedWearableKinds(email)
linkMarketplacePurchaseToWearables(email, items)
appendContinuousTick(email, kind)
clearWearableReadings(email, kind?)
listLatestReadingsByDevice(email)
getVitalsProfile(email)
updateVitalsProfile(email, { heightCm?, weightLb?, targetWeightLb? })

// Extend
recordCartCheckout({ email, items: { name, qty, price, productId? }[], total })
buildDashboardForEmail(email) // + vitalsProfile, owned devices
```

---

## File touch map (summary)

| Phase | Create | Modify |
|-------|--------|--------|
| 0 | (from merge) wearables data/UI | layout, home, store, hook, types |
| 1 | `vitalsBus.ts`, store tests | `patientCareStore.ts`, `types/dashboard.ts`, `wearables.ts` |
| 2 | — | `SpryApp.jsx` cart checkout payload |
| 3 | `useWearableStream.ts` | `DashboardLayout.tsx`, `useDashboardData.ts` |
| 4 | `vitals/VitalsBoard.tsx`, `VitalsPanel.tsx`, `VitalsSparkline.tsx` | `HomePage.tsx`, maybe `WearableReadings.tsx` |
| 5 | `VitalsProfileCard.tsx` (optional) | `ProfilePage.tsx` |
| 6 | fixtures CSV under `public/fixtures/` (optional) | toolbar copy, tests |
| 7 | supabase migration | store adapter |

---

## Out of scope for first PR series

- Real Bluetooth / Web Bluetooth device pairing  
- Clinician review queue for vitals  
- Billing for device subscriptions  
- Native HealthKit / Google Fit OAuth  
- Replacing entire Home with a trading-terminal aesthetic (panels should feel dense but stay SpryMD-branded)
