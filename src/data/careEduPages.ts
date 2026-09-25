/**
 * Educational product pages for homepage care options.
 * Linked from Care options / Start your visit tiles — intake starts from the CTA.
 */

import type { ConditionId } from "./careCatalog";

export type EduBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "faq"; items: { q: string; a: string }[] };

export type CareEduPage = {
  slug: string;
  title: string;
  navLabel: string;
  eyebrow: string;
  tagline: string;
  fromPrice: string;
  ctaLabel: string;
  ctaTarget: "intake";
  conditionId: ConditionId;
  highlights?: string[];
  sections: { title: string; blocks: EduBlock[] }[];
  group: "protocols";
};

/** Maps care-catalog condition ids → educational page slugs. */
export const conditionToEduSlug: Partial<Record<ConditionId, string>> = {
  weightloss: "weight-loss",
  ed: "ed",
  hairloss: "hair-loss",
  skincare: "skin",
  sermorelin: "sermorelin",
  nad: "nad-therapy",
};

export const careEduPages: Record<string, CareEduPage> = {
  ed: {
    slug: "ed",
    title: "Your Ultimate On-Demand ED Solution",
    navLabel: "ED",
    eyebrow: "Wingman by spryMD.ai",
    tagline:
      "The definitive 2-in-1 treatment for uncompromising performance, flexibility, and spontaneity.",
    fromPrice: "65",
    ctaLabel: "Start Your SpryMD Consultation",
    ctaTarget: "intake",
    conditionId: "ed",
    highlights: [
      "**Maximum Strength Formulation:** Combines 80 mg Sildenafil + 20 mg Tadalafil",
      "**Rapid Onset:** Fast-acting support so you are ready when the moment strikes",
      "**Extended Window:** Up to 36 hours of sustained erectile confidence",
      "**Discreet & Direct:** 100% online consultation with secure, private shipping",
    ],
    sections: [
      {
        title: "The Power of the 2-in-1 Advantage",
        blocks: [
          {
            type: "p",
            text: "Wingman is a precision-engineered formulation designed for modern men who demand both immediate results and lasting confidence. By merging the two most trusted, clinically proven active ingredients in erectile dysfunction treatment, Wingman eliminates the need to choose between fast action and longevity.",
          },
          {
            type: "table",
            headers: ["Performance Metric", "Wingman", "Traditional Single-Ingredient Meds"],
            rows: [
              ["Active Ingredients", "Sildenafil (80 mg) + Tadalafil (20 mg)", "Single ingredient only"],
              ["Response Time", "Fast-acting for on-demand use", "Often requires rigid timing or daily dosing"],
              ["Effective Duration", "Up to 36 hours of flexibility", "Typically limited to 4–6 hours"],
              ["Care Delivery", "Seamless SpryMD digital clinic", "Traditional in-person waiting rooms"],
            ],
          },
        ],
      },
      {
        title: "Get Started in 3 Simple Steps",
        blocks: [
          {
            type: "ol",
            items: [
              "**Quick Clinical Intake** — Complete a brief, secure medical questionnaire directly on the spryMD.ai platform. Skip the waiting room and provide your health history on your own schedule.",
              "**Licensed Provider Review** — A U.S.-licensed medical provider will evaluate your profile to ensure the Wingman 80/20 formulation is the safest and most effective treatment for you. You pay nothing unless approved.",
              "**Fast, Discreet Delivery** — Once prescribed, your medication is processed by a trusted pharmacy and shipped directly to your doorstep in unmarked packaging to protect your privacy.",
            ],
          },
        ],
      },
      {
        title: "Frequently Asked Questions",
        blocks: [
          {
            type: "faq",
            items: [
              {
                q: "What makes the 80 mg Sildenafil / 20 mg Tadalafil combination so effective?",
                a: "Sildenafil provides a robust, immediate increase in blood flow for harder, fuller erections right when you need them. Tadalafil stays in your system longer, providing a reliable foundation of erectile support that can last for up to 36 hours. Wingman combines these properties for the ultimate on-demand solution.",
              },
              {
                q: "Is it safe to take both medications together?",
                a: "Wingman is formulated to maximize the benefits of both PDE5 inhibitors. During your initial intake, a spryMD.ai medical provider will carefully review your specific health history to ensure this precise dosage combination is safe and appropriate for your body.",
              },
              {
                q: "Do I need an existing prescription?",
                a: "No. The spryMD.ai platform facilitates the entire process. Our integrated telehealth infrastructure connects you with a medical professional who can write your prescription entirely online if you are a suitable candidate.",
              },
              {
                q: "How quickly will I receive my medication?",
                a: "Our streamlined digital platform ensures your intake is reviewed promptly. Most approved prescriptions are processed and shipped safely and discreetly within 24 to 48 hours.",
              },
            ],
          },
        ],
      },
    ],
    group: "protocols",
  },

  "weight-loss": {
    slug: "weight-loss",
    title: "Doctor-Guided Weight Loss That Actually Sticks",
    navLabel: "Weight Loss",
    eyebrow: "Metabolic Care by spryMD.ai",
    tagline:
      "Clinician-titrated GLP-1 and dual-agonist therapy — compounded, cold-shipped, and adjusted to your response.",
    fromPrice: "200",
    ctaLabel: "Start Your SpryMD Consultation",
    ctaTarget: "intake",
    conditionId: "weightloss",
    highlights: [
      "**Clinician Titration:** Dose matched to your response — not a one-size chart",
      "**Proven Actives:** Tirzepatide and semaglutide, injectable or needle-free ODT",
      "**Cold-Chain Shipping:** Refrigerated injectables overnight when required",
      "**Discreet & Direct:** 100% online consultation with private delivery",
    ],
    sections: [
      {
        title: "Why SpryMD Metabolic Care",
        blocks: [
          {
            type: "p",
            text: "Metabolic weight loss is a signaling problem, not a willpower problem. SpryMD protocols use tirzepatide and semaglutide — dual GIP/GLP-1 and GLP-1 agents — reviewed by a licensed clinician and compounded by a trusted pharmacy. You get structured titration, secure follow-up, and a clear path whether you prefer injections or oral dissolve tablets.",
          },
          {
            type: "table",
            headers: ["What matters", "SpryMD metabolic care", "Typical DIY / OTC path"],
            rows: [
              ["Oversight", "Licensed doctor reviews every case", "No clinician gate"],
              ["Formulation", "Injectable + ODT + oral stack options", "Limited retail options"],
              ["Titration", "Adjusted to your tolerance and results", "Fixed or self-dosed"],
              ["Delivery", "Discreet shipping, cold-chain when needed", "Pharmacy pickup / mail lottery"],
            ],
          },
        ],
      },
      {
        title: "Get Started in 3 Simple Steps",
        blocks: [
          {
            type: "ol",
            items: [
              "**Quick Clinical Intake** — Share your weight history, goals, and medical background on your schedule.",
              "**Licensed Provider Review** — A U.S.-licensed clinician confirms eligibility and selects your starting protocol. You pay nothing unless approved.",
              "**Fast, Discreet Delivery** — Approved medication ships to your door in unmarked packaging — refrigerated overnight when required.",
            ],
          },
        ],
      },
      {
        title: "Frequently Asked Questions",
        blocks: [
          {
            type: "faq",
            items: [
              {
                q: "What medications do you offer for weight loss?",
                a: "SpryMD offers tirzepatide and semaglutide as weekly injections or daily oral dissolve tablets, plus an oral multi-agent metabolic stack for patients who cannot use GLP-1 injectables. Your clinician matches the option to your history and preferences.",
              },
              {
                q: "Who is a candidate?",
                a: "Most protocols are for adults with BMI ≥30, or BMI ≥27 with a weight-related condition. Your intake screens for contraindications; we decline when clinical risk outweighs benefit.",
              },
              {
                q: "Do I need an existing prescription?",
                a: "No. Complete the online intake and a licensed provider can prescribe entirely through spryMD.ai if you are a suitable candidate.",
              },
              {
                q: "How quickly will I receive my medication?",
                a: "Most approved prescriptions are processed and shipped within 24 to 48 hours. Refrigerated injectables use overnight cold-chain shipping.",
              },
            ],
          },
        ],
      },
    ],
    group: "protocols",
  },

  "hair-loss": {
    slug: "hair-loss",
    title: "Slow the Shed. Rebuild the Line.",
    navLabel: "Hair Loss",
    eyebrow: "Hair Restore by spryMD.ai",
    tagline:
      "Clinician-guided oral and topical protocols that combine DHT blockade, vasodilation, and compounded multi-agent formulas.",
    fromPrice: "40",
    ctaLabel: "Start Your SpryMD Consultation",
    ctaTarget: "intake",
    conditionId: "hairloss",
    highlights: [
      "**Proven Foundation:** Finasteride and minoxidil — oral, topical, or stacked",
      "**Compounded Strength:** Multi-agent topicals when single agents plateau",
      "**Clinician Matched:** Protocol chosen for your pattern, tolerance, and history",
      "**Discreet & Direct:** 100% online consultation with private shipping",
    ],
    sections: [
      {
        title: "A Protocol Built for Consistency",
        blocks: [
          {
            type: "p",
            text: "Androgenetic hair loss is progressive — and most treatable when you intervene early with the right agents. SpryMD hair protocols range from simple daily finasteride to five-agent topical compounds. Every regimen is clinician-reviewed so you get a plan you can actually maintain.",
          },
          {
            type: "table",
            headers: ["Approach", "SpryMD hair care", "Typical retail path"],
            rows: [
              ["Actives", "Finasteride, minoxidil, dutasteride, tretinoin stacks", "OTC minoxidil only"],
              ["Form", "Oral, topical, or combined capsule", "Separate products to juggle"],
              ["Oversight", "Licensed clinician reviews contraindications", "Self-directed"],
              ["Delivery", "Discreet doorstep shipping", "Drugstore aisle"],
            ],
          },
        ],
      },
      {
        title: "Get Started in 3 Simple Steps",
        blocks: [
          {
            type: "ol",
            items: [
              "**Quick Clinical Intake** — Describe your pattern of loss, prior treatments, and preferences.",
              "**Licensed Provider Review** — A U.S.-licensed clinician confirms safety and selects oral, topical, or stacked therapy. You pay nothing unless approved.",
              "**Fast, Discreet Delivery** — Your prescription ships unmarked to your door.",
            ],
          },
        ],
      },
      {
        title: "Frequently Asked Questions",
        blocks: [
          {
            type: "faq",
            items: [
              {
                q: "What treatments do you offer?",
                a: "Options include oral finasteride, finasteride plus oral minoxidil, multi-agent topical restores (including stronger five-in-one compounds), and a daily biotin/finasteride/minoxidil capsule. Your clinician matches strength and form to your goals.",
              },
              {
                q: "How long until I see results?",
                a: "Hair protocols are a long game. Most patients assess progress at 3–6 months of consistent use. Your care team can adjust if response plateaus.",
              },
              {
                q: "Do I need an existing prescription?",
                a: "No. The spryMD.ai intake connects you with a licensed provider who can prescribe online when appropriate.",
              },
              {
                q: "How quickly will I receive my medication?",
                a: "Most approved prescriptions ship within 24 to 48 hours in discreet packaging.",
              },
            ],
          },
        ],
      },
    ],
    group: "protocols",
  },

  skin: {
    slug: "skin",
    title: "Prescription Skin Care, Compounded for Results",
    navLabel: "Skin",
    eyebrow: "Skin Protocols by spryMD.ai",
    tagline:
      "Therapeutic-strength tretinoin complexes, acne gels, and anti-aging formulas — clinician-guided and compounded for tolerability.",
    fromPrice: "100",
    ctaLabel: "Start Your SpryMD Consultation",
    ctaTarget: "intake",
    conditionId: "skincare",
    highlights: [
      "**Therapeutic Strength:** Actives at concentrations that matter — not diluted OTC blends",
      "**Compounded Balance:** Tretinoin with adjuvants that reduce irritation without diluting efficacy",
      "**Goal Matched:** Texture, tone, acne, or anti-aging — selected for your skin",
      "**Discreet & Direct:** 100% online consultation with private shipping",
    ],
    sections: [
      {
        title: "Why Compounded Skin Care",
        blocks: [
          {
            type: "p",
            text: "Prescription skincare works when actives are at therapeutic concentrations and formulated for real-world tolerance. SpryMD skin protocols use tretinoin-based complexes, acne gels, and anti-aging gels — reviewed by a licensed clinician before anything ships.",
          },
          {
            type: "table",
            headers: ["Factor", "SpryMD skin protocols", "Typical OTC path"],
            rows: [
              ["Strength", "Prescription-level retinoids & antimicrobials", "Lower OTC concentrations"],
              ["Formulation", "Multi-active stable compounds", "Separate products layered nightly"],
              ["Guidance", "Clinician selects for goals and tolerance", "Trial and error"],
              ["Delivery", "Discreet shipping to your door", "Counter display"],
            ],
          },
        ],
      },
      {
        title: "Get Started in 3 Simple Steps",
        blocks: [
          {
            type: "ol",
            items: [
              "**Quick Clinical Intake** — Share your skin goals, sensitivity history, and current routine.",
              "**Licensed Provider Review** — A U.S.-licensed clinician confirms suitability and picks your formula. You pay nothing unless approved.",
              "**Fast, Discreet Delivery** — Compounded treatment ships unmarked to your doorstep.",
            ],
          },
        ],
      },
      {
        title: "Frequently Asked Questions",
        blocks: [
          {
            type: "faq",
            items: [
              {
                q: "What skin concerns do you treat?",
                a: "Protocols cover texture and tone, mild-to-strong retinoid complexes, inflammatory acne gels, and anti-aging formulas that combine tretinoin with vitamin C and niacinamide in a stable compound.",
              },
              {
                q: "Will tretinoin irritate my skin?",
                a: "We start with tolerability-focused compounds and can step up strength when you are ready. Your intake and clinician review account for prior retinoid use and sensitivity.",
              },
              {
                q: "Do I need an existing prescription?",
                a: "No. Complete the online intake and a licensed provider can prescribe through spryMD.ai if appropriate.",
              },
              {
                q: "How quickly will I receive my medication?",
                a: "Most approved prescriptions are processed and shipped within 24 to 48 hours.",
              },
            ],
          },
        ],
      },
    ],
    group: "protocols",
  },

  sermorelin: {
    slug: "sermorelin",
    title: "Recover Faster. Sleep Deeper. Build Lean Muscle.",
    navLabel: "Sermorelin",
    eyebrow: "Sermorelin by spryMD.ai",
    tagline:
      "Peptide therapy that prompts your body’s own growth-hormone pulse — clinician-supervised, compounded, and shipped cold.",
    fromPrice: "199",
    ctaLabel: "Start Your SpryMD Consultation",
    ctaTarget: "intake",
    conditionId: "sermorelin",
    highlights: [
      "**Physiologic Approach:** GHRH analog that supports your own GH release — not gray-market HGH",
      "**Nightly Protocol:** Subcutaneous dosing timed for sleep and recovery",
      "**Clinician Guided:** Standard, sleep-focused, or high-dose titration",
      "**Discreet & Direct:** Online consultation with cold-chain private shipping",
    ],
    sections: [
      {
        title: "The Sermorelin Advantage",
        blocks: [
          {
            type: "p",
            text: "Sermorelin is a growth-hormone-releasing hormone (GHRH) analog. Instead of replacing growth hormone directly, it prompts your pituitary to produce more of its own — preserving natural pulse and feedback. Patients use it for deeper sleep, faster training recovery, lean mass support, and healthy aging under licensed clinician oversight.",
          },
          {
            type: "table",
            headers: ["Factor", "SpryMD sermorelin", "Unregulated peptide sources"],
            rows: [
              ["Oversight", "U.S.-licensed clinician review", "No medical gate"],
              ["Source", "Compounded pharmacy fulfillment", "Gray-market vials"],
              ["Dosing", "Standard, glycine blend, or high-dose titration", "Guesswork"],
              ["Shipping", "Cold-chain, discreet packaging", "Inconsistent"],
            ],
          },
        ],
      },
      {
        title: "Get Started in 3 Simple Steps",
        blocks: [
          {
            type: "ol",
            items: [
              "**Quick Clinical Intake** — Share goals, age, medical history, and safety screening answers.",
              "**Licensed Provider Review** — A U.S.-licensed clinician confirms peptide therapy is appropriate and selects your protocol. You pay nothing unless approved.",
              "**Fast, Discreet Delivery** — Compounded sermorelin ships cold and unmarked to your door.",
            ],
          },
        ],
      },
      {
        title: "Frequently Asked Questions",
        blocks: [
          {
            type: "faq",
            items: [
              {
                q: "How is sermorelin different from HGH?",
                a: "Sermorelin stimulates your pituitary to release growth hormone in a more physiologic pattern. Direct HGH replacement bypasses that feedback. Your clinician will explain which approach — if any — fits your history.",
              },
              {
                q: "When do I take it?",
                a: "Protocols are typically nightly subcutaneous injections before bed to align with natural GH pulses and sleep architecture.",
              },
              {
                q: "Do I need an existing prescription?",
                a: "No. The spryMD.ai platform connects you with a licensed provider who can prescribe online when you are a suitable candidate.",
              },
              {
                q: "How quickly will I receive my medication?",
                a: "Most approved prescriptions are processed and cold-shipped within 24 to 48 hours.",
              },
            ],
          },
        ],
      },
    ],
    group: "protocols",
  },

  "nad-therapy": {
    slug: "nad-therapy",
    title: "Recharge Your Cells. Fight Fatigue and Brain Fog.",
    navLabel: "NAD+ Therapy",
    eyebrow: "NAD+ Therapy by spryMD.ai",
    tagline:
      "Clinic-grade NAD+ restoration by injection or needle-free nasal spray — clinician-tailored and shipped discreetly.",
    fromPrice: "149",
    ctaLabel: "Start Your SpryMD Consultation",
    ctaTarget: "intake",
    conditionId: "nad",
    highlights: [
      "**Cellular Energy:** Direct NAD+ support for metabolism, focus, and recovery",
      "**Flexible Forms:** Subcutaneous injection or daily nasal spray",
      "**Clinician Tailored:** Dose and form matched to your goals and tolerance",
      "**Discreet & Direct:** Online consultation with private shipping (cold-chain for injectables)",
    ],
    sections: [
      {
        title: "Why NAD+ Through SpryMD",
        blocks: [
          {
            type: "p",
            text: "NAD+ (nicotinamide adenine dinucleotide) is central to cellular energy production and repair. Levels decline with age — and with them, energy, focus, and recovery. SpryMD offers direct NAD+ restoration far more bioavailable than typical oral supplements, reviewed by a licensed clinician before anything ships.",
          },
          {
            type: "table",
            headers: ["Factor", "SpryMD NAD+", "Typical oral NMN/NR"],
            rows: [
              ["Delivery", "Injection or nasal spray", "Oral capsules"],
              ["Bioavailability", "Direct NAD+ restoration", "Indirect precursor path"],
              ["Oversight", "Licensed clinician review", "Self-purchase"],
              ["Intensity", "Standard, high-dose, or needle-free daily", "Fixed retail dose"],
            ],
          },
        ],
      },
      {
        title: "Get Started in 3 Simple Steps",
        blocks: [
          {
            type: "ol",
            items: [
              "**Quick Clinical Intake** — Describe energy, focus, goals, and complete safety screening.",
              "**Licensed Provider Review** — A U.S.-licensed clinician confirms NAD+ therapy is appropriate and selects form and dose. You pay nothing unless approved.",
              "**Fast, Discreet Delivery** — Medication ships unmarked — injectables cold-chain overnight when required.",
            ],
          },
        ],
      },
      {
        title: "Frequently Asked Questions",
        blocks: [
          {
            type: "faq",
            items: [
              {
                q: "Injection or nasal spray — which is right for me?",
                a: "Injections deliver the most effective at-home restoration for deeper fatigue or optimization goals. Nasal spray is needle-free daily support that travels well. Your clinician helps choose based on intensity and preference.",
              },
              {
                q: "How soon might I notice a difference?",
                a: "Many patients report steadier energy and clearer focus within 2–4 weeks of consistent use. Response varies; your care team can adjust dose or form.",
              },
              {
                q: "Do I need an existing prescription?",
                a: "No. Complete the online intake and a licensed provider can prescribe through spryMD.ai if you are a suitable candidate.",
              },
              {
                q: "How quickly will I receive my medication?",
                a: "Most approved prescriptions are processed and shipped within 24 to 48 hours.",
              },
            ],
          },
        ],
      },
    ],
    group: "protocols",
  },
};
