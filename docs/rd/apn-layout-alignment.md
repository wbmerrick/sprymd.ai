# APN Layout Alignment — SpryMD Landing R&D

> **Status:** Practical implementer note (layout + color rules).  
> **Source of truth for tokens:** `src/SpryApp.jsx` (`C.accent` = `#E87722`, `C.navy` = `#003399`).  
> **Reference site:** [apn.com](https://www.apn.com) (All Points North marketing homepage patterns).  
> **Scope:** Marketing `Landing` in `SpryApp.jsx` + plain dashboard labels.

---

## 1. How APN structures the page

### Hero
- [ ] Full-bleed dark photography / atmospheric backdrop (not an inset card).
- [ ] Brand mark present but **headline does the conversion work** (short, imperative, all-caps energy on APN).
- [ ] One supporting sentence under the H1 — plain language, benefit-first.
- [ ] Primary CTA cluster immediately under copy (phone + form / “Get started” equivalents).
- [ ] Trust micro-line or credentials sit **below** the CTA, not as floating badges on media.
- [ ] Keep first viewport lean: brand + headline + one sentence + CTA group (+ optional secondary action). No stats strips, promo chips, or schedule blocks in the hero.

### Sections (rhythm APN uses)
1. **Hero + primary conversion**
2. **Program / path finder** (“Find Your Path” style — choose a care lane)
3. **Proof of place / atmosphere** (gallery or lifestyle visual plane)
4. **Care continuum / levels** (how treatment ladders)
5. **Philosophy / differentiator** (“The APN Way”)
6. **Outcomes / social proof**
7. **Stories / testimonials**
8. **Locations / access**
9. **Closing CTA** (“Need assistance? Let’s talk.” repeated mid-page and at end)

### CTA pattern
- [ ] Primary = solid warm orange fill, white label, high contrast on black.
- [ ] Secondary = outline / ghost on dark (white or light border), never competing orange fill.
- [ ] Mid-page “Need help?” rails repeat the same CTA language — one job per rail.
- [ ] Closing section mirrors hero: brand remount + short line + primary CTA.

### Typography hierarchy (APN → Spry mapping)
| Role | APN feel | Spry implement |
| --- | --- | --- |
| Brand | Compact wordmark in header / hero | `display` · ~22–28px · weight 700 · `Spry` + orange `MD` |
| Eyebrow / kicker | Uppercase, tight tracking, accent color | 12–13px · `letter-spacing: 0.08–0.12em` · `#E87722` |
| H1 | Dominant, short, high contrast white | `clamp(42px, 7vw, 84px)` · weight 700 · line-height ~0.98–1.05 |
| H2 | Section title, slightly softer than H1 | `clamp(34px, 5vw, 52px)` · weight 600–650 |
| H3 / card title | Readable, not competing with H2 | ~24–28px · weight 600 |
| Body | Calm, generous line-height | 16–19px · `#D6D6D6` / `#8F8F8F` for muted |
| Mono labels | Step numbers, tags, rail labels | Uppercase · accent or muted · weight 600–700 |

---

## 2. Map to `Landing` in `SpryApp.jsx`

Current sections (top → bottom) and what should change:

| `#` | Current block | Approx. lines | APN analog | Change checklist |
| --- | --- | --- | --- | --- |
| 1 | **Hero** (brand, kicker, H1, body, CTAs, chat, telemetry rail) | ~740–825 | Hero + conversion | [ ] Trim to **one** primary + **one** secondary CTA (move “My dashboard” out of hero). [ ] Prefer full-bleed photo/atmosphere over dense decorative graphics if competing with brand. [ ] Keep brand-first; do not let H1 overpower `SpryMD`. [ ] Telemetry rail → optional trust rail (credentials / “licensed doctors”) — less “instrument HUD”. |
| 2 | **Brand definition** (“feel spry again”) | ~827–842 | Soft brand moment / mission | [ ] Keep as single-job bridge section. [ ] Shorten if it delays path-finder; max ~py-16–20. |
| 3 | **How it works** `#how` | ~844–870 | Continuum / process | [ ] Keep 3-step grid. [ ] Eyebrow + H2 + orange hairline + one sentence — already APN-aligned. [ ] Avoid adding icons/cards; keep hairline columns. |
| 4 | **What we help with** (domains grid) | ~872–907 | “Find Your Path” lite | [ ] Treat as path-finder preview, not a second catalog. [ ] Consider linking cells into `#landing-conditions`. [ ] Hover wash = orange glow only (`signalDim`), not navy. |
| 5 | **Care options** `#landing-conditions` | ~909–929 | Program cards | [ ] Primary conversion surface after process. [ ] Card hover border = orange; left accent bar already OK. [ ] One section H2; no extra promo chips. |
| 6 | **Your doctor** `#pcp` | ~931–996 | Differentiator / product depth | [ ] Keep split layout (copy + panel). [ ] Pricing panel is fine; avoid stacking a second CTA cluster that duplicates hero. |
| 7 | **Shop** | ~998–1020 | Secondary commerce | [ ] Demote visually vs care CTAs (secondary button language). [ ] Hero-in-section image OK if edge-to-edge inside section, not a floating card collage. |
| 8 | **Close** + `Footer` | ~1022–1045 | Closing CTA | [ ] Mirror APN end-rail: brand remount, one line, primary + secondary. [ ] Orange only on `MD` and primary button. |

### Implementer priority (highest first)
1. [ ] Hero CTA count + hierarchy
2. [ ] Section order / spacing rhythm (below)
3. [ ] Orange vs navy rules applied consistently (no teal leftovers)
4. [ ] Soften “space HUD” chrome where it fights APN calm luxury
5. [ ] Closing CTA parity with hero

---

## 3. Recommended section order & spacing rhythm

### Target order
1. **Hero** — conversion
2. **Brand bridge** — optional, keep short (or fold one line into hero support copy)
3. **How it works** — process
4. **What we help with** — path finder
5. **Care options** — primary catalog / start intake
6. **Your doctor (PCP)** — differentiator + plans
7. **Shop** — secondary
8. **Close CTA**
9. **Footer**

> Do **not** insert stats strips, accreditation marquees, or testimonial carousels into the first viewport. If adding proof later, place after Care options or before Close.

### Spacing rhythm (Tailwind-ish)
| Band | Mobile | Desktop | Notes |
| --- | --- | --- | --- |
| Hero vertical pad | `pt ~110–160px` / `pb ~72–110px` | same clamps | Content-height OK; avoid forcing empty below-fold chrome |
| Bridge / definition | `py-16` | `py-16–20` | Tightest mid-page band |
| Standard section | `py-16–20` | `py-20–28` | How / domains / care / PCP / shop |
| Closing CTA | `py-24` | `py-28–32` | Slightly taller for emphasis |
| Horizontal pad | `px-6` | `px-12` | Content `max-w-7xl` (copy blocks often `max-w-3xl` / `520px`) |
| Section header stack | eyebrow → 14px → H2 → 18–20px → body | | Orange hairline ~80px / 2px under H2 where used |
| Grid gaps | `gap-3–4` cards | `mt-12–14` after headers | Prefer hairline grids over heavy card chrome |

### Alternating grounds
- [ ] Alternate `C.bg` (`#000`) ↔ `C.bgAlt` (`#0C0C0C`) so sections read as bands without borders-as-cards.
- [ ] Single `borderBottom` / hairline dividers OK; do not box every section.

---

## 4. Orange (`#E87722`) vs navy (`#003399`)

### Orange — primary accent (use freely, with restraint)
**Use for:**
- [ ] Primary buttons / filled CTAs
- [ ] Eyebrows, step numbers, active nav (“Dashboard”), focus rings
- [ ] `MD` in wordmark, signal underlines, hairline accents
- [ ] Hover borders / left rails on interactive cards
- [ ] Soft washes: `rgba(232,119,34,0.10–0.16)` (`C.signalDim`)

**Do not use for:**
- [ ] Large filled backgrounds behind long body copy
- [ ] Both buttons in a pair (secondary stays outline/ghost)
- [ ] Decorative glow stacks (one soft wash max per hover)

### Navy — atmospheric only
**Use for:**
- [ ] Ambient gradients (e.g. body `radial-gradient` at top-right, ~0.18 opacity)
- [ ] Rare secondary depth behind photography (subtle, not UI chrome)

**Do not use for:**
- [ ] Buttons, links, eyebrows, icons, focus rings, badges, or chart series
- [ ] Competing with orange as a “second brand accent” in UI controls
- [ ] Text color — keep body/ink white / `#D6D6D6`

### Quick contrast check
- [ ] Orange on black/white: CTAs and labels
- [ ] White on black: headlines
- [ ] Navy: background atmosphere only — if you can select it as a control color, it’s wrong

---

## 5. Dashboard labels (plain)

| Avoid | Prefer |
| --- | --- |
| Biometric / vitals | Body readings / health numbers |
| Clinical terminal | Health desk / dashboard |
| Watchlist / signals | Your devices |
| Action dock / order form | Quick actions |
| Protocols | Care plans |
| Clinician | Doctor |

---

## 6. One-pass implementer checklist

Copy this into the PR:

- [ ] Hero: brand + H1 + 1 sentence + ≤2 CTAs
- [ ] Section order matches §3
- [ ] Spacing uses §3 rhythm (no random `py-32` mid-page except Close)
- [ ] Every section: one eyebrow, one H2, one supporting sentence
- [ ] Primary CTA = `#E87722` fill; secondary = outline
- [ ] Navy never on controls
- [ ] No floating badges / chips on hero media
- [ ] Cards only where the user clicks (care options / products)
- [ ] Closing section remounts brand + CTA like APN end-rail
- [ ] Tokens remain `C.accent` / `C.navy` in `SpryApp.jsx` — no one-off hex drift
- [ ] Dashboard panel titles use everyday words
- [ ] Chat / marketplace copy matches GED-level language

---

## 7. Out of scope (this note)

- Full Kraken panel redesign (see `kraken-pt-dashboard-spec.md`)
- Pixel-perfect APN clone — borrow **structure and restraint**, keep SpryMD product identity
