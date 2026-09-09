import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, ArrowLeft, Check, ShoppingBag, Scale, Flame, Sparkles, Leaf,
  ShieldCheck, Truck, Stethoscope, Lock, X, Plus, Minus, AlertCircle,
  Heart, Pill, Wind, Activity, Moon, Zap, RefreshCw, User, Clock, FileText,
  Send, Snowflake, Droplets, Brain, UserCheck, Star, LogOut, Package, MapPin,
  Watch, Menu,
} from "lucide-react";
import { footerPages, footerNavToSlug } from "./footerPages";

// Marketplace product photography
import imgMultivitamin from "./assets/products/p1_multivitamin.webp";
import imgOmega3 from "./assets/products/p2_omega3.webp";
import imgMagnesium from "./assets/products/p3_magnesium.webp";
import imgCreatine from "./assets/products/p4_creatine.webp";
import imgNasalPillow from "./assets/products/p5_nasal_pillow.webp";
import imgFullFaceMask from "./assets/products/p6_full_face_mask.webp";
import imgCpapWipes from "./assets/products/p7_cpap_wipes.webp";
import imgBpMonitor from "./assets/products/p8_bp_monitor.webp";
import imgPulseOximeter from "./assets/products/p9_pulse_oximeter.webp";
import imgSmartScale from "./assets/products/p10_smart_scale.webp";
import imgMelatonin from "./assets/products/p11_melatonin.webp";
import imgLTheanine from "./assets/products/p12_ltheanine.webp";
import imgMarketplaceHero from "./assets/products/marketplace-hero.webp";
import imgLifestyleHero from "./assets/tn-lifestyle-hero.png";
import {
  signInCustomer,
  signUpCustomer,
  signOutCustomer,
  restoreCustomerSession,
  updateCustomerProfile,
} from "./lib/customerAccounts";
import {
  recordSubscriptionCheckout,
  recordCartCheckout,
  recordRefillCheckout,
  ensureAccountShell,
} from "./lib/patientCareStore";
import { SignalField, ScanFrame, GridHorizon, ISpryChat } from "./components/graphics";

// ─────────────────────────────────────────────────────────────────────────────
// Brand tokens — elite performance health OS (Starlink precision × peak vitality)
// ─────────────────────────────────────────────────────────────────────────────
// Brand tokens — APN-inspired: black, white, warm orange (#E87722)
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  bg: "#000000",
  bgAlt: "#0C0C0C",
  paper: "#141414",
  ink: "#FFFFFF",
  inkSoft: "#D6D6D6",
  muted: "#8F8F8F",
  primary: "#E87722",
  primaryDark: "#CF6514",
  accent: "#E87722",
  accentSoft: "rgba(232, 119, 34, 0.78)",
  accentDeep: "#B85510",
  signalDim: "rgba(232, 119, 34, 0.16)",
  navy: "#003399",
  line: "#2A2A2A",
  lineSoft: "#1A1A1A",
  ok: "#2FBF7A",
  warn: "#E6A23C",
  destructive: "#E25555",
};

const fonts = {
  display: "'Outfit', 'Helvetica Neue', sans-serif",
  body: "'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  mono: "'DM Sans', 'Helvetica Neue', sans-serif",
};

const FontInjector = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Outfit:wght@400;500;600;700;800&display=swap');
    :root {
      --font-mono: ${fonts.body};
      --spry-accent: ${C.accent};
      --spry-bg: ${C.bg};
      --spry-ink: ${C.ink};
    }
    * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    html, body { background: ${C.bg}; color: ${C.ink}; }
    body {
      font-family: ${fonts.body}; letter-spacing: -0.005em;
      background-image:
        radial-gradient(ellipse 80% 50% at 50% -20%, rgba(232,119,34,0.10), transparent 55%),
        radial-gradient(ellipse 50% 35% at 100% 0%, rgba(20,20,20,0.55), transparent 50%);
      background-attachment: fixed;
    }
    .display { font-family: ${fonts.display}; font-weight: 600; letter-spacing: -0.02em; }
    .mono { font-family: ${fonts.body}; font-weight: 600; letter-spacing: 0.04em; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slideLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
    @keyframes spryRise {
      from { opacity: 0; transform: translateY(18px); filter: blur(4px); }
      to { opacity: 1; transform: translateY(0); filter: blur(0); }
    }
    @keyframes signalDraw { from { transform: scaleX(0); } to { transform: scaleX(1); } }
    @keyframes kenBurns { from { transform: scale(1.04); } to { transform: scale(1); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes orbitSpin { to { transform: rotate(360deg); } }
    @keyframes orbitSpinRev { to { transform: rotate(-360deg); } }
    @keyframes telemetryScroll {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
    @keyframes scanSweep {
      0% { transform: translateY(-40%); opacity: 0; }
      20% { opacity: 1; }
      80% { opacity: 1; }
      100% { transform: translateY(140%); opacity: 0; }
    }
    @keyframes breathGlow {
      0%, 100% { opacity: 0.35; }
      50% { opacity: 0.7; }
    }
    @keyframes hairlineIn {
      from { opacity: 0; transform: scaleX(0.6); }
      to { opacity: 1; transform: scaleX(1); }
    }
    .anim-fadeUp { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .anim-fadeIn { animation: fadeIn 0.4s ease both; }
    .anim-slideRight { animation: slideRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .anim-slideLeft { animation: slideLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .anim-pulse { animation: pulse 2s ease-in-out infinite; }
    .spry-rise { animation: spryRise 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .ken-burns { animation: kenBurns 1.2s cubic-bezier(0.16, 1, 0.3, 1) both; }
    .signal-underline { display: inline-block; position: relative; }
    .signal-underline::after {
      content: ""; position: absolute; left: 0; right: 0; bottom: -2px; height: 1px;
      background: ${C.accent}; transform-origin: left; animation: signalDraw 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    .anim-spin { animation: spin 0.8s linear infinite; }
    .orbit-spin { transform-box: fill-box; transform-origin: center; animation: orbitSpin 48s linear infinite; }
    .orbit-spin-slow { transform-box: fill-box; transform-origin: center; animation: orbitSpin 90s linear infinite; }
    .orbit-spin-rev { transform-box: fill-box; transform-origin: center; animation: orbitSpinRev 64s linear infinite; }
    .telemetry-track { animation: telemetryScroll 28s linear infinite; }
    .scan-line { animation: scanSweep 4.5s ease-in-out infinite; }
    @keyframes earthDrift {
      0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
      50% { transform: translate3d(0, -1.2%, 0) scale(1.025); }
    }
    .earth-distant {
      animation: earthDrift 42s ease-in-out infinite;
      will-change: transform;
      object-fit: cover;
    }
    .grain { position: relative; }
    .grain::after {
      content: ""; position: absolute; inset: 0; pointer-events: none; opacity: 0.04; z-index: 2;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
    }
    .hero-rail {
      border-top: 1px solid ${C.line};
      background: linear-gradient(90deg, rgba(5,5,5,0.92), rgba(11,11,12,0.75));
      backdrop-filter: blur(8px);
    }
    .instrument-panel {
      position: relative;
      isolation: isolate;
      background:
        linear-gradient(160deg, rgba(18,18,20,0.95) 0%, rgba(5,5,5,0.98) 100%);
      border: 1px solid ${C.line};
    }
    .instrument-panel::before {
      content: ""; position: absolute; inset: 0; pointer-events: none; z-index: 0;
      background: radial-gradient(ellipse at 80% 20%, rgba(232,119,34,0.10), transparent 50%);
    }
    @media (prefers-reduced-motion: reduce) {
      .orbit-spin, .orbit-spin-slow, .orbit-spin-rev, .telemetry-track, .scan-line, .breath-glow, .ken-burns, .spry-rise, .earth-distant {
        animation: none !important;
      }
    }
    input:focus, button:focus, select:focus, textarea:focus { outline: none; }
    .focus-ring:focus-visible { box-shadow: 0 0 0 2px ${C.bg}, 0 0 0 4px ${C.accent}; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
// CONDITIONS — Repriced from Empower wholesale to compete with Hims & Ro
// ─────────────────────────────────────────────────────────────────────────────
// Cost-basis examples (Empower wholesale + ship):
//  • Tirzepatide 17/2 mg/mL × 2 mL = $225.84 → ~$133 per 4-wk @ 5 mg/wk
//    + $41 refrig overnight = ~$174 cost → $279 retail = 38% gross
//  • Semaglutide 5/0.5 mg/mL × 2.5 mL = $160.66 → ~$64 per 4 wk @ 1 mg/wk
//    + $41 = ~$105 cost → $199 retail = 47% gross
//  • Tirzepatide ODT 5 mg × 30 = $131.40 + $15 = $146 → $229 retail = 36%
//  • Sildenafil ODT 60 mg × 10 = $23.90 + $15 = $39 → $99 retail = 61%
//  • Tadalafil ODT 6 mg × 30 = $57.00 + $15 = $72 → $99 retail = 27%
//  • Hair Restore MFK 60 mL = $56.84 + $15 = $72 → $89 retail (60-day = $44.50/mo equiv)
// Hims tirzepatide $299 → $499/mo, Ro Body $499/mo. SpryMD beats both.
// ─────────────────────────────────────────────────────────────────────────────
const conditions = {
  weightloss: {
    id: "weightloss", name: "Weight loss",
    tagline: "Lose weight with a real doctor watching your plan.",
    description: "Safe weight-loss medicine chosen for you. A doctor checks your answers, then we ship care to your door.",
    icon: Scale, accent: "#E87722", fromPrice: "149",
    treatments: [
      { id: "tirz-mid", name: "Tirzepatide Injection", sub: "5–10 mg / weekly · titrated", price: 279, chilled: true,
        note: "Dual GIP/GLP-1 agonism. The strongest agent we offer — direct alternative to compounded Mounjaro/Zepbound.",
        compareAt: 499, comparePeer: "Hims & Ro Body", badge: "Most prescribed" },
      { id: "sema-std", name: "Semaglutide Injection", sub: "0.5–1 mg / weekly · titrated", price: 199, chilled: true,
        note: "GLP-1 receptor agonist. The original blockbuster, now compounded for affordability.",
        compareAt: 299, comparePeer: "Hims" },
      { id: "tirz-odt", name: "Tirzepatide ODT", sub: "3–5 mg / daily microdose · oral dissolve", price: 229, chilled: false,
        note: "No needles. No refrigeration. Daily microdose protocol via oral dissolve tablet.", badge: "No-needle" },
      { id: "sema-odt", name: "Semaglutide ODT", sub: "2–5 mg / daily microdose · oral dissolve", price: 179, chilled: false,
        note: "Same active ingredient as the injection, in a once-daily melt-in-mouth format." },
      { id: "tirz-hi", name: "Tirzepatide High-Dose", sub: "10–15 mg / weekly · maintenance", price: 549, chilled: true,
        note: "For patients who have titrated through and need a higher dose for sustained loss." },
      { id: "bella", name: "Bella Metabolic Stack", sub: "Bupropion / Phentermine / Topiramate / Naltrexone / B12 · daily oral", price: 149, chilled: false,
        note: "Five-agent oral compound for patients who can't or won't use injectables. Lower-cost alternative." },
    ],
  },
  ed: {
    id: "ed", name: "Men's sexual health",
    tagline: "Feel confident again — daily or when you need it.",
    description: "Simple treatments for erectile health. Private questions. A doctor reviews your case before anything ships.",
    icon: Flame, accent: "#E87722", fromPrice: "49",
    treatments: [
      { id: "sild-prn", name: "Sildenafil 50mg PRN", sub: "10 doses / month · as needed", price: 69, chilled: false,
        note: "The standard. Onset 30–60 min. Most cost-effective entry.", compareAt: 89, comparePeer: "Hims" },
      { id: "tada-daily", name: "Tadalafil 5mg Daily", sub: "30 doses / month · once daily", price: 79, chilled: false,
        note: "Steady-state. Ready when you are. No timing.", badge: "Most popular" },
      { id: "sild-odt", name: "Sildenafil ODT", sub: "60 mg · 10 doses / month · fast melt", price: 99, chilled: false,
        note: "Oral dissolve. No water needed. Onset ~15 min — half the time of swallowed tablets." },
      { id: "tada-odt", name: "Tadalafil ODT Daily", sub: "6 mg · 30 doses / month · oral dissolve", price: 99, chilled: false,
        note: "Daily ODT for spontaneity without the swallowed pill." },
      { id: "combo", name: "Hard Mint Combo ODT", sub: "Sildenafil 55 + Tadalafil 12.5 mg · 10 doses", price: 119, chilled: false,
        note: "For patients who don't fully respond to monotherapy. Faster onset of sildenafil + duration of tadalafil.",
        badge: "Strongest single-dose" },
      { id: "climax", name: "Climax Combo ODT", sub: "Tadalafil 12 mg + Oxytocin 100 IU · 10 doses", price: 149, chilled: false,
        note: "Premium tier. Adds oxytocin for emotional/sensory enhancement on top of erection support." },
    ],
  },
  hairloss: {
    id: "hairloss", name: "Hair loss",
    tagline: "Slow hair loss and help hair grow back.",
    description: "Proven hair treatments. Pick what fits you. A doctor makes sure it is safe for you.",
    icon: Sparkles, accent: "#E87722", fromPrice: "25",
    treatments: [
      { id: "fin", name: "Finasteride 1mg Oral", sub: "30 tablets / month", price: 25, chilled: false,
        note: "DHT blockade. The gold-standard first-line treatment.", compareAt: 32, comparePeer: "Hims" },
      { id: "fin-min", name: "Finasteride + Oral Minoxidil", sub: "Fin 1mg + Min 2.5mg · daily", price: 49, chilled: false,
        note: "Combines DHT blockade with vasodilation. Two pills become one." },
      { id: "topical-mfk", name: "Hair Restore MFK Topical", sub: "Minoxidil 5% / Fin 0.3% / Ketoconazole 2%", price: 89, chilled: false,
        note: "Three-agent topical. Avoids systemic absorption of finasteride.", badge: "Most popular topical" },
      { id: "topical-extreme", name: "Hair Restore Extreme Topical", sub: "Min 5% / Dut 0.1% / Fin 0.1% / Tret 0.01% / Keto 2%", price: 109, chilled: false,
        note: "Five-in-one. Maximum-strength compound — for patients who've plateaued on simpler regimens." },
      { id: "topical-combo-cap", name: "Biotin / Fin / Min Capsule", sub: "5 / 1.25 / 2.5 mg · daily", price: 79, chilled: false,
        note: "Three actives in one daily oral capsule. Simplest possible regimen." },
    ],
  },
  skincare: {
    id: "skincare", name: "Skin care",
    tagline: "Clearer, healthier-looking skin.",
    description: "Doctor-guided skin treatments for aging, acne, and tone — made for your goals.",
    icon: Leaf, accent: "#E87722", fromPrice: "59",
    treatments: [
      { id: "tret-mild", name: "Tretinoin TAAN Mild", sub: "Tret 0.03% / Azelaic 4% / Niacinamide 4% · 30 g", price: 59, chilled: false,
        note: "Compounded for tolerability. Three-active complex for texture, tone, and brightening.", badge: "Best for first-timers" },
      { id: "tret-strong", name: "Tretinoin TAAN Strong", sub: "Tret 0.045% / Azelaic 4% / Niacinamide 4% · 30 g", price: 69, chilled: false,
        note: "For patients already tolerant to retinoids. Maximum anti-aging strength." },
      { id: "acne-ultra", name: "Acne Ultra Gel", sub: "Clindamycin 1% / Niacinamide 4% / Tretinoin 0.02%", price: 69, chilled: false,
        note: "Three-mechanism acne treatment — antimicrobial + anti-inflammatory + retinoid." },
      { id: "acne-extreme", name: "Acne Extreme Gel", sub: "Clinda / Dapsone / Niacinamide / Tretinoin", price: 79, chilled: false,
        note: "Four-active formula for moderate-severe inflammatory acne." },
      { id: "antiaging-vita", name: "Anti-Aging Vita Gel", sub: "Niacinamide 4% / Tretinoin 0.03% / Vitamin C 5%", price: 79, chilled: false,
        note: "Retinoid + Vitamin C in one stable compound — usually impossible OTC." },
    ],
  },
  lowt: {
    id: "lowt", name: "Low energy & hormones",
    tagline: "Get your energy and drive back.",
    description: "Care for low testosterone and low energy. Labs when needed. A doctor guides every step.",
    icon: Droplets, accent: "#E87722", fromPrice: "99",
    treatments: [
      { id: "t-cyp", name: "Testosterone Cypionate", sub: "100–200 mg / weekly · injectable", price: 149, chilled: false,
        note: "Gold-standard TRT. Clinician-titrated weekly injections with scheduled follow-up labs.", badge: "Most prescribed", compareAt: 199, comparePeer: "Hims" },
      { id: "enclo", name: "Enclomiphene", sub: "12.5–25 mg / daily · oral", price: 129, chilled: false,
        note: "Raises endogenous testosterone while preserving fertility. Ideal if you're not ready for exogenous T.", badge: "Fertility-preserving" },
      { id: "t-cream", name: "Testosterone Cream", sub: "50–100 mg / daily · topical", price: 119, chilled: false,
        note: "Transdermal application. Steady levels without needles. Compounded for absorption." },
      { id: "t-hcg", name: "TRT + HCG Stack", sub: "Testosterone cypionate + HCG · weekly", price: 199, chilled: false,
        note: "Exogenous T with HCG support to maintain testicular function and fertility markers.", badge: "Complete protocol" },
      { id: "t-boost", name: "Low-T Optimization Pack", sub: "Enclomiphene + Anastrozole PRN · monthly", price: 99, chilled: false,
        note: "Entry protocol for borderline levels. Oral only. Includes aromatase control as needed." },
    ],
  },
  mentalhealth: {
    id: "mentalhealth", name: "Mood & focus",
    tagline: "Feel calmer. Think clearer.",
    description: "Private help for anxiety, depression, and stress. A doctor checks in and stays with you.",
    icon: Brain, accent: "#E87722", fromPrice: "35",
    treatments: [
      { id: "sertraline", name: "Sertraline", sub: "25–100 mg / daily · SSRI", price: 39, chilled: false,
        note: "First-line for depression and anxiety. Broad evidence base, flexible titration.", badge: "Most prescribed", compareAt: 55, comparePeer: "Hims" },
      { id: "escitalopram", name: "Escitalopram", sub: "5–20 mg / daily · SSRI", price: 39, chilled: false,
        note: "Cleaner SSRI profile. Often preferred for generalized anxiety with fewer interactions." },
      { id: "bupropion", name: "Bupropion XL", sub: "150–300 mg / daily · NDRI", price: 49, chilled: false,
        note: "Activating antidepressant. Strong fit when energy, focus, or sexual side effects are a concern.", badge: "Energy-forward" },
      { id: "buspirone", name: "Buspirone", sub: "7.5–15 mg / 2–3× daily · anxiolytic", price: 35, chilled: false,
        note: "Non-sedating anxiety treatment. No dependence risk. Pairs well with SSRIs." },
      { id: "fluoxetine", name: "Fluoxetine", sub: "10–40 mg / daily · SSRI", price: 35, chilled: false,
        note: "Long half-life SSRI. Helpful for depression with obsessive features or missed-dose forgiveness." },
    ],
  },
  pcp: {
    id: "pcp", name: "Your doctor",
    tagline: "A doctor you can message any day.",
    description: "Make SpryMD your main doctor for checkups, labs, everyday illness, and follow-up — all online.",
    icon: UserCheck, accent: "#E87722", fromPrice: "49",
    treatments: [
      { id: "pcp-core", name: "Spry Primary Care", sub: "Ongoing PCP membership · messaging + visits", price: 79, chilled: false,
        note: "Your dedicated SpryMD clinician. Annual wellness visit, chronic condition management, referrals, and unlimited secure messaging.", badge: "Most popular", compareAt: 129, comparePeer: "One Medical" },
      { id: "pcp-labs", name: "PCP + Annual Labs", sub: "Membership + comprehensive metabolic panel", price: 99, chilled: false,
        note: "Everything in Primary Care plus annual labs drawn and reviewed — lipids, A1C, CBC, hormone panel as indicated.", badge: "Best value" },
      { id: "pcp-essentials", name: "PCP Essentials", sub: "Messaging + as-needed visits · lighter plan", price: 49, chilled: false,
        note: "Stay connected to a clinician without a full membership load. Ideal if you already have specialists." },
      { id: "pcp-family", name: "Household Primary Care", sub: "Up to 2 adults on one membership", price: 129, chilled: false,
        note: "Shared household membership. Same clinician continuity for you and a partner." },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Mock Empower Rx History — what a logged-in patient sees in Quick Refills
// In production: GET https://api.empowerpharmacy.com/v1/patients/{id}/prescriptions
// Wholesale costs are NEVER exposed client-side; only marginated retail.
// ─────────────────────────────────────────────────────────────────────────────
const mockRxHistory = [
  { rxId: "EMP-294817", name: "Tirzepatide Injection", strength: "8 mg/2 mL · grapeseed oil",
    sig: "Inject 0.25 mL (10 units) subQ once weekly", lastFilled: "Mar 14, 2026", refills: 5, refillsUsed: 1,
    price: 279, chilled: true, category: "Weight Loss", icon: Scale, color: "hsl(150, 55%, 40%)",
    prescriber: "Merrick, William DO", daysSupply: 28 },
  { rxId: "EMP-294112", name: "Tadalafil ODT", strength: "6 mg · oral dissolve",
    sig: "Dissolve one tablet under tongue daily", lastFilled: "Apr 02, 2026", refills: 11, refillsUsed: 0,
    price: 99, chilled: false, category: "Sexual Health", icon: Flame, color: "hsl(220, 60%, 20%)",
    prescriber: "Merrick, William DO", daysSupply: 30 },
  { rxId: "EMP-291003", name: "Hair Restore MFK Topical", strength: "Minoxidil 5% / Fin 0.3% / Ketoconazole 2% · 60 mL",
    sig: "Apply 1 mL to scalp twice daily", lastFilled: "Feb 28, 2026", refills: 5, refillsUsed: 2,
    price: 89, chilled: false, category: "Hair Loss", icon: Sparkles, color: "hsl(220, 60%, 20%)",
    prescriber: "Merrick, William DO", daysSupply: 60 },
  { rxId: "EMP-289445", name: "Tretinoin TAAN Mild Cream", strength: "Tret 0.03% / Azelaic 4% / Niac 4% · 30 g",
    sig: "Apply pea-sized amount nightly", lastFilled: "Mar 22, 2026", refills: 11, refillsUsed: 1,
    price: 59, chilled: false, category: "Dermatology", icon: Leaf, color: "hsl(220, 60%, 20%)",
    prescriber: "Merrick, William DO", daysSupply: 30 },
  { rxId: "EMP-285332", name: "Sildenafil 50mg", strength: "50 mg · 10 tablets",
    sig: "Take one tablet 30–60 min before activity", lastFilled: "Apr 18, 2026", refills: 5, refillsUsed: 0,
    price: 69, chilled: false, category: "Sexual Health", icon: Flame, color: "hsl(220, 60%, 20%)",
    prescriber: "Merrick, William DO", daysSupply: 30 },
  { rxId: "EMP-281109", name: "Methylene Blue Capsule", strength: "10 mg · cognition / mitochondrial support",
    sig: "Take one capsule each morning", lastFilled: "Mar 30, 2026", refills: 2, refillsUsed: 1,
    price: 79, chilled: false, category: "Longevity", icon: Zap, color: "hsl(150, 55%, 40%)",
    prescriber: "Merrick, William DO", daysSupply: 30 },
];

const rxIconFor = (rx) => {
  const cat = (rx?.category || "").toLowerCase();
  if (cat.includes("weight") || cat.includes("metabolic")) return Scale;
  if (cat.includes("sexual")) return Flame;
  if (cat.includes("hair")) return Sparkles;
  if (cat.includes("derm")) return Leaf;
  if (cat.includes("long")) return Zap;
  if (cat.includes("mental") || cat.includes("anx")) return Brain;
  if (cat.includes("testosterone") || cat.includes("hormone")) return Activity;
  return Pill;
};

const hydrateUser = (profile) => {
  if (!profile) return null;
  return {
    ...profile,
    rxHistory: (profile.rxHistory || []).map((rx) => ({ ...rx, icon: rx.icon || rxIconFor(rx) })),
    protocols: profile.protocols || [],
    orders: profile.orders || [],
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Marketplace
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// Marketplace — benefit-led catalog with photography
// ─────────────────────────────────────────────────────────────────────────────
const products = [
  { id: "p1", name: "Daily Multivitamin Complex", brand: "Spry Essentials", cat: "Supplements", price: 32, compareAt: 44, hsa: true, badge: "Bestseller", rating: 4.9, reviews: 1284,
    icon: Pill, image: imgMultivitamin, color: "hsl(150, 55%, 40%)",
    benefit: "Fill the gaps your diet misses",
    desc: "Methylated B-vitamins, vitamin D3/K2, and chelated minerals — one capsule that covers the fundamentals. 30-day supply." },
  { id: "p2", name: "Omega-3 EPA/DHA · 2000mg", brand: "Spry Essentials", cat: "Supplements", price: 28, compareAt: 39, hsa: true, badge: "Clinician pick", rating: 4.8, reviews: 942,
    icon: Pill, image: imgOmega3, color: "hsl(220, 60%, 20%)",
    benefit: "Heart, brain, and joint support",
    desc: "Triglyceride-form fish oil, IFOS-certified for purity. High-potency 2000mg. 60 softgels." },
  { id: "p3", name: "Magnesium Glycinate · 400mg", brand: "Spry Essentials", cat: "Supplements", price: 22, compareAt: 29, hsa: true, badge: null, rating: 4.9, reviews: 2103,
    icon: Moon, image: imgMagnesium, color: "hsl(220, 60%, 20%)",
    benefit: "Sleep deeper. Recover faster.",
    desc: "Highly bioavailable glycinate form — the one clinicians prefer for sleep, recovery, and stress. No GI upset." },
  { id: "p4", name: "Creatine Monohydrate · Micronized", brand: "Spry Performance", cat: "Supplements", price: 26, compareAt: 36, hsa: false, badge: "Top rated", rating: 4.9, reviews: 876,
    icon: Activity, image: imgCreatine, color: "hsl(220, 60%, 20%)",
    benefit: "Strength, power, cognitive edge",
    desc: "Creapure-grade micronized creatine. Unflavored, mixes clean. 90 servings." },
  { id: "p5", name: "ResMed AirFit P10 — Nasal Pillow", brand: "ResMed", cat: "Sleep Apnea", price: 119, compareAt: 149, hsa: true, badge: "Quietest", rating: 4.7, reviews: 534,
    icon: Wind, image: imgNasalPillow, color: "hsl(220, 60%, 20%)",
    benefit: "Barely-there CPAP comfort",
    desc: "The quietest mask on the market. Includes 3 pillow sizes + headgear. Ideal for side sleepers." },
  { id: "p6", name: "Philips DreamWear Full Face", brand: "Philips Respironics", cat: "Sleep Apnea", price: 149, compareAt: 179, hsa: true, badge: null, rating: 4.6, reviews: 311,
    icon: Wind, image: imgFullFaceMask, color: "hsl(220, 60%, 20%)",
    benefit: "Full seal without the bulk",
    desc: "Under-the-nose design with full-face seal for mouth breathers. Freedom to move all night." },
  { id: "p7", name: "CPAP Cleaning Wipes · 110 ct", brand: "Spry Care", cat: "Sleep Apnea", price: 18, compareAt: 24, hsa: true, badge: null, rating: 4.8, reviews: 667,
    icon: Wind, image: imgCpapWipes, color: "hsl(220, 60%, 20%)",
    benefit: "Clean mask. Cleaner sleep.",
    desc: "Unscented, alcohol-free wipes safe for daily mask and tubing cleaning. 110 count." },
  { id: "p8", name: "Smart Blood Pressure Monitor", brand: "Omron", cat: "Devices", price: 89, compareAt: 119, hsa: true, badge: "FDA-cleared", rating: 4.8, reviews: 1450,
    icon: Heart, image: imgBpMonitor, color: "hsl(150, 55%, 40%)",
    benefit: "Accurate readings at home",
    desc: "Bluetooth Omron monitor. Sends readings to your care team." },
  { id: "p9", name: "Pulse Oximeter · Fingertip", brand: "Masimo", cat: "Devices", price: 42, compareAt: 59, hsa: true, badge: null, rating: 4.7, reviews: 803,
    icon: Activity, image: imgPulseOximeter, color: "hsl(150, 55%, 40%)",
    benefit: "Check oxygen anytime",
    desc: "Masimo fingertip accuracy for oxygen and pulse. Compact, travel-ready." },
  { id: "p10", name: "Smart Body Composition Scale", brand: "Withings", cat: "Devices", price: 99, compareAt: 129, hsa: false, badge: "GLP-1 companion", rating: 4.8, reviews: 992,
    icon: Scale, image: imgSmartScale, color: "hsl(220, 60%, 20%)",
    benefit: "Track fat, muscle, and progress",
    desc: "Body fat %, muscle mass, BMI. Syncs to Apple Health & Google Fit — great with weight-loss care." },
  { id: "p11", name: "Melatonin · 5mg Time-Release", brand: "Spry Essentials", cat: "Sleep", price: 16, compareAt: 22, hsa: true, badge: null, rating: 4.6, reviews: 1544,
    icon: Moon, image: imgMelatonin, color: "hsl(220, 60%, 20%)",
    benefit: "Fall asleep. Stay asleep.",
    desc: "Time-release formula for sustained overnight support without morning grogginess." },
  { id: "p12", name: "L-Theanine · 200mg", brand: "Spry Essentials", cat: "Sleep", price: 19, compareAt: 26, hsa: false, badge: "Calm focus", rating: 4.8, reviews: 718,
    icon: Leaf, image: imgLTheanine, color: "hsl(150, 55%, 40%)",
    benefit: "Calm without sedation",
    desc: "Smooth focus for high-stress days. Pairs cleanly with coffee — no crash, no fog." },
  { id: "p13", name: "Oura Ring 4", brand: "Oura", cat: "Devices", price: 349, compareAt: 399, hsa: false, badge: "Top pick", rating: 4.7, reviews: 2104,
    icon: Activity, image: imgMarketplaceHero, color: "hsl(150, 55%, 40%)",
    benefit: "Sleep and recovery on your finger",
    desc: "Nightly body readings. Unlocks live Oura numbers on your SpryMD dashboard. Membership sold separately." },
  { id: "p14", name: "Whoop 5.0 Membership", brand: "Whoop", cat: "Devices", price: 239, compareAt: 269, hsa: false, badge: "Strain + recovery", rating: 4.6, reviews: 1588,
    icon: Activity, image: imgMarketplaceHero, color: "hsl(150, 55%, 40%)",
    benefit: "All-day strain, recovery, and sleep coaching",
    desc: "Yearly kit. Streams recovery and strain into your device list on the dashboard." },
  { id: "p15", name: "Apple Watch Series", brand: "Apple", cat: "Devices", price: 429, compareAt: 499, hsa: false, badge: "Top wearable", rating: 4.8, reviews: 5402,
    icon: Watch, image: imgMarketplaceHero, color: "hsl(220, 60%, 20%)",
    benefit: "Heart, oxygen, and activity your doctor knows",
    desc: "GPS model. Sync or stream heart rate and oxygen into SpryMD for your care plan." },
  { id: "p16", name: "Garmin Venu 3", brand: "Garmin", cat: "Devices", price: 449, compareAt: 499, hsa: false, badge: null, rating: 4.7, reviews: 976,
    icon: Watch, image: imgMarketplaceHero, color: "hsl(220, 60%, 20%)",
    benefit: "Training load with accurate heart rate",
    desc: "Bright sports watch. Unlocks Garmin health panels on your dashboard." },
  { id: "p17", name: "Dexcom G7 CGM Kit", brand: "Dexcom", cat: "Devices", price: 199, compareAt: 249, hsa: true, badge: "Blood sugar", rating: 4.8, reviews: 3210,
    icon: Droplets, image: imgPulseOximeter, color: "hsl(150, 55%, 40%)",
    benefit: "Blood sugar updates every few minutes",
    desc: "Sensor starter kit for continuous glucose. A prescription may be needed — streams to your dashboard when unlocked." },
];

const productCategories = ["All", "Supplements", "Sleep Apnea", "Devices", "Sleep"];

const conditionGraphics = {
  weightloss: imgMarketplaceHero,
  ed: imgMarketplaceHero,
  hairloss: imgMarketplaceHero,
  skincare: imgMarketplaceHero,
  lowt: imgMarketplaceHero,
  mentalhealth: imgMarketplaceHero,
  pcp: imgMarketplaceHero,
};

// ─────────────────────────────────────────────────────────────────────────────
// Intake schemas
// ─────────────────────────────────────────────────────────────────────────────
const intakes = {
  weightloss: [
    { key: "height_weight", type: "compound", title: "Tell us your height and weight.", sub: "We'll use this to calculate your BMI and dosing.",
      fields: [
        { key: "feet", label: "Feet", type: "number", placeholder: "5" },
        { key: "inches", label: "Inches", type: "number", placeholder: "10" },
        { key: "weight", label: "Weight (lbs)", type: "number", placeholder: "210" },
      ] },
    { key: "goal", type: "single", title: "What's your goal?", options: ["Lose 10–25 lbs", "Lose 25–50 lbs", "Lose 50–100 lbs", "Lose 100+ lbs", "Maintain after weight loss"] },
    { key: "diabetes", type: "single", title: "Have you been diagnosed with type 2 diabetes?", options: ["Yes", "No", "Pre-diabetes / borderline A1C"] },
    { key: "thyroid_history", type: "multi", title: "Do any of these apply to you or close family?", sub: "Required safety screening for GLP-1 therapy.",
      options: ["Medullary thyroid carcinoma (MTC)", "Multiple endocrine neoplasia type 2 (MEN-2)", "History of pancreatitis", "Active gallbladder disease", "None of the above"],
      disqualify: ["Medullary thyroid carcinoma (MTC)", "Multiple endocrine neoplasia type 2 (MEN-2)"] },
    { key: "previous", type: "single", title: "Have you tried weight loss medication before?", options: ["Never", "Yes — GLP-1 (semaglutide / tirzepatide)", "Yes — phentermine or other", "Yes — multiple"] },
    { key: "preference", type: "single", title: "Injection or oral?", options: ["Injection — strongest results", "Oral / dissolvable — no needles", "Open to either, recommend for me"] },
  ],
  ed: [
    { key: "age", type: "single", title: "What's your age range?", options: ["18–29", "30–39", "40–49", "50–59", "60–69", "70+"] },
    { key: "frequency", type: "single", title: "How often does ED occur?", options: ["Almost every time", "Most of the time", "Sometimes", "Rarely"] },
    { key: "onset", type: "single", title: "When did you first notice it?", options: ["Within the last 6 months", "6–24 months ago", "More than 2 years ago"] },
    { key: "cardiac", type: "multi", title: "Do any of these apply?", sub: "PDE5 inhibitors require cardiovascular screening.",
      options: ["Heart attack within the last 6 months", "Stroke within the last 6 months", "Currently taking nitrates (nitroglycerin, isosorbide)", "Currently taking riociguat", "Severe heart failure", "None of the above"],
      disqualify: ["Currently taking nitrates (nitroglycerin, isosorbide)", "Currently taking riociguat", "Heart attack within the last 6 months", "Stroke within the last 6 months"] },
    { key: "bp", type: "single", title: "Is your blood pressure controlled?", options: ["Yes, normal or controlled on meds", "Borderline / unsure", "No, uncontrolled", "I don't know my BP"] },
    { key: "preference", type: "single", title: "How would you prefer to take it?", options: ["As needed, before activity", "Daily — I want to be ready anytime", "Fast-melt ODT — no swallowing", "Not sure — recommend for me"] },
  ],
  hairloss: [
    { key: "pattern", type: "single", title: "Where are you losing hair?", options: ["Receding hairline (temples)", "Thinning crown", "Both hairline and crown", "Diffuse thinning all over", "Just monitoring early signs"] },
    { key: "duration", type: "single", title: "How long has this been happening?", options: ["Less than 1 year", "1–3 years", "3–5 years", "More than 5 years"] },
    { key: "family", type: "single", title: "Family history of hair loss?", options: ["Yes — father's side", "Yes — mother's side", "Yes — both sides", "No"] },
    { key: "tried", type: "multi", title: "What have you tried?", options: ["Topical minoxidil (Rogaine)", "Oral finasteride", "Topical finasteride", "Hair vitamins / biotin", "Nothing yet"] },
    { key: "concerns", type: "single", title: "Concerns about side effects?", options: ["No concerns", "Worried about sexual side effects", "Worried about systemic effects", "Tell me more"] },
  ],
  skincare: [
    { key: "concern", type: "single", title: "What's the primary concern?", options: ["Fine lines, texture, anti-aging", "Active acne or breakouts", "Dark spots / hyperpigmentation", "Dullness, uneven tone", "All of the above"] },
    { key: "skintype", type: "single", title: "Skin type?", options: ["Oily", "Dry", "Combination", "Sensitive", "Not sure"] },
    { key: "routine", type: "single", title: "How would you describe your current routine?", options: ["Just soap and water", "Cleanser + moisturizer", "Already use actives (retinol, AHAs)", "Inconsistent"] },
    { key: "sensitivity", type: "single", title: "Have you used tretinoin or retinol before?", options: ["Yes — tolerated well", "Yes — irritated my skin", "No, never", "Not sure"] },
    { key: "sun", type: "single", title: "Daily sunscreen use?", options: ["Every day", "Most days", "Sometimes", "Rarely"] },
  ],
  lowt: [
    { key: "symptoms", type: "multi", title: "Which symptoms are you experiencing?", sub: "Select all that apply.",
      options: ["Low energy / fatigue", "Reduced libido", "Difficulty building muscle", "Brain fog / poor focus", "Mood changes / irritability", "Weight gain around the midsection", "None of the above"] },
    { key: "labs", type: "single", title: "Have you had testosterone labs in the last 12 months?", options: ["Yes — confirmed low T", "Yes — borderline / low-normal", "Yes — but I don't remember the number", "No — I need labs ordered"] },
    { key: "age", type: "single", title: "What's your age range?", options: ["18–29", "30–39", "40–49", "50–59", "60–69", "70+"] },
    { key: "fertility", type: "single", title: "Is preserving fertility important right now?", options: ["Yes — planning children", "Maybe in the next few years", "No — not a concern"] },
    { key: "prostate", type: "multi", title: "Do any of these apply?", sub: "Required safety screening for testosterone therapy.",
      options: ["History of prostate cancer", "Active untreated sleep apnea", "Hematocrit above 54%", "Breast cancer history", "I'm not sure I want a full endocrine panel ran to check all of my hormone levels and any other tests that may be relevant to how my hormone functions.", "None of the above"],
      disqualify: ["History of prostate cancer", "Breast cancer history", "Hematocrit above 54%"] },
    { key: "preference", type: "single", title: "How would you prefer to treat?", options: ["Weekly injection — most effective", "Daily oral — no needles", "Topical cream", "Not sure — recommend for me"] },
  ],
  mentalhealth: [
    { key: "primary", type: "single", title: "What's your primary concern?", options: ["Anxiety / worry", "Depression / low mood", "Both anxiety and depression", "Stress and burnout", "Not sure — I just don't feel like myself"] },
    { key: "duration", type: "single", title: "How long have you been feeling this way?", options: ["Less than 2 weeks", "2 weeks – 3 months", "3–12 months", "More than a year"] },
    { key: "severity", type: "single", title: "How much is this affecting daily life?", options: ["Mild — manageable but annoying", "Moderate — interfering with work or relationships", "Significant — hard to function most days"] },
    { key: "tried", type: "multi", title: "What have you tried before?",
      options: ["Talk therapy / counseling", "SSRI or SNRI medication", "Bupropion or Wellbutrin", "Benzodiazepines (Xanax, Ativan)", "Nothing yet", "Other / herbal supplements"] },
    { key: "crisis", type: "multi", title: "Safety check — do any of these apply right now?", sub: "We take this seriously. Honest answers help us care for you safely.",
      options: ["Thoughts of harming yourself", "Plan or intent to act on those thoughts", "Recent psychiatric hospitalization", "None of the above"],
      disqualify: ["Thoughts of harming yourself", "Plan or intent to act on those thoughts", "Recent psychiatric hospitalization"] },
    { key: "preference", type: "single", title: "What matters most in a medication?", options: ["Proven for anxiety", "Proven for depression", "Less sexual side effects / more energy", "Something gentle to start", "Not sure — recommend for me"] },
  ],
  pcp: [
    { key: "reason", type: "single", title: "Why are you looking for a new primary care doctor?", options: ["I don't currently have a PCP", "My current doctor is hard to reach", "I want everything in one digital place", "I need help coordinating specialists", "Moving / changing insurance"] },
    { key: "needs", type: "multi", title: "What do you need from your PCP?",
      options: ["Annual wellness visits", "Lab ordering and review", "Chronic condition management", "Referrals to specialists", "Same-day messaging for acute issues", "Prescription renewals"] },
    { key: "conditions", type: "multi", title: "Any ongoing conditions we should know about?",
      options: ["High blood pressure", "High cholesterol", "Diabetes / prediabetes", "Thyroid disorder", "Asthma / allergies", "None of the above"] },
    { key: "household", type: "single", title: "Who needs coverage?", options: ["Just me", "Me and a partner", "Not sure yet"] },
    { key: "preference", type: "single", title: "Which membership fits best?", options: ["Full primary care — visits + messaging", "Primary care with annual labs included", "Lighter plan — messaging when I need it", "Household plan for two adults", "Not sure — recommend for me"] },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Atoms
// ─────────────────────────────────────────────────────────────────────────────
const Btn = ({ children, onClick, variant = "primary", size = "md", className = "", disabled, type, icon: Icon }) => {
  const sizes = { sm: { padding: "8px 16px", fontSize: 13 }, md: { padding: "14px 22px", fontSize: 14 }, lg: { padding: "18px 32px", fontSize: 15 } };
  const variants = {
    primary: { background: C.accent, color: "#FFFFFF", border: `1px solid ${C.accent}` },
    secondary: { background: "transparent", color: C.ink, border: `1px solid ${C.line}` },
    accent: { background: C.accent, color: "#FFFFFF", border: `1px solid ${C.accent}` },
    ghost: { background: "transparent", color: C.ink, border: `1px solid transparent` },
    dark: { background: C.ink, color: C.bg, border: `1px solid ${C.ink}` },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`focus-ring inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 ${className}`}
      style={{ ...sizes[size], ...variants[variant], borderRadius: 8, opacity: disabled ? 0.4 : 1, cursor: disabled ? "not-allowed" : "pointer", letterSpacing: "0.01em" }}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === "primary") e.currentTarget.style.background = C.accentDeep;
        if (variant === "secondary") e.currentTarget.style.background = C.bgAlt;
        if (variant === "accent") e.currentTarget.style.background = C.accentDeep;
        if (variant === "ghost") e.currentTarget.style.background = C.bgAlt;
        if (variant === "dark") e.currentTarget.style.background = "#E8E8E8";
      }}
      onMouseLeave={(e) => { e.currentTarget.style.background = variants[variant].background; }}>
      {children}
      {Icon && <Icon size={16} strokeWidth={1.75} />}
    </button>
  );
};

const Mark = ({ children }) => (
  <span className="display signal-underline" style={{ color: C.ink, fontWeight: 600 }}>{children}</span>
);

const Tag = ({ children, color, fg }) => (
  <span className="mono" style={{
    fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 999,
    background: color || C.bgAlt, color: fg || C.ink, border: color ? "none" : `1px solid ${C.line}`,
    fontWeight: 500, whiteSpace: "nowrap",
  }}>{children}</span>
);

const Logo = ({ color = C.ink, size = 22 }) => (
  <div className="flex items-center gap-2.5">
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" stroke={color} strokeWidth="1.5" />
      <path d="M10 20c0-3 2.5-5.5 5.5-5.5h1c3 0 5.5-2.5 5.5-5.5" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="16" r="2" fill={C.accent} />
    </svg>
    <span className="display" style={{ fontSize: size * 0.95, fontWeight: 600, color, letterSpacing: "-0.03em" }}>
      Spry<span style={{ fontWeight: 500, opacity: 0.55 }}>MD</span>
    </span>
  </div>
);

const inputStyle = { background: C.bgAlt, border: `1px solid ${C.line}`, borderRadius: 12, fontSize: 15, color: C.ink, fontFamily: fonts.body };

const Field = ({ label, children }) => (
  <div>
    <label className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", color: C.muted, textTransform: "uppercase", display: "block", marginBottom: 8, fontWeight: 500 }}>{label}</label>
    {children}
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between">
    <span style={{ fontSize: 13, color: C.inkSoft }}>{label}</span>
    <span style={{ fontSize: 13, color: C.ink, fontWeight: 500 }}>{value}</span>
  </div>
);

const TN_DELIVERY = {
  cutoff: "2:00 p.m. Central Time",
  eligibleDays: "Monday–Thursday",
  title: "Tennessee Next-Day Delivery",
  heroShort: "Eligible Tennessee orders: next-business-day delivery.",
  full: "Complete your visit by 2:00 p.m. Central Time on an eligible weekday (Monday–Thursday) and, once your prescription is approved and filled, qualifying Tennessee orders ship for next-business-day delivery. Availability varies by medication, location, pharmacy, weather, and carrier service.",
};

const DeliveryBar = ({ onClick }) => {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`w-full px-4 md:px-12 py-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 ${onClick ? "focus-ring" : ""}`}
      style={{ background: C.paper, borderBottom: `1px solid ${C.line}`, color: C.ink, cursor: onClick ? "pointer" : "default" }}
    >
      <span className="inline-flex items-center gap-2">
        <Truck size={14} color={C.accent} strokeWidth={2} />
        <span className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: C.accent, fontWeight: 700 }}>
          {TN_DELIVERY.title}
        </span>
      </span>
      <span style={{ fontSize: 12, color: C.inkSoft }}>
        After clinician approval, for eligible orders
      </span>
    </Tag>
  );
};

const DeliveryHeroNote = () => (
  <div className="inline-flex items-start gap-2" style={{ maxWidth: 280 }}>
    <Truck size={16} color={C.accent} strokeWidth={2} className="flex-shrink-0" style={{ marginTop: 2 }} />
    <span style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.4 }}>{TN_DELIVERY.heroShort}</span>
  </div>
);

const DeliveryDetailsCard = () => (
  <div id="tn-delivery" className="rounded-2xl p-5 md:p-6" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
    <div className="flex items-center gap-2 mb-3">
      <Truck size={16} color={C.accent} strokeWidth={2} />
      <span className="mono" style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: C.accent, fontWeight: 700 }}>
        {TN_DELIVERY.title}
      </span>
    </div>
    <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.6 }}>{TN_DELIVERY.full}</p>
    <ul className="mt-4 space-y-2">
      {[
        `Visit completed by ${TN_DELIVERY.cutoff} on ${TN_DELIVERY.eligibleDays}`,
        "Prescription approved and filled by the pharmacy",
        "Tennessee shipping address on an eligible medication",
        "Carrier, weather, and controlled-substance rules can change timing",
      ].map((item) => (
        <li key={item} className="flex items-start gap-2">
          <Check size={14} color={C.accent} strokeWidth={2} className="flex-shrink-0" style={{ marginTop: 3 }} />
          <span style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.45 }}>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────────────
const Header = ({ go, cartCount, dark, user }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const fg = dark ? C.paper : C.ink;
  const navItems = [
    { label: "How it works", view: "how" },
    { label: "Care options", view: "landing-conditions" },
    { label: "Shop", view: "marketplace" },
    { label: "Refills", view: "refills" },
    ...(user ? [{ label: "Dashboard", view: "dashboard" }] : []),
  ];
  const goNav = (view) => {
    setMenuOpen(false);
    if (view === "signin") go("signin", { returnTo: "dashboard" });
    else go(view);
  };
  return (
    <header className="relative w-full px-6 md:px-12 py-5"
      style={{ borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.12)" : C.lineSoft}` }}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="focus-ring md:hidden rounded p-2"
            style={{ background: dark ? "rgba(255,255,255,0.08)" : C.bgAlt, color: fg }}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={18} strokeWidth={1.75} /> : <Menu size={18} strokeWidth={1.75} />}
          </button>
          <button onClick={() => goNav("landing")} className="focus-ring rounded"><Logo color={fg} /></button>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button key={item.label} onClick={() => goNav(item.view)}
              className="focus-ring rounded text-sm transition-opacity hover:opacity-60"
              style={{
                color: item.view === "dashboard" ? C.accent : fg,
                fontWeight: item.view === "dashboard" ? 600 : 500,
              }}>{item.label}</button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={() => goNav(user ? "dashboard" : "signin")}
            className="focus-ring inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-colors"
            style={{
              background: user ? C.accent : (dark ? "rgba(255,255,255,0.08)" : C.bgAlt),
              color: user ? "#FFFFFF" : fg,
            }}
            aria-label={user ? "Open patient dashboard" : "Sign in to dashboard"}>
            <User size={18} strokeWidth={1.75} color={user ? "#FFFFFF" : fg} />
            <span className="hidden sm:inline" style={{ fontSize: 13, fontWeight: 600, color: user ? "#FFFFFF" : fg }}>
              {user ? "Dashboard" : "Sign in"}
            </span>
          </button>
          <button onClick={() => goNav("marketplace")} className="focus-ring relative rounded-lg p-2 transition-colors"
            style={{ background: dark ? "rgba(255,255,255,0.08)" : C.bgAlt }}>
            <ShoppingBag size={18} strokeWidth={1.75} color={fg} />
            {cartCount > 0 && (
              <span className="mono absolute -top-1 -right-1 flex items-center justify-center"
                style={{ background: C.accent, color: "#fff", fontSize: 10, width: 18, height: 18, borderRadius: 999, fontWeight: 600 }}>{cartCount}</span>
            )}
          </button>
        </div>
      </div>
      {menuOpen ? (
        <nav
          id="mobile-nav"
          className="md:hidden mt-4 flex flex-col gap-1 rounded-lg p-2"
          style={{ background: dark ? "rgba(255,255,255,0.06)" : C.paper, border: `1px solid ${C.line}` }}
        >
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => goNav(item.view)}
              className="focus-ring rounded-md px-3 py-3 text-left text-sm font-medium"
              style={{ color: item.view === "dashboard" ? C.accent : fg }}
            >
              {item.label}
            </button>
          ))}
          {!user ? (
            <button
              type="button"
              onClick={() => goNav("signin")}
              className="focus-ring rounded-md px-3 py-3 text-left text-sm font-semibold"
              style={{ color: C.accent }}
            >
              Sign in
            </button>
          ) : null}
        </nav>
      ) : null}
    </header>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Quick Refills CTA — pulsing accent button
// ─────────────────────────────────────────────────────────────────────────────
const QuickRefillsCTA = ({ onClick, variant = "hero" }) => {
  if (variant === "compact") {
    return (
      <button onClick={onClick}
        className="focus-ring inline-flex items-center gap-3 px-5 py-3 rounded-full transition-all hover:translate-y-[-1px]"
        style={{ background: "transparent", color: C.ink, border: `1px solid ${C.line}`, fontSize: 14, fontWeight: 600, letterSpacing: "0.02em" }}>
        <RefreshCw size={16} strokeWidth={2} color={C.accent} />Refills
      </button>
    );
  }
  return (
    <button onClick={onClick}
      className="focus-ring group inline-flex items-center gap-3 px-7 py-4 rounded-full transition-all hover:translate-y-[-1px]"
      style={{ background: C.paper, color: C.ink, fontSize: 15, fontWeight: 600, letterSpacing: "0.02em", border: `1px solid ${C.line}` }}>
      <RefreshCw size={18} strokeWidth={2} color={C.accent} />
      Quick refills
      <ArrowRight size={16} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" />
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Landing — elite performance health OS
// ─────────────────────────────────────────────────────────────────────────────
const Landing = ({ go }) => (
  <div className="anim-fadeIn relative">
    <ISpryChat onAction={() => go("landing-conditions")} forceDocked />

    <section className="grain relative z-10 overflow-hidden" style={{ background: C.bg }}>
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <SignalField density={28} interactive={false} />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-14 md:py-20">
        <div className="grid gap-10 lg:gap-14 items-center md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <p
              className="spry-rise"
              style={{
                fontSize: 13,
                letterSpacing: "0.1em",
                color: C.accent,
                textTransform: "uppercase",
                fontWeight: 700,
                marginBottom: 16,
              }}
            >
              Modern medicine, made for men
            </p>
            <h1
              className="spry-rise display"
              style={{
                animationDelay: "0.06s",
                fontSize: "clamp(40px, 6.4vw, 72px)",
                lineHeight: 0.98,
                fontWeight: 700,
                color: C.ink,
                maxWidth: 620,
                marginBottom: 20,
              }}
            >
              Men’s telehealth, built for <span className="signal-underline">Tennessee</span>.
            </h1>
            <p
              className="spry-rise"
              style={{
                animationDelay: "0.12s",
                fontSize: "clamp(16px, 2vw, 19px)",
                lineHeight: 1.55,
                color: C.inkSoft,
                maxWidth: 480,
                marginBottom: 28,
              }}
            >
              Licensed doctors. Private visits. Treatment that ships to your door when it’s clinically appropriate.
            </p>
            <div className="spry-rise flex flex-wrap items-center gap-4" style={{ animationDelay: "0.2s" }}>
              <Btn onClick={() => go("landing-conditions")} size="lg" icon={ArrowRight}>Start your confidential visit</Btn>
              <DeliveryHeroNote />
            </div>
            <div className="spry-rise flex flex-wrap gap-x-5 gap-y-2 mt-6" style={{ animationDelay: "0.28s" }}>
              {["Licensed clinical care", "Private & discreet", "No waiting rooms"].map((item) => (
                <div key={item} className="inline-flex items-center gap-2">
                  <Check size={14} color={C.accent} strokeWidth={2.25} />
                  <span style={{ fontSize: 14, color: C.inkSoft, fontWeight: 500 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl" style={{ border: `1px solid ${C.line}`, height: "min(520px, 78vw)" }}>
            <img
              src={imgLifestyleHero}
              alt="A man on a Tennessee porch at golden hour — confident, at home, not in a clinic"
              className="absolute inset-0 w-full h-full object-cover ken-burns"
              style={{ objectPosition: "center 28%" }}
            />
            <div className="absolute inset-x-0 bottom-0 p-5 md:p-6" style={{ background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.88) 55%)" }}>
              <p style={{ fontSize: 15, color: "#fff", lineHeight: 1.45, maxWidth: 420 }}>
                “I started after work in Nashville. A real doctor reviewed my case — no waiting room.”
              </p>
              <p className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: C.accent, marginTop: 8, fontWeight: 700 }}>
                Marcus · Nashville, TN
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="how" className="px-6 md:px-12 py-14 md:py-16" style={{ background: C.bgAlt, borderTop: `1px solid ${C.line}` }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <span style={{ fontSize: 12, letterSpacing: "0.12em", color: C.accent, textTransform: "uppercase", fontWeight: 700 }}>How it works</span>
            <h2 className="display" style={{ fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1.1, marginTop: 10, color: C.ink, fontWeight: 650 }}>
              Choose care → clinician review → treatment shipped.
            </h2>
          </div>
          <p style={{ fontSize: 15, color: C.inkSoft, maxWidth: 320, lineHeight: 1.5 }}>
            Three steps. No waiting room. A licensed clinician still has to approve every prescription.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { n: "01", t: "Choose care", d: "Pick a visit and answer a short, private intake." },
            { n: "02", t: "Clinician review", d: "A licensed doctor reviews your case before anything ships." },
            { n: "03", t: "Treatment shipped", d: "If approved and filled, qualifying Tennessee orders can move next business day." },
          ].map((s) => (
            <div key={s.n} className="p-5 md:p-6 rounded-2xl" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
              <div className="mono" style={{ fontSize: 11, letterSpacing: "0.12em", color: C.accent, fontWeight: 700 }}>{s.n}</div>
              <h3 className="display" style={{ fontSize: 22, fontWeight: 600, marginTop: 10, color: C.ink }}>{s.t}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.5, color: C.inkSoft, marginTop: 8 }}>{s.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <DeliveryDetailsCard />
        </div>
      </div>
    </section>

    <section className="px-6 md:px-12 py-14 md:py-20" style={{ background: C.bg }}>
      <div className="max-w-7xl mx-auto">
        <span style={{ fontSize: 12, letterSpacing: "0.12em", color: C.accent, textTransform: "uppercase", fontWeight: 700 }}>Social proof</span>
        <h2 className="display" style={{ fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1.1, marginTop: 10, marginBottom: 28, color: C.ink, fontWeight: 650 }}>
          Built here. Reviewed by a real physician.
        </h2>
        <div className="grid md:grid-cols-3 gap-3 mb-6">
          {[
            { q: "Private, straightforward, and a doctor actually reviewed my case. That’s what I wanted.", a: "Daniel · Knoxville, TN" },
            { q: "Finished the visit after work. No waiting room, no awkward small talk.", a: "Marcus · Nashville, TN" },
            { q: "Packaging was discreet and messaging the care team was easy. Felt local, not like a national mill.", a: "James · Memphis, TN" },
          ].map((r) => (
            <div key={r.a} className="p-5 md:p-6 rounded-2xl" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
              <div className="flex gap-1 mb-3">
                {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={13} color={C.accent} fill={C.accent} />)}
              </div>
              <p style={{ fontSize: 15, color: C.ink, lineHeight: 1.5 }}>“{r.q}”</p>
              <p className="mono" style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginTop: 14, fontWeight: 600 }}>{r.a}</p>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="p-6 rounded-2xl" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full flex items-center justify-center" style={{ width: 44, height: 44, background: C.signalDim, border: `1px solid ${C.line}` }}>
                <Stethoscope size={20} color={C.accent} />
              </div>
              <div>
                <div className="display" style={{ fontSize: 20, fontWeight: 600, color: C.ink }}>William Merrick, DO</div>
                <div style={{ fontSize: 13, color: C.inkSoft }}>Board-certified osteopathic internal medicine</div>
              </div>
            </div>
            <div className="space-y-2 mb-5">
              {["Licensed in Tennessee", "10+ years of clinical experience", "Hospital, clinic, and telehealth practice"].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Check size={14} color={C.accent} />
                  <span style={{ fontSize: 14, color: C.inkSoft }}>{item}</span>
                </div>
              ))}
            </div>
            <Btn onClick={() => go("page", { slug: "clinicians" })} size="md" variant="secondary" icon={ArrowRight}>Physician credentials</Btn>
          </div>
          <div className="p-6 rounded-2xl" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full flex items-center justify-center" style={{ width: 44, height: 44, background: C.signalDim, border: `1px solid ${C.line}` }}>
                <MapPin size={20} color={C.accent} />
              </div>
              <div>
                <div className="display" style={{ fontSize: 20, fontWeight: 600, color: C.ink }}>Tennessee service area</div>
                <div style={{ fontSize: 13, color: C.inkSoft }}>We currently care for patients located in Tennessee</div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.55, marginBottom: 18 }}>
              Questions about your visit, shipping, or account? Email <strong style={{ color: C.ink }}>support@sprymd.ai</strong> — we aim to reply within one business day. For emergencies, call 911.
            </p>
            <div className="flex flex-wrap gap-3">
              <Btn onClick={() => go("page", { slug: "contact" })} size="md" icon={ArrowRight}>Contact support</Btn>
              <Btn onClick={() => go("page", { slug: "about" })} size="md" variant="ghost">About SpryMD</Btn>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Signal domains */}
    <section className="px-6 md:px-12 py-20 md:py-28 relative overflow-hidden" style={{ background: C.bg }}>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <span style={{ fontSize: 12, letterSpacing: "0.12em", color: C.accent, textTransform: "uppercase", fontWeight: 700 }}>What we help with</span>
            <h2 className="display" style={{ fontSize: "clamp(34px, 5vw, 52px)", lineHeight: 1.08, marginTop: 14, color: C.ink, fontWeight: 650 }}>
              Care for real life goals.
            </h2>
          </div>
          <p style={{ maxWidth: 360, color: C.inkSoft, fontSize: 16, lineHeight: 1.55 }}>
            Pick the area that matters most. We keep the plan clear and follow up with you.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-px" style={{ background: C.line, border: `1px solid ${C.line}` }}>
          {[{ t: "Weight", d: "Lose weight safely with doctor support", c: "01" },
            { t: "Energy", d: "Feel stronger and less run-down", c: "02" },
            { t: "Mood", d: "Feel calmer and more focused", c: "03" },
            { t: "Sleep", d: "Rest better and wake up ready", c: "04" },
            { t: "Men's care", d: "Sexual health and confidence", c: "05" },
            { t: "Everyday care", d: "A doctor for checkups and questions", c: "06" }].map((d) => (
            <div key={d.t} className="p-6 md:p-8 group relative transition-colors" style={{ background: C.bg }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ background: "radial-gradient(ellipse at top left, rgba(232,119,34,0.10), transparent 60%)" }} />
              <div className="flex items-center justify-between mb-10 relative">
                <div style={{ fontSize: 13, letterSpacing: "0.08em", color: C.accent, textTransform: "uppercase", fontWeight: 700 }}>{d.t}</div>
                <span style={{ fontSize: 12, color: C.muted, letterSpacing: "0.08em", fontWeight: 600 }}>{d.c}</span>
              </div>
              <div className="relative" style={{ fontSize: 16, color: C.inkSoft, lineHeight: 1.45 }}>{d.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Protocols */}
    <section id="landing-conditions" className="px-6 md:px-12 py-20 md:py-28" style={{ background: C.bgAlt }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <span style={{ fontSize: 12, letterSpacing: "0.12em", color: C.accent, textTransform: "uppercase", fontWeight: 700 }}>Care options</span>
            <h2 className="display" style={{ fontSize: "clamp(34px, 5vw, 52px)", lineHeight: 1.08, marginTop: 14, color: C.ink, fontWeight: 650 }}>
              Choose what you want help with.
            </h2>
          </div>
          <p style={{ maxWidth: 360, color: C.inkSoft, fontSize: 16, lineHeight: 1.55 }}>
            Every plan is checked by a licensed doctor before anything is sent to you.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-3 md:gap-4">
          {Object.values(conditions).map((cond, i) => (
            <ConditionCard key={cond.id} condition={cond} onClick={() => go("intake", { condition: cond.id })} delay={i * 0.06} />
          ))}
        </div>
      </div>
    </section>

    {/* PCP */}
    <section id="pcp" className="px-6 md:px-12 py-20 md:py-28 relative overflow-hidden" style={{ background: C.bg }}>
      <div className="absolute inset-x-0 bottom-0 h-48 pointer-events-none opacity-45" aria-hidden="true">
        <GridHorizon className="w-full h-full" />
      </div>
      <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12 items-center relative z-10">
        <div className="md:col-span-6">
          <span style={{ fontSize: 12, letterSpacing: "0.12em", color: C.accent, textTransform: "uppercase", fontWeight: 700 }}>Your doctor</span>
          <h2 className="display" style={{ fontSize: "clamp(34px, 5vw, 52px)", lineHeight: 1.08, marginTop: 14, color: C.ink, fontWeight: 650 }}>
            Want a doctor you can reach anytime?
          </h2>
          <p style={{ fontSize: 17, color: C.inkSoft, marginTop: 18, lineHeight: 1.55, maxWidth: 480 }}>
            Get checkups, lab reviews, everyday care, and quick messages — all in one place with the same doctor who knows your story.
          </p>
          <div className="mt-8 space-y-3">
            {["One doctor who knows you", "Yearly checkup and lab review", "Message when you need help", "Help finding specialists"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <Check size={16} strokeWidth={2} color={C.accent} />
                <span style={{ fontSize: 16, color: C.inkSoft }}>{item}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-10">
            <Btn onClick={() => go("intake", { condition: "pcp" })} size="lg" icon={ArrowRight}>Get my doctor</Btn>
            <Btn onClick={() => go("landing-conditions")} size="lg" variant="ghost">See care options</Btn>
          </div>
        </div>
        <div className="md:col-span-6">
          <div className="instrument-panel rounded-2xl overflow-hidden">
            <div className="relative h-52 overflow-hidden flex items-center justify-center">
              <ScanFrame className="absolute inset-4" label="Doctor linked" />
              <div className="relative z-10 flex flex-col items-center gap-3 px-6 text-center">
                <div className="rounded-lg flex items-center justify-center" style={{ width: 56, height: 56, background: C.signalDim, border: `1px solid ${C.line}` }}>
                  <Stethoscope size={24} color={C.accent} strokeWidth={1.75} />
                </div>
                <span className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", color: C.muted, textTransform: "uppercase" }}>Doctor care online</span>
              </div>
            </div>
            <div className="p-7 md:p-8 relative z-10">
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", color: C.muted, textTransform: "uppercase" }}>Plans from</div>
              <div className="display" style={{ fontSize: 44, fontWeight: 600, color: C.ink, lineHeight: 1, marginTop: 6 }}>
                $49<span style={{ fontSize: 14, color: C.muted, fontWeight: 500, marginLeft: 6 }}>/mo</span>
              </div>
              <div className="mt-6 space-y-4">
                {[{ t: "Spry Primary Care", d: "$79/mo · visits + messaging", tag: "Most popular" },
                  { t: "Doctor + yearly labs", d: "$99/mo · full blood work included", tag: "Best value" },
                  { t: "Household", d: "$129/mo · two adults", tag: null }].map((tier) => (
                  <div key={tier.t} className="flex items-start justify-between gap-4 pb-4" style={{ borderBottom: `1px solid ${C.lineSoft}` }}>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{tier.t}</span>
                        {tier.tag && <Tag color={C.signalDim} fg={C.accent}>{tier.tag}</Tag>}
                      </div>
                      <span style={{ fontSize: 13, color: C.inkSoft }}>{tier.d}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Marketplace */}
    <section className="px-6 md:px-12 py-20 md:py-28" style={{ background: C.bgAlt }}>
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden mb-12" style={{ border: `1px solid ${C.line}`, minHeight: 260 }}>
          <img src={imgMarketplaceHero} alt="Spry marketplace" className="absolute inset-0 w-full h-full object-cover ken-burns" style={{ opacity: 0.55 }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.25) 100%)" }} />
          <ScanFrame className="absolute inset-3 md:inset-5" label="Shop ready" />
          <div className="relative z-10 flex flex-col justify-end p-8 md:p-12" style={{ minHeight: 260 }}>
            <span style={{ fontSize: 12, letterSpacing: "0.12em", color: C.accent, textTransform: "uppercase", fontWeight: 700 }}>Shop</span>
            <h2 className="display" style={{ fontSize: "clamp(30px, 4.5vw, 48px)", lineHeight: 1.05, marginTop: 12, color: C.ink, fontWeight: 650, maxWidth: 520 }}>
              Healthy extras, <Mark>ready to ship</Mark>.
            </h2>
            <div className="mt-6">
              <Btn onClick={() => go("marketplace")} icon={ArrowRight}>Browse the shop</Btn>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {products.filter((p) => p.badge).slice(0, 4).map((p) => <MiniProduct key={p.id} p={p} onClick={() => go("marketplace")} />)}
        </div>
      </div>
    </section>

    {/* Close */}
    <section className="px-6 md:px-12 py-24 md:py-32 relative overflow-hidden" style={{ background: C.bg }}>
      <div className="absolute inset-0 pointer-events-none opacity-70">
        <SignalField density={28} interactive={false} />
      </div>
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.92) 70%)" }} />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="display" style={{ fontSize: "clamp(18px, 2vw, 22px)", fontWeight: 700, marginBottom: 24 }}>
          Spry<span style={{ color: C.accent }}>MD</span>
        </div>
        <h2 className="display" style={{ fontSize: "clamp(32px, 5vw, 52px)", lineHeight: 1.12, fontWeight: 650, color: C.ink }}>
          A real doctor is with you every step.
        </h2>
        <p style={{ fontSize: 17, color: C.inkSoft, marginTop: 20, maxWidth: 480, marginLeft: "auto", marginRight: "auto", lineHeight: 1.55 }}>
          Clear plans. Private care. Help that fits your life — not a waiting room.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          <Btn onClick={() => go("landing-conditions")} size="lg" icon={ArrowRight}>Start your confidential visit</Btn>
          <Btn onClick={() => go("marketplace")} size="lg" variant="secondary">Browse the shop</Btn>
        </div>
      </div>
    </section>

    <Footer go={go} />
  </div>
);

const ConditionCard = ({ condition, onClick, delay }) => {
  const [hover, setHover] = useState(false);
  const Icon = condition.icon;
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className="anim-fadeUp focus-ring text-left p-7 md:p-8 transition-all duration-300 group relative overflow-hidden"
      style={{ background: C.bg, border: `1px solid ${hover ? C.accent : C.line}`, borderRadius: 16, animationDelay: `${delay}s`, transform: hover ? "translateY(-2px)" : "none" }}>
      <div className="absolute inset-y-0 left-0 w-px transition-all" style={{ background: C.accent, opacity: hover ? 1 : 0, boxShadow: hover ? `0 0 24px ${C.accent}` : "none" }} />
      <div className="flex items-start justify-between mb-8 relative">
        <div className="p-2.5 rounded-full" style={{ background: hover ? C.signalDim : C.paper, color: C.accent, transition: "all 0.3s" }}>
          <Icon size={20} strokeWidth={1.5} />
        </div>
        <div style={{ transform: hover ? "translateX(4px)" : "none", transition: "transform 0.3s" }}>
          <ArrowRight size={18} color={hover ? C.accent : C.muted} strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="display relative" style={{ fontSize: 28, fontWeight: 600, color: C.ink, marginBottom: 8 }}>{condition.name}</h3>
      <p className="relative" style={{ fontSize: 14, color: C.inkSoft, marginBottom: 20, lineHeight: 1.5 }}>{condition.tagline}</p>
      <div className="flex items-center justify-between relative" style={{ borderTop: `1px solid ${C.lineSoft}`, paddingTop: 14 }}>
        <span className="mono" style={{ fontSize: 10, color: C.muted, letterSpacing: "0.12em", textTransform: "uppercase" }}>From</span>
        <span className="display" style={{ fontSize: 22, fontWeight: 600, color: C.ink }}>
          ${condition.fromPrice}<span style={{ fontSize: 12, color: C.muted, fontWeight: 500, marginLeft: 4 }}>/mo</span>
        </span>
      </div>
    </button>
  );
};

const MiniProduct = ({ p, onClick }) => {
  const Icon = p.icon;
  return (
    <button onClick={onClick} className="focus-ring text-left p-4 md:p-5 transition-all hover:-translate-y-0.5 group"
      style={{ background: C.bgAlt, border: `1px solid ${C.line}`, borderRadius: 16 }}>
      <div className="aspect-square rounded-xl mb-4 flex items-center justify-center overflow-hidden relative" style={{ background: p.image ? C.bg : p.color }}>
        {p.image
          ? <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          : <Icon size={36} color={C.paper} strokeWidth={1.25} />}
        {p.badge && (
          <span className="absolute top-2 left-2 mono" style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", background: C.ink, color: C.paper, padding: "4px 8px", borderRadius: 999, fontWeight: 600 }}>
            {p.badge}
          </span>
        )}
      </div>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }} className="mono">{p.brand.toUpperCase()}</div>
      <div style={{ fontSize: 14, color: C.ink, marginBottom: 4, fontWeight: 500, lineHeight: 1.3 }}>{p.name}</div>
      {p.benefit && <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 10, lineHeight: 1.35 }}>{p.benefit}</div>}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="display" style={{ fontSize: 18, color: C.ink, fontWeight: 500 }}>${p.price}</span>
          {p.compareAt && <span style={{ fontSize: 12, color: C.muted, textDecoration: "line-through" }}>${p.compareAt}</span>}
        </div>
        {p.hsa && <span className="mono" style={{ fontSize: 9, color: C.ok, letterSpacing: "0.08em" }}>HSA</span>}
      </div>
    </button>
  );
};

const footerColumns = [
  { h: "Care plans", l: ["Weight Loss", "ED", "Low Testosterone", "Anxiety & Depression", "Hair Loss", "Skin", "Primary Care"] },
  { h: "Shop", l: ["Quick Refills", "Supplements", "Devices", "Sleep"] },
  { h: "Company", l: ["About", "Doctors", "Press", "Contact"] },
];

const Footer = ({ go }) => (
  <footer className="px-6 md:px-12 py-12" style={{ background: C.bg, borderTop: `1px solid ${C.line}` }}>
    <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
      <div>
        <Logo />
        <p style={{ fontSize: 12, color: C.muted, marginTop: 12, lineHeight: 1.5, maxWidth: 240 }}>
          Modern medicine, made for men. Licensed telehealth for patients in Tennessee. Support: support@sprymd.ai. Not for emergencies.
        </p>
      </div>
      {footerColumns.map((col) => (
        <div key={col.h}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: C.muted, textTransform: "uppercase", marginBottom: 16 }}>{col.h}</div>
          <div className="space-y-2">
            {col.l.map((it) => {
              const slug = footerNavToSlug[it];
              return (
                <button
                  key={it}
                  type="button"
                  onClick={() => slug && go("page", { slug })}
                  className="focus-ring block text-left transition-opacity hover:opacity-60"
                  style={{ fontSize: 13, color: C.ink, background: "transparent", border: "none", padding: 0, cursor: slug ? "pointer" : "default" }}
                >
                  {it}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
    <div className="max-w-7xl mx-auto mt-12 pt-8 flex justify-between items-center flex-wrap gap-3" style={{ borderTop: `1px solid ${C.line}` }}>
      <span className="mono" style={{ fontSize: 11, color: C.muted }}>© 2026 SPRYMD INC.</span>
      <div className="flex flex-wrap gap-4">
        {[{ label: "Terms", href: "/terms" }, { label: "Privacy", href: "/privacy" }, { label: "NPP", href: "/npp" }, { label: "FAQ", href: "/faq" }].map((l) => (
          <a key={l.href} href={l.href} className="mono" style={{ fontSize: 11, color: C.muted, textDecoration: "none" }}>{l.label}</a>
        ))}
        <span className="mono" style={{ fontSize: 11, color: C.muted }}>SPRYMD.AI</span>
      </div>
    </div>
  </footer>
);

const RichText = ({ text }) => {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} style={{ color: C.ink, fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
};

const FooterPage = ({ slug, go, cartCount, user }) => {
  const page = footerPages[slug];
  if (!page) {
    return (
      <div className="anim-fadeIn min-h-screen" style={{ background: C.bg }}>
        <Header go={go} cartCount={cartCount} user={user} />
        <div className="max-w-3xl mx-auto px-6 md:px-12 py-24 text-center">
          <h1 className="display" style={{ fontSize: 40, color: C.ink, marginBottom: 12 }}>Page not found</h1>
          <Btn onClick={() => go("landing")} icon={ArrowRight}>Back home</Btn>
        </div>
        <Footer go={go} />
      </div>
    );
  }

  const runCta = () => {
    if (page.ctaTarget === "intake" && page.conditionId) {
      go("intake", { condition: page.conditionId });
      return;
    }
    if (page.ctaTarget === "marketplace") {
      go("marketplace", { filter: page.marketplaceFilter && page.marketplaceFilter !== "null" ? page.marketplaceFilter : "All" });
      return;
    }
    if (page.ctaTarget === "refills") {
      go("refills");
      return;
    }
    if (page.ctaTarget === "landing-conditions") {
      go("landing-conditions");
      return;
    }
    if (page.ctaTarget === "contact") {
      go("page", { slug: "contact" });
      return;
    }
    if (page.ctaTarget === "press") {
      go("page", { slug: "press" });
      return;
    }
    go("landing");
  };

  return (
    <div className="anim-fadeIn min-h-screen" style={{ background: C.bg }}>
      <Header go={go} cartCount={cartCount} user={user} />
      <section className="px-6 md:px-12 pt-14 md:pt-20 pb-10" style={{ borderBottom: `1px solid ${C.lineSoft}` }}>
        <div className="max-w-3xl mx-auto">
          <button type="button" onClick={() => go("landing")} className="focus-ring mono mb-8 transition-opacity hover:opacity-60"
            style={{ fontSize: 11, letterSpacing: "0.14em", color: C.muted, textTransform: "uppercase", background: "transparent", border: "none", padding: 0 }}>
            ← SpryMD
          </button>
          <div className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: C.accent, textTransform: "uppercase", marginBottom: 14 }}>
            {page.eyebrow}
          </div>
          <h1 className="display" style={{ fontSize: "clamp(36px, 6vw, 64px)", lineHeight: 1.02, fontWeight: 600, color: C.ink, marginBottom: 16 }}>
            {page.title}
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.5, color: C.inkSoft, maxWidth: 560, marginBottom: 28 }}>
            {page.tagline}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Btn onClick={runCta} size="lg" icon={ArrowRight}>{page.ctaLabel || "Continue"}</Btn>
            {page.fromPrice && (
              <span className="mono" style={{ fontSize: 12, letterSpacing: "0.12em", color: C.muted, textTransform: "uppercase" }}>
                From ${page.fromPrice}/mo
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 py-14 md:py-20">
        <div className="max-w-3xl mx-auto space-y-12">
          {page.sections.map((section) => (
            <div key={section.title}>
              <h2 className="display" style={{ fontSize: 28, fontWeight: 600, color: C.ink, marginBottom: 16 }}>{section.title}</h2>
              <div className="space-y-4">
                {section.blocks.map((block, bi) => {
                  if (block.type === "p") {
                    return (
                      <p key={bi} style={{ fontSize: 16, lineHeight: 1.65, color: C.inkSoft }}>
                        <RichText text={block.text} />
                      </p>
                    );
                  }
                  if (block.type === "ul") {
                    return (
                      <ul key={bi} className="space-y-3" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {block.items.map((item, ii) => (
                          <li key={ii} className="flex gap-3" style={{ fontSize: 15, lineHeight: 1.55, color: C.inkSoft }}>
                            <span style={{ color: C.accent, marginTop: 2 }}>▸</span>
                            <span><RichText text={item} /></span>
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  if (block.type === "ol") {
                    return (
                      <ol key={bi} className="space-y-4" style={{ listStyle: "none", padding: 0, margin: 0, counterReset: "step" }}>
                        {block.items.map((item, ii) => (
                          <li key={ii} className="flex gap-4" style={{ fontSize: 15, lineHeight: 1.55, color: C.inkSoft }}>
                            <span className="mono" style={{ fontSize: 12, letterSpacing: "0.12em", color: C.accent, minWidth: 28 }}>
                              {String(ii + 1).padStart(2, "0")}
                            </span>
                            <span><RichText text={item} /></span>
                          </li>
                        ))}
                      </ol>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          ))}

          {slug === "contact" && (
            <div className="pt-4" style={{ borderTop: `1px solid ${C.lineSoft}` }}>
              <h2 className="display" style={{ fontSize: 28, fontWeight: 600, color: C.ink, marginBottom: 16 }}>Send a message</h2>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Thanks — this demo form does not send yet. Email support@sprymd.ai.");
                }}
              >
                {[
                  { id: "name", label: "Name", type: "text" },
                  { id: "email", label: "Email", type: "email" },
                  { id: "topic", label: "Topic", type: "text" },
                ].map((f) => (
                  <Field key={f.id} label={f.label}>
                    <input required id={f.id} name={f.id} type={f.type} className="w-full px-4 py-3 focus-ring" style={inputStyle} />
                  </Field>
                ))}
                <Field label="Message">
                  <textarea required name="message" rows={5} className="w-full px-4 py-3 focus-ring" style={{ ...inputStyle, resize: "vertical" }} />
                </Field>
                <Btn type="submit" icon={Send}>Send message</Btn>
              </form>
            </div>
          )}
        </div>
      </section>
      <Footer go={go} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Sign in / Sign up — per-customer account gate
// ─────────────────────────────────────────────────────────────────────────────
const SignIn = ({ go, returnTo, onAuthSuccess }) => {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const canSubmit = email.includes("@") && password.length >= 8 &&
    (mode === "signin" || (name.trim().length > 0 && dob.length >= 8));

  const submit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError("");
    setNotice("");
    try {
      if (mode === "signup") {
        const { profile, needsEmailConfirm } = await signUpCustomer({ email, password, name, dob });
        onAuthSuccess(hydrateUser(profile));
        if (needsEmailConfirm) {
          setNotice("Account created. Check your email to confirm — you can keep using your account now.");
        }
        go(returnTo || "dashboard", { justLoggedIn: true });
      } else {
        const { profile } = await signInCustomer({ email, password });
        onAuthSuccess(hydrateUser(profile));
        go(returnTo || "dashboard", { justLoggedIn: true });
      }
    } catch (e) {
      setError(e?.message || "Unable to authenticate. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="anim-fadeIn min-h-screen flex flex-col" style={{ background: C.bg }}>
      <div className="px-6 md:px-12 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.lineSoft}` }}>
        <button onClick={() => go("landing")} className="focus-ring rounded"><Logo /></button>
        <button onClick={() => go("landing")} className="focus-ring rounded-full p-1 hover:opacity-60">
          <X size={20} color={C.ink} strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-stretch">
          <div className="hidden md:block rounded-3xl overflow-hidden relative instrument-panel min-h-[480px]">
            <SignalField density={40} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(5,5,5,0.15) 0%, rgba(5,5,5,0.85) 100%)" }} />
            <ScanFrame className="absolute inset-5" label="Secure sign-in" />
            <div className="absolute left-7 right-7 bottom-7 z-10">
              <p className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", color: C.accent, textTransform: "uppercase" }}>Your account</p>
              <p style={{ fontSize: 20, lineHeight: 1.3, color: C.ink, marginTop: 10 }}>
                Sign in to open your health dashboard — care plans, goals, devices, refills, and orders.
              </p>
            </div>
          </div>
          <div className="w-full max-w-md md:max-w-none md:px-2">
          <div className="anim-fadeUp">
            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: C.accent, textTransform: "uppercase" }}>
              {mode === "signin" ? "Welcome back" : "Create account"}
            </span>
            <h1 className="display" style={{ fontSize: "clamp(36px, 5vw, 52px)", lineHeight: 1.05, fontWeight: 400, color: C.ink, marginTop: 12, marginBottom: 12 }}>
              {mode === "signin" ? <>Sign in to your <Mark>account</Mark>.</> : <>Create your <Mark>SpryMD</Mark> account.</>}
            </h1>
            <p style={{ fontSize: 14, color: C.inkSoft, marginBottom: 32, lineHeight: 1.55 }}>
              {mode === "signin"
                ? "Each login opens only your medical record, prescriptions, and order history."
                : "One email, one account. Your care plan and pharmacy history stay private to you."}
            </p>

            <div className="space-y-4">
              {mode === "signup" && (
                <>
                  <Field label="Full legal name">
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="William B Merrick" className="focus-ring w-full p-4" style={inputStyle} />
                  </Field>
                  <Field label="Date of birth">
                    <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="focus-ring w-full p-4" style={inputStyle} />
                  </Field>
                </>
              )}
              <Field label="Email">
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="focus-ring w-full p-4" style={inputStyle} autoComplete="email" />
              </Field>
              <Field label="Password">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className="focus-ring w-full p-4" style={inputStyle} autoComplete={mode === "signin" ? "current-password" : "new-password"} />
              </Field>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: "rgba(226,85,85,0.12)", border: `1px solid rgba(226,85,85,0.35)` }}>
                  <AlertCircle size={16} color={C.destructive} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.45 }}>{error}</span>
                </div>
              )}
              {notice && (
                <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: C.signalDim, border: `1px solid ${C.accentDeep}` }}>
                  <Check size={16} color={C.accent} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.45 }}>{notice}</span>
                </div>
              )}

              <Btn onClick={submit} disabled={!canSubmit || loading} size="lg" className="w-full">
                {loading ? <span className="anim-pulse">{mode === "signin" ? "Signing in..." : "Creating account..."}</span>
                         : <>{mode === "signin" ? "Sign in" : "Create account & continue"}</>}
              </Btn>

              <div className="flex items-center gap-2 justify-center pt-2">
                <Lock size={11} color={C.muted} />
                <span className="mono" style={{ fontSize: 10, color: C.muted, letterSpacing: "0.1em" }}>HIPAA-COMPLIANT · ENCRYPTED · PER-CUSTOMER</span>
              </div>
            </div>

            <div className="text-center mt-8 pt-8" style={{ borderTop: `1px solid ${C.lineSoft}` }}>
              <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setNotice(""); }}
                className="focus-ring rounded text-sm hover:opacity-60 transition-opacity" style={{ color: C.inkSoft }}>
                {mode === "signin"
                  ? <>New to SpryMD? <span style={{ color: C.accent, fontWeight: 500, textDecoration: "underline" }}>Create an account</span></>
                  : <>Already a member? <span style={{ color: C.accent, fontWeight: 500, textDecoration: "underline" }}>Sign in</span></>}
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Quick Refills — Empower medication database query for this patient
// ─────────────────────────────────────────────────────────────────────────────
const Refills = ({ user, go, refillCart, addRefill, removeRefill }) => {
  const [filter, setFilter] = useState("All");
  const [loaded, setLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 700);
    return () => clearTimeout(t);
  }, []);

  const rxs = user?.rxHistory || [];
  const categories = ["All", ...Array.from(new Set(rxs.map((r) => r.category)))];
  const filtered = rxs.filter((r) => {
    if (filter !== "All" && r.category !== filter) return false;
    if (searchTerm && !r.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const cartTotal = refillCart.reduce((s, i) => s + i.price, 0);
  const cartCount = refillCart.length;
  const isInCart = (rxId) => refillCart.some((i) => i.rxId === rxId);

  return (
    <div className="anim-fadeIn min-h-screen" style={{ background: C.bg }}>
      <div className="px-6 md:px-12 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.lineSoft}` }}>
        <button onClick={() => go("landing")} className="focus-ring rounded"><Logo /></button>
        <div className="flex items-center gap-4">
          <span style={{ fontSize: 13, color: C.inkSoft }}>
            <span className="mono" style={{ fontSize: 11, color: C.muted, letterSpacing: "0.08em" }}>HI,</span>{" "}
            {user.name.split(" ")[0] || "Member"}
          </span>
          <button onClick={() => go("landing")} className="focus-ring rounded-full p-1 hover:opacity-60">
            <X size={20} color={C.ink} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <section className="px-6 md:px-12 pt-12 md:pt-16 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw size={14} color={C.accent} strokeWidth={2} />
            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: C.accent, textTransform: "uppercase", fontWeight: 600 }}>Quick Refills</span>
          </div>
          <h1 className="display" style={{ fontSize: "clamp(40px, 6vw, 76px)", lineHeight: 0.98, fontWeight: 400, color: C.ink, marginBottom: 16 }}>
            Your active <Mark>prescriptions</Mark>.
          </h1>
          <div className="flex items-center gap-4 flex-wrap">
            <p style={{ fontSize: 15, color: C.inkSoft, maxWidth: 580, lineHeight: 1.55 }}>
              Pulled live from the Empower medication database. Select what you need refilled — we'll e-prescribe and ship the same day. Your health record updates automatically.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-3 flex-wrap">
            <Tag color={C.bgAlt}><Activity size={10} style={{ display: "inline", marginRight: 4 }} />{rxs.length} active Rx</Tag>
            <Tag color={C.bgAlt}><Stethoscope size={10} style={{ display: "inline", marginRight: 4 }} />Prescriber: Merrick, William DO</Tag>
            <Tag color={C.bgAlt}><ShieldCheck size={10} style={{ display: "inline", marginRight: 4 }} />gethealthy.com synced</Tag>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 py-4 sticky top-0 z-10" style={{ background: C.bg, borderTop: `1px solid ${C.lineSoft}`, borderBottom: `1px solid ${C.lineSoft}` }}>
        <div className="max-w-7xl mx-auto flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setFilter(cat)}
                className="focus-ring px-4 py-2 rounded-full transition-all whitespace-nowrap"
                style={{ background: filter === cat ? C.ink : "transparent", color: filter === cat ? C.paper : C.ink,
                  border: `1px solid ${filter === cat ? C.ink : C.line}`, fontSize: 13, fontWeight: 500 }}>
                {cat}
              </button>
            ))}
          </div>
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search prescriptions..."
            className="focus-ring px-4 py-2 rounded-full text-sm"
            style={{ background: C.bgAlt, border: `1px solid ${C.line}`, color: C.ink, minWidth: 200, fontFamily: fonts.body }} />
        </div>
      </section>

      {!loaded && (
        <section className="px-6 md:px-12 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center mb-6">
              <RefreshCw size={32} color={C.accent} strokeWidth={1.5} className="anim-spin" />
            </div>
            <h3 className="display" style={{ fontSize: 22, fontWeight: 500, color: C.ink, marginBottom: 8 }}>
              Querying Empower medication database…
            </h3>
            <p style={{ fontSize: 13, color: C.muted, fontFamily: fonts.mono, letterSpacing: "0.05em" }}>
              GET /api/v1/patients/{user.email.split("@")[0]}/prescriptions
            </p>
          </div>
        </section>
      )}

      {loaded && (
        <section className="px-6 md:px-12 py-8 pb-32">
          <div className="max-w-7xl mx-auto space-y-3">
            {filtered.map((rx, i) => (
              <RxRow key={rx.rxId} rx={rx} inCart={isInCart(rx.rxId)}
                onAdd={() => addRefill(rx)} onRemove={() => removeRefill(rx.rxId)} delay={i * 0.04} />
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-20"><p style={{ color: C.muted, fontSize: 15 }}>No prescriptions match those filters.</p></div>
            )}
          </div>
        </section>
      )}

      {cartCount > 0 && (
        <button onClick={() => go("refill-checkout")}
          className="anim-fadeUp focus-ring fixed bottom-6 right-6 px-6 py-4 rounded-full flex items-center gap-3 shadow-lg transition-transform hover:-translate-y-0.5"
          style={{ background: C.accent, color: "#fff", zIndex: 30 }}>
          <Send size={16} strokeWidth={2} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>E-Prescribe {cartCount} · ${cartTotal.toFixed(2)}</span>
          <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
};

const RxRow = ({ rx, inCart, onAdd, onRemove, delay }) => {
  const Icon = rx.icon;
  return (
    <div className="anim-fadeUp transition-all"
      style={{ background: inCart ? C.primary : C.paper, color: inCart ? C.paper : C.ink,
        border: `1px solid ${inCart ? C.primary : C.line}`, borderRadius: 16, padding: "20px 24px", animationDelay: `${delay}s` }}>
      <div className="flex items-center gap-5 flex-wrap">
        <div className="rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: inCart ? "rgba(255,255,255,0.1)" : rx.color, width: 56, height: 56 }}>
          <Icon size={24} color={inCart ? rx.color : C.paper} strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="display" style={{ fontSize: 20, fontWeight: 500, color: inCart ? C.paper : C.ink }}>{rx.name}</h4>
            {rx.chilled && <Tag color={inCart ? "rgba(255,255,255,0.15)" : "hsl(210, 40%, 93%)"} fg={inCart ? C.paper : C.primary}>
              <Snowflake size={9} style={{ display: "inline", marginRight: 3 }} />Refrigerated
            </Tag>}
          </div>
          <div style={{ fontSize: 13, color: inCart ? "rgba(255,255,255,0.7)" : C.inkSoft, marginBottom: 4 }}>{rx.strength}</div>
          <div style={{ fontSize: 12, color: inCart ? "rgba(255,255,255,0.6)" : C.muted, marginBottom: 8 }}>"{rx.sig}"</div>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="mono" style={{ fontSize: 10, color: inCart ? "rgba(255,255,255,0.5)" : C.muted, letterSpacing: "0.05em" }}>RX #{rx.rxId}</span>
            <span className="mono" style={{ fontSize: 10, color: inCart ? "rgba(255,255,255,0.5)" : C.muted, letterSpacing: "0.05em" }}>
              <Clock size={9} style={{ display: "inline", marginRight: 3 }} />LAST FILL: {rx.lastFilled.toUpperCase()}
            </span>
            <span className="mono" style={{ fontSize: 10, color: inCart ? "rgba(255,255,255,0.5)" : C.muted, letterSpacing: "0.05em" }}>
              {rx.refills - rx.refillsUsed} of {rx.refills} REFILLS LEFT
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right">
            <div className="display" style={{ fontSize: 24, fontWeight: 500, color: inCart ? C.paper : C.ink, lineHeight: 1 }}>${rx.price}</div>
            <div style={{ fontSize: 11, color: inCart ? "rgba(255,255,255,0.6)" : C.muted, marginTop: 2 }}>{rx.daysSupply}-day supply</div>
          </div>
          {inCart ? (
            <button onClick={onRemove}
              className="focus-ring rounded-full px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5"
              style={{ background: "rgba(255,255,255,0.15)", color: C.paper, border: "1px solid rgba(255,255,255,0.2)" }}>
              <Check size={14} strokeWidth={2.5} />Added
            </button>
          ) : (
            <button onClick={onAdd}
              className="focus-ring rounded-full px-4 py-2 text-sm font-medium transition-all flex items-center gap-1.5 hover:translate-x-0.5"
              style={{ background: C.ink, color: C.paper }}>
              <Plus size={14} strokeWidth={2.5} />Refill
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Refill checkout — separate flow (Stripe → gethealthy.com → Empower e-Rx)
// ─────────────────────────────────────────────────────────────────────────────
const RefillCheckout = ({ user, refillCart, go, onComplete }) => {
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [zip, setZip] = useState("");
  const [shipping, setShipping] = useState("standard");
  const [processing, setProcessing] = useState(false);

  const formatCard = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExp = (v) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return digits.slice(0, 2) + " / " + digits.slice(2);
  };

  const hasChilled = refillCart.some((i) => i.chilled);
  const subtotal = refillCart.reduce((s, i) => s + i.price, 0);
  const shippingCost = shipping === "overnight" ? (hasChilled ? 41 : 33) : (hasChilled ? 20 : 15);
  const tax = subtotal * 0.0875;
  const total = subtotal + shippingCost + tax;

  const canSubmit = card.replace(/\s/g, "").length === 16 && exp.length >= 7 && cvc.length >= 3 && zip.length >= 5;

  const submit = () => {
    if (!canSubmit) return;
    setProcessing(true);
    setTimeout(() => onComplete(), 1500);
  };

  return (
    <div className="anim-fadeIn min-h-screen" style={{ background: C.bg }}>
      <DeliveryBar />
      <div className="px-6 md:px-12 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.lineSoft}` }}>
        <Logo />
        <button onClick={() => go("refills")} className="focus-ring rounded-full p-1 hover:opacity-60">
          <X size={20} color={C.ink} strokeWidth={1.5} />
        </button>
      </div>

      <div className="px-6 md:px-12 py-12">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
          <div>
            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: C.accent, textTransform: "uppercase" }}>Refill Checkout</span>
            <h1 className="display" style={{ fontSize: "clamp(32px, 4vw, 48px)", lineHeight: 1.05, fontWeight: 400, marginTop: 12, marginBottom: 8, color: C.ink }}>
              E-prescribe & <Mark>ship</Mark>.
            </h1>
            <p style={{ fontSize: 14, color: C.inkSoft, marginBottom: 32, lineHeight: 1.55, maxWidth: 460 }}>
              Once paid, we transmit your prescriptions to Empower Pharmacy and update your record at gethealthy.com automatically.
            </p>

            <div className="mb-8">
              <label className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", color: C.muted, textTransform: "uppercase", display: "block", marginBottom: 12, fontWeight: 500 }}>Shipping</label>
              <div className="grid grid-cols-2 gap-3">
                {[{ id: "standard", label: "2nd Day Express", days: hasChilled ? "1–2 days · refrigerated" : "1–2 days", price: hasChilled ? 20 : 15 },
                  { id: "overnight", label: "Eligible TN next-business-day", days: hasChilled ? "After fill · refrigerated" : "After approval and fill", price: hasChilled ? 41 : 33 }].map((s) => (
                  <button key={s.id} onClick={() => setShipping(s.id)}
                    className="focus-ring text-left p-4 rounded-xl transition-all"
                    style={{ background: shipping === s.id ? C.primary : C.paper, color: shipping === s.id ? C.paper : C.ink,
                      border: `1px solid ${shipping === s.id ? C.primary : C.line}` }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{s.label}</div>
                    <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{s.days}</div>
                    <div className="display" style={{ fontSize: 18, fontWeight: 500, marginTop: 8 }}>${s.price}</div>
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <DeliveryDetailsCard />
              </div>
            </div>

            <div className="space-y-5">
              <Field label="Cardholder name">
                <input value={user.name} readOnly className="focus-ring w-full p-4" style={{ ...inputStyle, opacity: 0.7 }} />
              </Field>
              <div>
                <label className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", color: C.muted, textTransform: "uppercase", display: "block", marginBottom: 8, fontWeight: 500 }}>Card information</label>
                <div className="rounded-xl overflow-hidden" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
                  <input value={card} onChange={(e) => setCard(formatCard(e.target.value))} placeholder="1234 1234 1234 1234"
                    className="focus-ring w-full p-4"
                    style={{ ...inputStyle, border: "none", borderBottom: `1px solid ${C.line}`, borderRadius: 0, background: "transparent" }} />
                  <div className="flex">
                    <input value={exp} onChange={(e) => setExp(formatExp(e.target.value))} placeholder="MM / YY"
                      className="focus-ring flex-1 p-4"
                      style={{ ...inputStyle, border: "none", borderRight: `1px solid ${C.line}`, borderRadius: 0, background: "transparent" }} />
                    <input value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="CVC"
                      className="focus-ring flex-1 p-4"
                      style={{ ...inputStyle, border: "none", borderRadius: 0, background: "transparent" }} />
                  </div>
                </div>
              </div>
              <Field label="ZIP / Postal code">
                <input value={zip} onChange={(e) => setZip(e.target.value.slice(0, 10))} placeholder="38201" className="focus-ring w-full p-4" style={inputStyle} />
              </Field>

              <Btn onClick={submit} disabled={!canSubmit || processing} size="lg" className="w-full" icon={!processing ? Send : null}>
                {processing ? <span className="anim-pulse">Processing...</span> : `Pay $${total.toFixed(2)} & e-prescribe`}
              </Btn>

              <div className="flex items-center justify-center gap-2">
                <Lock size={11} color={C.muted} />
                <span className="mono" style={{ fontSize: 10, color: C.muted, letterSpacing: "0.12em" }}>STRIPE · NCPDP-COMPLIANT E-RX</span>
              </div>
            </div>
          </div>

          <div>
            <div className="p-8 rounded-3xl sticky top-8" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
              <h3 className="display" style={{ fontSize: 22, fontWeight: 500, color: C.ink, marginBottom: 24 }}>Refill summary</h3>

              <div className="space-y-4 pb-6 mb-6" style={{ borderBottom: `1px solid ${C.line}` }}>
                {refillCart.map((rx) => {
                  const Icon = rx.icon;
                  return (
                    <div key={rx.rxId} className="flex gap-3 items-start">
                      <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: rx.color, width: 44, height: 44 }}>
                        <Icon size={18} color={C.paper} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div style={{ fontSize: 13, color: C.ink, fontWeight: 500, lineHeight: 1.3 }}>{rx.name}</div>
                        <div className="mono" style={{ fontSize: 10, color: C.muted, marginTop: 2, letterSpacing: "0.05em" }}>RX #{rx.rxId}</div>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>${rx.price.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 pb-6 mb-6" style={{ borderBottom: `1px solid ${C.line}` }}>
                <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
                <Row label={`Shipping (${shipping === "overnight" ? "Overnight" : "2-Day"}${hasChilled ? " · refrigerated" : ""})`} value={`$${shippingCost.toFixed(2)}`} />
                <Row label="Tax (est.)" value={`$${tax.toFixed(2)}`} />
              </div>

              <div className="flex items-baseline justify-between">
                <span style={{ fontSize: 14, color: C.inkSoft, fontWeight: 500 }}>Total</span>
                <span className="display" style={{ fontSize: 32, fontWeight: 500, color: C.ink }}>${total.toFixed(2)}</span>
              </div>

              <div className="mt-6 p-4 rounded-xl" style={{ background: C.bgAlt, border: `1px solid ${C.line}` }}>
                <div className="flex items-start gap-3">
                  <ShieldCheck size={16} color={C.primary} strokeWidth={1.75} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <div style={{ fontSize: 12, color: C.ink, fontWeight: 500, marginBottom: 4 }}>What happens next</div>
                    <div style={{ fontSize: 11, color: C.inkSoft, lineHeight: 1.5 }}>
                      Health record updated at gethealthy.com → e-Rx transmitted to Empower → discreet shipment within {shipping === "overnight" ? "24 hours" : "48 hours"}.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Refill Success — animated webhook + e-prescribe pipeline
// ─────────────────────────────────────────────────────────────────────────────
const RefillSuccess = ({ refillCart, go, onClearCart }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const stages = [
      { delay: 0, stage: 0 },
      { delay: 1200, stage: 1 },
      { delay: 2600, stage: 2 },
      { delay: 4000, stage: 3 },
    ];
    const timers = stages.map((s) => setTimeout(() => setStage(s.stage), s.delay));
    return () => timers.forEach(clearTimeout);
  }, []);

  const total = refillCart.reduce((s, i) => s + i.price, 0);

  const steps = [
    { title: "Refill request recorded", sub: "Saved to your SpryMD account · pending clinician confirmation", icon: Lock },
    { title: "Chart flagged for review", sub: "A clinician will confirm appropriateness before pharmacy release", icon: FileText },
    { title: "Queued for fulfillment", sub: `${refillCart.length} medication${refillCart.length > 1 ? "s" : ""} will release after approval`, icon: Send },
  ];

  return (
    <div className="anim-fadeIn min-h-screen flex flex-col" style={{ background: C.bg }}>
      <div className="px-6 md:px-12 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.lineSoft}` }}>
        <Logo />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-2xl w-full">
          <div className="anim-fadeUp text-center mb-12">
            <div className="inline-flex items-center justify-center mb-6 rounded-full transition-colors"
              style={{ background: stage >= 3 ? C.primary : C.bgAlt, width: 72, height: 72, transition: "background 0.4s" }}>
              {stage >= 3 ? <Check size={32} color={C.paper} strokeWidth={2} /> : <RefreshCw size={28} color={C.primary} strokeWidth={1.75} className="anim-spin" />}
            </div>
            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: C.muted, textTransform: "uppercase" }}>
              {stage >= 3 ? "Refill complete" : "Processing your refill..."}
            </span>
            <h1 className="display" style={{ fontSize: "clamp(36px, 5vw, 56px)", lineHeight: 1.05, fontWeight: 400, color: C.ink, marginTop: 12, marginBottom: 16 }}>
              {stage >= 3 ? <>Your meds are <Mark>on the way</Mark>.</> : <>Hang tight, <Mark>working...</Mark></>}
            </h1>
          </div>

          <div className="rounded-3xl p-6 md:p-8 mb-8" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
            <div className="space-y-2">
              {steps.map((step, i) => {
                const isDone = stage > i;
                const isActive = stage === i;
                const Icon = step.icon;
                return (
                  <div key={step.title} className="flex items-start gap-4 p-3 rounded-xl transition-all"
                    style={{ background: isActive ? C.bgAlt : "transparent", opacity: isDone || isActive ? 1 : 0.35 }}>
                    <div className="rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                      style={{ background: isDone ? C.ok : isActive ? C.accent : C.bgAlt, color: isDone || isActive ? C.paper : C.muted, width: 36, height: 36 }}>
                      {isDone ? <Check size={16} strokeWidth={2.5} />
                       : isActive ? <Icon size={16} strokeWidth={1.75} className="anim-pulse" />
                       : <Icon size={16} strokeWidth={1.5} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: 15, fontWeight: 500, color: C.ink }}>{step.title}</div>
                      <div className="mono" style={{ fontSize: 11, color: C.muted, marginTop: 2, letterSpacing: "0.02em", wordBreak: "break-all" }}>{step.sub}</div>
                    </div>
                    {isDone && <Tag color={C.accentSoft} fg={C.accentDeep}>OK</Tag>}
                  </div>
                );
              })}
            </div>
          </div>

          {stage >= 3 && (
            <div className="anim-fadeUp">
              <div className="rounded-2xl p-6 mb-6" style={{ background: C.primary, color: C.paper }}>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: C.accentSoft, textTransform: "uppercase" }}>Order #SR-29481</span>
                    <div className="display" style={{ fontSize: 24, fontWeight: 500, marginTop: 4 }}>
                      ${total.toFixed(2)} · {refillCart.length} prescription{refillCart.length > 1 ? "s" : ""}
                    </div>
                  </div>
                  <Tag color="rgba(255,255,255,0.1)" fg={C.paper}>
                    <Truck size={10} style={{ display: "inline", marginRight: 4 }} />Tracking sent to email
                  </Tag>
                </div>
                <p style={{ fontSize: 13, color: "rgba(248,244,234,0.75)", lineHeight: 1.55 }}>
                  Empower will dispense and ship within 24–48 hours. You'll get tracking once the package leaves the facility. Refrigerated items ship in insulated cold-chain packaging.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Btn onClick={() => { onClearCart(); go("dashboard"); }} size="lg" variant="dark">Open dashboard</Btn>
                <Btn onClick={() => { onClearCart(); go("landing"); }} size="lg" variant="ghost">Back to home</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Customer Account — private hub after login
// ─────────────────────────────────────────────────────────────────────────────
const Account = ({ user, go, onSignOut, onUpdateUser }) => {
  const [tab, setTab] = useState("overview");
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [dob, setDob] = useState(user?.dob || "");
  const [line1, setLine1] = useState(user?.address?.line1 || "");
  const [city, setCity] = useState(user?.address?.city || "");
  const [state, setState] = useState(user?.address?.state || "");
  const [zip, setZip] = useState(user?.address?.zip || "");
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const rxs = user.rxHistory || [];
  const protocols = user.protocols || [];
  const orders = user.orders || [];
  const memberLabel = user.memberSince
    ? new Date(user.memberSince).toLocaleDateString(undefined, { month: "short", year: "numeric" })
    : "—";

  const saveProfile = () => {
    const next = onUpdateUser({
      name: name.trim() || user.name,
      phone,
      dob,
      address: { line1, city, state, zip },
    });
    if (next) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "protocols", label: "Care plans" },
    { id: "orders", label: "Orders" },
    { id: "profile", label: "Profile" },
  ];

  return (
    <div className="anim-fadeIn min-h-screen" style={{ background: C.bg }}>
      <Header go={go} cartCount={0} user={user} />
      <section className="px-6 md:px-12 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
            <div>
              <span className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: C.muted, textTransform: "uppercase" }}>Your account</span>
              <h1 className="display" style={{ fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 1, marginTop: 16, marginBottom: 12, fontWeight: 400, color: C.ink }}>
                Welcome back, <Mark>{user.name.split(" ")[0]}</Mark>.
              </h1>
              <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.5 }}>
                Signed in as <span style={{ color: C.ink }}>{user.email}</span>
                <span className="mono" style={{ color: C.muted }}> · Member since {memberLabel}</span>
              </p>
            </div>
            <button onClick={onSignOut}
              className="focus-ring inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm hover:opacity-70"
              style={{ border: `1px solid ${C.line}`, color: C.inkSoft }}>
              <LogOut size={14} /> Sign out
            </button>
          </div>

          <div className="flex gap-2 flex-wrap mt-8 mb-8" style={{ borderBottom: `1px solid ${C.lineSoft}`, paddingBottom: 12 }}>
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="focus-ring px-4 py-2 rounded-full text-sm transition-all"
                style={{
                  background: tab === t.id ? C.ink : "transparent",
                  color: tab === t.id ? C.paper : C.inkSoft,
                  border: `1px solid ${tab === t.id ? C.ink : C.line}`,
                  fontWeight: 500,
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="space-y-6 anim-fadeUp">
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { i: RefreshCw, t: "Quick Refills", d: rxs.length ? `${rxs.length} active prescription${rxs.length === 1 ? "" : "s"}` : "No medicine yet — start a care plan", action: () => go(rxs.length ? "refills" : "landing-conditions"), accent: true },
                  { i: Stethoscope, t: "Start a care plan", d: "Weight, hormones, mental health, your doctor", action: () => go("landing-conditions") },
                  { i: ShoppingBag, t: "Browse the shop", d: "Supplements & devices", action: () => go("marketplace") },
                ].map((card) => (
                  <button key={card.t} onClick={card.action}
                    className="focus-ring text-left p-6 rounded-2xl transition-all hover:-translate-y-0.5"
                    style={{ background: card.accent ? C.accent : C.paper, color: card.accent ? C.paper : C.ink,
                      border: `1px solid ${card.accent ? C.accent : C.line}` }}>
                    <card.i size={20} strokeWidth={1.5} />
                    <div className="display" style={{ fontSize: 22, fontWeight: 500, marginTop: 24, marginBottom: 4 }}>{card.t}</div>
                    <div style={{ fontSize: 13, opacity: 0.75 }}>{card.d}</div>
                  </button>
                ))}
              </div>

              <div className="rounded-2xl p-6" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
                <h3 className="display" style={{ fontSize: 18, fontWeight: 500, color: C.ink, marginBottom: 16 }}>Active prescriptions</h3>
                {rxs.length === 0 ? (
                  <div className="py-6">
                    <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.55, marginBottom: 16 }}>
                      This account is empty until you start care. Begin a care plan and your prescriptions will appear here — only for you.
                    </p>
                    <Btn onClick={() => go("landing-conditions")} size="md" icon={ArrowRight}>Browse care plans</Btn>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {rxs.slice(0, 4).map((rx) => {
                        const Icon = rx.icon || rxIconFor(rx);
                        return (
                          <div key={rx.rxId} className="flex items-center gap-4 py-2">
                            <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: rx.color || C.accent, width: 36, height: 36 }}>
                              <Icon size={16} color={C.paper} strokeWidth={1.5} />
                            </div>
                            <div className="flex-1">
                              <div style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>{rx.name}</div>
                              <div className="mono" style={{ fontSize: 11, color: C.muted, letterSpacing: "0.05em" }}>
                                {typeof rx.refills === "number" ? `${rx.refills - (rx.refillsUsed || 0)} refills left` : rx.lastFilled}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <button onClick={() => go("refills")}
                      className="focus-ring mt-4 inline-flex items-center gap-2 text-sm font-medium hover:opacity-60"
                      style={{ color: C.accent }}>View all & refill<ArrowRight size={14} /></button>
                  </>
                )}
              </div>
            </div>
          )}

          {tab === "protocols" && (
            <div className="anim-fadeUp rounded-2xl p-6" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
              <h3 className="display" style={{ fontSize: 18, fontWeight: 500, color: C.ink, marginBottom: 16 }}>Your care plans</h3>
              {protocols.length === 0 ? (
                <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.55 }}>
                  No care plans on this account yet.{" "}
                  <button onClick={() => go("landing-conditions")} className="focus-ring" style={{ color: C.accent, textDecoration: "underline" }}>Start one</button>.
                </p>
              ) : (
                <div className="space-y-3">
                  {protocols.map((p) => (
                    <div key={p.id} className="flex items-center justify-between gap-4 py-3" style={{ borderBottom: `1px solid ${C.lineSoft}` }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 500, color: C.ink }}>{p.name}</div>
                        <div className="mono" style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                          {(p.status || "active").replace(/_/g, " ")} · started {p.startedAt ? new Date(p.startedAt).toLocaleDateString() : "—"}
                        </div>
                      </div>
                      {p.price != null && <span className="mono" style={{ fontSize: 13, color: C.ink }}>${p.price}/mo</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "orders" && (
            <div className="anim-fadeUp rounded-2xl p-6" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
              <h3 className="display" style={{ fontSize: 18, fontWeight: 500, color: C.ink, marginBottom: 16 }}>Order history</h3>
              {orders.length === 0 ? (
                <div className="flex items-start gap-3">
                  <Package size={18} color={C.muted} style={{ marginTop: 2 }} />
                  <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.55 }}>
                    Orders placed while signed in land here, private to {user.email}.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between gap-4 py-3" style={{ borderBottom: `1px solid ${C.lineSoft}` }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 500, color: C.ink }}>{o.label || o.mode || "Order"}</div>
                        <div className="mono" style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
                          {o.createdAt ? new Date(o.createdAt).toLocaleString() : "—"}
                        </div>
                      </div>
                      {o.total != null && <span className="mono" style={{ fontSize: 13, color: C.ink }}>${o.total}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "profile" && (
            <div className="anim-fadeUp rounded-2xl p-6 space-y-4" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
              <h3 className="display" style={{ fontSize: 18, fontWeight: 500, color: C.ink, marginBottom: 8 }}>Profile</h3>
              <p style={{ fontSize: 13, color: C.inkSoft, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <MapPin size={14} color={C.muted} /> Saved only on your account ({user.email})
              </p>
              <Field label="Full legal name">
                <input value={name} onChange={(e) => setName(e.target.value)} className="focus-ring w-full p-4" style={inputStyle} />
              </Field>
              <Field label="Email">
                <input value={user.email} readOnly className="focus-ring w-full p-4" style={{ ...inputStyle, opacity: 0.65 }} />
              </Field>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Date of birth">
                  <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="focus-ring w-full p-4" style={inputStyle} />
                </Field>
                <Field label="Phone">
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 000-0000" className="focus-ring w-full p-4" style={inputStyle} />
                </Field>
              </div>
              <Field label="Shipping address">
                <input value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="Street address" className="focus-ring w-full p-4" style={inputStyle} />
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="City">
                  <input value={city} onChange={(e) => setCity(e.target.value)} className="focus-ring w-full p-4" style={inputStyle} />
                </Field>
                <Field label="State">
                  <input value={state} onChange={(e) => setState(e.target.value)} className="focus-ring w-full p-4" style={inputStyle} />
                </Field>
                <Field label="ZIP">
                  <input value={zip} onChange={(e) => setZip(e.target.value)} className="focus-ring w-full p-4" style={inputStyle} />
                </Field>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Btn onClick={saveProfile} size="md">Save profile</Btn>
                {saved && <span style={{ fontSize: 13, color: C.accent }}>Saved</span>}
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer go={go} />
    </div>
  );
};

// Keep legacy name for any lingering references
const Dashboard = Account;

// ─────────────────────────────────────────────────────────────────────────────
// Intake
// ─────────────────────────────────────────────────────────────────────────────
const Intake = ({ conditionId, go }) => {
  const condition = conditions[conditionId];
  const questions = intakes[conditionId];
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [direction, setDirection] = useState("forward");

  const isLast = step === questions.length - 1;
  const current = questions[step];
  const value = answers[current.key];

  const canAdvance = (() => {
    if (current.type === "single") return !!value;
    if (current.type === "multi") return Array.isArray(value) && value.length > 0;
    if (current.type === "compound") return current.fields.every((f) => answers[f.key]);
    return false;
  })();

  const handleAdvance = () => {
    if (!canAdvance) return;
    if (isLast) {
      let disqualified = null;
      questions.forEach((q) => {
        if (q.disqualify && Array.isArray(answers[q.key])) {
          const hit = answers[q.key].find((a) => q.disqualify.includes(a));
          if (hit) disqualified = hit;
        }
      });
      go("plan", { condition: conditionId, answers, disqualified });
    } else {
      setDirection("forward");
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step === 0) go("landing");
    else { setDirection("back"); setStep(step - 1); }
  };

  const setAnswer = (key, val) => setAnswers((a) => ({ ...a, [key]: val }));
  const progress = ((step + 1) / questions.length) * 100;

  return (
    <div className="anim-fadeIn min-h-screen flex flex-col" style={{ background: C.bg }}>
      <div className="px-6 md:px-12 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.lineSoft}` }}>
        <Logo />
        <div className="flex items-center gap-4">
          <span className="mono" style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em" }}>
            {String(step + 1).padStart(2, "0")} / {String(questions.length).padStart(2, "0")}
          </span>
          <button onClick={() => go("landing")} className="focus-ring rounded-full p-1 hover:opacity-60 transition-opacity">
            <X size={20} color={C.ink} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div style={{ height: 2, background: C.lineSoft, position: "relative" }}>
        <div style={{ height: "100%", background: C.primary, width: `${progress}%`, transition: "width 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)" }} />
      </div>

      <div className="flex-1 flex items-start md:items-center justify-center px-6 md:px-12 py-12 md:py-16">
        <div key={step} className={direction === "forward" ? "anim-slideRight" : "anim-slideLeft"} style={{ width: "100%", maxWidth: 640 }}>
          <div className="mb-8">
            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: condition.accent, textTransform: "uppercase", fontWeight: 500 }}>{condition.name}</span>
            <h2 className="display" style={{ fontSize: "clamp(28px, 4vw, 44px)", lineHeight: 1.1, fontWeight: 400, color: C.ink, marginTop: 12 }}>{current.title}</h2>
            {current.sub && <p style={{ fontSize: 15, color: C.inkSoft, marginTop: 12, lineHeight: 1.55 }}>{current.sub}</p>}
          </div>

          {current.type === "single" && (
            <div className="space-y-3">
              {current.options.map((opt) => (
                <button key={opt} onClick={() => setAnswer(current.key, opt)}
                  className="focus-ring w-full text-left flex items-center justify-between p-5 transition-all"
                  style={{ background: value === opt ? C.primary : C.paper, color: value === opt ? C.paper : C.ink,
                    border: `1px solid ${value === opt ? C.primary : C.line}`, borderRadius: 12, fontSize: 15, fontWeight: 500 }}>
                  <span>{opt}</span>
                  <div className="rounded-full flex items-center justify-center"
                    style={{ width: 22, height: 22, border: `1.5px solid ${value === opt ? C.paper : C.line}`,
                      background: value === opt ? C.paper : "transparent" }}>
                    {value === opt && <Check size={12} strokeWidth={3} color={C.primary} />}
                  </div>
                </button>
              ))}
            </div>
          )}

          {current.type === "multi" && (
            <div className="space-y-3">
              {current.options.map((opt) => {
                const checked = Array.isArray(value) && value.includes(opt);
                return (
                  <button key={opt}
                    onClick={() => {
                      const cur = Array.isArray(value) ? value : [];
                      let next;
                      if (opt.toLowerCase().includes("none of the above")) next = checked ? [] : [opt];
                      else {
                        const filtered = cur.filter((c) => !c.toLowerCase().includes("none of the above"));
                        next = checked ? filtered.filter((c) => c !== opt) : [...filtered, opt];
                      }
                      setAnswer(current.key, next);
                    }}
                    className="focus-ring w-full text-left flex items-center justify-between p-5 transition-all"
                    style={{ background: checked ? C.primary : C.paper, color: checked ? C.paper : C.ink,
                      border: `1px solid ${checked ? C.primary : C.line}`, borderRadius: 12, fontSize: 15, fontWeight: 500 }}>
                    <span style={{ flex: 1, paddingRight: 16, lineHeight: 1.45 }}>{opt}</span>
                    <div className="flex items-center justify-center flex-shrink-0"
                      style={{ width: 22, height: 22, border: `1.5px solid ${checked ? C.paper : C.line}`,
                        background: checked ? C.paper : "transparent", borderRadius: 6 }}>
                      {checked && <Check size={12} strokeWidth={3} color={C.primary} />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {current.type === "compound" && (
            <div className="grid grid-cols-3 gap-3">
              {current.fields.map((f) => (
                <div key={f.key}>
                  <label className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", color: C.muted, textTransform: "uppercase", display: "block", marginBottom: 8 }}>{f.label}</label>
                  <input type={f.type} value={answers[f.key] || ""} onChange={(e) => setAnswer(f.key, e.target.value)} placeholder={f.placeholder}
                    className="focus-ring w-full p-4"
                    style={{ background: C.bgAlt, border: `1px solid ${C.line}`, borderRadius: 12, fontSize: 18, color: C.ink, fontFamily: fonts.display, fontWeight: 500 }} />
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-12">
            <button onClick={handleBack} className="focus-ring inline-flex items-center gap-2 px-4 py-2 rounded-full transition-opacity hover:opacity-60" style={{ color: C.inkSoft, fontSize: 14 }}>
              <ArrowLeft size={16} strokeWidth={1.75} />Back
            </button>
            <Btn onClick={handleAdvance} disabled={!canAdvance} size="lg" icon={ArrowRight}>{isLast ? "See my plan" : "Continue"}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Plan view — Empower-aligned subscriptions with compareAt vs Hims/Ro
// ─────────────────────────────────────────────────────────────────────────────
const Plan = ({ conditionId, answers, disqualified, go, onSelectPlan }) => {
  const condition = conditions[conditionId];
  const planGraphic = conditionGraphics[conditionId] || imgMarketplaceHero;

  if (disqualified) {
    return (
      <div className="anim-fadeIn min-h-screen px-6 md:px-12 py-12" style={{ background: C.bg }}>
        <div className="max-w-2xl mx-auto pt-12">
          <Logo />
          <div className="mt-12 p-10 rounded-3xl" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
            <div className="inline-flex items-center justify-center mb-6 rounded-full p-3" style={{ background: "hsl(38, 92%, 95%)" }}>
              <AlertCircle size={28} strokeWidth={1.5} color={C.warn} />
            </div>
            <h2 className="display" style={{ fontSize: 36, fontWeight: 400, color: C.ink, marginBottom: 16 }}>We need to talk first.</h2>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: C.inkSoft, marginBottom: 24 }}>
              Based on your answer regarding <strong>{disqualified}</strong>, this medication isn't appropriate to prescribe through an asynchronous visit. A SpryMD clinician would like to speak with you directly.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: C.inkSoft, marginBottom: 32 }}>
              We'll route your case for a synchronous consult — no charge until we determine whether treatment is safe and appropriate.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Btn onClick={() => go("success", { consult: true })} size="lg">Request a clinician call</Btn>
              <Btn onClick={() => go("landing")} size="lg" variant="ghost">Return home</Btn>
            </div>
          </div>
        </div>
      </div>
    );
  }

  let recommended = condition.treatments[0];
  const pref = answers?.preference;
  if (conditionId === "weightloss" && pref) {
    if (pref.includes("Oral")) recommended = condition.treatments.find((t) => t.id === "tirz-odt") || recommended;
    else if (pref.includes("Injection")) recommended = condition.treatments.find((t) => t.id === "tirz-mid") || recommended;
  }
  if (conditionId === "ed" && pref) {
    if (pref.includes("Daily")) recommended = condition.treatments.find((t) => t.id === "tada-daily") || recommended;
    else if (pref.includes("Fast-melt")) recommended = condition.treatments.find((t) => t.id === "sild-odt") || recommended;
    else if (pref.includes("As needed")) recommended = condition.treatments.find((t) => t.id === "sild-prn") || recommended;
  }
  if (conditionId === "lowt" && pref) {
    if (pref.includes("injection") || pref.includes("Injection")) recommended = condition.treatments.find((t) => t.id === "t-cyp") || recommended;
    else if (pref.includes("oral") || pref.includes("Oral")) recommended = condition.treatments.find((t) => t.id === "enclo") || recommended;
    else if (pref.includes("cream") || pref.includes("Cream") || pref.includes("Topical")) recommended = condition.treatments.find((t) => t.id === "t-cream") || recommended;
    else if (answers?.fertility?.includes("Yes") || answers?.fertility?.includes("Maybe")) {
      recommended = condition.treatments.find((t) => t.id === "enclo") || recommended;
    }
  }
  if (conditionId === "mentalhealth" && pref) {
    if (pref.includes("anxiety") && !pref.includes("depression")) recommended = condition.treatments.find((t) => t.id === "escitalopram") || recommended;
    else if (pref.includes("depression") && !pref.includes("anxiety")) recommended = condition.treatments.find((t) => t.id === "sertraline") || recommended;
    else if (pref.includes("energy") || pref.includes("sexual")) recommended = condition.treatments.find((t) => t.id === "bupropion") || recommended;
    else if (pref.includes("gentle")) recommended = condition.treatments.find((t) => t.id === "buspirone") || recommended;
  }
  if (conditionId === "pcp" && pref) {
    if (pref.includes("labs")) recommended = condition.treatments.find((t) => t.id === "pcp-labs") || recommended;
    else if (pref.includes("Lighter") || pref.includes("messaging when")) recommended = condition.treatments.find((t) => t.id === "pcp-essentials") || recommended;
    else if (pref.includes("Household") || answers?.household?.includes("partner")) recommended = condition.treatments.find((t) => t.id === "pcp-family") || recommended;
    else if (pref.includes("Full primary")) recommended = condition.treatments.find((t) => t.id === "pcp-core") || recommended;
  }

  const alternatives = condition.treatments.filter((t) => t.id !== recommended.id);

  return (
    <div className="anim-fadeIn min-h-screen" style={{ background: C.bg }}>
      <DeliveryBar />
      <div className="px-6 md:px-12 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.lineSoft}` }}>
        <Logo /><Tag>Plan ready</Tag>
      </div>

      <div className="px-6 md:px-12 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="anim-fadeUp mb-12">
            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: condition.accent, textTransform: "uppercase", fontWeight: 500 }}>Reviewed and ready</span>
            <h1 className="display" style={{ fontSize: "clamp(38px, 6vw, 72px)", lineHeight: 1, fontWeight: 400, color: C.ink, marginTop: 16 }}>
              Your <Mark>{condition.name.toLowerCase()}</Mark><br />treatment plan.
            </h1>
            <p style={{ fontSize: 16, color: C.inkSoft, marginTop: 16, maxWidth: 600, lineHeight: 1.5 }}>
              Based on your answers, you're a good fit for the care plan below. A licensed doctor will review your case before any prescription is issued.
            </p>
          </div>
          <div className="anim-fadeUp rounded-3xl overflow-hidden mb-8 relative" style={{ border: `1px solid ${C.line}` }}>
            <img src={planGraphic} alt={`${condition.name} treatment`} className="w-full h-44 md:h-56 object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.2) 100%)" }} />
            <div className="absolute left-6 right-6 bottom-6">
              <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "rgba(255,255,255,0.78)", textTransform: "uppercase" }}>Care pathway</span>
              <p style={{ color: "#fff", fontSize: 20, marginTop: 8, lineHeight: 1.2 }}>{condition.name} plan personalized to your intake.</p>
            </div>
          </div>

          <div className="anim-fadeUp grid md:grid-cols-12 gap-6 p-6 md:p-10 rounded-3xl mb-8" style={{ background: C.primary, color: C.paper, animationDelay: "0.1s" }}>
            <div className="md:col-span-7">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag color="rgba(255,255,255,0.1)" fg={C.paper}>Top recommendation</Tag>
                {recommended.badge && <Tag color={C.accent} fg={C.paper}>{recommended.badge}</Tag>}
                {recommended.chilled && <Tag color="rgba(255,255,255,0.1)" fg={C.paper}><Snowflake size={9} style={{ display: "inline", marginRight: 3 }} />Refrigerated</Tag>}
              </div>
              <h2 className="display" style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 400, marginTop: 16, lineHeight: 1.05 }}>{recommended.name}</h2>
              <p style={{ fontSize: 14, opacity: 0.7, marginTop: 6 }}>{recommended.sub}</p>
              <p style={{ fontSize: 15, marginTop: 24, opacity: 0.85, lineHeight: 1.55 }}>
                {recommended.note}{" "}
                {conditionId === "pcp"
                  ? "Includes ongoing clinician support, secure messaging, and care coordination."
                  : "Compounded at Empower Pharmacy. Free shipping. Includes ongoing clinician support and dose adjustments."}
              </p>
              <div className="mt-8 space-y-2">
                {(conditionId === "pcp"
                  ? ["Unlimited secure messaging", "Annual wellness visit", "Cancel or pause whenever", "Synced with your gethealthy.com record"]
                  : ["Free shipping, every refill", "Message your clinician anytime", "Cancel or pause whenever", "Synced with your gethealthy.com record"]
                ).map((b) => (
                  <div key={b} className="flex items-center gap-2">
                    <Check size={14} strokeWidth={2} color={C.accentSoft} />
                    <span style={{ fontSize: 14, opacity: 0.9 }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:col-span-5">
              <div className="p-6 rounded-2xl h-full flex flex-col justify-between" style={{ background: "rgba(248,244,234,0.08)", border: "1px solid rgba(248,244,234,0.15)" }}>
                <div>
                  <span className="mono" style={{ fontSize: 10, letterSpacing: "0.2em", opacity: 0.7 }}>MONTHLY</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="display" style={{ fontSize: 56, fontWeight: 400, lineHeight: 1 }}>${recommended.price}</span>
                    <span style={{ fontSize: 14, opacity: 0.7 }}>/mo</span>
                  </div>
                  {recommended.compareAt && (
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span style={{ fontSize: 13, color: C.accentSoft, textDecoration: "line-through", opacity: 0.7 }}>${recommended.compareAt}/mo</span>
                      <Tag color={C.accent} fg={C.paper}>SAVE ${recommended.compareAt - recommended.price} VS {recommended.comparePeer.toUpperCase()}</Tag>
                    </div>
                  )}
                  <p style={{ fontSize: 12, opacity: 0.6, marginTop: 12 }}>Billed monthly. No commitment. Cancel anytime.</p>
                </div>
                <Btn onClick={() => onSelectPlan(recommended)} size="lg" variant="accent" icon={ArrowRight} className="w-full mt-6">Continue to checkout</Btn>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Lock size={12} color={C.accentSoft} />
                  <span className="mono" style={{ fontSize: 10, opacity: 0.7, letterSpacing: "0.1em" }}>SECURE · STRIPE</span>
                </div>
              </div>
            </div>
          </div>

          <div className="anim-fadeUp" style={{ animationDelay: "0.2s" }}>
            <h3 className="display" style={{ fontSize: 24, fontWeight: 500, marginBottom: 16, color: C.ink }}>Or consider these alternatives</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {alternatives.map((t) => (
                <div key={t.id} className="p-6 rounded-2xl flex items-start justify-between gap-4" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <div style={{ fontSize: 17, fontWeight: 600, color: C.ink }}>{t.name}</div>
                      {t.badge && <Tag color={C.bgAlt}>{t.badge}</Tag>}
                      {t.chilled && <Tag color={C.bgAlt}><Snowflake size={9} style={{ display: "inline", marginRight: 3 }} />Cold</Tag>}
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>{t.sub}</div>
                    <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.45 }}>{t.note}</div>
                  </div>
                  <button onClick={() => onSelectPlan(t)}
                    className="focus-ring rounded-full px-4 py-2 text-sm font-medium transition-colors flex-shrink-0"
                    style={{ background: C.bgAlt, color: C.ink, border: `1px solid ${C.line}` }}>${t.price}/mo</button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 mb-8">
            <DeliveryDetailsCard />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[{ i: ShieldCheck, t: "Clinician-reviewed", d: "Every prescription is signed by a licensed provider in your state." },
              { i: Truck, t: "Eligible TN delivery", d: TN_DELIVERY.heroShort },
              { i: Stethoscope, t: "Ongoing support", d: "Message your care team anytime through the app." }].map((b) => (
              <div key={b.t} className="p-6 rounded-2xl" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
                <b.i size={20} color={C.primary} strokeWidth={1.5} />
                <div className="display" style={{ fontSize: 18, fontWeight: 500, marginTop: 12, marginBottom: 6, color: C.ink }}>{b.t}</div>
                <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>{b.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Marketplace
// ─────────────────────────────────────────────────────────────────────────────
const Marketplace = ({ go, cart, addToCart, removeFromCart, cartCount, user, initialFilter = "All" }) => {
  const [filter, setFilter] = useState(initialFilter || "All");
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    setFilter(initialFilter || "All");
  }, [initialFilter]);

  const filtered = products.filter((p) => {
    if (filter !== "All" && p.cat !== filter) return false;
    return true;
  });

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="anim-fadeIn min-h-screen" style={{ background: C.bg }}>
      <Header go={go} cartCount={cartCount} user={user} />

      <section className="px-6 md:px-12 pt-12 md:pt-16 pb-8" style={{ borderBottom: `1px solid ${C.lineSoft}` }}>
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-[28px] overflow-hidden mb-10" style={{ border: `1px solid ${C.line}` }}>
            <img src={imgMarketplaceHero} alt="Spry shop" className="w-full h-[180px] md:h-[260px] object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.2) 100%)" }} />
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
              <span className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: C.accentSoft, textTransform: "uppercase" }}>Marketplace</span>
              <h1 className="display" style={{ fontSize: "clamp(36px, 6vw, 64px)", lineHeight: 1, fontWeight: 400, color: C.ink, marginTop: 10 }}>
                The <Mark>shop</Mark>.
              </h1>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.72)", maxWidth: 480, lineHeight: 1.55, marginTop: 12 }}>
                Branded Spry essentials, sleep apnea gear, and clinician-curated devices. Free shipping over $50.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 text-sm" style={{ color: C.inkSoft }}>
            {[{ i: Truck, t: "Free shipping $50+" }, { i: ShieldCheck, t: "HSA / FSA eligible" }, { i: Star, t: "4.8 avg rating" }].map((b) => (
              <div key={b.t} className="flex items-center gap-2">
                <b.i size={15} strokeWidth={1.75} color={C.ok} />
                <span>{b.t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 py-6 sticky top-0 z-10" style={{ background: C.bg, borderBottom: `1px solid ${C.lineSoft}` }}>
        <div className="max-w-7xl mx-auto flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {productCategories.map((cat) => (
              <button key={cat} onClick={() => setFilter(cat)}
                className="focus-ring px-4 py-2 rounded-full transition-all whitespace-nowrap"
                style={{ background: filter === cat ? C.ink : "transparent", color: filter === cat ? C.paper : C.ink,
                  border: `1px solid ${filter === cat ? C.ink : C.line}`, fontSize: 13, fontWeight: 500 }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 py-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((p) => <ProductCard key={p.id} p={p} onAdd={() => addToCart(p)} />)}
        </div>
        {filtered.length === 0 && <div className="text-center py-20"><p style={{ color: C.muted, fontSize: 15 }}>No products match those filters.</p></div>}
      </section>

      {cart.length > 0 && (
        <button onClick={() => setShowCart(true)}
          className="anim-fadeUp focus-ring fixed bottom-6 right-6 px-6 py-4 rounded-full flex items-center gap-3 shadow-lg transition-transform hover:-translate-y-0.5"
          style={{ background: C.ink, color: C.paper, zIndex: 30 }}>
          <ShoppingBag size={18} />
          <span style={{ fontSize: 14, fontWeight: 500 }}>{cartCount} item{cartCount > 1 ? "s" : ""} · ${cartTotal.toFixed(2)}</span>
          <ArrowRight size={16} />
        </button>
      )}

      {showCart && (
        <CartDrawer cart={cart} onClose={() => setShowCart(false)} removeFromCart={removeFromCart} addToCart={addToCart}
          onCheckout={() => { setShowCart(false); go("checkout-cart"); }} />
      )}

      <Footer go={go} />
    </div>
  );
};

const ProductCard = ({ p, onAdd }) => {
  const Icon = p.icon;
  const [hover, setHover] = useState(false);
  const savings = p.compareAt ? p.compareAt - p.price : 0;
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className="rounded-2xl overflow-hidden transition-all flex flex-col"
      style={{ background: C.paper, border: `1px solid ${hover ? C.inkSoft : C.line}`, transform: hover ? "translateY(-3px)" : "none", boxShadow: hover ? "0 18px 40px -24px rgba(255,255,255,0.25)" : "none" }}>
      <div className="aspect-square relative flex items-center justify-center overflow-hidden" style={{ background: p.image ? C.bg : p.color }}>
        {p.image
          ? <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500" style={{ transform: hover ? "scale(1.06)" : "scale(1)" }} />
          : <Icon size={56} color={C.paper} strokeWidth={1} style={{ opacity: 0.9 }} />}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {p.badge && (
            <span className="mono" style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", background: C.ink, color: C.paper, padding: "5px 10px", borderRadius: 999, fontWeight: 600 }}>
              {p.badge}
            </span>
          )}
          {savings > 0 && (
            <span className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", background: C.ok, color: "#04120a", padding: "5px 10px", borderRadius: 999, fontWeight: 700 }}>
              Save ${savings}
            </span>
          )}
        </div>
        {p.hsa && (
          <span className="absolute top-3 right-3 mono" style={{ fontSize: 10, letterSpacing: "0.08em", background: "rgba(0,0,0,0.65)", color: C.ink, border: `1px solid ${C.line}`, padding: "5px 9px", borderRadius: 999 }}>
            HSA/FSA
          </span>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2 gap-2">
          <span className="mono" style={{ fontSize: 10, color: C.muted, letterSpacing: "0.1em" }}>{p.brand.toUpperCase()}</span>
          {p.rating && (
            <span className="flex items-center gap-1" style={{ fontSize: 12, color: C.inkSoft }}>
              <Star size={12} fill={C.inkSoft} color={C.inkSoft} /> {p.rating}
              <span style={{ color: C.muted }}>({p.reviews})</span>
            </span>
          )}
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: C.ink, marginBottom: 4, lineHeight: 1.3 }}>{p.name}</h3>
        {p.benefit && <p style={{ fontSize: 13, color: C.ok, marginBottom: 8, fontWeight: 500 }}>{p.benefit}</p>}
        <p style={{ fontSize: 12, color: C.inkSoft, marginBottom: 16, lineHeight: 1.5, flex: 1 }}>{p.desc}</p>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="display" style={{ fontSize: 24, color: C.ink, fontWeight: 500 }}>${p.price}</span>
              {p.compareAt && <span style={{ fontSize: 13, color: C.muted, textDecoration: "line-through" }}>${p.compareAt}</span>}
            </div>
          </div>
          <button onClick={onAdd} className="focus-ring px-4 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5"
            style={{ background: hover ? C.ok : C.ink, color: hover ? "#04120a" : C.paper }}>
            <Plus size={14} strokeWidth={2} />Add
          </button>
        </div>
      </div>
    </div>
  );
};

const CartDrawer = ({ cart, onClose, removeFromCart, addToCart, onCheckout }) => {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 anim-fadeIn" style={{ background: "rgba(21, 32, 26, 0.4)", zIndex: 40, backdropFilter: "blur(4px)" }} />
      <div className="anim-slideRight fixed right-0 top-0 bottom-0 w-full max-w-md flex flex-col" style={{ background: C.paper, zIndex: 50 }}>
        <div className="p-6 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.line}` }}>
          <h3 className="display" style={{ fontSize: 24, fontWeight: 500, color: C.ink }}>Your bag</h3>
          <button onClick={onClose} className="focus-ring p-1 rounded-full"><X size={20} color={C.ink} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="flex gap-4">
                <div className="rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ background: item.image ? C.bg : item.color, width: 80, height: 80 }}>
                  {item.image
                    ? <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                    : <Icon size={28} color={C.paper} strokeWidth={1.25} />}
                </div>
                <div className="flex-1">
                  <div style={{ fontSize: 14, color: C.ink, fontWeight: 500, lineHeight: 1.3 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{item.brand}{item.benefit ? ` · ${item.benefit}` : ""}</div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3 px-3 py-1.5 rounded-full" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
                      <button onClick={() => removeFromCart(item)} className="focus-ring"><Minus size={12} strokeWidth={2} /></button>
                      <span className="mono" style={{ fontSize: 12, fontWeight: 500 }}>{item.qty}</span>
                      <button onClick={() => addToCart(item)} className="focus-ring"><Plus size={12} strokeWidth={2} /></button>
                    </div>
                    <span className="display" style={{ fontSize: 16, fontWeight: 500, color: C.ink }}>${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-6" style={{ borderTop: `1px solid ${C.line}` }}>
          <div className="flex items-baseline justify-between mb-4">
            <span style={{ fontSize: 13, color: C.inkSoft }}>Subtotal</span>
            <span className="display" style={{ fontSize: 28, fontWeight: 500, color: C.ink }}>${total.toFixed(2)}</span>
          </div>
          <Btn onClick={onCheckout} size="lg" className="w-full" icon={ArrowRight}>Checkout</Btn>
        </div>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Subscription / Cart Checkout — auth hold; fulfillment after clinician review
// ─────────────────────────────────────────────────────────────────────────────
const Checkout = ({ mode, plan, condition, cart, go, onComplete, user }) => {
  const [email, setEmail] = useState(user?.email || "");
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [zip, setZip] = useState("");
  const [name, setName] = useState(user?.name || "");
  const [processing, setProcessing] = useState(false);
  const [consent, setConsent] = useState(false);

  const isSubscription = mode === "subscription";
  const cartTotal = cart ? cart.reduce((s, i) => s + i.price * i.qty, 0) : 0;
  const subtotal = isSubscription ? plan.price : cartTotal;
  const shipping = isSubscription ? 0 : cartTotal >= 50 ? 0 : 7;
  const tax = subtotal * 0.0875;
  const total = subtotal + shipping + tax;

  const formatCard = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExp = (v) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return digits.slice(0, 2) + " / " + digits.slice(2);
  };

  const canSubmit = email.includes("@") && card.replace(/\s/g, "").length === 16 && exp.length >= 7 && cvc.length >= 3 && zip.length >= 5 && name.trim().length > 0 && consent;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setProcessing(true);
    setTimeout(() => onComplete({ email, name }), 1200);
  };

  return (
    <div className="anim-fadeIn min-h-screen" style={{ background: C.bg }}>
      <DeliveryBar />
      <div className="px-6 md:px-12 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.lineSoft}` }}>
        <Logo />
        <button onClick={() => go(isSubscription ? "plan" : "marketplace")} className="focus-ring rounded-full p-1 hover:opacity-60">
          <X size={20} color={C.ink} strokeWidth={1.5} />
        </button>
      </div>

      <div className="px-6 md:px-12 py-12">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
          <div>
            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: C.muted, textTransform: "uppercase" }}>Checkout</span>
            <h1 className="display" style={{ fontSize: "clamp(32px, 4vw, 48px)", lineHeight: 1.05, fontWeight: 400, marginTop: 12, marginBottom: 16, color: C.ink }}>
              Almost <Mark>there</Mark>.
            </h1>
            <p style={{ fontSize: 14, color: C.inkSoft, marginBottom: 28, lineHeight: 1.55, maxWidth: 480 }}>
              {isSubscription
                ? "Your case goes to clinician review before any prescription ships. Card authorization is held until approval."
                : "Your order is saved to your SpryMD account. Authorization is held until fulfillment is confirmed."}
            </p>

            <div className="space-y-6">
              <Field label="Email"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="focus-ring w-full p-4" style={inputStyle} /></Field>
              <Field label="Cardholder name"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="As it appears on card" className="focus-ring w-full p-4" style={inputStyle} /></Field>
              <div>
                <label className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", color: C.muted, textTransform: "uppercase", display: "block", marginBottom: 8, fontWeight: 500 }}>Card information</label>
                <div className="rounded-xl overflow-hidden" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
                  <input value={card} onChange={(e) => setCard(formatCard(e.target.value))} placeholder="1234 1234 1234 1234" className="focus-ring w-full p-4" style={{ ...inputStyle, border: "none", borderBottom: `1px solid ${C.line}`, borderRadius: 0, background: "transparent" }} />
                  <div className="flex">
                    <input value={exp} onChange={(e) => setExp(formatExp(e.target.value))} placeholder="MM / YY" className="focus-ring flex-1 p-4" style={{ ...inputStyle, border: "none", borderRight: `1px solid ${C.line}`, borderRadius: 0, background: "transparent" }} />
                    <input value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="CVC" className="focus-ring flex-1 p-4" style={{ ...inputStyle, border: "none", borderRadius: 0, background: "transparent" }} />
                  </div>
                </div>
              </div>
              <Field label="ZIP / Postal code"><input value={zip} onChange={(e) => setZip(e.target.value.slice(0, 10))} placeholder="38201" className="focus-ring w-full p-4" style={inputStyle} /></Field>

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
                <span style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>
                  I agree to the <a href="/terms" style={{ color: C.accent }}>Terms</a>, <a href="/privacy" style={{ color: C.accent }}>Privacy Policy</a>, and <a href="/npp" style={{ color: C.accent }}>NPP</a>, and I understand a clinician must approve treatment before medication ships.
                </span>
              </label>

              <Btn onClick={handleSubmit} disabled={!canSubmit || processing} size="lg" className="w-full" icon={!processing ? Lock : null}>
                {processing ? <span className="anim-pulse">Submitting…</span> : isSubscription ? `Submit case · $${total.toFixed(2)} auth hold` : `Place order · $${total.toFixed(2)}`}
              </Btn>
              <div className="flex items-center justify-center gap-2">
                <Lock size={11} color={C.muted} />
                <span className="mono" style={{ fontSize: 10, color: C.muted, letterSpacing: "0.12em" }}>ENCRYPTED · CLINICIAN REVIEW BEFORE FULFILLMENT</span>
              </div>
            </div>
          </div>

          <div>
            <div className="p-8 rounded-3xl sticky top-8" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
              <h3 className="display" style={{ fontSize: 22, fontWeight: 500, color: C.ink, marginBottom: 24 }}>Order summary</h3>

              {isSubscription ? (
                <div className="pb-6 mb-6" style={{ borderBottom: `1px solid ${C.line}` }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Tag color={C.bgAlt}>Pending clinician review</Tag>
                      <div style={{ fontSize: 17, fontWeight: 500, color: C.ink, marginTop: 8 }}>{plan.name}</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{plan.sub}</div>
                      <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 8 }}>For: <strong>{conditions[condition].name}</strong></div>
                    </div>
                    <span className="display" style={{ fontSize: 20, fontWeight: 500, color: C.ink }}>${plan.price}/mo</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pb-6 mb-6" style={{ borderBottom: `1px solid ${C.line}` }}>
                  {cart.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.id} className="flex gap-3 items-center">
                        <div className="rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ background: item.image ? C.bg : item.color, width: 56, height: 56 }}>
                          {item.image
                            ? <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                            : <Icon size={20} color={C.paper} strokeWidth={1.25} />}
                        </div>
                        <div className="flex-1">
                          <div style={{ fontSize: 13, color: C.ink, fontWeight: 500, lineHeight: 1.3 }}>{item.name}</div>
                          <div style={{ fontSize: 11, color: C.muted }}>Qty {item.qty}</div>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="space-y-2 pb-6 mb-6" style={{ borderBottom: `1px solid ${C.line}` }}>
                <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
                <Row label="Shipping" value={shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`} />
                <Row label="Tax (est.)" value={`$${tax.toFixed(2)}`} />
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <span style={{ fontSize: 14, color: C.inkSoft, fontWeight: 500 }}>{isSubscription ? "Today" : "Total"}</span>
                <span className="display" style={{ fontSize: 32, fontWeight: 500, color: C.ink }}>${total.toFixed(2)}</span>
              </div>
              {isSubscription && <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.4, marginTop: 8 }}>Then ${plan.price}/mo after clinician approval. Cancel anytime in your account.</p>}
              <div className="mt-6">
                <DeliveryDetailsCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Subscription/Cart success
const Success = ({ mode, plan, consult, go }) => (
  <div className="anim-fadeIn min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: C.bg }}>
    <div className="anim-fadeUp max-w-xl">
      <div className="rounded-2xl overflow-hidden mb-7" style={{ border: `1px solid ${C.line}` }}>
        <img src={imgMarketplaceHero} alt="SpryMD care complete" className="w-full h-40 object-cover" />
      </div>
      <div className="inline-flex items-center justify-center mb-8 rounded-full" style={{ background: C.primary, width: 72, height: 72 }}>
        <Check size={32} color={C.paper} strokeWidth={2} />
      </div>
      <span className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: C.muted, textTransform: "uppercase" }}>
        {consult ? "Consult requested" : mode === "subscription" ? "Case submitted" : "Order recorded"}
      </span>
      <h1 className="display" style={{ fontSize: "clamp(40px, 6vw, 64px)", lineHeight: 1.05, fontWeight: 400, color: C.ink, marginTop: 16, marginBottom: 24 }}>
        {consult ? <>We'll be in <Mark>touch</Mark>.</> : <>Saved to your <Mark>account</Mark>.</>}
      </h1>
      <p style={{ fontSize: 16, color: C.inkSoft, lineHeight: 1.55, marginBottom: 40 }}>
        {consult
          ? "A clinician will reach out within 24 hours to schedule a brief synchronous consult."
          : mode === "subscription"
          ? `Your intake for ${plan?.name || "treatment"} is queued for clinician review. Nothing ships until a prescription is signed. Track status anytime in your account.`
          : "Your order is on your account. You’ll get updates by email as fulfillment progresses."}
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Btn onClick={() => go("dashboard")} size="lg" variant="dark">Open dashboard</Btn>
        <Btn onClick={() => go("landing")} size="lg" variant="ghost">Back to home</Btn>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// App root
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const navigate = useNavigate();
  const [view, setView] = useState("landing");
  const [params, setParams] = useState({});
  const [cart, setCart] = useState([]);
  const [refillCart, setRefillCart] = useState([]);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const profile = await restoreCustomerSession();
      if (!cancelled && profile) setUser(hydrateUser(profile));
      if (!cancelled) setAuthReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  // Deep-link: /?auth=1&returnTo=... or /?view=marketplace&filter=Devices
  useEffect(() => {
    if (!authReady) return;
    const qs = new URLSearchParams(window.location.search);
    if (qs.get("auth") === "1") {
      const returnTo = qs.get("returnTo") || "dashboard";
      const target = returnTo.startsWith("/dashboard") || returnTo === "account" ? "dashboard" : returnTo;
      setParams({ returnTo: target });
      setView("signin");
      window.history.replaceState({}, "", "/");
      return;
    }
    const deepView = qs.get("view");
    if (deepView === "marketplace") {
      setParams({ filter: qs.get("filter") || "All" });
      setView("marketplace");
      window.history.replaceState({}, "", "/");
    }
  }, [authReady]);

  const requireAuth = (target, extra = {}) => {
    setParams({ returnTo: target, ...extra });
    setView("signin");
    window.scrollTo(0, 0);
  };

  const openPatientDashboard = () => {
    navigate("/dashboard");
    window.scrollTo(0, 0);
  };

  const go = (target, p = {}) => {
    if (target === "landing-conditions") {
      setView("landing");
      setTimeout(() => { const el = document.getElementById("landing-conditions"); if (el) el.scrollIntoView({ behavior: "smooth" }); }, 50);
      return;
    }
    if (target === "how") {
      setView("landing");
      setTimeout(() => { const el = document.getElementById("how"); if (el) el.scrollIntoView({ behavior: "smooth" }); }, 50);
      return;
    }
    // Auth gates — account + refills require a signed-in customer
    // justLoggedIn covers the render before setUser flushes
    if ((target === "refills" || target === "account" || target === "dashboard") && !user && !p.justLoggedIn) {
      requireAuth(target === "dashboard" || target === "account" ? "account" : target, p);
      return;
    }
    // Patient account dashboard (React Router)
    if (target === "account" || target === "dashboard") {
      openPatientDashboard();
      return;
    }
    if (target === "intake") { setParams({ condition: p.condition }); setView("intake"); window.scrollTo(0, 0); return; }
    if (target === "plan") { setParams({ ...params, ...p }); setView("plan"); window.scrollTo(0, 0); return; }
    if (target === "page") { setParams({ slug: p.slug }); setView("page"); window.scrollTo(0, 0); return; }
    if (target === "marketplace") { setParams({ filter: p.filter || "All" }); setView("marketplace"); window.scrollTo(0, 0); return; }
    if (target === "checkout-cart") {
      if (!user) {
        requireAuth("checkout", { mode: "cart" });
        return;
      }
      setParams({ mode: "cart" });
      setView("checkout");
      window.scrollTo(0, 0);
      return;
    }
    if (target === "checkout") {
      if (!user && !p.justLoggedIn) {
        requireAuth("checkout", { ...params, ...p });
        return;
      }
      setParams({ ...params, ...p, mode: p.mode || params.mode || "subscription" });
      setView("checkout");
      window.scrollTo(0, 0);
      return;
    }
    if (target === "refill-checkout") { setView("refill-checkout"); window.scrollTo(0, 0); return; }
    if (target === "refill-success") { setView("refill-success"); window.scrollTo(0, 0); return; }
    if (target === "success") { setParams({ ...params, ...p }); setView("success"); window.scrollTo(0, 0); return; }
    if (target === "signin") {
      setParams({ returnTo: p.returnTo || params.returnTo || "dashboard", ...p });
      setView("signin");
      window.scrollTo(0, 0);
      return;
    }
    setParams({ ...params, ...p });
    setView(target);
    window.scrollTo(0, 0);
  };

  const addToCart = (p) => {
    setCart((c) => {
      const existing = c.find((i) => i.id === p.id);
      if (existing) return c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { ...p, qty: 1 }];
    });
  };

  const removeFromCart = (p) => {
    setCart((c) => {
      const existing = c.find((i) => i.id === p.id);
      if (existing && existing.qty > 1) return c.map((i) => (i.id === p.id ? { ...i, qty: i.qty - 1 } : i));
      return c.filter((i) => i.id !== p.id);
    });
  };

  const addRefill = (rx) => setRefillCart((c) => (c.find((i) => i.rxId === rx.rxId) ? c : [...c, rx]));
  const removeRefill = (rxId) => setRefillCart((c) => c.filter((i) => i.rxId !== rxId));

  const onSelectPlan = (plan) => {
    if (!user) {
      requireAuth("checkout", { plan, mode: "subscription", condition: params.condition, answers: params.answers });
      return;
    }
    setParams({ ...params, plan, mode: "subscription" });
    setView("checkout");
    window.scrollTo(0, 0);
  };

  const onAuthSuccess = (u) => {
    setUser(hydrateUser(u));
  };

  const onUpdateUser = (patch) => {
    if (!user?.email) return null;
    const next = hydrateUser(updateCustomerProfile(user.email, patch));
    setUser(next);
    return next;
  };

  const onSignOut = async () => {
    await signOutCustomer();
    setUser(null);
    setRefillCart([]);
    setView("landing");
    setParams({});
    window.scrollTo(0, 0);
  };

  const completeCheckout = (checkoutMeta = {}) => {
    const email = (user?.email || checkoutMeta.email || "").toLowerCase();
    if (!email) {
      requireAuth("checkout", { ...params });
      return;
    }
    ensureAccountShell(email, checkoutMeta.name || user?.name);
    if (params.mode === "subscription" && params.plan) {
      recordSubscriptionCheckout({
        email,
        plan: params.plan,
        conditionId: params.condition,
        conditionName: conditions[params.condition]?.name,
        answers: params.answers,
      });
    } else if (params.mode === "cart") {
      const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
      recordCartCheckout({
        email,
        items: cart.map((i) => ({ name: i.name, qty: i.qty, price: i.price, productId: i.id })),
        total,
      });
    }
    setUser(hydrateUser(updateCustomerProfile(email, { name: checkoutMeta.name || user?.name })));
    if (params.mode === "cart") setCart([]);
    go("success", { mode: params.mode });
  };

  const completeRefillCheckout = () => {
    if (user?.email && refillCart.length) {
      const total = refillCart.reduce((s, i) => s + i.price, 0);
      recordRefillCheckout({
        email: user.email,
        items: refillCart.map((r) => ({ rxId: r.rxId, name: r.name, price: r.price })),
        total,
      });
      setUser(hydrateUser(updateCustomerProfile(user.email, {})));
    }
    go("refill-success");
  };

  if (!authReady) {
    return (
      <div style={{ background: C.bg, minHeight: "100vh", color: C.ink }} className="flex items-center justify-center">
        <FontInjector />
        <span className="mono anim-pulse" style={{ fontSize: 12, letterSpacing: "0.16em", color: C.muted }}>LOADING ACCOUNT…</span>
      </div>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.ink }}>
      <FontInjector />

      {view === "landing" && (<><DeliveryBar onClick={() => go("how")} /><Header go={go} cartCount={cartCount} user={user} /><Landing go={go} /></>)}
      {view === "page" && <FooterPage slug={params.slug} go={go} cartCount={cartCount} user={user} />}
      {view === "intake" && <Intake conditionId={params.condition} go={go} />}
      {view === "plan" && <Plan conditionId={params.condition} answers={params.answers} disqualified={params.disqualified} go={go} onSelectPlan={onSelectPlan} />}
      {view === "marketplace" && <Marketplace go={go} cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} cartCount={cartCount} user={user} initialFilter={params.filter || "All"} />}
      {view === "checkout" && (
        <Checkout mode={params.mode} plan={params.plan} condition={params.condition} cart={cart} go={go} user={user}
          onComplete={completeCheckout} />
      )}
      {view === "success" && <Success mode={params.mode} plan={params.plan} consult={params.consult} go={go} />}
      {view === "signin" && <SignIn go={go} returnTo={params.returnTo} onAuthSuccess={onAuthSuccess} />}
      {view === "refills" && user && <Refills user={user} go={go} refillCart={refillCart} addRefill={addRefill} removeRefill={removeRefill} />}
      {view === "refill-checkout" && user && <RefillCheckout user={user} refillCart={refillCart} go={go} onComplete={completeRefillCheckout} />}
      {view === "refill-success" && <RefillSuccess refillCart={refillCart} go={go} onClearCart={() => setRefillCart([])} />}
      {(view === "account" || view === "dashboard") && user && (
        <Account user={user} go={go} onSignOut={onSignOut} onUpdateUser={onUpdateUser} />
      )}
    </div>
  );
}
