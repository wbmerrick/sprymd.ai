import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, ArrowLeft, Check, ShoppingBag, Scale, Flame, Sparkles, Leaf,
  ShieldCheck, Truck, Stethoscope, Lock, X, Plus, Minus, AlertCircle,
  Heart, Pill, Wind, Activity, Moon, Sun, Zap, RefreshCw, User, Clock, FileText,
  Send, Snowflake, Droplets, Brain, UserCheck, Star, LogOut, Package, MapPin,
  Watch, Menu, Dna,
} from "lucide-react";
import { footerPages, footerNavToSlug } from "./footerPages";
import LaserLogo from "./components/brand/LaserLogo";
import BrandAtmosphere from "./components/brand/BrandAtmosphere";
import { brandPlates } from "./assets/brand/catalog";
import imgFounder from "./assets/brand/founder-dr-merrick.jpg";

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
import {
  signInCustomer,
  signUpCustomer,
  signOutCustomer,
  restoreCustomerSession,
  updateCustomerProfile,
} from "./lib/customerAccounts";
import { FEATURES } from "./config/features";
import { recordRefillCheckout } from "./lib/patientCareStore";
import { SignalField, ScanFrame, GridHorizon, ISpryChat } from "./components/graphics";
import { FONT_BODY, FONT_DISPLAY, SPRY_MD_COLOR } from "./brand/tokens";
import { conditions } from "./data/careCatalog";
import { careEduPages, conditionToEduSlug } from "./data/careEduPages";
import {
  ADULT_NO,
  ADULT_YES,
  CRISIS_LINE_NUMBER,
  ELIGIBILITY_ADULT_KEY,
  ELIGIBILITY_STATE_KEY,
  EMERGENCY_NUMBER,
  buildIntakeSteps,
  canAdvanceStep,
  checkoutPath,
  clearIntakeProgress,
  compoundFieldError,
  dobError,
  eligibilityBlockReason,
  findDisqualifier,
  isKnownCondition,
  loadIntakeProgress,
  recommendTreatment,
  safetyFlags,
  saveCheckoutSelection,
  saveIntakeProgress,
  stepCrisisHits,
  stepDisqualifiers,
  stepUrgentHits,
  timeLeftLabel,
  toggleMultiOption,
} from "./lib/intakeFlow";
import { isValidEmail, isValidPhone, persistFunnelCase, submitConsultRequest } from "./lib/caseSubmission";
import { US_STATES } from "../shared/usStates";

// ─────────────────────────────────────────────────────────────────────────────
// Brand tokens — "Clinical Zen": high-end wellness retreat × modern clinic.
// Grounding natural palette — deep forest greens, slate blues, warm sandstone.
// Calming and masculine without sterile whites or aggressive black/neon.
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  bg: "#0C120F",        // deep forest — grounding near-black green
  bgAlt: "#101915",
  paper: "#16211B",     // card surface — warm dark evergreen
  ink: "#F4F1E8",       // warm parchment white — softer than pure white
  inkSoft: "#D2CFC2",
  muted: "#93A096",     // sage gray
  primary: "#C89E67",   // warm sandstone
  primaryDark: "#B0854F",
  accent: "#C89E67",
  accentSoft: "rgba(200, 158, 103, 0.78)",
  accentDeep: "#96703F",
  signalDim: "rgba(200, 158, 103, 0.16)",
  md: SPRY_MD_COLOR,    // light green — SpryMD wordmark "MD"
  slate: "#5C7E9E",     // slate blue — secondary informational accent
  navy: "#5C7E9E",      // legacy key — now slate blue
  line: "#263129",      // green-tinted hairlines
  lineSoft: "#1A241E",
  ok: "#57A874",
  warn: "#D9A441",
  destructive: "#CE6B5D",
};

const fonts = {
  display: FONT_DISPLAY,
  body: FONT_BODY,
  /** Label/eyebrow style — same face as body, tighter tracking via .mono */
  mono: FONT_BODY,
};

const FontInjector = () => (
  <style>{`
    :root {
      --font-display: ${fonts.display};
      --font-body: ${fonts.body};
      --font-mono: ${fonts.body};
      --spry-accent: ${C.accent};
      --spry-bg: ${C.bg};
      --spry-ink: ${C.ink};
      --spry-md: ${C.md};
    }
    .spry-md {
      color: var(--spry-md) !important;
      opacity: 1 !important;
      -webkit-text-stroke: 0.4px rgba(9, 14, 11, 0.45);
      paint-order: stroke fill;
      text-shadow: 0 0 12px rgba(9, 14, 11, 0.35);
    }
    * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    html, body { background: ${C.bg}; color: ${C.ink}; }
    body {
      font-family: ${fonts.body}; letter-spacing: -0.005em;
      background-image:
        radial-gradient(ellipse 80% 50% at 50% -20%, rgba(200, 158, 103, 0.10), transparent 55%),
        radial-gradient(ellipse 90% 60% at 50% 115%, rgba(92, 126, 158, 0.12), transparent 60%),
        linear-gradient(180deg, rgba(12,18,15,0.48), rgba(12,18,15,0.62)),
        url("/brand/sprymd-tn-ridge.webp");
      background-size: auto, auto, auto, cover;
      background-position: center, center, center, center 40%;
      background-attachment: fixed;
      background-repeat: no-repeat;
    }
    .display { font-family: ${fonts.display}; font-weight: 600; letter-spacing: -0.01em; }
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
      0%, 100% { box-shadow: 0 0 0 3px rgba(200, 158, 103,0.14); }
      50% { box-shadow: 0 0 0 3px rgba(200, 158, 103,0.22), 0 0 18px 4px rgba(200, 158, 103,0.38); }
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
    @keyframes spryBrandIn {
      from { opacity: 0; transform: translateY(14px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .spry-brand-in { animation: spryBrandIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; opacity: 1; }
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
      background: linear-gradient(90deg, rgba(8,13,10,0.92), rgba(14,21,17,0.75));
      backdrop-filter: blur(8px);
    }
    .instrument-panel {
      position: relative;
      isolation: isolate;
      background:
        linear-gradient(160deg, rgba(20,29,24,0.95) 0%, rgba(8,12,10,0.98) 100%);
      border: 1px solid ${C.line};
    }
    .instrument-panel::before {
      content: ""; position: absolute; inset: 0; pointer-events: none; z-index: 0;
      background: radial-gradient(ellipse at 80% 20%, rgba(200, 158, 103,0.10), transparent 50%);
    }
    .breath-glow { animation: breathGlow 3.4s ease-in-out infinite; }
    /* Button system — soft pill radius, hover lift, sandstone glow, arrow nudge */
    .spry-btn {
      border-radius: 999px;
      letter-spacing: 0.01em;
      transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease,
        transform 0.18s ease, box-shadow 0.25s ease, opacity 0.2s ease;
    }
    .spry-btn:not(:disabled) { cursor: pointer; }
    .spry-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .spry-btn:hover:not(:disabled) { transform: translateY(-1px); }
    .spry-btn:active:not(:disabled) { transform: translateY(0); transition-duration: 0.06s; }
    .spry-btn-icon { display: inline-flex; transition: transform 0.2s ease; }
    .spry-btn:hover:not(:disabled) .spry-btn-icon,
    .spry-btn:focus-visible .spry-btn-icon { transform: translateX(3px); }
    .spry-btn--primary, .spry-btn--accent { background: ${C.accent}; color: ${C.bg}; border: 1px solid ${C.accent}; }
    .spry-btn--primary:hover:not(:disabled), .spry-btn--accent:hover:not(:disabled) {
      background: ${C.primaryDark}; border-color: ${C.primaryDark};
      box-shadow: 0 0 22px rgba(200, 158, 103,0.35), 0 12px 28px -16px rgba(200, 158, 103,0.6);
    }
    .spry-btn--primary:active:not(:disabled), .spry-btn--accent:active:not(:disabled) {
      background: ${C.accentDeep}; border-color: ${C.accentDeep}; box-shadow: none;
    }
    .spry-btn--secondary { background: transparent; color: ${C.ink}; border: 1px solid ${C.line}; }
    .spry-btn--secondary:hover:not(:disabled) { background: ${C.bgAlt}; border-color: #3B4A40; }
    .spry-btn--ghost { background: transparent; color: ${C.ink}; border: 1px solid transparent; }
    .spry-btn--ghost:hover:not(:disabled) { background: ${C.bgAlt}; }
    .spry-btn--dark { background: ${C.ink}; color: ${C.bg}; border: 1px solid ${C.ink}; }
    .spry-btn--dark:hover:not(:disabled) { background: #E9E5D8; }
    /* Condition tiles — hero services grid */
    .spry-tile {
      text-align: left;
      border: 1px solid ${C.line};
      transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.25s ease;
    }
    .spry-tile:hover, .spry-tile:focus-visible {
      transform: translateY(-2px);
      border-color: ${C.accent};
      box-shadow: 0 0 20px rgba(200, 158, 103,0.16);
    }
    .spry-tile-arrow { display: inline-flex; transition: transform 0.2s ease; }
    .spry-tile:hover .spry-tile-arrow, .spry-tile:focus-visible .spry-tile-arrow { transform: translateX(3px); }
    /* One-shot attention ping when a CTA hands off to the condition grid */
    @keyframes attnPulse {
      0% { box-shadow: 0 0 0 0 rgba(200, 158, 103,0.4); }
      100% { box-shadow: 0 0 0 18px rgba(200, 158, 103,0); }
    }
    .spry-attn { animation: attnPulse 0.9s ease-out 2; border-radius: 20px; }
    .spry-sticky-bar { transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.35s; will-change: transform; }
    .spry-desktop-only { display: none; }
    @media (min-width: 768px) { .spry-desktop-only { display: inline-flex; } }
    @media (prefers-reduced-motion: reduce) {
      .orbit-spin, .orbit-spin-slow, .orbit-spin-rev, .telemetry-track, .scan-line, .breath-glow, .ken-burns, .spry-rise, .spry-brand-in, .earth-distant, .spry-attn {
        animation: none !important;
      }
      .spry-btn, .spry-btn-icon, .spry-tile, .spry-tile-arrow, .spry-sticky-bar { transition: none !important; }
      .spry-btn:hover:not(:disabled), .spry-btn:active:not(:disabled), .spry-tile:hover, .spry-tile:focus-visible { transform: none !important; }
      .spry-btn:hover:not(:disabled) .spry-btn-icon, .spry-btn:focus-visible .spry-btn-icon,
      .spry-tile:hover .spry-tile-arrow, .spry-tile:focus-visible .spry-tile-arrow { transform: none !important; }
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
// Catalog (conditions + plans) lives in ./data/careCatalog.ts.

// ─────────────────────────────────────────────────────────────────────────────
// Mock Empower Rx History — what a logged-in patient sees in Quick Refills
// In production: GET https://api.empowerpharmacy.com/v1/patients/{id}/prescriptions
// Wholesale costs are NEVER exposed client-side; only marginated retail.
// ─────────────────────────────────────────────────────────────────────────────
const mockRxHistory = [
  { rxId: "EMP-294817", name: "Tirzepatide Injection", strength: "8 mg/2 mL · grapeseed oil",
    sig: "Inject 0.25 mL (10 units) subQ once weekly", lastFilled: "Mar 14, 2026", refills: 5, refillsUsed: 1,
    price: 279, chilled: true, category: "Weight Loss", icon: Scale, color: "hsl(150, 55%, 40%)",
    prescriber: "SpryMD Clinician", daysSupply: 28 },
  { rxId: "EMP-294112", name: "Tadalafil ODT", strength: "6 mg · oral dissolve",
    sig: "Dissolve one tablet under tongue daily", lastFilled: "Apr 02, 2026", refills: 11, refillsUsed: 0,
    price: 99, chilled: false, category: "Sexual Health", icon: Flame, color: "hsl(220, 60%, 20%)",
    prescriber: "SpryMD Clinician", daysSupply: 30 },
  { rxId: "EMP-291003", name: "Hair Restore MFK Topical", strength: "Minoxidil 5% / Fin 0.3% / Ketoconazole 2% · 60 mL",
    sig: "Apply 1 mL to scalp twice daily", lastFilled: "Feb 28, 2026", refills: 5, refillsUsed: 2,
    price: 89, chilled: false, category: "Hair Loss", icon: Sparkles, color: "hsl(220, 60%, 20%)",
    prescriber: "SpryMD Clinician", daysSupply: 60 },
  { rxId: "EMP-289445", name: "Tretinoin TAAN Mild Cream", strength: "Tret 0.03% / Azelaic 4% / Niac 4% · 30 g",
    sig: "Apply pea-sized amount nightly", lastFilled: "Mar 22, 2026", refills: 11, refillsUsed: 1,
    price: 59, chilled: false, category: "Dermatology", icon: Leaf, color: "hsl(220, 60%, 20%)",
    prescriber: "SpryMD Clinician", daysSupply: 30 },
  { rxId: "EMP-285332", name: "Sildenafil 50mg", strength: "50 mg · 10 tablets",
    sig: "Take one tablet 30–60 min before activity", lastFilled: "Apr 18, 2026", refills: 5, refillsUsed: 0,
    price: 69, chilled: false, category: "Sexual Health", icon: Flame, color: "hsl(220, 60%, 20%)",
    prescriber: "SpryMD Clinician", daysSupply: 30 },
  { rxId: "EMP-281109", name: "Methylene Blue Capsule", strength: "10 mg · cognition / mitochondrial support",
    sig: "Take one capsule each morning", lastFilled: "Mar 30, 2026", refills: 2, refillsUsed: 1,
    price: 79, chilled: false, category: "Longevity", icon: Zap, color: "hsl(150, 55%, 40%)",
    prescriber: "SpryMD Clinician", daysSupply: 30 },
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
  sermorelin: imgMarketplaceHero,
  nad: imgMarketplaceHero,
  lowt: imgMarketplaceHero,
  mentalhealth: imgMarketplaceHero,
  pcp: imgMarketplaceHero,
};

// Intake schemas live in ./data/careCatalog.ts (shared with unit tests and /checkout).

// ─────────────────────────────────────────────────────────────────────────────
// Atoms
// ─────────────────────────────────────────────────────────────────────────────
const Btn = ({ children, onClick, variant = "primary", size = "md", className = "", disabled, type = "button", icon: Icon }) => {
  const sizes = { sm: { padding: "8px 16px", fontSize: 13 }, md: { padding: "14px 22px", fontSize: 14 }, lg: { padding: "18px 32px", fontSize: 15 } };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`spry-btn spry-btn--${variant} focus-ring inline-flex items-center justify-center gap-2 font-medium ${className}`}
      style={sizes[size]}>
      {children}
      {Icon && <span className="spry-btn-icon" aria-hidden="true"><Icon size={16} strokeWidth={1.75} /></span>}
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

const Logo = ({ color = C.ink, size = 22, onClick, className = "" }) => {
  const mark = (
    <>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M18.81 2.79A13.5 13.5 0 1 0 27.19 8.45" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M18.26 15.15C22.43 11.12 24.77 6.38 24.84 2.92C22.79 4.4 19.75 8.43 16.85 13.74ZM14.35 16.62C11.31 19.56 9.6 23.02 9.55 25.55C11.04 24.47 13.26 21.53 15.38 17.65Z" fill={C.accent} stroke="#000" strokeWidth="1.2" strokeLinejoin="round" paintOrder="stroke" />
        <path d="M18.4 13.45Q21.09 9.78 23.92 4.83M14.25 17.86Q12.28 20.54 10.22 24.15" fill="none" stroke="#000" strokeWidth="0.4" strokeLinecap="round" />
        <path d="M18.4 15 17 13.6 15 13.6 13.6 15 13.6 17 15 18.4 17 18.4 18.4 17Z" fill={C.accent} stroke="#000" strokeWidth="1.2" paintOrder="stroke" />
      </svg>
      <span className="display" style={{ fontSize: size * 0.95, fontWeight: 600, color, letterSpacing: "-0.03em" }}>
        Spry<span className="spry-md">MD</span>
      </span>
    </>
  );
  // Always prefer a real control when a home handler is provided so the
  // top-left mark is clickable on intake, plan, checkout, and related views.
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`focus-ring flex items-center gap-2.5 rounded transition-opacity hover:opacity-80 ${className}`.trim()}
        aria-label="SpryMD home"
      >
        {mark}
      </button>
    );
  }
  return <div className={`flex items-center gap-2.5 ${className}`.trim()}>{mark}</div>;
};

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

const DeliveryBar = ({ onClick, glass = false }) => {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`w-full px-4 md:px-12 py-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 ${onClick ? "focus-ring" : ""}`}
      style={{
        background: glass ? "rgba(9,14,11,0.58)" : C.paper,
        borderBottom: `1px solid ${C.line}`,
        color: C.ink,
        cursor: onClick ? "pointer" : "default",
        backdropFilter: glass ? "blur(10px)" : undefined,
      }}
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
  <div className="inline-flex items-start gap-2" style={{ maxWidth: 480 }}>
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
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────────────
const Header = ({ go, cartCount, dark, user, glass = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const fg = dark ? C.paper : C.ink;
  const navItems = [
    { label: "How it works", view: "how" },
    { label: "Care options", view: "landing-conditions" },
    ...(FEATURES.enableShop ? [{ label: "Shop", view: "marketplace" }] : []),
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
      style={{
        borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.12)" : C.lineSoft}`,
        background: glass ? "rgba(9,14,11,0.62)" : undefined,
        backdropFilter: glass ? "blur(12px)" : undefined,
      }}>
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
          <Logo color={fg} onClick={() => goNav("landing")} />
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
          <span className="spry-desktop-only">
            <Btn size="sm" onClick={() => goNav("landing-conditions")}>Start your visit</Btn>
          </span>
          <button
            onClick={() => goNav(user ? "dashboard" : "signin")}
            className="focus-ring inline-flex items-center gap-2 rounded-lg px-3 py-2 transition-colors"
            style={{
              background: user ? C.accent : (dark ? "rgba(255,255,255,0.08)" : C.bgAlt),
              color: user ? C.bg : fg,
            }}
            aria-label={user ? "Open patient dashboard" : "Sign in to dashboard"}>
            <User size={18} strokeWidth={1.75} color={user ? C.bg : fg} />
            <span className="hidden sm:inline" style={{ fontSize: 13, fontWeight: 600, color: user ? C.bg : fg }}>
              {user ? "Dashboard" : "Sign in"}
            </span>
          </button>
          {FEATURES.enableShop ? (
            <button onClick={() => goNav("marketplace")} className="focus-ring relative rounded-lg p-2 transition-colors"
              style={{ background: dark ? "rgba(255,255,255,0.08)" : C.bgAlt }}
              aria-label="Open shop">
              <ShoppingBag size={18} strokeWidth={1.75} color={fg} />
              {cartCount > 0 && (
                <span className="mono absolute -top-1 -right-1 flex items-center justify-center"
                  style={{ background: C.accent, color: C.bg, fontSize: 10, width: 18, height: 18, borderRadius: 999, fontWeight: 600 }}>{cartCount}</span>
              )}
            </button>
          ) : null}
        </div>
      </div>
      {menuOpen ? (
        <nav
          id="mobile-nav"
          className="md:hidden mt-4 flex flex-col gap-1 rounded-lg p-2"
          style={{ background: dark ? "rgba(255,255,255,0.06)" : C.paper, border: `1px solid ${C.line}` }}
        >
          <button
            type="button"
            onClick={() => goNav("landing-conditions")}
            className="focus-ring rounded-md px-3 py-3 text-left text-sm font-semibold"
            style={{ color: C.accent }}
          >
            Start your visit
          </button>
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
// Sticky visit bar — persistent conversion CTA once the hero scrolls away
// ─────────────────────────────────────────────────────────────────────────────
const StickyVisitBar = ({ go }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 620);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      className="spry-sticky-bar"
      aria-hidden={!show}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        transform: show ? "translateY(0)" : "translateY(-110%)",
        visibility: show ? "visible" : "hidden",
        background: "rgba(9,14,11,0.72)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.line}`,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between gap-3" style={{ paddingTop: 10, paddingBottom: 10 }}>
        <Logo size={18} onClick={() => go("landing")} />
        <div className="flex items-center gap-4">
          <span className="spry-desktop-only" style={{ fontSize: 13, color: C.inkSoft }}>
            Private visits, reviewed by licensed doctors.
          </span>
          <Btn size="sm" icon={ArrowRight} onClick={() => go("landing-conditions")}>Start your visit</Btn>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Landing — elite performance health OS
// ─────────────────────────────────────────────────────────────────────────────
const openCareEdu = (go, conditionId) => {
  const slug = conditionToEduSlug[conditionId];
  if (slug) go("page", { slug });
  else go("intake", { condition: conditionId });
};

const Landing = ({ go }) => {
  return (
  <div className="anim-fadeIn relative">
    <ISpryChat onAction={() => go("landing-conditions")} forceDocked />
    <StickyVisitBar go={go} />

    <section className="grain relative z-10 overflow-hidden flex items-center" style={{ background: "transparent", minHeight: "88vh" }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(90deg, rgba(9,14,11,0.55) 0%, rgba(9,14,11,0.38) 50%, rgba(9,14,11,0.30) 100%)" }}
      />
      {/* Darken the bright sky behind the centered SpryMD wordmark */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 75% 42% at 50% 12%, rgba(9,14,11,0.72) 0%, rgba(9,14,11,0.38) 45%, transparent 72%)" }}
      />
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.14 }}>
        <SignalField density={28} interactive={false} />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-14 md:py-20">
        <div
          className="spry-brand-in display"
          style={{
            animationDelay: "0.02s",
            fontSize: "clamp(46px, 7.2vw, 82px)",
            lineHeight: 1.05,
            fontWeight: 700,
            color: C.ink,
            textAlign: "center",
            marginBottom: 40,
            opacity: 1,
          }}
        >
          <span className="relative inline-block">
            <span
              aria-hidden="true"
              className="absolute pointer-events-none"
              style={{
                inset: "-0.15em -0.35em",
                borderRadius: 999,
                background: "rgba(9,14,11,0.55)",
                filter: "blur(18px)",
                zIndex: 0,
              }}
            />
            <span className="relative" style={{ opacity: 1 }}>
              Spry<span className="spry-md">MD</span>
            </span>
          </span>
          <div style={{ fontSize: "0.42em", lineHeight: 1.3, marginTop: 8, color: C.ink, opacity: 1 }}>
            Feel better. Stay stronger. Live longer.
          </div>
        </div>
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
              Modern medicine, made for men and women
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
              Telehealth, built for <span className="signal-underline">Tennessee</span>.
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
              Licensed doctors. Hassle-free private visits. Treatment that ships fast &amp; discreetly to your door when it’s clinically appropriate.
            </p>
            <div className="spry-rise" style={{ animationDelay: "0.16s", marginBottom: 16 }}>
              <DeliveryHeroNote />
            </div>
            <div className="spry-rise flex flex-wrap items-center gap-4" style={{ animationDelay: "0.2s" }}>
              <Btn onClick={() => go("landing-conditions")} size="lg" icon={ArrowRight}>Start your confidential visit</Btn>
            </div>
            <div className="spry-rise flex flex-wrap gap-y-2 mt-6" style={{ animationDelay: "0.28s", columnGap: 28 }}>
              {["Zero judgment", "100% confidential", "Discreet, unmarked packaging"].map((item) => (
                <div key={item} className="inline-flex items-center gap-2">
                  <Check size={14} color={C.accent} strokeWidth={2.25} />
                  <span style={{ fontSize: 14, color: C.inkSoft, fontWeight: 500 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl p-5 md:p-6" style={{ border: `1px solid ${C.line}`, background: C.paper }}>
            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: C.accent, fontWeight: 700 }}>
              Start your visit
            </span>
            <h2 className="display" style={{ fontSize: 22, fontWeight: 650, color: C.ink, marginTop: 8, marginBottom: 16 }}>
              What can we help you with?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.values(conditions).filter((cond) => !["lowt", "mentalhealth", "pcp"].includes(cond.id)).map((cond) => {
                const Icon = cond.icon;
                return (
                  <button
                    key={cond.id}
                    onClick={() => openCareEdu(go, cond.id)}
                    className="spry-tile focus-ring text-left rounded-2xl p-4"
                    style={{ background: C.bg }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 38, height: 38, background: C.signalDim, border: `1px solid ${C.line}` }}>
                        <Icon size={18} color={C.accent} />
                      </div>
                      <div className="min-w-0">
                        <div style={{ fontSize: 15, fontWeight: 650, color: C.ink }}>{cond.name}</div>
                        {cond.fromPrice && (
                          <div style={{ fontSize: 12, color: C.muted }}>From ${cond.fromPrice}/mo</div>
                        )}
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.45, marginTop: 10 }}>{cond.tagline}</p>
                    <span className="inline-flex items-center gap-1.5 mt-3" style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>
                      Learn more <span className="spry-tile-arrow"><ArrowRight size={14} /></span>
                    </span>
                  </button>
                );
              })}
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
              You Choose → Clinician Reviews → Treatment Shipped.
            </h2>
          </div>
          <p style={{ fontSize: 15, color: C.inkSoft, maxWidth: 320, lineHeight: 1.5 }}>
            3 steps. No waiting room.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { n: "01", t: "Choose the type of care you want to receive.", d: "Then answer a short, private intake questionnaire that focuses on any contraindications to that particular treatment." },
            { n: "02", t: "Clinician review", d: "A licensed doctor reviews your case to make sure the treatment is safe." },
            { n: "03", t: "Treatment shipped", d: "Once treatment is approved, your prescription will be filled by our pharmacy, discreetly packaged and shipped within 24 hours for next-day delivery." },
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
        <div data-conditions-grid className="grid md:grid-cols-2 gap-3 md:gap-4">
          {Object.values(conditions).filter((cond) => !["pcp", "lowt", "mentalhealth"].includes(cond.id)).map((cond, i) => (
            <ConditionCard
              key={cond.id}
              condition={cond}
              onClick={() => openCareEdu(go, cond.id)}
              delay={i * 0.06}
            />
          ))}
        </div>
      </div>
    </section>

    {/* PCP */}
    <section id="pcp" className="px-6 md:px-12 py-20 md:py-28 relative overflow-hidden" style={{ background: C.bg }}>
      <BrandAtmosphere plate="care" variant="wash" />
      <div className="absolute inset-x-0 bottom-0 h-48 pointer-events-none" aria-hidden="true" style={{ opacity: 0.45 }}>
        <GridHorizon className="w-full h-full" />
      </div>
      <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12 items-center relative z-10">
        <div className="md:col-span-6">
          <span style={{ fontSize: 12, letterSpacing: "0.12em", color: C.accent, textTransform: "uppercase", fontWeight: 700 }}>Your doctor</span>
          <h2 className="display" style={{ fontSize: "clamp(34px, 5vw, 52px)", lineHeight: 1.08, marginTop: 14, color: C.ink, fontWeight: 650 }}>
            Want Spry to be your PCP?
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
                <span className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", color: C.muted, textTransform: "uppercase" }}>Spry Primary Care</span>
              </div>
            </div>
            <div className="p-7 md:p-8 relative z-10">
              <div className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", color: C.muted, textTransform: "uppercase" }}>Choose a plan</div>
              <div className="display" style={{ fontSize: "clamp(22px, 2.8vw, 28px)", fontWeight: 600, color: C.ink, lineHeight: 1.2, marginTop: 8 }}>
                Online Provider Visits start at $100
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  {
                    id: "pcp-acute",
                    t: "Acute Insight — meant for acute issues/complaints",
                    d: "$100 · 1 visit + anytime messaging for 1 month",
                    two: "$180 · Acute Insight for two adults",
                    tag: "Most popular",
                    span: false,
                  },
                  {
                    id: "pcp-yearly",
                    t: "Yearly Checkup",
                    d: "$250 · 1 visit + full blood work (yearly labs) + anytime messaging",
                    two: "$470 · Yearly Checkups for two adults",
                    tag: "Best value",
                    span: false,
                  },
                  {
                    id: "pcp-monthly",
                    t: "Monthly Doctor-Initiated Visits",
                    d: "$500 · Spry Primary Care at its finest. Your doctor calls you once a month to check on you and your wellbeing.",
                    two: null,
                    tag: null,
                    span: true,
                  },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => go("intake", { condition: "pcp", treatmentId: tier.id })}
                    className={`text-left rounded-2xl p-4 transition-all focus:outline-none ${tier.span ? "col-span-2" : ""}`}
                    style={{
                      background: C.bgAlt,
                      border: `1px solid ${tier.tag ? C.accent : C.line}`,
                      boxShadow: tier.tag ? `0 0 0 1px ${C.accent}33` : "none",
                    }}
                  >
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span style={{ fontSize: 15, fontWeight: 650, color: C.ink }}>{tier.t}</span>
                      {tier.tag && <Tag color={C.signalDim} fg={C.accent}>{tier.tag}</Tag>}
                    </div>
                    <span style={{ fontSize: 13, color: C.inkSoft, display: "block", lineHeight: 1.5 }}>{tier.d}</span>
                    {tier.two && (
                      <span style={{ fontSize: 12, color: C.muted, display: "block", lineHeight: 1.45, marginTop: 8 }}>{tier.two}</span>
                    )}
                    <span className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: C.accent, textTransform: "uppercase", fontWeight: 600, display: "inline-block", marginTop: 12 }}>
                      Start intake →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Physician authority — people buy into the who as much as the what */}
    <section id="physician" className="px-6 md:px-12 py-16 md:py-24" style={{ background: C.bgAlt, borderTop: `1px solid ${C.lineSoft}` }}>
      <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-10 md:gap-14 items-center">
        <div className="md:col-span-6">
          <span style={{ fontSize: 12, letterSpacing: "0.12em", color: C.accent, textTransform: "uppercase", fontWeight: 700 }}>Physician-led</span>
          <h2 className="display" style={{ fontSize: "clamp(30px, 4.6vw, 46px)", lineHeight: 1.14, marginTop: 14, color: C.ink, fontWeight: 600 }}>
            Founded by a physician who has spent years at the hospital bedside.
          </h2>
          <p style={{ fontSize: 16, color: C.inkSoft, marginTop: 18, lineHeight: 1.6, maxWidth: 520 }}>
            SpryMD isn&rsquo;t a faceless internet pharmacy. It was founded by Dr. William Merrick, DO —
            a practicing Tennessee hospitalist whose day job is caring for hospitalized patients — and
            that bedside judgment shapes every treatment we offer.
          </p>
          <p style={{ fontSize: 16, color: C.inkSoft, marginTop: 12, lineHeight: 1.6, maxWidth: 520 }}>
            When you finish your intake, a real, licensed Tennessee physician personally reviews it —
            your history, your medications, your answers — before anything is prescribed or shipped.
            And if treatment isn&rsquo;t right for you, we&rsquo;ll tell you that too.
          </p>
          <div className="mt-8 space-y-4">
            {[
              { icon: Stethoscope, t: "Hospitalist-founded", d: "Years of inpatient hospital medicine behind every protocol — not a marketing team with a prescription pad." },
              { icon: UserCheck, t: "A physician reads every intake", d: "Personal review by a Tennessee-licensed doctor before any treatment ships." },
              { icon: FileText, t: "Board-certified oversight", d: "No protocol is authorized without independent medical judgment." },
              { icon: Heart, t: "Judgment-free by design", d: "These are conditions doctors treat every single day. There's nothing you can't tell us." },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="flex items-start gap-3.5">
                <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 38, height: 38, background: C.signalDim, border: `1px solid ${C.line}` }}>
                  <Icon size={17} color={C.accent} strokeWidth={1.75} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 650, color: C.ink }}>{t}</div>
                  <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.5, marginTop: 2 }}>{d}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-10">
            <Btn onClick={() => go("page", { slug: "clinicians" })} size="lg" variant="secondary" icon={ArrowRight}>How we practice medicine</Btn>
          </div>
        </div>
        <div className="md:col-span-6">
          <div className="rounded-3xl overflow-hidden" style={{ border: `1px solid ${C.line}`, background: C.paper }}>
            <div>
              <img
                src={imgFounder}
                alt="Dr. William Merrick, DO — founder of SpryMD"
                className="w-full"
                style={{ display: "block", width: "100%", height: "auto", objectFit: "contain" }}
              />
              <div className="px-6 md:px-7 pt-5 pb-1">
                <div className="display" style={{ fontSize: 24, fontWeight: 600, color: C.ink }}>Dr. William Merrick, DO</div>
                <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 2 }}>Founder · Practicing hospitalist · Tennessee</div>
              </div>
            </div>
            <div className="p-6 md:p-7 pt-4">
              <p className="display" style={{ fontSize: 17, lineHeight: 1.5, color: C.inkSoft, fontStyle: "italic" }}>
                &ldquo;The doctor reviewing your case has heard it all before — and took an oath to
                help, not to judge.&rdquo;
              </p>
              <div className="grid grid-cols-2 gap-3 mt-6">
                {[
                  { k: "Training", v: "Hospital medicine" },
                  { k: "Licensure", v: "Tennessee" },
                  { k: "Every intake", v: "Physician-reviewed" },
                  { k: "Oversight", v: "Board-certified" },
                ].map(({ k, v }) => (
                  <div key={k} className="rounded-2xl p-4" style={{ background: C.bgAlt, border: `1px solid ${C.line}` }}>
                    <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: C.muted, textTransform: "uppercase", fontWeight: 600 }}>{k}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginTop: 4 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="px-6 md:px-12 py-14 md:py-20" style={{ background: C.bg }}>
      <div className="max-w-7xl mx-auto">
        <span style={{ fontSize: 12, letterSpacing: "0.12em", color: C.accent, textTransform: "uppercase", fontWeight: 700 }}>Social proof</span>
        <div className="grid md:grid-cols-3 gap-3 mb-6 mt-6">
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
        <div className="grid gap-3">
          <div className="p-6 rounded-2xl relative overflow-hidden" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
            <img
              src={brandPlates.tn.src}
              alt=""
              className="absolute inset-0 w-full h-full"
              style={{ objectFit: "cover", opacity: 0.45, objectPosition: "center 35%" }}
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(20,20,20,0.15), rgba(20,20,20,0.62))" }} />
            <div className="flex items-center gap-3 mb-4 relative">
              <div className="rounded-full flex items-center justify-center" style={{ width: 44, height: 44, background: C.signalDim, border: `1px solid ${C.line}` }}>
                <MapPin size={20} color={C.accent} />
              </div>
              <div>
                <div className="display" style={{ fontSize: 20, fontWeight: 600, color: C.ink }}>Tennessee service area</div>
                <div style={{ fontSize: 13, color: C.inkSoft }}>We currently care for patients located in Tennessee</div>
              </div>
            </div>
            <p className="relative" style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.55, marginBottom: 18 }}>
              Questions about your visit, shipping, or account? Email <strong style={{ color: C.ink }}>support@sprymd.ai</strong> — we aim to reply within one business day. For emergencies, call 911.
            </p>
            <div className="flex flex-wrap gap-3 relative">
              <Btn onClick={() => go("page", { slug: "contact" })} size="md" icon={ArrowRight}>Contact support</Btn>
              <Btn onClick={() => go("page", { slug: "about" })} size="md" variant="ghost">About SpryMD</Btn>
            </div>
          </div>
        </div>
      </div>
    </section>


    {FEATURES.enableShop ? (
    <section className="px-6 md:px-12 py-20 md:py-28" style={{ background: C.bgAlt }}>
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden mb-12" style={{ border: `1px solid ${C.line}`, minHeight: 260 }}>
          <BrandAtmosphere plate="shop" variant="banner" />
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
    ) : null}

    {/* Close */}
    <section className="px-6 md:px-12 py-24 md:py-32 relative overflow-hidden" style={{ background: "transparent" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.18 }}>
        <SignalField density={28} interactive={false} />
      </div>
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(9,14,11,0.48) 0%, rgba(9,14,11,0.62) 74%)" }} />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="display" style={{ fontSize: "clamp(18px, 2vw, 22px)", fontWeight: 700, marginBottom: 24, opacity: 1 }}>
          Spry<span className="spry-md">MD</span>
        </div>
        <h2 className="display" style={{ fontSize: "clamp(32px, 5vw, 52px)", lineHeight: 1.12, fontWeight: 650, color: C.ink }}>
          A real doctor is with you every step.
        </h2>
        <p style={{ fontSize: 17, color: C.inkSoft, marginTop: 20, maxWidth: 480, marginLeft: "auto", marginRight: "auto", lineHeight: 1.55 }}>
          Clear plans. Private care. Help that fits your life — not a waiting room.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          <Btn onClick={() => go("landing-conditions")} size="lg" icon={ArrowRight}>Start your confidential visit</Btn>
          {FEATURES.enableShop ? (
            <Btn onClick={() => go("marketplace")} size="lg" variant="secondary">Browse the shop</Btn>
          ) : (
            <Btn onClick={() => go("refills")} size="lg" variant="secondary">Quick refills</Btn>
          )}
        </div>
      </div>
    </section>

    <Footer go={go} />
  </div>
  );
};

const ConditionCard = ({ condition, onClick, delay }) => {
  const [hover, setHover] = useState(false);

  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="anim-fadeUp focus-ring text-left p-7 md:p-8 transition-all duration-300 group relative overflow-hidden"
      style={{ background: C.bg, border: `1px solid ${hover ? C.accent : C.line}`, borderRadius: 16, animationDelay: `${delay}s`, transform: hover ? "translateY(-2px)" : "none" }}>
      <div className="absolute inset-y-0 left-0 w-px transition-all" style={{ background: C.accent, opacity: hover ? 1 : 0, boxShadow: hover ? `0 0 24px ${C.accent}` : "none" }} />
      <div className="flex items-start justify-end mb-8 relative">
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
  { h: "Care plans", l: ["Weight Loss", "ED", "Low Testosterone", "Sermorelin", "NAD+ Therapy", "Anxiety & Depression", "Hair Loss", "Skin", "Primary Care"] },
  {
    h: FEATURES.enableShop ? "Shop" : "Pharmacy",
    l: FEATURES.enableShop
      ? ["Quick Refills", "Supplements", "Devices", "Sleep"]
      : ["Quick Refills"],
  },
  { h: "Company", l: ["About", "Doctors", "Press", "Contact"] },
];

const Footer = ({ go }) => (
  <footer className="px-6 md:px-12 py-12" style={{ background: C.bg, borderTop: `1px solid ${C.line}` }}>
    <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
      <div>
        <Logo onClick={() => go("landing")} />
        <p style={{ fontSize: 12, color: C.muted, marginTop: 12, lineHeight: 1.5, maxWidth: 240 }}>
          Modern medicine, made for men and women. Licensed telehealth for patients in Tennessee. Support: support@sprymd.ai. Not for emergencies.
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

const FaqBlock = ({ items }) => {
  const [open, setOpen] = useState(0);
  return (
    <div className="space-y-2" style={{ marginTop: 4 }}>
      {items.map((item, ii) => {
        const isOpen = open === ii;
        return (
          <div key={ii} style={{ border: `1px solid ${C.lineSoft}`, borderRadius: 12, background: C.bgAlt, overflow: "hidden" }}>
            <button
              type="button"
              className="focus-ring w-full text-left flex items-start justify-between gap-4 px-4 py-3.5"
              onClick={() => setOpen(isOpen ? -1 : ii)}
              aria-expanded={isOpen}
              style={{ background: "transparent", border: "none", color: C.ink }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>{item.q}</span>
              <span className="mono flex-shrink-0" style={{ fontSize: 18, color: C.accent, lineHeight: 1 }}>{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4" style={{ fontSize: 15, lineHeight: 1.6, color: C.inkSoft }}>
                <RichText text={item.a} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const FooterPage = ({ slug, go, cartCount, user }) => {
  const page = careEduPages[slug] || footerPages[slug];
  const shopStackSlugs = new Set(["supplements", "devices", "sleep"]);
  if (!page || (!FEATURES.enableShop && shopStackSlugs.has(slug))) {
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
      if (!FEATURES.enableShop) {
        go("landing");
        return;
      }
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
          <p style={{ fontSize: 18, lineHeight: 1.5, color: C.inkSoft, maxWidth: 560, marginBottom: page.highlights?.length ? 22 : 28 }}>
            {page.tagline}
          </p>
          {page.highlights?.length > 0 && (
            <ul className="space-y-3 mb-8" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {page.highlights.map((item, ii) => (
                <li key={ii} className="flex gap-3" style={{ fontSize: 15, lineHeight: 1.55, color: C.inkSoft }}>
                  <Check size={16} color={C.accent} strokeWidth={2.25} style={{ marginTop: 3, flexShrink: 0 }} />
                  <span><RichText text={item} /></span>
                </li>
              ))}
            </ul>
          )}
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
                  if (block.type === "table") {
                    return (
                      <div key={bi} className="overflow-x-auto" style={{ border: `1px solid ${C.line}`, borderRadius: 14 }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                          <thead>
                            <tr style={{ background: C.bgAlt }}>
                              {block.headers.map((h, hi) => (
                                <th key={hi} className="text-left px-4 py-3" style={{ color: C.ink, fontWeight: 650, borderBottom: `1px solid ${C.line}` }}>
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {block.rows.map((row, ri) => (
                              <tr key={ri}>
                                {row.map((cell, ci) => (
                                  <td key={ci} className="px-4 py-3 align-top" style={{ color: ci === 0 ? C.ink : C.inkSoft, fontWeight: ci === 0 ? 600 : 400, borderBottom: ri < block.rows.length - 1 ? `1px solid ${C.lineSoft}` : "none" }}>
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  }
                  if (block.type === "faq") {
                    return <FaqBlock key={bi} items={block.items} />;
                  }
                  return null;
                })}
              </div>
            </div>
          ))}

          {page.conditionId && (
            <div className="pt-2">
              <Btn onClick={runCta} size="lg" icon={ArrowRight}>{page.ctaLabel || "Continue"}</Btn>
            </div>
          )}

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
const AUTH_THEME_KEY = "sprymd_auth_theme";

const authThemes = {
  dark: {
    bg: "transparent",
    ink: "#F4F1E8",
    inkSoft: "#D2CFC2",
    muted: "#93A096",
    line: "#263129",
    lineSoft: "#1A241E",
    inputBg: "#101915",
    errorBg: "rgba(206,107,93,0.12)",
    errorBorder: "rgba(206,107,93,0.35)",
    noticeBg: "rgba(200, 158, 103, 0.16)",
    noticeBorder: "#96703F",
  },
  light: {
    bg: "#EAE7DC",
    ink: "#1B241E",
    inkSoft: "#3C463F",
    muted: "#67716A",
    line: "#C9C4B4",
    lineSoft: "#D8D3C4",
    inputBg: "#FFFDF7",
    errorBg: "rgba(206,107,93,0.08)",
    errorBorder: "rgba(206,107,93,0.28)",
    noticeBg: "rgba(200, 158, 103, 0.10)",
    noticeBorder: "#C89E67",
  },
};

const SignIn = ({ go, returnTo, onAuthSuccess }) => {
  const opsReturn =
    typeof returnTo === "string" &&
    (returnTo === "/ops" || returnTo.startsWith("/ops/") || returnTo.startsWith("/ops?"));
  const [mode, setMode] = useState(opsReturn ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [playCount, setPlayCount] = useState(1);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(AUTH_THEME_KEY) === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });
  const animResolveRef = useRef(null);
  const T = authThemes[theme];
  const isLight = theme === "light";

  // Adults only: the intake already asks, but the account is the hard gate.
  const dobProblem = mode === "signup" ? dobError(dob) : null;
  const canSubmit = email.includes("@") && password.length >= 8 &&
    (mode === "signin" || (name.trim().length > 0 && dob.length >= 8 && !dobProblem));

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try { localStorage.setItem(AUTH_THEME_KEY, next); } catch { /* ignore */ }
      return next;
    });
  };

  const handleLaserComplete = () => {
    if (animResolveRef.current) {
      animResolveRef.current();
      animResolveRef.current = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setError("");
    setNotice("");
    setPlayCount((c) => c + 1);

    let resolveAnim = () => {};
    const animationDonePromise = new Promise((resolve) => {
      resolveAnim = resolve;
      animResolveRef.current = resolve;
    });
    const animSafety = window.setTimeout(() => resolveAnim(), 4100);

    const authPromise =
      mode === "signup"
        ? signUpCustomer({ email, password, name, dob })
        : signInCustomer({ email, password });

    try {
      const [result] = await Promise.all([authPromise, animationDonePromise]);
      if (mode === "signup") {
        onAuthSuccess(hydrateUser(result.profile));
        if (result.needsEmailConfirm) {
          setNotice(
            opsReturn
              ? "Account created — confirm the email link, then sign in to open Ops. Clinician APIs need a live Supabase session."
              : "Account created. Check your email to confirm — you can keep using your account now.",
          );
          if (opsReturn) {
            setMode("signin");
            setLoading(false);
            return;
          }
        }
      } else {
        onAuthSuccess(hydrateUser(result.profile));
      }

      // Ops APIs require a Supabase Bearer token — local-only accounts cannot call /api/ops/*.
      if (opsReturn && result.provider === "local") {
        setError(
          "Ops needs a clinical Supabase login. Create the account again (or confirm email), then sign in with the same password.",
        );
        setLoading(false);
        return;
      }

      go(returnTo || "dashboard", { justLoggedIn: true });
    } catch (err) {
      resolveAnim();
      setError(err?.message || "Unable to authenticate. Try again.");
      setLoading(false);
    } finally {
      window.clearTimeout(animSafety);
      animResolveRef.current = null;
    }
  };

  const themedInput = {
    ...inputStyle,
    background: T.inputBg,
    border: `1px solid ${T.line}`,
    color: T.ink,
  };

  const iconBtn = {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: `1px solid ${T.line}`,
    background: isLight ? "#FFFFFF" : "transparent",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div className="anim-fadeIn min-h-screen flex flex-col" style={{ background: T.bg, color: T.ink, transition: "background 0.25s ease, color 0.25s ease" }}>
      <div className="px-6 md:px-12 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.lineSoft}` }}>
        <Logo color={T.ink} onClick={() => go("landing")} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="focus-ring hover:opacity-80 transition-opacity"
            style={iconBtn}
            aria-label={isLight ? "Switch to dark background" : "Switch to light background"}
            title={isLight ? "Dark" : "Light"}
          >
            {isLight ? <Moon size={16} color={T.ink} strokeWidth={1.75} /> : <Sun size={16} color={T.ink} strokeWidth={1.75} />}
          </button>
          <button onClick={() => go("landing")} className="focus-ring hover:opacity-80 transition-opacity" style={iconBtn} aria-label="Close">
            <X size={16} color={T.ink} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-10 md:py-16">
        <div className="w-full max-w-[380px] anim-fadeUp">
          <LaserLogo play={playCount} onComplete={handleLaserComplete} className="mb-9" />

          <div className="mb-8">
            <p className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: C.accent, textTransform: "uppercase" }}>
              {opsReturn
                ? (mode === "signin" ? "Staff sign in" : "Staff account")
                : (mode === "signin" ? "Sign in" : "Create account")}
            </p>
            <p style={{ fontSize: 15, color: T.inkSoft, marginTop: 10, lineHeight: 1.5 }}>
              {opsReturn
                ? (mode === "signin"
                  ? "Use your allowlisted clinician email to open the ops queue."
                  : "First login after cutover: create your account with the allowlisted staff email, then open Ops.")
                : (mode === "signin"
                  ? "Open your care plan, prescriptions, and orders."
                  : "One email. Your care plan stays private to you.")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <label className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", color: T.muted, textTransform: "uppercase", display: "block", marginBottom: 8, fontWeight: 500 }}>Full legal name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full legal name" className="focus-ring w-full p-4" style={themedInput} disabled={loading} />
                </div>
                <div>
                  <label htmlFor="signup-dob" className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", color: T.muted, textTransform: "uppercase", display: "block", marginBottom: 8, fontWeight: 500 }}>Date of birth</label>
                  <input id="signup-dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} max={new Date().toISOString().slice(0, 10)}
                    aria-invalid={!!dobProblem} aria-describedby={dobProblem ? "signup-dob-error" : undefined}
                    className="focus-ring w-full p-4" style={{ ...themedInput, borderColor: dobProblem ? C.destructive : T.line }} disabled={loading} />
                  {dobProblem && <p id="signup-dob-error" role="alert" style={{ fontSize: 13, color: C.destructive, marginTop: 8, lineHeight: 1.45 }}>{dobProblem}</p>}
                </div>
              </>
            )}
            <div>
              <label className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", color: T.muted, textTransform: "uppercase", display: "block", marginBottom: 8, fontWeight: 500 }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="focus-ring w-full p-4" style={themedInput} autoComplete="email" disabled={loading} />
            </div>
            <div>
              <label className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", color: T.muted, textTransform: "uppercase", display: "block", marginBottom: 8, fontWeight: 500 }}>Password</label>
              <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }} placeholder="At least 8 characters" className="focus-ring w-full p-4" style={themedInput} autoComplete={mode === "signin" ? "current-password" : "new-password"} disabled={loading} />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: T.errorBg, border: `1px solid ${T.errorBorder}` }}>
                <AlertCircle size={16} color={C.destructive} style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.45 }}>{error}</span>
              </div>
            )}
            {notice && (
              <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: T.noticeBg, border: `1px solid ${T.noticeBorder}` }}>
                <Check size={16} color={C.accent} style={{ marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: T.inkSoft, lineHeight: 1.45 }}>{notice}</span>
              </div>
            )}

            <Btn type="submit" disabled={!canSubmit || loading} size="lg" className="w-full">
              {loading ? <span className="anim-pulse">{mode === "signin" ? "Signing in..." : "Creating account..."}</span>
                       : <>{mode === "signin" ? "Sign in" : "Create account & continue"}</>}
            </Btn>

            <div className="flex items-center gap-2 justify-center pt-1">
              <Lock size={11} color={T.muted} />
              <span className="mono" style={{ fontSize: 10, color: T.muted, letterSpacing: "0.1em" }}>HIPAA-COMPLIANT · ENCRYPTED · PER-CUSTOMER</span>
            </div>
          </form>

          <div className="text-center mt-7 pt-6" style={{ borderTop: `1px solid ${T.lineSoft}` }}>
            <button type="button" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setNotice(""); }}
              className="focus-ring rounded text-sm hover:opacity-60 transition-opacity" style={{ color: T.inkSoft }} disabled={loading}>
              {mode === "signin"
                ? <>New to SpryMD? <span style={{ color: C.accent, fontWeight: 500, textDecoration: "underline" }}>Create an account</span></>
                : <>Already a member? <span style={{ color: C.accent, fontWeight: 500, textDecoration: "underline" }}>Sign in</span></>}
            </button>
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
        <Logo onClick={() => go("landing")} />
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
            <Tag color={C.bgAlt}><Stethoscope size={10} style={{ display: "inline", marginRight: 4 }} />Prescriber: SpryMD Clinician</Tag>
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
        <Logo onClick={() => go("landing")} />
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
        <Logo onClick={() => go("landing")} />
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
                  ...(FEATURES.enableShop
                    ? [{ i: ShoppingBag, t: "Browse the shop", d: "Supplements & devices", action: () => go("marketplace") }]
                    : []),
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
// Safety panels — shown the moment a self-harm or cardiac answer is selected
// ─────────────────────────────────────────────────────────────────────────────
const CrisisPanel = ({ compact = false }) => (
  <div role="alert" aria-live="assertive" data-testid="crisis-panel" className="rounded-2xl"
    style={{ background: "rgba(206,107,93,0.12)", border: `1px solid ${C.destructive}`, padding: compact ? 16 : 24 }}>
    <div className="flex items-start gap-3">
      <AlertCircle size={22} strokeWidth={1.75} color={C.destructive} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <p style={{ fontSize: compact ? 15 : 17, fontWeight: 600, color: C.ink, lineHeight: 1.4 }}>
          If you are in danger or thinking about harming yourself, get help right now.
        </p>
        <p style={{ fontSize: 14, color: C.inkSoft, marginTop: 8, lineHeight: 1.55 }}>
          Call or text <strong style={{ color: C.ink }}>{CRISIS_LINE_NUMBER}</strong> (Suicide &amp; Crisis Lifeline, 24/7, free and confidential),
          or call <strong style={{ color: C.ink }}>{EMERGENCY_NUMBER}</strong> if you may act on these thoughts. SpryMD is not an emergency service
          and cannot start medication online for this — a clinician needs to talk with you first.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <a href={`tel:${CRISIS_LINE_NUMBER}`} className="spry-btn spry-btn--primary focus-ring inline-flex items-center gap-2" style={{ padding: "10px 16px", fontSize: 14, textDecoration: "none" }}>
            Call {CRISIS_LINE_NUMBER}
          </a>
          <a href={`sms:${CRISIS_LINE_NUMBER}`} className="spry-btn spry-btn--secondary focus-ring inline-flex items-center gap-2" style={{ padding: "10px 16px", fontSize: 14, textDecoration: "none" }}>
            Text {CRISIS_LINE_NUMBER}
          </a>
          <a href={`tel:${EMERGENCY_NUMBER}`} className="spry-btn spry-btn--secondary focus-ring inline-flex items-center gap-2" style={{ padding: "10px 16px", fontSize: 14, textDecoration: "none" }}>
            Call {EMERGENCY_NUMBER}
          </a>
        </div>
      </div>
    </div>
  </div>
);

const EmergencyNote = ({ children }) => (
  <div role="note" data-testid="emergency-note" className="flex items-start gap-3 rounded-2xl p-4"
    style={{ background: "rgba(217,164,65,0.10)", border: `1px solid ${C.warn}` }}>
    <AlertCircle size={18} strokeWidth={1.75} color={C.warn} style={{ flexShrink: 0, marginTop: 2 }} />
    <p style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.55 }}>{children}</p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Intake
// ─────────────────────────────────────────────────────────────────────────────
const Intake = ({ conditionId, treatmentId, go, persist = true }) => {
  const condition = conditions[conditionId];
  const steps = buildIntakeSteps(conditionId);
  const [saved] = useState(() => (persist ? loadIntakeProgress(conditionId) : null));
  const [step, setStep] = useState(saved?.step ?? 0);
  const [answers, setAnswers] = useState(() => ({
    ...(saved?.answers || {}),
    ...(treatmentId ? { treatmentId } : {}),
  }));
  const [direction, setDirection] = useState("forward");
  const [resumed, setResumed] = useState(!!saved && saved.step > 0);

  useEffect(() => {
    if (persist) saveIntakeProgress({ conditionId, step, answers });
  }, [persist, conditionId, step, answers]);

  const isLast = step === steps.length - 1;
  const current = steps[step];
  const value = answers[current.key];
  const canAdvance = canAdvanceStep(current, answers);
  const eligibilityBlock = current.type === "eligibility" ? eligibilityBlockReason(answers) : null;
  const disqualifiersHere = stepDisqualifiers(current, answers);
  const crisisHere = stepCrisisHits(current, answers);
  const urgentHere = stepUrgentHits(current, answers);

  const handleAdvance = () => {
    if (!canAdvance) return;
    if (!isLast) {
      setDirection("forward");
      setStep(step + 1);
      return;
    }
    const disqualifier = findDisqualifier(steps, answers);
    go("plan", { condition: conditionId, answers, disqualified: disqualifier?.option ?? null, safety: safetyFlags(steps, answers) });
  };

  const handleBack = () => {
    if (step === 0) go("landing");
    else { setDirection("back"); setStep(step - 1); }
  };

  const startOver = () => {
    clearIntakeProgress(conditionId);
    setAnswers(treatmentId ? { treatmentId } : {});
    setDirection("back");
    setStep(0);
    setResumed(false);
  };

  const setAnswer = (key, val) => setAnswers((a) => ({ ...a, [key]: val }));
  const progress = ((step + 1) / steps.length) * 100;
  const timeLeft = timeLeftLabel(step, steps.length);

  const optionStyle = (selected) => ({
    background: selected ? C.primary : C.paper, color: selected ? C.bg : C.ink,
    border: `1px solid ${selected ? C.primary : C.line}`, borderRadius: 16, fontSize: 15, fontWeight: 500,
  });

  return (
    <div className="anim-fadeIn min-h-screen flex flex-col" style={{ background: C.bg }}>
      <div className="px-6 md:px-12 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.lineSoft}` }}>
        <Logo onClick={() => go("landing")} />
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="mono" style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", display: "block" }}>
              {String(step + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
            </span>
            <span style={{ fontSize: 11, color: C.accent, fontWeight: 600 }}>{timeLeft}</span>
          </div>
          <button onClick={() => go("landing")} aria-label="Close intake and return home" className="focus-ring rounded-full p-1 hover:opacity-60 transition-opacity">
            <X size={20} color={C.ink} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div style={{ height: 3, background: C.lineSoft, position: "relative" }}>
        <div style={{ height: "100%", background: C.primary, width: `${progress}%`, transition: "width 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)", borderRadius: "0 999px 999px 0" }} />
      </div>

      {/* Normalizing micro-copy — a quiet, private conversation, zero friction */}
      <div className="px-6 md:px-12 py-2.5 flex flex-wrap items-center justify-center gap-x-6 gap-y-1" style={{ borderBottom: `1px solid ${C.lineSoft}`, background: C.bgAlt }}>
        {[
          { icon: Heart, label: "Zero judgment" },
          { icon: Lock, label: "100% confidential" },
          { icon: Package, label: "Ships in discreet, unmarked packaging" },
        ].map(({ icon: TrustIcon, label }) => (
          <span key={label} className="inline-flex items-center gap-1.5">
            <TrustIcon size={12} color={C.accent} strokeWidth={2} />
            <span style={{ fontSize: 11.5, color: C.inkSoft, letterSpacing: "0.02em" }}>{label}</span>
          </span>
        ))}
      </div>

      <div className="flex-1 flex items-start md:items-center justify-center px-6 md:px-12 py-12 md:py-16">
        <div key={step} className={direction === "forward" ? "anim-slideRight" : "anim-slideLeft"} style={{ width: "100%", maxWidth: 640 }}>
          {resumed && (
            <div data-testid="intake-resumed" className="flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-3 mb-6"
              style={{ background: C.bgAlt, border: `1px solid ${C.line}` }}>
              <span style={{ fontSize: 13, color: C.inkSoft }}>Picked up where you left off.</span>
              <button type="button" onClick={startOver} className="focus-ring rounded" style={{ fontSize: 13, color: C.accent, fontWeight: 600 }}>Start over</button>
            </div>
          )}

          <div className="mb-8">
            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: condition.accent, textTransform: "uppercase", fontWeight: 500 }}>{condition.name}</span>
            <h2 className="display" style={{ fontSize: "clamp(28px, 4vw, 44px)", lineHeight: 1.1, fontWeight: 400, color: C.ink, marginTop: 12 }}>{current.title}</h2>
            {current.sub && <p style={{ fontSize: 15, color: C.inkSoft, marginTop: 12, lineHeight: 1.55 }}>{current.sub}</p>}
          </div>

          {current.type === "eligibility" && (
            <div className="space-y-6">
              <div>
                <label htmlFor="intake-state" className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", color: C.muted, textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                  State where you are physically located right now
                </label>
                <select id="intake-state" value={answers[ELIGIBILITY_STATE_KEY] || ""} onChange={(e) => setAnswer(ELIGIBILITY_STATE_KEY, e.target.value)}
                  className="focus-ring w-full p-4"
                  style={{ ...inputStyle, borderRadius: 16, fontSize: 16, appearance: "auto" }}>
                  <option value="">Select a state</option>
                  {US_STATES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
                </select>
              </div>
              <fieldset>
                <legend className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", color: C.muted, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Are you 18 or older?</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[ADULT_YES, ADULT_NO].map((opt) => {
                    const selected = answers[ELIGIBILITY_ADULT_KEY] === opt;
                    return (
                      <button key={opt} type="button" aria-pressed={selected} onClick={() => setAnswer(ELIGIBILITY_ADULT_KEY, opt)}
                        className="focus-ring w-full text-left flex items-center justify-between p-5 transition-all" style={optionStyle(selected)}>
                        <span>{opt}</span>
                        {selected && <Check size={14} strokeWidth={3} color={C.bg} />}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              {eligibilityBlock && (
                <div role="alert" data-testid="eligibility-block" className="rounded-2xl p-5" style={{ background: C.paper, border: `1px solid ${C.warn}` }}>
                  <p style={{ fontSize: 15, color: C.ink, lineHeight: 1.55 }}>{eligibilityBlock}</p>
                  <div className="mt-4">
                    <Btn onClick={() => go("landing")} variant="secondary">Return home</Btn>
                  </div>
                </div>
              )}
            </div>
          )}

          {current.type === "single" && (
            <div className="space-y-3" role="group" aria-label={current.title}>
              {current.options.map((opt) => (
                <button key={opt} type="button" aria-pressed={value === opt} onClick={() => setAnswer(current.key, opt)}
                  className="focus-ring w-full text-left flex items-center justify-between p-5 transition-all" style={optionStyle(value === opt)}>
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
            <div className="space-y-3" role="group" aria-label={current.title}>
              {current.options.map((opt) => {
                const checked = Array.isArray(value) && value.includes(opt);
                return (
                  <button key={opt} type="button" aria-pressed={checked}
                    onClick={() => setAnswer(current.key, toggleMultiOption(current, Array.isArray(value) ? value : [], opt))}
                    className="focus-ring w-full text-left flex items-center justify-between p-5 transition-all" style={optionStyle(checked)}>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {current.fields.map((f) => {
                const raw = answers[f.key] || "";
                const error = compoundFieldError(f, raw);
                const inputId = `intake-${current.key}-${f.key}`;
                return (
                  <div key={f.key}>
                    <label htmlFor={inputId} className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", color: C.muted, textTransform: "uppercase", display: "block", marginBottom: 8 }}>{f.label}</label>
                    <input id={inputId} type={f.type} inputMode="decimal" min={f.min} max={f.max} value={raw} onChange={(e) => setAnswer(f.key, e.target.value)} placeholder={f.placeholder}
                      aria-invalid={!!error} aria-describedby={error ? `${inputId}-error` : undefined}
                      className="focus-ring w-full p-4"
                      style={{ background: C.bgAlt, border: `1px solid ${error ? C.destructive : C.line}`, borderRadius: 16, fontSize: 18, color: C.ink, fontFamily: fonts.body, fontWeight: 500 }} />
                    {error && <p id={`${inputId}-error`} role="alert" style={{ fontSize: 12, color: C.destructive, marginTop: 6, lineHeight: 1.4 }}>{error}</p>}
                  </div>
                );
              })}
            </div>
          )}

          {crisisHere.length > 0 && (
            <div className="mt-6"><CrisisPanel compact /></div>
          )}
          {crisisHere.length === 0 && urgentHere.length > 0 && (
            <div className="mt-6">
              <EmergencyNote>
                If you have chest pain, trouble breathing, or stroke symptoms right now, call <strong style={{ color: C.ink }}>{EMERGENCY_NUMBER}</strong>. These answers mean a clinician must speak with you before any prescription.
              </EmergencyNote>
            </div>
          )}
          {disqualifiersHere.length > 0 && crisisHere.length === 0 && urgentHere.length === 0 && (
            <div className="mt-6">
              <EmergencyNote>
                Because of this answer we can't prescribe through an online-only visit. Finish the remaining questions so a clinician has the full picture, then request a call.
              </EmergencyNote>
            </div>
          )}

          <div className="flex items-center justify-between mt-12">
            <button type="button" onClick={handleBack} className="focus-ring inline-flex items-center gap-2 px-4 py-2 rounded-full transition-opacity hover:opacity-60" style={{ color: C.inkSoft, fontSize: 14 }}>
              <ArrowLeft size={16} strokeWidth={1.75} />Back
            </button>
            <Btn onClick={handleAdvance} disabled={!canAdvance} size="lg" icon={ArrowRight}>{isLast ? "See my options" : "Continue"}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────
// Disqualified intake → request a clinician call. Captures contact details and
// records the request (device + chart when signed in) before confirming.
// ─────────────────────────────────────────────────────────────────────────────
const CONSULT_TIMES = ["Any time", "Morning (8am–12pm CT)", "Afternoon (12pm–5pm CT)", "Evening (5pm–8pm CT)"];

const ConsultRequest = ({ conditionId, answers, disqualified, safety, go, user }) => {
  const condition = conditions[conditionId];
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [bestTime, setBestTime] = useState(CONSULT_TIMES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const crisis = !!safety?.crisis;
  const urgent = !!safety?.urgent;
  const canSubmit = name.trim().length > 1 && isValidEmail(email) && isValidPhone(phone) && !submitting;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      const contact = { name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), bestTime };
      const outcome = await submitConsultRequest({ conditionId, answers: answers || {}, disqualifier: disqualified, crisis, contact });
      clearIntakeProgress(conditionId);
      go("consult-requested", { condition: conditionId, contact, crisis, storedWhere: outcome.storedWhere });
    } catch {
      setError("We couldn't save your request. Please try again, or email support@sprymd.ai.");
      setSubmitting(false);
    }
  };

  const field = (label, id, input) => (
    <div>
      <label htmlFor={id} className="mono" style={{ fontSize: 11, letterSpacing: "0.1em", color: C.muted, textTransform: "uppercase", display: "block", marginBottom: 8, fontWeight: 500 }}>{label}</label>
      {input}
    </div>
  );

  return (
    <div className="anim-fadeIn min-h-screen px-6 md:px-12 py-12" style={{ background: C.bg }}>
      <div className="max-w-2xl mx-auto pt-6 md:pt-12">
        <Logo onClick={() => go("landing")} />
        {crisis && <div className="mt-8"><CrisisPanel /></div>}
        {!crisis && urgent && (
          <div className="mt-8">
            <EmergencyNote>
              If you have chest pain, trouble breathing, or stroke symptoms right now, call <strong style={{ color: C.ink }}>{EMERGENCY_NUMBER}</strong> or go to the nearest emergency department.
            </EmergencyNote>
          </div>
        )}
        <div className="mt-8 p-6 md:p-10 rounded-3xl" style={{ background: C.paper, border: `1px solid ${C.line}` }}>
          <div className="inline-flex items-center justify-center mb-6 rounded-full p-3" style={{ background: "hsl(38, 92%, 95%)" }}>
            <AlertCircle size={28} strokeWidth={1.5} color={C.warn} />
          </div>
          <span className="mono" style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", color: condition.accent, textTransform: "uppercase", fontWeight: 500 }}>{condition.name}</span>
          <h2 className="display" style={{ fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 400, color: C.ink, marginTop: 10, marginBottom: 16 }}>We need to talk first.</h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: C.inkSoft, marginBottom: 16 }}>
            Because you answered <strong style={{ color: C.ink }}>{disqualified}</strong>, this treatment can't be prescribed through an online-only visit. A SpryMD clinician needs to talk with you directly before any decision is made.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: C.inkSoft, marginBottom: 28 }}>
            Leave your details and a clinician will call you. There is no charge for this call and nothing is prescribed or shipped until a clinician decides treatment is safe and appropriate.
          </p>

          <form onSubmit={submit} className="space-y-5" data-testid="consult-request-form">
            {field("Full name", "consult-name", <input id="consult-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Your name" className="focus-ring w-full p-4" style={inputStyle} disabled={submitting} />)}
            {field("Email", "consult-email", <input id="consult-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" className="focus-ring w-full p-4" style={inputStyle} disabled={submitting} />)}
            {field("Mobile phone", "consult-phone", <input id="consult-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" placeholder="(615) 555-0100" className="focus-ring w-full p-4" style={inputStyle} disabled={submitting} />)}
            {field("Best time to call", "consult-time", (
              <select id="consult-time" value={bestTime} onChange={(e) => setBestTime(e.target.value)} className="focus-ring w-full p-4" style={{ ...inputStyle, appearance: "auto" }} disabled={submitting}>
                {CONSULT_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            ))}
            {phone && !isValidPhone(phone) && <p role="alert" style={{ fontSize: 13, color: C.destructive }}>Enter a 10-digit US mobile number.</p>}
            {error && <p role="alert" style={{ fontSize: 13, color: C.destructive }}>{error}</p>}
            <div className="flex gap-3 flex-wrap pt-2">
              <Btn type="submit" disabled={!canSubmit} size="lg">{submitting ? <span className="anim-pulse">Saving…</span> : "Request a clinician call"}</Btn>
              <Btn onClick={() => go("landing")} size="lg" variant="ghost">Return home</Btn>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Consult requested — honest confirmation with the next step spelled out
// ─────────────────────────────────────────────────────────────────────────────
const ConsultRequested = ({ contact, crisis, storedWhere, go }) => (
  <div className="anim-fadeIn min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center" style={{ background: C.bg }}>
    <div className="anim-fadeUp max-w-xl w-full">
      {crisis && <div className="mb-8 text-left"><CrisisPanel /></div>}
      <div className="inline-flex items-center justify-center mb-8 rounded-full" style={{ background: C.primary, width: 72, height: 72 }}>
        <Check size={32} color={C.paper} strokeWidth={2} />
      </div>
      <span className="mono" style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", color: C.muted, textTransform: "uppercase" }}>Call requested</span>
      <h1 className="display" style={{ fontSize: "clamp(36px, 6vw, 56px)", lineHeight: 1.05, fontWeight: 400, color: C.ink, marginTop: 16, marginBottom: 20 }}>
        We'll call <Mark>{contact?.phone || "you"}</Mark>.
      </h1>
      <p style={{ fontSize: 16, color: C.inkSoft, lineHeight: 1.55, marginBottom: 12 }}>
        A SpryMD clinician will call within one business day{contact?.bestTime && contact.bestTime !== CONSULT_TIMES[0] ? `, ${contact.bestTime.charAt(0).toLowerCase()}${contact.bestTime.slice(1)}` : ""}. We'll also email {contact?.email || "you"} to confirm.
      </p>
      <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.55, marginBottom: 32 }}>
        {storedWhere === "chart"
          ? "Your answers are on your SpryMD chart for the clinician to review before the call."
          : "Your answers are saved to your SpryMD account on this device. Sign in with the same email to see them in your dashboard."}{" "}
        If you don't hear from us, email <strong style={{ color: C.ink }}>support@sprymd.ai</strong>. If anything feels urgent, call {EMERGENCY_NUMBER}.
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Btn onClick={() => go("landing")} size="lg">Back to home</Btn>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Plan view — the options a clinician may consider, then hand off to Stripe
// ─────────────────────────────────────────────────────────────────────────────
const Plan = ({ conditionId, answers, disqualified, safety, go, onSelectPlan, user }) => {
  const condition = conditions[conditionId];
  const planGraphic = conditionGraphics[conditionId] || imgMarketplaceHero;

  if (disqualified) {
    return <ConsultRequest conditionId={conditionId} answers={answers} disqualified={disqualified} safety={safety} go={go} user={user} />;
  }

  const recommended = recommendTreatment(conditionId, answers || {});
  const alternatives = condition.treatments.filter((t) => t.id !== recommended.id);

  return (
    <div className="anim-fadeIn min-h-screen" style={{ background: C.bg }}>
      <DeliveryBar />
      <div className="px-6 md:px-12 py-5 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.lineSoft}` }}>
        <Logo onClick={() => go("landing")} /><Tag>Options ready</Tag>
      </div>

      <div className="px-6 md:px-12 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <div className="anim-fadeUp mb-12">
            <span className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: condition.accent, textTransform: "uppercase", fontWeight: 500 }}>Your options</span>
            <h1 className="display" style={{ fontSize: "clamp(38px, 6vw, 72px)", lineHeight: 1, fontWeight: 400, color: C.ink, marginTop: 16 }}>
              Your <Mark>{condition.planLabel || condition.name.toLowerCase()}</Mark><br />care options.
            </h1>
            <p style={{ fontSize: 16, color: C.inkSoft, marginTop: 16, maxWidth: 600, lineHeight: 1.5 }}>
              Based on your answers, these are the treatments a clinician may consider for you. A licensed Tennessee doctor reviews your intake before anything is prescribed — a prescription is never guaranteed.
            </p>
          </div>
          <div className="anim-fadeUp rounded-3xl overflow-hidden mb-8 relative" style={{ border: `1px solid ${C.line}` }}>
            <img src={planGraphic} alt={`${condition.name} treatment`} className="w-full h-44 md:h-56 object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(9,14,11,0.72) 0%, rgba(9,14,11,0.2) 100%)" }} />
            <div className="absolute left-6 right-6 bottom-6">
              <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", color: "rgba(255,255,255,0.78)", textTransform: "uppercase" }}>Care pathway</span>
              <p style={{ color: "#fff", fontSize: 20, marginTop: 8, lineHeight: 1.2 }}>{condition.name} options matched to your intake.</p>
            </div>
          </div>

          <div className="anim-fadeUp grid md:grid-cols-12 gap-6 p-6 md:p-10 rounded-3xl mb-8" style={{ background: C.primary, color: C.paper, animationDelay: "0.1s" }}>
            <div className="md:col-span-7">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag color="rgba(255,255,255,0.1)" fg={C.paper}>Suggested starting point</Tag>
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
                  <p style={{ fontSize: 12, opacity: 0.6, marginTop: 12 }}>Billed monthly only after a clinician approves. Cancel anytime.</p>
                </div>
                <Btn onClick={() => onSelectPlan(recommended)} size="lg" variant="accent" icon={ArrowRight} className="w-full mt-6">Continue to checkout</Btn>
                <p style={{ fontSize: 12, opacity: 0.75, marginTop: 12, lineHeight: 1.45, textAlign: "center" }}>Next: pay the visit fee securely with Stripe. Medication is billed only if a clinician approves it.</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <Lock size={12} color={C.accentSoft} />
                  <span className="mono" style={{ fontSize: 10, opacity: 0.7, letterSpacing: "0.1em" }}>SECURE · STRIPE CHECKOUT</span>
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
            {[{ i: ShieldCheck, t: "Clinician-reviewed", d: "Every prescription is signed by a Tennessee-licensed provider after reviewing your intake." },
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
            <img src={brandPlates.shop.src} alt="" className="w-full h-[180px] md:h-[260px] object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(9,14,11,0.88) 0%, rgba(9,14,11,0.45) 60%, rgba(9,14,11,0.2) 100%)" }} />
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
          <span className="absolute top-3 right-3 mono" style={{ fontSize: 10, letterSpacing: "0.08em", background: "rgba(9,14,11,0.65)", color: C.ink, border: `1px solid ${C.line}`, padding: "5px 9px", borderRadius: 999 }}>
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
// Payment is never collected in-app. The plan screen hands off to the
// Stripe-backed /checkout route (see src/pages/CashPayCheckout.tsx).
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// App root
// ─────────────────────────────────────────────────────────────────────────────
// The intake and plan screens get a real URL (/?view=intake&condition=ed) so a
// refresh resumes the saved answers and the browser Back button walks
// plan → intake → landing instead of leaving the site.
const funnelUrl = (view, condition) => `/?${new URLSearchParams({ view, condition }).toString()}`;

const PERSIST_TIMEOUT_MS = 2500;
const withTimeout = (promise, ms = PERSIST_TIMEOUT_MS) =>
  Promise.race([promise, new Promise((resolve) => window.setTimeout(() => resolve(null), ms))]);

/** Rebuild the plan-screen params from the saved intake, or null if incomplete. */
const planParamsFromProgress = (condition) => {
  const saved = loadIntakeProgress(condition);
  const steps = buildIntakeSteps(condition);
  if (!saved || !steps.length || !steps.every((s) => canAdvanceStep(s, saved.answers))) return null;
  const disqualifier = findDisqualifier(steps, saved.answers);
  return {
    condition,
    answers: saved.answers,
    disqualified: disqualifier?.option ?? null,
    safety: safetyFlags(steps, saved.answers),
  };
};

/** Funnel view named in the URL (/?view=intake|plan&condition=…), or null. */
const readFunnelFromUrl = () => {
  if (typeof window === "undefined") return null;
  const qs = new URLSearchParams(window.location.search);
  const requested = qs.get("view");
  const condition = qs.get("condition");
  if ((requested !== "intake" && requested !== "plan") || !isKnownCondition(condition)) return null;
  const treatmentId = qs.get("treatmentId") || null;
  if (requested === "plan") {
    const planParams = planParamsFromProgress(condition);
    if (planParams) return { view: "plan", condition, treatmentId, params: planParams };
  }
  return { view: "intake", condition, treatmentId, params: { condition, treatmentId } };
};

export default function App() {
  const navigate = useNavigate();
  // Start on the funnel step named in the URL so a refresh doesn't flash the landing page.
  const [initialFunnel] = useState(readFunnelFromUrl);
  const [view, setView] = useState(initialFunnel?.view ?? "landing");
  const [params, setParams] = useState(initialFunnel?.params ?? {});
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

  const showFunnelView = (target, condition, extra = {}) => {
    if (target === "plan") {
      const planParams = planParamsFromProgress(condition);
      if (planParams) {
        setParams(planParams);
        setView("plan");
        return "plan";
      }
    }
    setParams({ condition, treatmentId: extra.treatmentId || null });
    setView("intake");
    return "intake";
  };

  // Deep-links: /?auth=1&returnTo=…, /?view=marketplace&filter=Devices,
  // /?view=start (care options), /?view=intake|plan&condition=<id> (also /quiz).
  useEffect(() => {
    if (!authReady) return;
    const qs = new URLSearchParams(window.location.search);
    if (qs.get("auth") === "1") {
      const returnTo = qs.get("returnTo") || "dashboard";
      // Absolute paths (/ops, /dashboard/…) stay intact for router navigate after sign-in.
      const target =
        returnTo.startsWith("/")
          ? returnTo
          : returnTo === "account"
            ? "dashboard"
            : returnTo;
      setParams({ returnTo: target });
      setView("signin");
      window.history.replaceState({}, "", "/");
      return;
    }
    const deepView = qs.get("view");
    if (deepView === "marketplace") {
      if (FEATURES.enableShop) {
        setParams({ filter: qs.get("filter") || "All" });
        setView("marketplace");
      } else {
        setView("landing");
      }
      window.history.replaceState({}, "", "/");
      return;
    }
    if (deepView === "start") {
      window.history.replaceState({}, "", "/");
      go("landing-conditions");
      return;
    }
    if (initialFunnel) {
      // View/params were already initialised from the URL; just seed the history
      // entry so Back/Forward can restore it.
      const { view: shown, condition, treatmentId } = initialFunnel;
      window.history.replaceState({ spryView: shown, condition, treatmentId }, "", funnelUrl(shown, condition));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady]);

  // Browser Back / Forward between landing ⇄ intake ⇄ plan.
  useEffect(() => {
    const onPopState = (event) => {
      const state = event.state || {};
      if ((state.spryView === "intake" || state.spryView === "plan") && isKnownCondition(state.condition)) {
        showFunnelView(state.spryView, state.condition, { treatmentId: state.treatmentId || null });
      } else {
        setParams({});
        setView("landing");
      }
      window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const pushFunnelUrl = (target, condition, extra = {}) => {
    const url = funnelUrl(target, condition);
    const state = { spryView: target, condition, ...extra };
    const current = `${window.location.pathname}${window.location.search}`;
    if (current === url) window.history.replaceState(state, "", url);
    else window.history.pushState(state, "", url);
  };

  const clearFunnelUrl = () => {
    if (window.location.search) window.history.replaceState({}, "", "/");
  };

  const requireAuth = (target, extra = {}) => {
    setParams({ returnTo: target, ...extra });
    setView("signin");
    clearFunnelUrl();
    window.scrollTo(0, 0);
  };

  const openPatientDashboard = () => {
    navigate("/dashboard");
    window.scrollTo(0, 0);
  };

  const go = (target, p = {}) => {
    if (target === "landing-conditions") {
      setView("landing");
      clearFunnelUrl();
      setTimeout(() => {
        const el = document.getElementById("landing-conditions");
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth" });
        // Visible handoff: ping the grid and move focus to the first care option
        const grid = el.querySelector("[data-conditions-grid]");
        if (grid) {
          window.setTimeout(() => {
            grid.classList.remove("spry-attn");
            void grid.offsetWidth; // restart the animation if re-triggered
            grid.classList.add("spry-attn");
          }, 350);
        }
        const firstCard = el.querySelector("button");
        if (firstCard) window.setTimeout(() => firstCard.focus({ preventScroll: true }), 650);
      }, 50);
      return;
    }
    if (target === "how") {
      setView("landing");
      clearFunnelUrl();
      setTimeout(() => { const el = document.getElementById("how"); if (el) el.scrollIntoView({ behavior: "smooth" }); }, 50);
      return;
    }
    // Router paths from auth returnTo (e.g. /ops, /dashboard/profile)
    if (typeof target === "string" && target.startsWith("/")) {
      navigate(target);
      clearFunnelUrl();
      window.scrollTo(0, 0);
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
    if (target === "intake") {
      if (!isKnownCondition(p.condition)) { go("landing-conditions"); return; }
      setParams({ condition: p.condition, treatmentId: p.treatmentId || null });
      setView("intake");
      pushFunnelUrl("intake", p.condition, { treatmentId: p.treatmentId || null });
      window.scrollTo(0, 0);
      return;
    }
    if (target === "plan") {
      const condition = p.condition || params.condition;
      setParams({ ...params, ...p });
      setView("plan");
      pushFunnelUrl("plan", condition);
      window.scrollTo(0, 0);
      return;
    }
    if (target === "consult-requested") {
      setParams({ ...params, ...p });
      setView("consult-requested");
      clearFunnelUrl();
      window.scrollTo(0, 0);
      return;
    }
    if (target === "page") {
      const shopStackSlugs = new Set(["supplements", "devices", "sleep"]);
      if (!FEATURES.enableShop && shopStackSlugs.has(p.slug)) {
        setView("landing");
        clearFunnelUrl();
        window.scrollTo(0, 0);
        return;
      }
      setParams({ slug: p.slug });
      setView("page");
      clearFunnelUrl();
      window.scrollTo(0, 0);
      return;
    }
    if (target === "marketplace") {
      if (!FEATURES.enableShop) {
        setView("landing");
        clearFunnelUrl();
        window.scrollTo(0, 0);
        return;
      }
      setParams({ filter: p.filter || "All" });
      setView("marketplace");
      window.scrollTo(0, 0);
      return;
    }
    // Card details are never collected in-app. Plan checkout hands off to the
    // Stripe-backed /checkout route; the dormant marketplace cart has no
    // payment path yet, so it returns to the landing page.
    if (target === "checkout") {
      startCheckout(p.plan || params.plan);
      return;
    }
    if (target === "checkout-cart") {
      setView("landing");
      clearFunnelUrl();
      window.scrollTo(0, 0);
      return;
    }
    if (target === "refill-checkout") { setView("refill-checkout"); window.scrollTo(0, 0); return; }
    if (target === "refill-success") { setView("refill-success"); window.scrollTo(0, 0); return; }
    if (target === "signin") {
      setParams({ returnTo: p.returnTo || params.returnTo || "dashboard", ...p });
      setView("signin");
      clearFunnelUrl();
      window.scrollTo(0, 0);
      return;
    }
    setParams({ ...params, ...p });
    setView(target);
    clearFunnelUrl();
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

  /**
   * Plan chosen → record the intake (device + chart when signed in) and hand
   * off to the Stripe-backed /checkout route. No account is required first;
   * Stripe collects the payment details.
   */
  const startCheckout = async (plan) => {
    const conditionId = params.condition;
    if (!plan || !isKnownCondition(conditionId)) {
      go("landing-conditions");
      return;
    }
    const answers = params.answers || {};
    saveCheckoutSelection({ conditionId, treatmentId: plan.id, answers, email: user?.email });
    await withTimeout(
      persistFunnelCase({ kind: "plan_selected", conditionId, answers, treatmentId: plan.id, crisis: !!params.safety?.crisis }).catch(() => null),
    );
    navigate(checkoutPath(conditionId, plan.id, user?.email));
    window.scrollTo(0, 0);
  };

  const onSelectPlan = (plan) => { void startCheckout(plan); };

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
    clearFunnelUrl();
    window.scrollTo(0, 0);
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
    <div className="relative" style={{ background: C.bg, minHeight: "100vh", color: C.ink }}>
      <FontInjector />
      {view === "landing" ? <BrandAtmosphere plate="tn" variant="site" locked objectPosition="center 40%" /> : null}

      {view === "landing" && (
        <div className="relative z-10">
          <DeliveryBar onClick={() => go("how")} glass />
          <Header go={go} cartCount={cartCount} user={user} glass />
          <Landing go={go} />
        </div>
      )}
      {view === "page" && <FooterPage slug={params.slug} go={go} cartCount={cartCount} user={user} />}
      {view === "intake" && isKnownCondition(params.condition) && (
        <Intake key={params.condition} conditionId={params.condition} treatmentId={params.treatmentId} go={go} />
      )}
      {view === "plan" && isKnownCondition(params.condition) && (
        <Plan conditionId={params.condition} answers={params.answers} disqualified={params.disqualified} safety={params.safety} go={go} onSelectPlan={onSelectPlan} user={user} />
      )}
      {view === "consult-requested" && <ConsultRequested contact={params.contact} crisis={params.crisis} storedWhere={params.storedWhere} go={go} />}
      {FEATURES.enableShop && view === "marketplace" && <Marketplace go={go} cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} cartCount={cartCount} user={user} initialFilter={params.filter || "All"} />}
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
