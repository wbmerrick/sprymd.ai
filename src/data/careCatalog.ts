import {
  Brain,
  Dna,
  Droplets,
  Flame,
  Leaf,
  Scale,
  Sparkles,
  UserCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Care catalog — the conditions SpryMD treats, their plan options, and the
 * per-condition intake questionnaires the funnel walks a visitor through.
 * Kept out of SpryApp.jsx so the intake logic can be unit tested and so the
 * cash-pay checkout page can show the plan a visitor picked.
 */

export type ConditionId =
  | "weightloss"
  | "ed"
  | "hairloss"
  | "skincare"
  | "sermorelin"
  | "nad"
  | "lowt"
  | "mentalhealth"
  | "pcp";

export type Treatment = {
  id: string;
  name: string;
  sub: string;
  price: number;
  chilled: boolean;
  note: string;
  compareAt?: number;
  comparePeer?: string;
  badge?: string;
  twoAdultPrice?: number;
};

export type Condition = {
  id: ConditionId;
  name: string;
  planLabel?: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  fromPrice: string;
  treatments: Treatment[];
};

export type CompoundField = {
  key: string;
  label: string;
  type: "number";
  placeholder: string;
  /** Inclusive numeric bounds for validation. */
  min: number;
  max: number;
  unit: string;
};

export type IntakeQuestion = {
  key: string;
  /** `eligibility` is the synthetic first step (state of presence + age gate). */
  type: "single" | "multi" | "compound" | "eligibility";
  title: string;
  sub?: string;
  options?: string[];
  fields?: CompoundField[];
  /** Answers that stop an asynchronous prescription and route to a clinician call. */
  disqualify?: string[];
  /**
   * Answers that indicate an immediate safety risk (self-harm). Selecting one
   * shows crisis resources (988 / 911) right at that step.
   */
  crisis?: string[];
  /** Answers that warrant an "if this is happening now, call 911" note. */
  urgent?: string[];
  /** Options that clear every other selection ("None of the above" style). */
  exclusive?: string[];
};

export const conditions: Record<ConditionId, Condition> = {
  weightloss: {
    id: "weightloss", name: "Weight loss",
    tagline: "Lose weight with a real doctor watching your plan.",
    description: "Safe weight-loss medicine chosen for you. A doctor checks your answers, then we ship care to your door.",
    icon: Scale, accent: "#C89E67", fromPrice: "200",
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
    icon: Flame, accent: "#C89E67", fromPrice: "65",
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
    icon: Sparkles, accent: "#C89E67", fromPrice: "40",
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
    icon: Leaf, accent: "#C89E67", fromPrice: "100",
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
  sermorelin: {
    id: "sermorelin", name: "Sermorelin",
    tagline: "Recover faster. Sleep deeper. Build lean muscle.",
    description: "Peptide therapy that helps your body make more of its own growth hormone. A doctor reviews your goals and history before anything ships.",
    icon: Dna, accent: "#C89E67", fromPrice: "199",
    treatments: [
      { id: "serm-std", name: "Sermorelin Injection", sub: "200–300 mcg / nightly · subQ", price: 199, chilled: true,
        note: "GHRH analog that prompts your pituitary's own growth-hormone pulse. Supports recovery, sleep quality, body composition, and energy.",
        compareAt: 249, comparePeer: "Hone", badge: "Most prescribed" },
      { id: "serm-gly", name: "Sermorelin + Glycine Injection", sub: "Enhanced nightly blend · subQ", price: 229, chilled: true,
        note: "Sermorelin paired with glycine to support deeper sleep architecture and a stronger nighttime GH release.", badge: "Best for sleep" },
      { id: "serm-hi", name: "Sermorelin High-Dose", sub: "500 mcg / nightly · titrated · subQ", price: 269, chilled: true,
        note: "For patients who have plateaued on standard dosing. Clinician-titrated with scheduled follow-up." },
    ],
  },
  nad: {
    id: "nad", name: "NAD+ therapy", planLabel: "NAD+ therapy",
    tagline: "Recharge your cells. Fight fatigue and brain fog.",
    description: "NAD+ supports cellular energy, focus, and healthy aging. A doctor tailors the dose and form to you before anything ships.",
    icon: Zap, accent: "#C89E67", fromPrice: "149",
    treatments: [
      { id: "nad-inj", name: "NAD+ Injection", sub: "100 mg / 2–3× weekly · subQ", price: 249, chilled: true,
        note: "Direct NAD+ restoration for energy metabolism, mental clarity, and cellular repair. The most effective at-home format.",
        compareAt: 299, comparePeer: "AgelessRx", badge: "Most prescribed" },
      { id: "nad-hi", name: "NAD+ High-Dose Injection", sub: "200 mg / 2–3× weekly · subQ", price: 349, chilled: true,
        note: "Accelerated protocol for deeper fatigue, heavy training loads, or longevity optimization.", badge: "Maximum strength" },
      { id: "nad-spray", name: "NAD+ Nasal Spray", sub: "300 mg/mL · daily", price: 149, chilled: false,
        note: "Needle-free daily NAD+ support. Gentler intensity than injections and easy to travel with.", badge: "No-needle" },
    ],
  },
  lowt: {
    id: "lowt", name: "Low energy & hormones",
    tagline: "Get your energy and drive back.",
    description: "Care for low testosterone and low energy. Labs when needed. A doctor guides every step.",
    icon: Droplets, accent: "#C89E67", fromPrice: "99",
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
    icon: Brain, accent: "#C89E67", fromPrice: "35",
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
    icon: UserCheck, accent: "#C89E67", fromPrice: "100",
    treatments: [
      { id: "pcp-acute", name: "Acute Insight", sub: "Meant for acute issues/complaints · 1 visit + anytime messaging for 1 month", price: 100, chilled: false,
        note: "One clinician visit plus a month of anytime messaging for acute issues and complaints. Two adults: $180.", badge: "Most popular", twoAdultPrice: 180 },
      { id: "pcp-yearly", name: "Yearly Checkup", sub: "1 visit + full blood work + anytime messaging", price: 250, chilled: false,
        note: "Annual visit with yearly labs and messaging. Two adults: $470.", badge: "Best value", twoAdultPrice: 470 },
      { id: "pcp-monthly", name: "Monthly Doctor-Initiated Visits", sub: "Your doctor calls you once a month", price: 500, chilled: false,
        note: "Spry Primary Care at its finest. Your doctor calls you once a month to check on you and your wellbeing." },
    ],
  },
};

export const NONE_OF_THE_ABOVE = "None of the above";

export const intakes: Record<ConditionId, IntakeQuestion[]> = {
  weightloss: [
    { key: "height_weight", type: "compound", title: "Tell us your height and weight.", sub: "We'll use this to calculate your BMI and dosing.",
      fields: [
        { key: "feet", label: "Feet", type: "number", placeholder: "5", min: 3, max: 8, unit: "ft" },
        { key: "inches", label: "Inches", type: "number", placeholder: "10", min: 0, max: 11, unit: "in" },
        { key: "weight", label: "Weight (lbs)", type: "number", placeholder: "210", min: 70, max: 800, unit: "lbs" },
      ] },
    { key: "goal", type: "single", title: "What's your goal?", options: ["Lose 10–25 lbs", "Lose 25–50 lbs", "Lose 50–100 lbs", "Lose 100+ lbs", "Maintain after weight loss"] },
    { key: "diabetes", type: "single", title: "Have you been diagnosed with type 2 diabetes?", options: ["Yes", "No", "Pre-diabetes / borderline A1C"] },
    { key: "thyroid_history", type: "multi", title: "Do any of these apply to you or close family?", sub: "Required safety screening for GLP-1 therapy.",
      options: ["Medullary thyroid carcinoma (MTC)", "Multiple endocrine neoplasia type 2 (MEN-2)", "History of pancreatitis", "Active gallbladder disease", NONE_OF_THE_ABOVE],
      disqualify: ["Medullary thyroid carcinoma (MTC)", "Multiple endocrine neoplasia type 2 (MEN-2)"] },
    { key: "previous", type: "single", title: "Have you tried weight loss medication before?", options: ["Never", "Yes — GLP-1 (semaglutide / tirzepatide)", "Yes — phentermine or other", "Yes — multiple"] },
    { key: "preference", type: "single", title: "Injection or oral?", options: ["Injection — strongest results", "Oral / dissolvable — no needles", "Open to either, recommend for me"] },
  ],
  ed: [
    { key: "age", type: "single", title: "What's your age range?", options: ["18–29", "30–39", "40–49", "50–59", "60–69", "70+"] },
    { key: "frequency", type: "single", title: "How often does ED occur?", options: ["Almost every time", "Most of the time", "Sometimes", "Rarely"] },
    { key: "onset", type: "single", title: "When did you first notice it?", options: ["Within the last 6 months", "6–24 months ago", "More than 2 years ago"] },
    { key: "cardiac", type: "multi", title: "Do any of these apply?", sub: "PDE5 inhibitors require cardiovascular screening.",
      options: ["Heart attack within the last 6 months", "Stroke within the last 6 months", "Currently taking nitrates (nitroglycerin, isosorbide)", "Currently taking riociguat", "Severe heart failure", NONE_OF_THE_ABOVE],
      disqualify: ["Currently taking nitrates (nitroglycerin, isosorbide)", "Currently taking riociguat", "Heart attack within the last 6 months", "Stroke within the last 6 months"],
      urgent: ["Heart attack within the last 6 months", "Stroke within the last 6 months", "Severe heart failure"] },
    { key: "bp", type: "single", title: "Is your blood pressure controlled?", options: ["Yes, normal or controlled on meds", "Borderline / unsure", "No, uncontrolled", "I don't know my BP"] },
    { key: "preference", type: "single", title: "How would you prefer to take it?", options: ["As needed, before activity", "Daily — I want to be ready anytime", "Fast-melt ODT — no swallowing", "Not sure — recommend for me"] },
  ],
  hairloss: [
    { key: "pattern", type: "single", title: "Where are you losing hair?", options: ["Receding hairline (temples)", "Thinning crown", "Both hairline and crown", "Diffuse thinning all over", "Just monitoring early signs"] },
    { key: "duration", type: "single", title: "How long has this been happening?", options: ["Less than 1 year", "1–3 years", "3–5 years", "More than 5 years"] },
    { key: "family", type: "single", title: "Family history of hair loss?", options: ["Yes — father's side", "Yes — mother's side", "Yes — both sides", "No"] },
    { key: "tried", type: "multi", title: "What have you tried?", options: ["Topical minoxidil (Rogaine)", "Oral finasteride", "Topical finasteride", "Hair vitamins / biotin", "Nothing yet"],
      exclusive: ["Nothing yet"] },
    { key: "concerns", type: "single", title: "Concerns about side effects?", options: ["No concerns", "Worried about sexual side effects", "Worried about systemic effects", "Tell me more"] },
  ],
  skincare: [
    { key: "concern", type: "single", title: "What's the primary concern?", options: ["Fine lines, texture, anti-aging", "Active acne or breakouts", "Dark spots / hyperpigmentation", "Dullness, uneven tone", "All of the above"] },
    { key: "skintype", type: "single", title: "Skin type?", options: ["Oily", "Dry", "Combination", "Sensitive", "Not sure"] },
    { key: "routine", type: "single", title: "How would you describe your current routine?", options: ["Just soap and water", "Cleanser + moisturizer", "Already use actives (retinol, AHAs)", "Inconsistent"] },
    { key: "sensitivity", type: "single", title: "Have you used tretinoin or retinol before?", options: ["Yes — tolerated well", "Yes — irritated my skin", "No, never", "Not sure"] },
    { key: "sun", type: "single", title: "Daily sunscreen use?", options: ["Every day", "Most days", "Sometimes", "Rarely"] },
  ],
  sermorelin: [
    { key: "goal", type: "multi", title: "What do you want sermorelin to help with?", sub: "Select all that apply.",
      options: ["Faster recovery from training", "Deeper sleep", "Lean muscle / body composition", "Energy and vitality", "Healthy aging"] },
    { key: "age", type: "single", title: "What's your age range?", options: ["18–29", "30–39", "40–49", "50–59", "60+"] },
    { key: "screening", type: "multi", title: "Do any of these apply to you?", sub: "Required safety screening for growth-hormone peptide therapy.",
      options: ["Active cancer diagnosis or treatment", "History of pituitary tumor or brain lesion", "Untreated thyroid disorder", "Type 2 diabetes", NONE_OF_THE_ABOVE],
      disqualify: ["Active cancer diagnosis or treatment", "History of pituitary tumor or brain lesion"] },
    { key: "experience", type: "single", title: "Have you used peptide or growth hormone therapy before?",
      options: ["Never", "Yes — sermorelin or similar peptides", "Yes — HGH", "Currently using something"] },
    { key: "preference", type: "single", title: "Which protocol sounds right?",
      options: ["Standard nightly protocol", "Sleep-focused blend", "Maximum strength", "Not sure — recommend for me"] },
  ],
  nad: [
    { key: "goal", type: "multi", title: "What are you hoping NAD+ helps with?", sub: "Select all that apply.",
      options: ["Low energy / fatigue", "Brain fog / focus", "Recovery and performance", "Healthy aging / longevity", "General wellness"] },
    { key: "duration", type: "single", title: "How long have you felt this way?",
      options: ["Less than 3 months", "3–12 months", "More than a year", "Just optimizing — no specific issue"] },
    { key: "screening", type: "multi", title: "Do any of these apply to you?", sub: "Required safety screening for NAD+ therapy.",
      options: ["Active cancer diagnosis or treatment", "Severe kidney or liver disease", "Currently on dialysis", NONE_OF_THE_ABOVE],
      disqualify: ["Active cancer diagnosis or treatment", "Severe kidney or liver disease", "Currently on dialysis"] },
    { key: "experience", type: "single", title: "Have you tried NAD+ before?",
      options: ["Never", "Oral supplements (NMN / NR)", "IV NAD+ at a clinic", "At-home injections"] },
    { key: "preference", type: "single", title: "How would you prefer to take it?",
      options: ["Injection — most effective", "Nasal spray — no needles", "Not sure — recommend for me"] },
  ],
  lowt: [
    { key: "symptoms", type: "multi", title: "Which symptoms are you experiencing?", sub: "Select all that apply.",
      options: ["Low energy / fatigue", "Reduced libido", "Difficulty building muscle", "Brain fog / poor focus", "Mood changes / irritability", "Weight gain around the midsection", NONE_OF_THE_ABOVE] },
    { key: "labs", type: "single", title: "Have you had testosterone labs in the last 12 months?", options: ["Yes — confirmed low T", "Yes — borderline / low-normal", "Yes — but I don't remember the number", "No — I need labs ordered"] },
    { key: "age", type: "single", title: "What's your age range?", options: ["18–29", "30–39", "40–49", "50–59", "60–69", "70+"] },
    { key: "fertility", type: "single", title: "Is preserving fertility important right now?", options: ["Yes — planning children", "Maybe in the next few years", "No — not a concern"] },
    { key: "prostate", type: "multi", title: "Do any of these apply?", sub: "Required safety screening for testosterone therapy.",
      options: ["History of prostate cancer", "Active untreated sleep apnea", "Hematocrit above 54%", "Breast cancer history", "Not sure — I'd like a full hormone panel first", NONE_OF_THE_ABOVE],
      disqualify: ["History of prostate cancer", "Breast cancer history", "Hematocrit above 54%"] },
    { key: "preference", type: "single", title: "How would you prefer to treat?", options: ["Weekly injection — most effective", "Daily oral — no needles", "Topical cream", "Not sure — recommend for me"] },
  ],
  mentalhealth: [
    { key: "primary", type: "single", title: "What's your primary concern?", options: ["Anxiety / worry", "Depression / low mood", "Both anxiety and depression", "Stress and burnout", "Not sure — I just don't feel like myself"] },
    { key: "duration", type: "single", title: "How long have you been feeling this way?", options: ["Less than 2 weeks", "2 weeks – 3 months", "3–12 months", "More than a year"] },
    { key: "severity", type: "single", title: "How much is this affecting daily life?", options: ["Mild — manageable but annoying", "Moderate — interfering with work or relationships", "Significant — hard to function most days"] },
    { key: "tried", type: "multi", title: "What have you tried before?",
      options: ["Talk therapy / counseling", "SSRI or SNRI medication", "Bupropion or Wellbutrin", "Benzodiazepines (Xanax, Ativan)", "Nothing yet", "Other / herbal supplements"],
      exclusive: ["Nothing yet"] },
    { key: "crisis", type: "multi", title: "Safety check — do any of these apply right now?", sub: "We take this seriously. Honest answers help us care for you safely.",
      options: ["Thoughts of harming yourself", "Plan or intent to act on those thoughts", "Recent psychiatric hospitalization", NONE_OF_THE_ABOVE],
      disqualify: ["Thoughts of harming yourself", "Plan or intent to act on those thoughts", "Recent psychiatric hospitalization"],
      crisis: ["Thoughts of harming yourself", "Plan or intent to act on those thoughts"] },
    { key: "preference", type: "single", title: "What matters most in a medication?", options: ["Proven for anxiety", "Proven for depression", "Less sexual side effects / more energy", "Something gentle to start", "Not sure — recommend for me"] },
  ],
  pcp: [
    { key: "reason", type: "single", title: "Why are you looking for a new primary care doctor?", options: ["I don't currently have a PCP", "My current doctor is hard to reach", "I want everything in one digital place", "I need help coordinating specialists", "Moving / changing insurance"] },
    { key: "needs", type: "multi", title: "What do you need from your PCP?",
      options: ["Annual wellness visits", "Lab ordering and review", "Chronic condition management", "Referrals to specialists", "Same-day messaging for acute issues", "Prescription renewals"] },
    { key: "conditions", type: "multi", title: "Any ongoing conditions we should know about?",
      options: ["High blood pressure", "High cholesterol", "Diabetes / prediabetes", "Thyroid disorder", "Asthma / allergies", NONE_OF_THE_ABOVE] },
    { key: "household", type: "single", title: "Who needs coverage?", options: ["Just me", "Me and a partner", "Not sure yet"] },
    { key: "preference", type: "single", title: "Which plan fits best?", options: ["Acute Insight — visit + messaging for 1 month", "Yearly Checkup — visit + labs + messaging", "Monthly Doctor-Initiated Visits — doctor calls monthly", "Not sure — recommend for me"] },
  ],
};

export function getCondition(id: string | null | undefined): Condition | undefined {
  return id && id in conditions ? conditions[id as ConditionId] : undefined;
}

export function getTreatment(conditionId: string | null | undefined, treatmentId: string | null | undefined): Treatment | undefined {
  const condition = getCondition(conditionId);
  if (!condition || !treatmentId) return undefined;
  return condition.treatments.find((t) => t.id === treatmentId);
}
