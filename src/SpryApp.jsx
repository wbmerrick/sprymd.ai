import React, { useState, useEffect } from "react";
import {
  ArrowRight, ArrowLeft, Check, ShoppingBag, Scale, Flame, Sparkles, Leaf,
  ShieldCheck, Truck, Stethoscope, Lock, X, Plus, Minus, AlertCircle,
  Heart, Pill, Wind, Activity, Moon, Zap, RefreshCw, User, Clock, FileText,
  Send, Snowflake, Droplets, Brain, UserCheck,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Brand tokens
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  bg: "hsl(0, 0%, 0%)",              // pure black canvas (Starlink)
  bgAlt: "hsl(0, 0%, 4%)",           // near-black alt sections
  paper: "hsl(0, 0%, 7%)",           // cards — barely-lifted surface
  ink: "hsl(0, 0%, 100%)",           // white text
  inkSoft: "hsl(0, 0%, 85%)",        // body text
  muted: "hsl(0, 0%, 60%)",          // captions
  primary: "hsl(0, 0%, 100%)",       // white CTAs on black
  primaryDark: "hsl(0, 0%, 85%)",    // hover
  accent: "hsl(0, 0%, 100%)",        // trust marks in white
  accentSoft: "hsl(0, 0%, 75%)",
  accentDeep: "hsl(0, 0%, 90%)",
  line: "hsl(0, 0%, 18%)",           // hairline borders
  lineSoft: "hsl(0, 0%, 12%)",       // dividers
  ok: "hsl(150, 55%, 55%)",
  warn: "hsl(38, 92%, 55%)",
  destructive: "hsl(0, 75%, 60%)",
};

const fonts = {
  display: "'Inter Tight', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
};

const FontInjector = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Inter+Tight:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
    * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    html, body { background: ${C.bg}; color: ${C.ink}; }
    body { font-family: ${fonts.body}; letter-spacing: -0.005em; }
    .display { font-family: ${fonts.display}; font-weight: 500; letter-spacing: -0.04em; }

    .mono { font-family: ${fonts.mono}; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes slideLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
    @keyframes pulseRing {
      0% { box-shadow: 0 0 0 0 rgba(46, 158, 102, 0.5); }
      70% { box-shadow: 0 0 0 14px rgba(46, 158, 102, 0); }
      100% { box-shadow: 0 0 0 0 rgba(46, 158, 102, 0); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .anim-fadeUp { animation: fadeUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
    .anim-fadeIn { animation: fadeIn 0.4s ease both; }
    .anim-slideRight { animation: slideRight 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
    .anim-slideLeft { animation: slideLeft 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
    .anim-pulse { animation: pulse 2s ease-in-out infinite; }
    .pulse-ring { animation: pulseRing 2s infinite; }
    .anim-spin { animation: spin 0.8s linear infinite; }
    .grain { position: relative; }
    .grain::after {
      content: ""; position: absolute; inset: 0; pointer-events: none; opacity: 0.04;
      background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
    }
    input:focus, button:focus, select:focus, textarea:focus { outline: none; }
    .focus-ring:focus-visible { box-shadow: 0 0 0 2px ${C.bg}, 0 0 0 4px ${C.primary}; }
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
    id: "weightloss", name: "Weight Loss",
    tagline: "GLP-1 therapy. Compounded. Refrigerated.",
    description: "Tirzepatide and semaglutide protocols, compounded by Empower Pharmacy. Clinician-titrated. Ships overnight in temperature-controlled packaging.",
    icon: Scale, accent: "hsl(220, 60%, 20%)", fromPrice: "149",
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
    id: "ed", name: "Erectile Dysfunction",
    tagline: "Pills. Daily. Or melt-in-mouth.",
    description: "Sildenafil and tadalafil in tablet, daily-dose, and oral-dissolve formulations. Compounded combinations available for patients who don't respond to standard PDE5 monotherapy.",
    icon: Flame, accent: "hsl(220, 60%, 20%)", fromPrice: "49",
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
    id: "hairloss", name: "Hair Loss",
    tagline: "Stop the shed. Restore the line.",
    description: "Finasteride, dutasteride, and minoxidil in oral and compounded topical formulations — solo or stacked.",
    icon: Sparkles, accent: "hsl(220, 60%, 20%)", fromPrice: "25",
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
    id: "skincare", name: "Skin",
    tagline: "Compounded retinoids. Targeted complexes.",
    description: "Tretinoin formulations and prescription acne, melasma, and rosacea protocols — compounded with adjuvants for tolerability.",
    icon: Leaf, accent: "hsl(220, 60%, 20%)", fromPrice: "59",
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
    id: "lowt", name: "Low Testosterone",
    tagline: "Labs. Protocols. Energy restored.",
    description: "Clinician-supervised testosterone replacement and fertility-preserving alternatives. Baseline labs required. Ongoing monitoring included.",
    icon: Droplets, accent: "hsl(220, 60%, 20%)", fromPrice: "99",
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
    id: "mentalhealth", name: "Anxiety & Depression",
    tagline: "Discreet. Evidence-based. Ongoing support.",
    description: "SSRI, SNRI, and atypical antidepressant protocols with clinician check-ins. Private intake, no waiting room, continuous follow-up.",
    icon: Brain, accent: "hsl(220, 60%, 20%)", fromPrice: "35",
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
    id: "pcp", name: "Primary Care",
    tagline: "Want Spry to be your PCP?",
    description: "A dedicated SpryMD clinician as your primary care physician — annual wellness, labs, chronic care, referrals, and same-day messaging.",
    icon: UserCheck, accent: "hsl(220, 60%, 20%)", fromPrice: "49",
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

// ─────────────────────────────────────────────────────────────────────────────
// Marketplace
// ─────────────────────────────────────────────────────────────────────────────
const products = [
  { id: "p1", name: "Daily Multivitamin Complex", brand: "Spry Essentials", cat: "Supplements", price: 32, hsa: true, icon: Pill, color: "hsl(150, 55%, 40%)", desc: "Methylated B-vitamins, vitamin D3/K2, and chelated minerals. 30-day supply." },
  { id: "p2", name: "Omega-3 EPA/DHA · 2000mg", brand: "Spry Essentials", cat: "Supplements", price: 28, hsa: true, icon: Pill, color: "hsl(220, 60%, 20%)", desc: "Triglyceride-form, IFOS-certified for purity. 60 softgels." },
  { id: "p3", name: "Magnesium Glycinate · 400mg", brand: "Spry Essentials", cat: "Supplements", price: 22, hsa: true, icon: Moon, color: "hsl(220, 60%, 20%)", desc: "Highly bioavailable form for sleep, recovery, and stress." },
  { id: "p4", name: "Creatine Monohydrate · Micronized", brand: "Spry Performance", cat: "Supplements", price: 26, hsa: false, icon: Activity, color: "hsl(220, 60%, 20%)", desc: "Creapure-grade. 90 servings, unflavored." },
  { id: "p5", name: "ResMed AirFit P10 — Nasal Pillow", brand: "ResMed", cat: "Sleep Apnea", price: 119, hsa: true, icon: Wind, color: "hsl(220, 60%, 20%)", desc: "Quietest mask on the market. Includes 3 pillow sizes + headgear." },
  { id: "p6", name: "Philips DreamWear Full Face", brand: "Philips Respironics", cat: "Sleep Apnea", price: 149, hsa: true, icon: Wind, color: "hsl(220, 60%, 20%)", desc: "Under-the-nose design with full-face seal for mouth breathers." },
  { id: "p7", name: "CPAP Cleaning Wipes · 110 ct", brand: "Spry Care", cat: "Sleep Apnea", price: 18, hsa: true, icon: Wind, color: "hsl(220, 60%, 20%)", desc: "Unscented, alcohol-free. Safe for daily mask cleaning." },
  { id: "p8", name: "Smart Blood Pressure Monitor", brand: "Omron", cat: "Devices", price: 89, hsa: true, icon: Heart, color: "hsl(150, 55%, 40%)", desc: "Bluetooth-enabled, FDA-cleared. Validated against clinical standards." },
  { id: "p9", name: "Pulse Oximeter · Fingertip", brand: "Masimo", cat: "Devices", price: 42, hsa: true, icon: Activity, color: "hsl(150, 55%, 40%)", desc: "Hospital-grade SpO2 and pulse rate accuracy." },
  { id: "p10", name: "Smart Body Composition Scale", brand: "Withings", cat: "Devices", price: 99, hsa: false, icon: Scale, color: "hsl(220, 60%, 20%)", desc: "Body fat %, muscle mass, BMI. Syncs to Apple Health & Google Fit." },
  { id: "p11", name: "Melatonin · 5mg Time-Release", brand: "Spry Essentials", cat: "Sleep", price: 16, hsa: true, icon: Moon, color: "hsl(220, 60%, 20%)", desc: "Time-release formula for sustained overnight support." },
  { id: "p12", name: "L-Theanine · 200mg", brand: "Spry Essentials", cat: "Sleep", price: 19, hsa: false, icon: Leaf, color: "hsl(150, 55%, 40%)", desc: "Calm focus without sedation. Pairs well with caffeine." },
];

const productCategories = ["All", "Supplements", "Sleep Apnea", "Devices", "Sleep"];

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
      options: ["History of prostate cancer", "Active untreated sleep apnea", "Hematocrit above 54%", "Breast cancer history", "None of the above"],
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
    primary: { background: C.primary, color: C.paper, border: `1px solid ${C.primary}` },
    secondary: { background: "transparent", color: C.ink, border: `1px solid ${C.line}` },
    accent: { background: C.accent, color: "#fff", border: `1px solid ${C.accent}` },
    ghost: { background: "transparent", color: C.ink, border: `1px solid transparent` },
    dark: { background: C.ink, color: C.paper, border: `1px solid ${C.ink}` },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`focus-ring inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 ${className}`}
      style={{ ...sizes[size], ...variants[variant], borderRadius: 999, opacity: disabled ? 0.4 : 1, cursor: disabled ? "not-allowed" : "pointer", letterSpacing: "0.01em" }}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === "primary") e.currentTarget.style.background = C.primaryDark;
        if (variant === "secondary") e.currentTarget.style.background = C.bgAlt;
        if (variant === "accent") e.currentTarget.style.background = C.accentDeep;
        if (variant === "ghost") e.currentTarget.style.background = C.bgAlt;
        if (variant === "dark") e.currentTarget.style.background = "#000";
      }}
      onMouseLeave={(e) => { e.currentTarget.style.background = variants[variant].background; }}>
      {children}
      {Icon && <Icon size={16} strokeWidth={1.75} />}
    </button>
  );
};

const Mark = ({ children }) => (
  <span className="display" style={{ color: C.accent, fontWeight: 500 }}>{children}</span>
);

const Tag = ({ children, color, fg }) => (
  <span className="mono" style={{
    fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 999,
    background: color || C.bgAlt, color: fg || C.ink, border: color ? "none" : `1px solid ${C.line}`,
    fontWeight: 500, whiteSpace: "nowrap",
  }}>{children}</span>
);

const Logo = ({ color = C.ink, size = 22 }) => (
  <div className="flex items-center gap-2">
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" stroke={color} strokeWidth="1.5" />
      <path d="M10 20c0-3 2.5-5.5 5.5-5.5h1c3 0 5.5-2.5 5.5-5.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="16" r="2" fill={color} />
    </svg>
    <span className="display" style={{ fontSize: size * 0.95, fontWeight: 500, color, letterSpacing: "-0.03em" }}>
      Spry<span style={{ fontWeight: 400, opacity: 0.6 }}>MD</span>
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

// ─────────────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────────────
const Header = ({ go, cartCount, dark, user }) => {
  const fg = dark ? C.paper : C.ink;
  return (
    <header className="w-full px-6 md:px-12 py-5 flex items-center justify-between"
      style={{ borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.1)" : C.lineSoft}` }}>
      <button onClick={() => go("landing")} className="focus-ring rounded"><Logo color={fg} /></button>
      <nav className="hidden md:flex items-center gap-8">
        {[{ label: "Treatments", view: "landing" }, { label: "Quick Refills", view: "refills" },
          { label: "Shop", view: "marketplace" }, { label: "How it works", view: "how" }].map((item) => (
          <button key={item.label} onClick={() => go(item.view)}
            className="focus-ring rounded text-sm transition-opacity hover:opacity-60"
            style={{ color: fg, fontWeight: 500 }}>{item.label}</button>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <button onClick={() => go(user ? "dashboard" : "signin")}
          className="focus-ring rounded-full p-2 transition-colors"
          style={{ background: dark ? "rgba(255,255,255,0.08)" : C.bgAlt }}>
          <User size={18} strokeWidth={1.75} color={fg} />
        </button>
        <button onClick={() => go("marketplace")} className="focus-ring relative rounded-full p-2 transition-colors"
          style={{ background: dark ? "rgba(255,255,255,0.08)" : C.bgAlt }}>
          <ShoppingBag size={18} strokeWidth={1.75} color={fg} />
          {cartCount > 0 && (
            <span className="mono absolute -top-1 -right-1 flex items-center justify-center"
              style={{ background: C.accent, color: "#fff", fontSize: 10, width: 18, height: 18, borderRadius: 999, fontWeight: 600 }}>{cartCount}</span>
          )}
        </button>
      </div>
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
        style={{ background: C.accent, color: "#fff", fontSize: 14, fontWeight: 600, letterSpacing: "0.02em" }}>
        <RefreshCw size={16} strokeWidth={2} />Quick Refills
      </button>
    );
  }
  return (
    <button onClick={onClick}
      className="focus-ring group inline-flex items-center gap-3 px-7 py-4 rounded-full transition-all hover:translate-y-[-2px] pulse-ring"
      style={{ background: C.accent, color: "#fff", fontSize: 15, fontWeight: 600, letterSpacing: "0.02em",
               boxShadow: "0 8px 24px -8px rgba(46, 158, 102, 0.5)" }}>
      <RefreshCw size={18} strokeWidth={2.25} />
      Quick REFILLS!
      <ArrowRight size={16} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" />
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Landing
// ─────────────────────────────────────────────────────────────────────────────
const Landing = ({ go }) => (
  <div className="anim-fadeIn">
    {/* Hero */}
    <section className="grain px-6 md:px-12 pt-12 md:pt-20 pb-20 md:pb-32 relative overflow-hidden" style={{ background: C.bg }}>
      <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-10 items-end relative z-10">
        <div className="md:col-span-7 anim-fadeUp">
          <div className="flex items-center gap-2 mb-8">
            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: C.muted, textTransform: "uppercase" }}>01 — Telehealth, refined</span>
          </div>
          <h1 className="display" style={{ fontSize: "clamp(48px, 8vw, 104px)", lineHeight: 0.95, fontWeight: 400, color: C.ink, marginBottom: 24 }}>
            Modern medicine,<br /><Mark>made for men.</Mark>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.5, color: C.inkSoft, maxWidth: 480, marginBottom: 40 }}>
            Physician-supervised treatments for weight loss, ED, low testosterone, anxiety & depression, hair, and skin — plus full primary care. Compounded by Empower Pharmacy, delivered discreetly, monitored continuously.
          </p>
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Btn onClick={() => go("landing-conditions")} size="lg" icon={ArrowRight}>Start your assessment</Btn>
            <Btn onClick={() => go("how")} size="lg" variant="ghost">How it works</Btn>
          </div>
          <div className="flex items-center gap-6 mt-12">
            {[{ icon: ShieldCheck, label: "HIPAA-compliant" },
              { icon: Stethoscope, label: "Licensed clinicians" },
              { icon: Truck, label: "Free shipping" }].map((it) => (
              <div key={it.label} className="flex items-center gap-2">
                <it.icon size={16} color={C.inkSoft} strokeWidth={1.5} />
                <span style={{ fontSize: 13, color: C.inkSoft }}>{it.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-5 anim-fadeUp" style={{ animationDelay: "0.15s" }}>
          <div className="relative rounded-3xl p-8 md:p-10" style={{ background: C.primary, color: C.paper, aspectRatio: "4/5", overflow: "hidden" }}>
            <svg viewBox="0 0 400 500" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.18 }}>
              <defs>
                <radialGradient id="g1" cx="50%" cy="0%" r="80%">
                  <stop offset="0%" stopColor="hsl(150, 60%, 75%)" />
                  <stop offset="100%" stopColor="hsl(220, 60%, 20%)" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="400" height="500" fill="url(#g1)" />
              {Array.from({ length: 14 }).map((_, i) => (
                <line key={i} x1="0" y1={50 + i * 32} x2="400" y2={50 + i * 32} stroke={C.paper} strokeWidth="0.5" opacity="0.2" />
              ))}
            </svg>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <span className="mono" style={{ fontSize: 10, letterSpacing: "0.2em", color: C.accentSoft, textTransform: "uppercase" }}>Every membership includes</span>
                <h3 className="display" style={{ fontSize: 38, lineHeight: 1.05, marginTop: 20, fontWeight: 400 }}>
                  End-to-end care, not just a script.
                </h3>
              </div>
              <div className="space-y-3">
                {["Compounded at Empower Pharmacy (503A)",
                  "Cold-chain overnight on injectables",
                  "Free shipping on every refill",
                  "Message your clinician anytime",
                  "Pause or cancel from your dashboard"].map((s) => (
                  <div key={s} className="flex items-start gap-3 pb-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
                    <Check size={14} strokeWidth={2.5} color={C.accentSoft} className="flex-shrink-0 mt-1" />
                    <span style={{ fontSize: 14 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Conditions */}
    <section id="landing-conditions" className="px-6 md:px-12 py-20 md:py-28" style={{ background: C.bgAlt }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: C.muted, textTransform: "uppercase" }}>02 — What we treat</span>
            <h2 className="display" style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1, marginTop: 16, color: C.ink, fontWeight: 400 }}>
              Choose your <Mark>focus</Mark>.
            </h2>
          </div>
          <p style={{ maxWidth: 360, color: C.inkSoft, fontSize: 15, lineHeight: 1.55 }}>
            Each protocol is built around evidence-based dosing and reviewed by a board-certified clinician within 24 hours.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {Object.values(conditions).map((cond, i) => (
            <ConditionCard key={cond.id} condition={cond} onClick={() => go("intake", { condition: cond.id })} delay={i * 0.08} />
          ))}
        </div>
      </div>
    </section>

    {/* Want Spry to be your PCP? */}
    <section id="pcp" className="px-6 md:px-12 py-20 md:py-28" style={{ background: C.bg }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-center">
          <div className="md:col-span-6 anim-fadeUp">
            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: C.muted, textTransform: "uppercase" }}>03 — Primary care</span>
            <h2 className="display" style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1, marginTop: 16, color: C.ink, fontWeight: 400 }}>
              Want Spry to be your <Mark>PCP</Mark>?
            </h2>
            <p style={{ fontSize: 16, color: C.inkSoft, marginTop: 20, lineHeight: 1.55, maxWidth: 480 }}>
              Stop waiting weeks for a 7-minute visit. Get a dedicated SpryMD clinician who knows your chart — annual wellness, labs, chronic care, referrals, and same-day messaging.
            </p>
            <div className="mt-8 space-y-4">
              {["Dedicated clinician who stays with you",
                "Annual wellness + lab review",
                "Unlimited secure messaging",
                "Referrals and prescription renewals",
                "Same account as your Spry treatments"].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <Check size={16} strokeWidth={2} color={C.ok} className="flex-shrink-0 mt-0.5" />
                  <span style={{ fontSize: 15, color: C.inkSoft }}>{item}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-10">
              <Btn onClick={() => go("intake", { condition: "pcp" })} size="lg" icon={ArrowRight}>Make Spry my PCP</Btn>
              <Btn onClick={() => go("landing-conditions")} size="lg" variant="ghost">See all treatments</Btn>
            </div>
          </div>
          <div className="md:col-span-6 anim-fadeUp" style={{ animationDelay: "0.12s" }}>
            <div className="rounded-3xl p-8 md:p-10" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-full" style={{ background: C.bgAlt }}>
                  <UserCheck size={22} strokeWidth={1.5} color={C.ink} />
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", color: C.muted, textTransform: "uppercase" }}>Membership from</div>
                  <div className="display" style={{ fontSize: 36, fontWeight: 500, color: C.ink, lineHeight: 1 }}>
                    $49<span style={{ fontSize: 14, color: C.muted, fontWeight: 400, marginLeft: 4 }}>/mo</span>
                  </div>
                </div>
              </div>
              <div className="space-y-5">
                {[{ t: "Spry Primary Care", d: "Visits, messaging, chronic care — $79/mo", tag: "Most popular" },
                  { t: "PCP + Annual Labs", d: "Membership plus full lab panel — $99/mo", tag: "Best value" },
                  { t: "Household Plan", d: "You + a partner on one membership — $129/mo", tag: null }].map((tier) => (
                  <div key={tier.t} className="flex items-start justify-between gap-4 pb-5" style={{ borderBottom: `1px solid ${C.lineSoft}` }}>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>{tier.t}</span>
                        {tier.tag && <Tag color={C.bgAlt}>{tier.tag}</Tag>}
                      </div>
                      <span style={{ fontSize: 13, color: C.inkSoft }}>{tier.d}</span>
                    </div>
                    <Stethoscope size={18} color={C.muted} strokeWidth={1.5} className="flex-shrink-0 mt-1" />
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: C.muted, marginTop: 20, lineHeight: 1.5 }}>
                Cash-pay membership. Not a substitute for emergency care. Available where SpryMD clinicians are licensed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* How */}
    <section id="how" className="px-6 md:px-12 py-20 md:py-28" style={{ background: C.bgAlt }}>
      <div className="max-w-7xl mx-auto">
        <span className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: C.muted, textTransform: "uppercase" }}>04 — Three steps</span>
        <h2 className="display" style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1, marginTop: 16, marginBottom: 56, color: C.ink, fontWeight: 400 }}>
          From visit to <Mark>doorstep</Mark>.
        </h2>
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {[{ n: "01", t: "Online assessment", d: "A clinically validated intake quiz, built by physicians. Five minutes, no awkward small talk." },
            { n: "02", t: "Clinician review", d: "A licensed provider in your state reviews your case within 24 hours and writes the prescription." },
            { n: "03", t: "Discreet delivery", d: "Compounded at a 503A pharmacy and shipped in plain packaging. Free, with ongoing monitoring." }].map((s) => (
            <div key={s.n}>
              <div className="display" style={{ fontSize: 80, fontWeight: 300, color: C.accent, lineHeight: 0.9, marginBottom: 16 }}>{s.n}</div>
              <h3 className="display" style={{ fontSize: 26, fontWeight: 500, marginBottom: 12, color: C.ink }}>{s.t}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.55, color: C.inkSoft }}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Marketplace teaser */}
    <section className="px-6 md:px-12 py-20 md:py-28" style={{ background: C.bg }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: C.muted, textTransform: "uppercase" }}>05 — Marketplace</span>
            <h2 className="display" style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1, marginTop: 16, color: C.ink, fontWeight: 400 }}>
              Stocked for <Mark>everything else</Mark>.
            </h2>
            <p style={{ maxWidth: 480, color: C.inkSoft, fontSize: 15, lineHeight: 1.55, marginTop: 16 }}>
              Curated supplements, sleep apnea masks, and clinician-vetted health devices — many shippable on the same prescription account.
            </p>
          </div>
          <Btn onClick={() => go("marketplace")} icon={ArrowRight} variant="secondary">Shop all</Btn>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.slice(0, 4).map((p) => <MiniProduct key={p.id} p={p} onClick={() => go("marketplace")} />)}
        </div>
      </div>
    </section>

    <section className="px-6 md:px-12 py-24 md:py-32" style={{ background: C.ink, color: C.paper }}>
      <div className="max-w-5xl mx-auto text-center">
        <span className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: C.accentSoft, textTransform: "uppercase" }}>06 — Our promise</span>
        <h2 className="display" style={{ fontSize: "clamp(28px, 4vw, 48px)", lineHeight: 1.15, fontWeight: 400, marginTop: 32, color: C.paper }}>
          A licensed clinician signs every prescription, monitors every dose adjustment, and is reachable any day of the week.
        </h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", marginTop: 24, maxWidth: 540, marginLeft: "auto", marginRight: "auto", lineHeight: 1.55 }}>
          No vending-machine medicine. Real care, delivered through a modern interface.
        </p>
      </div>
    </section>

    <Footer />
  </div>
);

const ConditionCard = ({ condition, onClick, delay }) => {
  const [hover, setHover] = useState(false);
  const Icon = condition.icon;
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className="anim-fadeUp focus-ring text-left p-8 md:p-10 transition-all duration-300 group"
      style={{ background: hover ? C.bg : C.bgAlt, border: `1px solid ${C.line}`, borderRadius: 24, animationDelay: `${delay}s`, transform: hover ? "translateY(-2px)" : "none" }}>
      <div className="flex items-start justify-between mb-12">
        <div className="p-3 rounded-full" style={{ background: hover ? condition.accent : C.paper, color: hover ? C.paper : condition.accent, transition: "all 0.3s" }}>
          <Icon size={22} strokeWidth={1.5} />
        </div>
        <div style={{ transform: hover ? "translateX(4px)" : "none", transition: "transform 0.3s" }}>
          <ArrowRight size={20} color={C.ink} strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="display" style={{ fontSize: 36, fontWeight: 400, color: C.ink, marginBottom: 8 }}>{condition.name}</h3>
      <p style={{ fontSize: 15, color: C.inkSoft, marginBottom: 24, lineHeight: 1.5 }}>{condition.tagline}</p>
      <div className="flex items-center justify-between" style={{ borderTop: `1px solid ${C.line}`, paddingTop: 16 }}>
        <span className="mono" style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>From</span>
        <span className="display" style={{ fontSize: 24, fontWeight: 500, color: C.ink }}>
          ${condition.fromPrice}<span style={{ fontSize: 13, color: C.muted, fontWeight: 400, marginLeft: 4 }}>/mo</span>
        </span>
      </div>
    </button>
  );
};

const MiniProduct = ({ p, onClick }) => {
  const Icon = p.icon;
  return (
    <button onClick={onClick} className="focus-ring text-left p-5 transition-all hover:-translate-y-0.5"
      style={{ background: C.bg, border: `1px solid ${C.line}`, borderRadius: 16 }}>
      <div className="aspect-square rounded-xl mb-4 flex items-center justify-center" style={{ background: p.color }}>
        <Icon size={36} color={C.paper} strokeWidth={1.25} />
      </div>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }} className="mono">{p.brand.toUpperCase()}</div>
      <div style={{ fontSize: 14, color: C.ink, marginBottom: 8, fontWeight: 500, lineHeight: 1.3 }}>{p.name}</div>
      <div className="flex items-center justify-between">
        <span className="display" style={{ fontSize: 18, color: C.ink, fontWeight: 500 }}>${p.price}</span>
      </div>
    </button>
  );
};

const Footer = () => (
  <footer className="px-6 md:px-12 py-12" style={{ background: C.bg, borderTop: `1px solid ${C.line}` }}>
    <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
      <div>
        <Logo />
        <p style={{ fontSize: 12, color: C.muted, marginTop: 12, lineHeight: 1.5, maxWidth: 220 }}>
          Telehealth services provided by independent licensed clinicians. Not a substitute for emergency care. Compounded medications fulfilled by Empower Pharmacy.
        </p>
      </div>
      {[{ h: "Treatments", l: ["Weight Loss", "ED", "Low Testosterone", "Anxiety & Depression", "Hair Loss", "Skin", "Primary Care"] },
        { h: "Shop", l: ["Quick Refills", "Supplements", "Devices", "Sleep"] },
        { h: "Company", l: ["About", "Clinicians", "Press", "Contact"] }].map((col) => (
        <div key={col.h}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: C.muted, textTransform: "uppercase", marginBottom: 16 }}>{col.h}</div>
          <div className="space-y-2">
            {col.l.map((it) => <div key={it} style={{ fontSize: 13, color: C.ink }}>{it}</div>)}
          </div>
        </div>
      ))}
    </div>
    <div className="max-w-7xl mx-auto mt-12 pt-8 flex justify-between items-center flex-wrap gap-2" style={{ borderTop: `1px solid ${C.line}` }}>
      <span className="mono" style={{ fontSize: 11, color: C.muted }}>© 2026 SPRYMD INC.</span>
      <span className="mono" style={{ fontSize: 11, color: C.muted }}>SPRYMD.AI</span>
    </div>
  </footer>
);

// ─────────────────────────────────────────────────────────────────────────────
// Sign in / Sign up — auth gate for Quick Refills
// ─────────────────────────────────────────────────────────────────────────────
const SignIn = ({ go, returnTo, onAuthSuccess }) => {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = email.includes("@") && password.length >= 8 &&
    (mode === "signin" || (name.trim().length > 0 && dob.length >= 8));

  const submit = () => {
    if (!canSubmit) return;
    setLoading(true);
    setTimeout(() => {
      onAuthSuccess({
        email, name: name || email.split("@")[0],
        dob: dob || "1985-06-15",
        rxHistory: mockRxHistory,
      });
      go(returnTo || "refills", { justLoggedIn: true });
    }, 1100);
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
        <div className="w-full max-w-md">
          <div className="anim-fadeUp">
            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: C.accent, textTransform: "uppercase" }}>
              {mode === "signin" ? "Welcome back" : "Create account"}
            </span>
            <h1 className="display" style={{ fontSize: "clamp(36px, 5vw, 52px)", lineHeight: 1.05, fontWeight: 400, color: C.ink, marginTop: 12, marginBottom: 12 }}>
              {mode === "signin" ? <>Sign in to <Mark>refill</Mark>.</> : <>One screen. <Mark>Then we're in</Mark>.</>}
            </h1>
            <p style={{ fontSize: 14, color: C.inkSoft, marginBottom: 32, lineHeight: 1.55 }}>
              {mode === "signin"
                ? "Your prescriptions, dose history, and shipping address are right where you left them."
                : "We'll create your medical record at gethealthy.com and connect it to your Empower pharmacy account in a single step."}
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
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="focus-ring w-full p-4" style={inputStyle} />
              </Field>
              <Field label="Password">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className="focus-ring w-full p-4" style={inputStyle} />
              </Field>

              <Btn onClick={submit} disabled={!canSubmit || loading} size="lg" className="w-full">
                {loading ? <span className="anim-pulse">{mode === "signin" ? "Signing in..." : "Creating account..."}</span>
                         : <>{mode === "signin" ? "Sign in" : "Create account & continue"}</>}
              </Btn>

              <div className="flex items-center gap-2 justify-center pt-2">
                <Lock size={11} color={C.muted} />
                <span className="mono" style={{ fontSize: 10, color: C.muted, letterSpacing: "0.1em" }}>HIPAA-COMPLIANT · ENCRYPTED</span>
              </div>
            </div>

            <div className="text-center mt-8 pt-8" style={{ borderTop: `1px solid ${C.lineSoft}` }}>
              <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
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
                  { id: "overnight", label: "Overnight", days: hasChilled ? "Next day · refrigerated" : "Next day", price: hasChilled ? 41 : 33 }].map((s) => (
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
    { title: "Payment captured", sub: "Stripe charge ID: ch_3PqXk2HwMMRoLBKt0aQ8YN1", icon: Lock },
    { title: "Health record updated", sub: "POST gethealthy.com/api/v1/patients/p_2849/health-record", icon: FileText },
    { title: "E-prescribed to Empower", sub: `${refillCart.length} prescription${refillCart.length > 1 ? "s" : ""} transmitted via NCPDP`, icon: Send },
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
                <Btn onClick={() => { onClearCart(); go("dashboard"); }} size="lg" variant="dark">Go to dashboard</Btn>
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
// Member Dashboard
// ─────────────────────────────────────────────────────────────────────────────
const Dashboard = ({ user, go, onSignOut }) => {
  if (!user) return null;
  return (
    <div className="anim-fadeIn min-h-screen" style={{ background: C.bg }}>
      <Header go={go} cartCount={0} user={user} />
      <section className="px-6 md:px-12 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <span className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: C.muted, textTransform: "uppercase" }}>Member dashboard</span>
          <h1 className="display" style={{ fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 1, marginTop: 16, marginBottom: 32, fontWeight: 400, color: C.ink }}>
            Welcome back, <Mark>{user.name.split(" ")[0]}</Mark>.
          </h1>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[{ i: RefreshCw, t: "Quick Refills", d: `${user.rxHistory.length} active prescriptions`, action: () => go("refills"), accent: true },
              { i: Stethoscope, t: "Message clinician", d: "Available 7 days a week", action: () => {} },
              { i: ShoppingBag, t: "Shop", d: "Supplements & devices", action: () => go("marketplace") }].map((card) => (
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
            <div className="space-y-3">
              {user.rxHistory.slice(0, 3).map((rx) => {
                const Icon = rx.icon;
                return (
                  <div key={rx.rxId} className="flex items-center gap-4 py-2">
                    <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: rx.color, width: 36, height: 36 }}>
                      <Icon size={16} color={C.paper} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <div style={{ fontSize: 14, fontWeight: 500, color: C.ink }}>{rx.name}</div>
                      <div className="mono" style={{ fontSize: 11, color: C.muted, letterSpacing: "0.05em" }}>{rx.refills - rx.refillsUsed} refills left</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={() => go("refills")}
              className="focus-ring mt-4 inline-flex items-center gap-2 text-sm font-medium hover:opacity-60"
              style={{ color: C.accent }}>View all & refill<ArrowRight size={14} /></button>
          </div>

          <button onClick={onSignOut} className="focus-ring mt-6 text-sm hover:opacity-60" style={{ color: C.muted }}>Sign out</button>
        </div>
      </section>
      <Footer />
    </div>
  );
};

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
                    <span>{opt}</span>
                    <div className="flex items-center justify-center"
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
              Based on your answers, you're a strong candidate for the protocol below. A licensed clinician will review your case before any prescription is issued.
            </p>
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

          <div className="mt-12 grid md:grid-cols-3 gap-4">
            {[{ i: ShieldCheck, t: "Clinician-reviewed", d: "Every prescription is signed by a licensed provider in your state." },
              { i: Truck, t: "Discreet shipping", d: "Plain packaging. Free, every refill, on every plan." },
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
const Marketplace = ({ go, cart, addToCart, removeFromCart, cartCount, user }) => {
  const [filter, setFilter] = useState("All");
  const [showCart, setShowCart] = useState(false);

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
          <span className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: C.muted, textTransform: "uppercase" }}>Marketplace</span>
          <h1 className="display" style={{ fontSize: "clamp(40px, 6vw, 80px)", lineHeight: 1, fontWeight: 400, color: C.ink, marginTop: 16, marginBottom: 16 }}>
            The <Mark>shop</Mark>.
          </h1>
          <p style={{ fontSize: 16, color: C.inkSoft, maxWidth: 580, lineHeight: 1.55 }}>
            Supplements, sleep apnea masks, and clinician-curated health devices. Shipped fast.
          </p>
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

      <Footer />
    </div>
  );
};

const ProductCard = ({ p, onAdd }) => {
  const Icon = p.icon;
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className="rounded-2xl overflow-hidden transition-all"
      style={{ background: C.paper, border: `1px solid ${C.line}`, transform: hover ? "translateY(-2px)" : "none" }}>
      <div className="aspect-square relative flex items-center justify-center" style={{ background: p.color }}>
        <Icon size={56} color={C.paper} strokeWidth={1} style={{ opacity: 0.9 }} />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="mono" style={{ fontSize: 10, color: C.muted, letterSpacing: "0.1em" }}>{p.brand.toUpperCase()}</span>
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 500, color: C.ink, marginBottom: 6, lineHeight: 1.3 }}>{p.name}</h3>
        <p style={{ fontSize: 12, color: C.inkSoft, marginBottom: 16, lineHeight: 1.5, minHeight: 36 }}>{p.desc}</p>
        <div className="flex items-center justify-between">
          <span className="display" style={{ fontSize: 22, color: C.ink, fontWeight: 500 }}>${p.price}</span>
          <button onClick={onAdd} className="focus-ring px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5" style={{ background: C.ink, color: C.paper }}>
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
                <div className="rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.color, width: 80, height: 80 }}>
                  <Icon size={28} color={C.paper} strokeWidth={1.25} />
                </div>
                <div className="flex-1">
                  <div style={{ fontSize: 14, color: C.ink, fontWeight: 500, lineHeight: 1.3 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{item.brand}</div>
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
// Subscription / Cart Checkout (Stripe)
// ─────────────────────────────────────────────────────────────────────────────
const Checkout = ({ mode, plan, condition, cart, go, onComplete }) => {
  const [email, setEmail] = useState("");
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [zip, setZip] = useState("");
  const [name, setName] = useState("");
  const [processing, setProcessing] = useState(false);

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

  const canSubmit = email.includes("@") && card.replace(/\s/g, "").length === 16 && exp.length >= 7 && cvc.length >= 3 && zip.length >= 5 && name.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setProcessing(true);
    setTimeout(onComplete, 1800);
  };

  return (
    <div className="anim-fadeIn min-h-screen" style={{ background: C.bg }}>
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
            <h1 className="display" style={{ fontSize: "clamp(32px, 4vw, 48px)", lineHeight: 1.05, fontWeight: 400, marginTop: 12, marginBottom: 32, color: C.ink }}>
              Almost <Mark>there</Mark>.
            </h1>

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

              <Btn onClick={handleSubmit} disabled={!canSubmit || processing} size="lg" className="w-full" icon={!processing ? Lock : null}>
                {processing ? <span className="anim-pulse">Processing...</span> : `Pay $${total.toFixed(2)}${isSubscription ? " · Start subscription" : ""}`}
              </Btn>
              <div className="flex items-center justify-center gap-2">
                <Lock size={11} color={C.muted} />
                <span className="mono" style={{ fontSize: 10, color: C.muted, letterSpacing: "0.12em" }}>256-BIT ENCRYPTION · POWERED BY STRIPE</span>
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
                      <Tag color={C.bgAlt}>Subscription</Tag>
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
                        <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: item.color, width: 56, height: 56 }}>
                          <Icon size={20} color={C.paper} strokeWidth={1.25} />
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
              {isSubscription && <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.4, marginTop: 8 }}>Then ${plan.price}/mo. Cancel anytime in your dashboard. First shipment after clinician review.</p>}
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
      <div className="inline-flex items-center justify-center mb-8 rounded-full" style={{ background: C.primary, width: 72, height: 72 }}>
        <Check size={32} color={C.paper} strokeWidth={2} />
      </div>
      <span className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: C.muted, textTransform: "uppercase" }}>
        {consult ? "Consult requested" : mode === "subscription" ? "Subscription started" : "Order confirmed"}
      </span>
      <h1 className="display" style={{ fontSize: "clamp(40px, 6vw, 64px)", lineHeight: 1.05, fontWeight: 400, color: C.ink, marginTop: 16, marginBottom: 24 }}>
        {consult ? <>We'll be in <Mark>touch</Mark>.</> : <>Welcome to <Mark>Spry</Mark>.</>}
      </h1>
      <p style={{ fontSize: 16, color: C.inkSoft, lineHeight: 1.55, marginBottom: 40 }}>
        {consult
          ? "A clinician will reach out within 24 hours to schedule a brief synchronous consult."
          : mode === "subscription"
          ? `Your case has been routed to a clinician for review. You'll hear from your provider within 24 hours, and your first shipment of ${plan?.name} will go out the same day the prescription is signed.`
          : "Your order has been placed. Tracking will arrive in your email within 24 hours."}
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Btn onClick={() => go("landing")} size="lg" variant="dark">Back to home</Btn>
        {!consult && <Btn onClick={() => go("marketplace")} size="lg" variant="ghost">Browse the shop</Btn>}
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// App root
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("landing");
  const [params, setParams] = useState({});
  const [cart, setCart] = useState([]);
  const [refillCart, setRefillCart] = useState([]);
  const [user, setUser] = useState(null);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

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
    // Auth gate
    if (target === "refills" && !user) {
      setParams({ returnTo: "refills" });
      setView("signin");
      window.scrollTo(0, 0);
      return;
    }
    if (target === "dashboard" && !user) {
      setParams({ returnTo: "dashboard" });
      setView("signin");
      window.scrollTo(0, 0);
      return;
    }
    if (target === "intake") { setParams({ condition: p.condition }); setView("intake"); window.scrollTo(0, 0); return; }
    if (target === "plan") { setParams({ ...params, ...p }); setView("plan"); window.scrollTo(0, 0); return; }
    if (target === "checkout-cart") { setParams({ mode: "cart" }); setView("checkout"); window.scrollTo(0, 0); return; }
    if (target === "refill-checkout") { setView("refill-checkout"); window.scrollTo(0, 0); return; }
    if (target === "refill-success") { setView("refill-success"); window.scrollTo(0, 0); return; }
    if (target === "success") { setParams({ ...params, ...p }); setView("success"); window.scrollTo(0, 0); return; }
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
    setParams({ ...params, plan, mode: "subscription" });
    setView("checkout");
    window.scrollTo(0, 0);
  };

  const onAuthSuccess = (u) => setUser(u);
  const onSignOut = () => { setUser(null); setRefillCart([]); go("landing"); };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.ink }}>
      <FontInjector />

      {view === "landing" && (<><Header go={go} cartCount={cartCount} user={user} /><Landing go={go} /></>)}
      {view === "intake" && <Intake conditionId={params.condition} go={go} />}
      {view === "plan" && <Plan conditionId={params.condition} answers={params.answers} disqualified={params.disqualified} go={go} onSelectPlan={onSelectPlan} />}
      {view === "marketplace" && <Marketplace go={go} cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} cartCount={cartCount} user={user} />}
      {view === "checkout" && (
        <Checkout mode={params.mode} plan={params.plan} condition={params.condition} cart={cart} go={go}
          onComplete={() => { if (params.mode === "cart") setCart([]); go("success", { mode: params.mode }); }} />
      )}
      {view === "success" && <Success mode={params.mode} plan={params.plan} consult={params.consult} go={go} />}
      {view === "signin" && <SignIn go={go} returnTo={params.returnTo} onAuthSuccess={onAuthSuccess} />}
      {view === "refills" && user && <Refills user={user} go={go} refillCart={refillCart} addRefill={addRefill} removeRefill={removeRefill} />}
      {view === "refill-checkout" && user && <RefillCheckout user={user} refillCart={refillCart} go={go} onComplete={() => go("refill-success")} />}
      {view === "refill-success" && <RefillSuccess refillCart={refillCart} go={go} onClearCart={() => setRefillCart([])} />}
      {view === "dashboard" && user && <Dashboard user={user} go={go} onSignOut={onSignOut} />}
    </div>
  );
}
