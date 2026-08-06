# Bioinformatic Wearables Catalog — SpryMD Marketplace R&D

> **Status:** R&D. Suggested SKUs and price bands for a patient-facing device rack that feeds the Kraken-style PT terminal.  
> **Existing baseline:** `content/footer/stack/devices.md` (Omron BP, Masimo SpO₂, Withings scale) and wearable branch catalog (`bp_monitor`, `pulse_oximeter`, `smart_scale`, `cpap`, `sleep_tracker`).

Prices are **MSRP / street bands as of mid-2026 research** — verify before listing. Prefer HSA/FSA-eligible SKUs where possible. Flag clinical vs wellness devices clearly.

---

## 1. Catalog principles

1. **Clinical-first core** — FDA-cleared or clinician-familiar devices for BP, SpO₂, weight, CGM.  
2. **Recovery / lifestyle tier** — Oura, Whoop, Garmin, Apple Watch, Eight Sleep for engagement and rich time-series.  
3. **Unified metrics** — Every SKU maps to Spry `MetricKey`s used by the terminal chart/ticker.  
4. **SKU shape** — `spry_<brand>_<product>_<variant>` for cart + care store linkage.  
5. **Subscription honesty** — Surface vendor memberships (Oura, Whoop) in product copy so PT cost of ownership is clear.

### Metric keys (canonical)

| Key | Unit | Typical devices |
| --- | --- | --- |
| `hr` | bpm | Watch, ring, band, pulse ox |
| `hrv` | ms (rMSSD or vendor score) | Oura, Whoop, Garmin, Apple |
| `spo2` | % | Pulse ox, Apple Watch, some rings |
| `bp_sys` / `bp_dia` | mmHg | Omron, Withings BPM |
| `weight` | lb or kg | Withings, Garmin Index |
| `body_fat` | % | Withings Body / Body Scan |
| `bmi` | kg/m² (derived) | Scale + height |
| `sleep_score` | 0–100 vendor | Oura, Whoop, Eight, Garmin |
| `sleep_hours` | hr | All sleep trackers |
| `skin_temp_delta` | °C / °F delta | Oura, Whoop |
| `glucose` | mg/dL | Dexcom / CGM |
| `strain` / `recovery` | vendor score | Whoop |
| `steps` / `active_kcal` | count / kcal | Watches |
| `ahi` / `cpap_usage_hr` | events/hr · hr | ResMed / CPAP stack |

---

## 2. Tier A — Clinical home monitoring (must-sell)

Aligns with current Devices merchandising page.

| Brand | Product | Suggested SKU | Price band (USD) | Metrics | Notes |
| --- | --- | --- | --- | --- | --- |
| **Omron** | Platinum / Evolv Bluetooth BP | `spry_omron_bp_bt` | $70–$120 | `bp_sys`, `bp_dia`, `hr` | FDA-cleared; keep as flagship BP |
| **Omron** | Complete (BP + EKG optional) | `spry_omron_complete` | $150–$220 | BP + optional ECG export | Upsell for cardiac protocols |
| **Masimo** | MightSat / fingertip SpO₂ | `spry_masimo_spo2` | $40–$80 | `spo2`, `hr` | Hospital-grade brand trust |
| **Withings** | Body / Body+ scale | `spry_withings_body` | $80–$130 | `weight`, `bmi`, `body_fat` | Current $99 merchandising fit |
| **Withings** | Body Scan / Body Comp | `spry_withings_bodyscan` | $300–$500 | weight, fat, vascular age*, ECG* | Premium metabolic / GLP-1 companion |
| **Withings** | BPM Connect / Core | `spry_withings_bpm` | $100–$180 | `bp_sys`, `bp_dia`, `hr` | Alternate BP if Omron stock constrained |

\*Marketing must distinguish wellness estimates vs diagnostic claims.

---

## 3. Tier B — Continuous / metabolic (high clinical value)

| Brand | Product | Suggested SKU | Price band (USD) | Metrics | Notes |
| --- | --- | --- | --- | --- | --- |
| **Dexcom** | G7 CGM sensor kit | `spry_dexcom_g7_kit` | $150–$250 / sensor period (varies by coverage) | `glucose` (1–5 min) | Rx / pharmacy pathway; stream analog for ticker |
| **Dexcom** | Starter / receiver accessory | `spry_dexcom_g7_start` | $0–$100 | pairs to phone | Often insurance-mediated |
| **Abbott** | FreeStyle Libre 3 | `spry_abbott_libre3` | Similar CGM economics | `glucose` | Alternate CGM SKU |
| **ResMed** | AirSense / CPAP accessories already on stack | `spry_resmed_cpap_*` | existing mask SKUs | `ahi`, `cpap_usage_hr` | Wearable branch already models CPAP |

CGM listings should deep-link to care intake / clinician approval rather than open cart-only purchase when Rx is required.

---

## 4. Tier C — Recovery wearables (engagement + rich charts)

| Brand | Product | Suggested SKU | Price band (USD) | Recurring | Metrics |
| --- | --- | --- | --- | --- | --- |
| **Oura** | Ring 4 (Silver/Black) | `spry_oura_ring4_base` | $349 | Membership ~$6/mo or ~$70/yr | `hr`, `hrv`, `spo2`, `sleep_score`, `sleep_hours`, `skin_temp_delta`, activity |
| **Oura** | Ring 4 (Gold/Ceramic) | `spry_oura_ring4_premium` | $499 | same | same sensors |
| **Whoop** | Whoop 5.0 membership | `spry_whoop_mem_annual` | $0 hardware + ~$239/yr (or ~$30/mo) | Required | `hr`, `hrv`, `strain`, `recovery`, `sleep_*`, skin temp |
| **Garmin** | Venu / Forerunner mid | `spry_garmin_venu3` | $350–$500 | Optional Garmin Connect+ | `hr`, `hrv`, `spo2`, sleep, `steps`, workouts |
| **Garmin** | Index S2 smart scale | `spry_garmin_index_s2` | $150–$200 | — | `weight`, `body_fat`, `bmi` |
| **Apple** | Watch Series (GPS) | `spry_apple_watch_series` | $399–$499 | — | `hr`, `hrv`, `spo2`, ECG, sleep, activity |
| **Apple** | Watch Ultra 2 | `spry_apple_watch_ultra2` | ~$799 | — | Same + rugged / outdoor |
| **Fitbit** | Charge / Sense (Google) | `spry_fitbit_charge` | $100–$250 | Premium optional | HR, sleep, SpO₂ estimates |
| **Ultrahuman** | Ring Air | `spry_ultrahuman_ring_air` | ~$349 | None | Sleep, HR, HRV, temp — no-sub alternative to Oura |

---

## 5. Tier D — Sleep environment (high ASP, strong “terminal” narrative)

| Brand | Product | Suggested SKU | Price band (USD) | Metrics / actuation |
| --- | --- | --- | --- | --- |
| **Eight Sleep** | Pod Cover (Pod 4 class) | `spry_eightsleep_pod4` | ~$2,000–$3,000+ | Sleep stages, HR, HRV proxies; **temperature control** |
| **Eight Sleep** | Hub / membership add-on | `spry_eightsleep_mem` | Vendor plan dependent | Autopilot features |
| **Philips / ResMed** | Sleep masks (existing p5/p6 assets) | existing | existing | Interface for CPAP adherence |

Eight Sleep is a **hero ASP** item for Device Ops layout demos; not required for clinical MVP.

---

## 6. Bundle recommendations (cart packages)

| Bundle | SKUs | Suggested band | Narrative |
| --- | --- | --- | --- |
| **Metabolic Starter** | Omron BP + Withings Body + Masimo SpO₂ | $200–$280 | Matches current Devices page story |
| **GLP-1 Companion** | Withings Body Scan + Omron BP | $370–$600 | Weight + BP trend for titration review |
| **Recovery Stack** | Oura Ring 4 + Whoop *or* Garmin | $350–$750 + subs | Terminal chart richness |
| **Sleep Clinic Home** | Masimo + sleep tracker/CPAP mask + optional Eight | $100–$3,000 | Adherence + SpO₂ overnight story |
| **Glucose Guard** | Dexcom kit + Withings scale | Coverage-dependent | CGM ticker + weight |

---

## 7. Mapping to wearable branch `WearableKind`

Today’s kinds are narrow. Proposed expansion:

| Current `WearableKind` | Expand to / replace with |
| --- | --- |
| `bp_monitor` | keep; brand field Omron \| Withings |
| `pulse_oximeter` | keep; Masimo |
| `smart_scale` | keep; Withings \| Garmin |
| `cpap` | keep |
| `sleep_tracker` | split → `sleep_wearable` \| `sleep_environment` |
| *(new)* `ring` | Oura, Ultrahuman |
| *(new)* `band` | Whoop |
| *(new)* `smartwatch` | Apple, Garmin, Fitbit |
| *(new)* `cgm` | Dexcom, Libre |

Prefer a **catalog id** (`spry_oura_ring4_base`) separate from **kind** so one kind hosts many SKUs.

```ts
// Illustrative — see body-goals-data-model.md for store placement
interface DeviceSku {
  sku: string;
  kind: WearableKind;
  brand: string;
  name: string;
  msrpUsd: [number, number]; // band
  metrics: MetricKey[];
  requiresRx?: boolean;
  vendorSubscription?: { name: string; usdPerMonth?: number; usdPerYear?: number };
  hsaFsaEligible?: boolean;
  imageKey: string;
}
```

---

## 8. Terminal widget affinity

| Catalog tier | Default Signals watchlist | Chart default | Action dock |
| --- | --- | --- | --- |
| Tier A clinical | Always pinned | BP / weight / SpO₂ | Manual + sync |
| Tier B CGM | Pin when paired | Glucose 24h | Upload / vendor sync |
| Tier C recovery | User favorites | HRV / sleep 7d | Stream simulator |
| Tier D Eight | Optional | Sleep score | Deep-link shop |

---

## 9. Merchandising & compliance checklist

- [ ] Label FDA-cleared vs wellness clearly (already started in `devices.md`)  
- [ ] CGM / Rx devices: gate behind account + clinical case, not open cart alone  
- [ ] Disclose Oura / Whoop subscriptions on PDP  
- [ ] HSA/FSA badges only when verified  
- [ ] Image pipeline: extend `src/assets/products/` beyond p8–p10  
- [ ] Avoid implying SpryMD clinically validates vendor recovery scores  

---

## 10. MVP sell list (first 8 SKUs)

Priority for marketplace + terminal demo:

1. `spry_omron_bp_bt` — $89  
2. `spry_masimo_spo2` — $42  
3. `spry_withings_body` — $99  
4. `spry_oura_ring4_base` — $349 (+ membership note)  
5. `spry_whoop_mem_annual` — ~$239/yr  
6. `spry_apple_watch_series` — $399+  
7. `spry_garmin_venu3` — $450 band  
8. `spry_dexcom_g7_kit` — coverage / Rx pathway  

Eight Sleep and Body Scan as phase-2 premium row.

---

## Related

- [`kraken-pt-dashboard-spec.md`](./kraken-pt-dashboard-spec.md)  
- [`body-goals-data-model.md`](./body-goals-data-model.md)  
