import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, ArrowLeft, Check, ShoppingBag, Scale, Flame, Sparkles, Leaf,
  ShieldCheck, Truck, Stethoscope, Lock, X, Plus, Minus, AlertCircle,
  Heart, Pill, Wind, Activity, Moon, Zap, RefreshCw, User, Clock, FileText,
  Send, Snowflake, Droplets, Brain, UserCheck, Star, LogOut, Package, MapPin,
  Watch,
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
import imgEarthSpace from "./assets/earth-from-space.webp";
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
import { SignalField, OrbitRings, ScanFrame, TelemetryStrip, HexMesh, GridHorizon, ISpryChat } from "./components/graphics";

// ─────────────────────────────────────────────────────────────────────────────
// Brand tokens — elite performance health OS (Starlink precision × peak vitality)
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  bg: "#050505",
  bgAlt: "#0B0B0C",
  paper: "#121214",
  ink: "#FAFAFA",
  inkSoft: "#C8C8C8",
  muted: "#8A8A8E",
  primary: "#FAFAFA",
  primaryDark: "#D4D4D4",
  accent: "#1EC8A5",           // signal — instrumentation only
  accentSoft: "rgba(30, 200, 165, 0.72)",
  accentDeep: "#0E8F74",
  signalDim: "rgba(30, 200, 165, 0.14)",
  line: "#1F1F22",
  lineSoft: "#161618",
  ok: "#2FBF7A",
  warn: "#E6A23C",
  destructive: "#E25555",
};

const fonts = {
  display: "'Syne', 'Arial Narrow', sans-serif",
  body: "'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
};

const FontInjector = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&family=Syne:wght@400;500;600;700;800&display=swap');
    :root {
      --font-mono: ${fonts.mono};
      --spry-accent: ${C.accent};
      --spry-bg: ${C.bg};
      --spry-ink: ${C.ink};
    }
    * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    html, body { background: ${C.bg}; color: ${C.ink}; }
    body {
      font-family: ${fonts.body}; letter-spacing: -0.005em;
      background-image:
        radial-gradient(ellipse 80% 50% at 50% -20%, rgba(30,200,165,0.06), transparent 55%),
        radial-gradient(ellipse 60% 40% at 100% 0%, rgba(18,28,36,0.5), transparent 50%);
      background-attachment: fixed;
    }
    .display { font-family: ${fonts.display}; font-weight: 600; letter-spacing: -0.03em; }
    .mono { font-family: ${fonts.mono}; }
    