# SpryMD Landing — APN Layout Alignment (Post-Retheme)

> **Status:** R&D proposal only. No large feature implementation in this doc.  
> **Audience:** Product + design + engineering.  
> **Baseline:** APN homepage (`https://apn.com/`, inspected 2026-09-06) vs SpryMD landing on `cursor/apn-style-simple-copy-54bc` (`src/SpryApp.jsx` → `Landing`).  
> **Already shipped on that branch:** Black / white / warm orange (`#E87722`) tokens, plain-language marketing copy, orange primary CTAs.

---

## 1. Intent

The black/orange retheme brought SpryMD’s **color system and reading level** closer to All Points North. Layout rhythm still differs. APN is a **conversion-funnel homepage**: short hero → path picker → proof → people → FAQ → sticky “talk” CTAs. SpryMD is still a **product catalog homepage**: hero → brand manifesto → steps → domains → protocol cards → PCP → shop → close.

This note maps those structures, documents CTA and voice rules worth keeping, and ranks five small UI tweaks that would deepen alignment without a redesign.

We borrow **structure and clarity**, not clinical/rehab content or luxury-lodge photography.

---

## 2. Section order comparison

### 2.1 APN homepage (observed order)

| # | Section | Job |
| --- | --- | --- |
| 0 | Persistent admissions chrome | Phone + “Get a Call Back” + “Verify Insurance” always reachable |
| 1 | Hero | One urgent headline (“Recovery begins with a call”) + short promise + trust bullets + primary CTAs |
| 2 | News / accreditation strip | Authority signal (Joint Commission, FSPHP, etc.) |
| 3 | **Find Your Path** | Program grid — primary navigation into care |
| 4 | Mid-page “Need assistance? Let’s talk.” | Soft interrupt CTA |
| 5 | Luxury / facility gallery | Emotional proof via place |
| 6 | Payment / insurance options | Friction reducer before depth |
| 7 | Levels of care + specialty tracks | Continuum explanation |
| 8 | Differentiator cards (“World-Class Programs”, “APN Way”, etc.) | Why APN |
| 9 | Outcomes / ACORN proof | Quantitative trust |
| 10 | Testimonials (“Real Stories”) | Social proof |
| 11 | Mid-page “Let’s talk.” again | Soft interrupt CTA |
| 12 | Staff carousel | People / clinical credibility |
| 13 | Quiz promo | Low-friction self-triage |
| 14 | Locations | Geography + telehealth |
| 15 | FAQ | Objection handling |
| 16 | Resources / blog | SEO + education |
| 17 | Final “Talk to an Expert” | Close CTA |

**APN pattern in one line:** Hero → **path picker first** → proof loops → repeated “talk to us” rails → FAQ → close.

### 2.2 SpryMD landing after retheme (`Landing` in `SpryApp.jsx`)

| # | Section | Job |
| --- | --- | --- |
| 1 | Hero (brand + chat) | Brand-first headline, one support line, 3 CTAs, iSpry chat |
| 2 | Hero rail (“Here to help” + telemetry) | Motion / signal atmosphere |
| 3 | Brand definition (“feel spry again”) | Manifesto / dictionary |
| 4 | How it works (3 steps) | Process education |
| 5 | What we help with (6 domains) | Category overview |
| 6 | Care options (protocol cards) | Primary product picker |
| 7 | Your doctor (PCP membership) | Continuity offer |
| 8 | Shop / marketplace | Retail upsell |
| 9 | Close CTA | Final “Get started” |
| 10 | Footer | Legal + nav |

**SpryMD pattern in one line:** Hero → **brand story** → process → domains → **protocol catalog** → PCP → shop → close.

### 2.3 Gap summary

| Layout concern | APN | SpryMD today | Alignment note |
| --- | --- | --- | --- |
| First decision after hero | Path / program grid | Brand manifesto + how-it-works | Move “Choose care” earlier; demote manifesto |
| Repeated mid-page help CTA | “Need assistance? Let’s talk.” every few sections | Only hero + close | Add 1–2 short orange help rails |
| Trust / outcomes block | Accreditation + ACORN metrics | Implicit (“licensed doctor”) | Add one plain-language trust strip |
| Social proof | Long testimonial carousel | None on landing | Optional later; not top-5 unless assets exist |
| Self-triage micro-tool | Mental health quiz promo | iSpry chat in hero | Chat already covers this; tighten copy |
| Sticky / always-on contact | Phone + callback + insurance | None | Spry analog: sticky “Get started” / message doctor |
| Retail section | None on homepage | Marketplace block | Keep (Spry product), but after care path |
| Visual density | Photo-led, fewer instrument graphics | Signal/orbit/scan graphics heavy | Soften chrome so orange CTA + type lead |

---

## 3. CTA patterns (orange primary)

### 3.1 APN CTA system (behavioral)

- **Primary action is always human contact:** Call / Get a Call Back / Talk to an Expert / Get In Touch.
- **Secondary actions reduce risk:** Verify Insurance, take a quiz, Explore Program.
- **Orange (or high-contrast warm) fills the primary button**; secondary is outline / text.
- **CTA verb is concrete and short:** Call Us, Get a Call Back, Explore Program, Talk to an Expert.
- **Same ask repeats** without apology — mid-page and footer — so scrollers never lose the next step.
- **Program cards end with one link each** (“Explore Program”), not three competing buttons.

### 3.2 SpryMD CTA system after retheme

Tokens and `Btn` variants already match the palette:

| Variant | Role | Style |
| --- | --- | --- |
| `primary` / `accent` | Main conversion | Filled `#E87722`, white text, pill radius |
| `secondary` | Alternate path | Transparent + gray border |
| `ghost` | Tertiary | No border until hover |

Current landing CTAs:

| Location | Buttons | Assessment |
| --- | --- | --- |
| Hero | Get started · How it works · My dashboard | **Three peers** — primary diluted; dashboard is an account action, not a prospect CTA |
| PCP | Get my doctor · See care options | Good primary/secondary pair |
| Shop | Browse the shop | Fine as section-local |
| Close | Get started · Browse the shop | Shop as co-equal close competes with care start |

### 3.3 Rules to keep (and tighten)

1. **One orange primary per viewport.** Secondary outline; tertiary text-only or ghost.
2. **Prospect CTAs stay care-first:** “Get started”, “Get my doctor”, “See care options”. Move “My dashboard” to header for signed-in users only.
3. **Repeat a short help rail** once after How it works and once before FAQ/close: orange primary + one calm line (“Questions? Message us — a real person replies.”).
4. **Card CTAs stay singular:** protocol cards already use whole-card click; keep one implied action (“Start this plan”), avoid nested buttons.
5. **Avoid white-on-orange elsewhere** competing with buttons (badges, prices, underlines can use orange; fills reserved for CTAs).

---

## 4. Plain-language voice principles (GED-simple)

APN’s marketing voice is urgent but readable: short sentences, everyday verbs (“call”, “heal”, “find your path”), limited jargon until deeper pages. SpryMD’s retheme already moved this direction (“Feel better. Stay strong.” / “Three simple steps.”). Codify it so later UI work does not slide back into “performance OS” jargon.

### 4.1 Principles

| Principle | Do | Don’t |
| --- | --- | --- |
| Grade ~6–8 reading level | Short words; one idea per sentence | Stacked clauses, Latinate stacks (“utilize”, “optimize outcomes”) |
| Lead with the person’s goal | “Lose weight safely”, “Feel calmer” | Lead with product architecture (“signal domains”, “protocols stack”) |
| Name the human | “A licensed doctor reviews your answers” | “Clinician-titrated pathway”, “telemetry”, “instrument panel” in patient copy |
| Numbers people feel | “Usually within one day”, “from $49/mo” | Vague excellence (“world-class infrastructure”) without a next step |
| One ask | “Get started” | Three equal buttons that force a decision before trust |
| Honest limits | “When approved”, “not for emergencies” | Overclaim cures or speed |
| Internal vs external labels | Keep scan labels (`PCP // LINKED`) in decorative chrome only | Put mono/ops jargon in H1/H2 |

### 4.2 Voice checklist for any new landing string

1. Can someone explain the sentence after one read?
2. Is there a concrete next step nearby?
3. Would removing the brand name still make sense as health help (not tech)?
4. Are there fewer than ~20 words in the support line under an H1/H2?

### 4.3 Footer / residual jargon to clean when convenient

Footer still says “Performance medicine infrastructure” — that fights the GED-simple hero. Prefer: “Online doctor care. Licensed clinicians. Medicine shipped to your door.”

---

## 5. Top 5 next UI tweaks (ranked by impact)

Small changes only — each is a layout/copy/CTA tweak on the existing `Landing`, not a new product surface.

| Rank | Tweak | Why high impact | Scope |
| --- | --- | --- | --- |
| **1** | **Promote “Care options” immediately after the hero** (or after a 1-line trust strip). Demote “Brand definition” below How it works or fold it into the hero support line. | APN’s conversion hinge is early path picking. Spry buries the picker under manifesto + process. Moving the grid up should lift “Get started → intake” without new features. | Reorder sections in `Landing`; optional delete/shorten brand block |
| **2** | **Collapse hero CTAs to 1 primary + 1 secondary** — orange “Get started” + outline “How it works”. Relocate “My dashboard” to the header (signed-in only). | Matches APN’s clear primary ask and stops diluting orange. | `Landing` hero button row + header auth awareness |
| **3** | **Add one mid-page orange help rail** after How it works (and optionally after Care options): short headline + “Get started” / “Message care”. | APN’s “Need assistance? Let’s talk.” interrupts scroll with the same action; Spry only asks at ends. | ~40 lines of section UI; reuse `Btn` |
| **4** | **Insert a compact trust strip** (3 items, checkmarks or plain text): e.g. Licensed doctors · Private & secure · Medicine shipped to your door. Place between hero and Care options. | APN fronts accreditation before depth; Spry currently relies on copy alone. Low design cost, high reassurance. | Thin section; no new assets required |
| **5** | **Make “What we help with” cells clickable** into the matching care option / intake, and drop redundant overlap with Care options *or* turn domains into filters/anchors for the protocol grid. | Today domains are static text while Care options repeat the same ideas as cards — APN’s Find Your Path is one interactive grid, not two. | Wire `go("intake"…)` or scroll-to-card; optional merge |

### 5.1 Explicitly out of scope for this pass

- Full testimonial/staff carousels (needs real patient assets).
- Sticky phone / insurance verification (wrong analog for cash-pay telehealth).
- Removing marketplace (Spry-specific revenue; only deprioritize visually).
- Rewriting the entire graphics system (signal field can stay; just don’t let it outrank CTAs).

---

## 6. Suggested target section order (after tweaks)

1. Hero (brand + one support line + **Get started** / How it works)  
2. Trust strip (3 plain facts)  
3. **Care options** (path picker — primary)  
4. Mid-page help rail (orange)  
5. How it works (3 steps)  
6. Your doctor (PCP)  
7. Shop (kept, shorter)  
8. Close CTA  
9. Footer (plain-language blurb)

Optional later: FAQ teaser, outcomes/trust metrics, stories — only with real content.

---

## 7. Sources

- Live APN site: [apn.com](https://apn.com/), [apn.com/programs](https://apn.com/programs/), [apn.com/locations](https://apn.com/locations/) (fetched 2026-09-06).
- SpryMD retheme branch: `cursor/apn-style-simple-copy-54bc` — commit `7c64957` (`feat: APN-inspired black/orange theme with plain-language copy`), component `Landing` in `src/SpryApp.jsx`.

---

## 8. Decision ask

Approve implementing **tweaks 1–3** as a focused follow-up PR (reorder + CTA collapse + one help rail). Hold 4–5 for the same PR if time allows; otherwise ship 1–3 first and measure scroll-to-intake / CTA clicks.
