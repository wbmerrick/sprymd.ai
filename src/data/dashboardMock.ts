import type { DashboardData } from "@/types/dashboard";
import { defaultWearableDevices } from "@/data/wearables";
import { emptyBodyProfile } from "@/lib/patientCareStore";

/** Realistic mock payload so every dashboard page is fully previewable. */
export const mockDashboardData: DashboardData = {
  user: {
    id: "usr_spry_001",
    name: "Alex Rivera",
    email: "alex.rivera@example.com",
    avatarInitials: "AR",
  },
  treatments: [
    {
      id: "tx_tirz",
      medicationName: "Tirzepatide Injection",
      dosage: "5 mg weekly · subcutaneous",
      goal: "Reach a sustainable weight and improve metabolic markers",
      startDate: "2026-01-12",
      refillThroughDate: "2026-08-04",
      status: "expiring_soon",
      refillsRemaining: 1,
      category: "Metabolic",
      dosingInstructions:
        "Inject 0.25 mL (5 mg) subcutaneously once weekly on the same day each week. Rotate injection sites (abdomen, thigh, or upper arm). Do not inject into areas that are tender, bruised, or scarred.",
      storage:
        "Keep refrigerated at 36–46°F (2–8°C). Do not freeze. Protect from light. After first use, vials may be kept refrigerated and used within the labeled beyond-use date.",
      howItWorks:
        "Tirzepatide is a dual GIP/GLP-1 receptor agonist. It slows gastric emptying, reduces appetite, and improves insulin sensitivity — supporting gradual, clinician-titrated weight loss.",
      sideEffects: [
        {
          effect: "Nausea or reduced appetite",
          mitigation: "Eat smaller meals, avoid greasy foods, and stay hydrated. Usually improves after titration.",
        },
        {
          effect: "Constipation",
          mitigation: "Increase fiber and fluid; a gentle stool softener may help if your clinician approves.",
        },
        {
          effect: "Injection-site redness",
          mitigation: "Rotate sites and apply a cool compress. Contact care if swelling worsens.",
        },
      ],
      troubleshooting:
        "Missed dose within 4 days: take as soon as you remember, then resume your weekly schedule. More than 4 days late: skip and take the next scheduled dose. Never double up.",
      warnings:
        "Do not use if you have a personal or family history of medullary thyroid carcinoma or MEN2. Seek urgent care for severe abdominal pain (possible pancreatitis), persistent vomiting, or signs of allergic reaction.",
    },
    {
      id: "tx_tadalafil",
      medicationName: "Tadalafil ODT",
      dosage: "6 mg daily · oral dissolve",
      goal: "Restore reliable erectile function and confidence",
      startDate: "2025-11-02",
      refillThroughDate: "2026-11-02",
      status: "active",
      refillsRemaining: 8,
      category: "Sexual health",
      dosingInstructions:
        "Dissolve one tablet under the tongue once daily at approximately the same time. Do not chew or swallow whole. Avoid heavy meals immediately before dosing if absorption feels inconsistent.",
      storage: "Store at room temperature (68–77°F) in the original blister. Keep dry and away from moisture.",
      howItWorks:
        "Tadalafil inhibits PDE5, increasing blood flow in response to sexual stimulation. Daily low-dose dosing supports readiness without timing a single as-needed tablet.",
      sideEffects: [
        {
          effect: "Mild headache or flushing",
          mitigation: "Hydrate and consider taking with a light snack. Usually transient.",
        },
        {
          effect: "Nasal congestion",
          mitigation: "Saline rinse; avoid decongestants that interact with PDE5 inhibitors.",
        },
      ],
      troubleshooting:
        "If erection lasts longer than 4 hours, seek emergency care. Do not combine with nitrates or recreational nitrites.",
      warnings:
        "Contraindicated with nitrates (nitroglycerin, isosorbide) and riociguat. Tell your clinician about heart disease, recent stroke/MI, or uncontrolled blood pressure.",
    },
    {
      id: "tx_hair",
      medicationName: "Hair Restore MFK Topical",
      dosage: "1 mL twice daily · scalp",
      goal: "Slow hair loss and thicken the crown and hairline",
      startDate: "2026-02-18",
      refillThroughDate: "2026-10-18",
      status: "active",
      refillsRemaining: 3,
      category: "Hair",
      dosingInstructions:
        "Apply 1 mL to dry scalp at the thinning areas morning and night. Wash hands after application. Allow to dry before styling products or lying down.",
      storage: "Store upright at room temperature. Keep tightly capped. Avoid extreme heat.",
      howItWorks:
        "Combines minoxidil (vasodilator), low-dose finasteride (5α-reductase inhibition), and ketoconazole (scalp microbiome / DHT adjunct) for multi-pathway hair support.",
      sideEffects: [
        {
          effect: "Scalp itch or dryness",
          mitigation: "Reduce to once daily for a few days; use a gentle moisturizer around (not on) treated areas.",
        },
        {
          effect: "Initial shedding",
          mitigation: "Common in weeks 2–6 as follicles reset. Continue therapy unless advised otherwise.",
        },
      ],
      troubleshooting:
        "Missed application: resume at the next scheduled dose. Consistency over months matters more than a single missed day.",
      warnings:
        "For external use only. Keep away from eyes. Discuss pregnancy plans with your clinician before continuing finasteride-containing topicals in a shared household.",
    },
    {
      id: "tx_sertraline",
      medicationName: "Sertraline",
      dosage: "50 mg daily · oral",
      goal: "Reduce anxiety and stabilize daily mood",
      startDate: "2026-03-01",
      refillThroughDate: "2026-09-01",
      status: "pending",
      refillsRemaining: 0,
      category: "Mental health",
      dosingInstructions:
        "Take one tablet by mouth each morning with or without food. Full benefit may take 4–6 weeks. Do not stop abruptly without clinician guidance.",
      storage: "Room temperature in a dry place. Keep in original container.",
      howItWorks:
        "Sertraline is an SSRI that increases serotonin signaling, which can ease anxiety and depressive symptoms over time.",
      sideEffects: [
        {
          effect: "Transient nausea or sleep changes",
          mitigation: "Taking with food or adjusting time of day (AM vs PM) often helps in the first two weeks.",
        },
      ],
      troubleshooting:
        "If mood worsens or you have thoughts of self-harm, contact care or emergency services immediately.",
      warnings:
        "May interact with MAOIs, certain migraine medications, and blood thinners. Avoid abrupt discontinuation.",
    },
    {
      id: "tx_legacy_bp",
      medicationName: "Lisinopril",
      dosage: "10 mg daily",
      goal: "Manage blood pressure",
      startDate: "2024-06-01",
      refillThroughDate: "2025-06-01",
      status: "inactive",
      refillsRemaining: 0,
      category: "Cardiometabolic",
      dosingInstructions: "Historical record — no longer active on this account.",
      storage: "—",
      howItWorks: "ACE inhibitor previously used for blood pressure support.",
      sideEffects: [],
      troubleshooting: "Contact your clinician if you need this therapy restarted.",
      warnings: "Inactive protocol — do not take leftover tablets without a new prescription.",
    },
  ],
  notifications: [
    {
      id: "ntf_1",
      icon: "pill",
      title: "Refill window opening",
      description: "Tirzepatide coverage ends Aug 4. Renew now to avoid a gap in therapy.",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      dismissed: false,
    },
    {
      id: "ntf_2",
      icon: "truck",
      title: "Shipment on the way",
      description: "Tadalafil ODT left the pharmacy. Tracking will appear in Orders within 24 hours.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      dismissed: false,
    },
    {
      id: "ntf_3",
      icon: "message",
      title: "Clinician replied",
      description: "A clinician answered your question about titration timing.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      dismissed: false,
    },
    {
      id: "ntf_4",
      icon: "lab",
      title: "Labs ready to review",
      description: "Your metabolic panel from June 12 is available in Lab history.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      dismissed: true,
    },
  ],
  shipments: [
    {
      id: "shp_1",
      treatmentId: "tx_tadalafil",
      medicationName: "Tadalafil ODT",
      nextShipmentDate: "2026-07-29",
      status: "shipped",
      quantity: 30,
    },
    {
      id: "shp_2",
      treatmentId: "tx_tirz",
      medicationName: "Tirzepatide Injection",
      nextShipmentDate: "2026-08-06",
      status: "scheduled",
      quantity: 1,
    },
    {
      id: "shp_3",
      treatmentId: "tx_hair",
      medicationName: "Hair Restore MFK Topical",
      nextShipmentDate: "2026-08-20",
      status: "processing",
      quantity: 1,
    },
    {
      id: "shp_4",
      treatmentId: "tx_tadalafil",
      medicationName: "Tadalafil ODT",
      nextShipmentDate: null,
      status: "delivered",
      quantity: 30,
    },
  ],
  subscriptions: [
    {
      id: "sub_1",
      treatmentId: "tx_tirz",
      price: 279,
      billingCadence: "Every 4 weeks",
      nextChargeDate: "2026-08-04",
      autoshipEnabled: true,
    },
    {
      id: "sub_2",
      treatmentId: "tx_tadalafil",
      price: 99,
      billingCadence: "Monthly",
      nextChargeDate: "2026-08-02",
      autoshipEnabled: true,
    },
    {
      id: "sub_3",
      treatmentId: "tx_hair",
      price: 89,
      billingCadence: "Every 60 days",
      nextChargeDate: "2026-08-18",
      autoshipEnabled: false,
    },
  ],
  messages: [
    {
      id: "msg_1",
      subject: "Tirzepatide titration question",
      preview: "Thanks — hold at 5 mg for another two weeks, then we can discuss 7.5 mg.",
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      status: "no_action",
    },
    {
      id: "msg_2",
      subject: "Photo ID verification",
      preview: "We still need a clear photo of your government ID to keep prescribing.",
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
      status: "action_required",
    },
    {
      id: "msg_3",
      subject: "Hair Restore shipping delay",
      preview: "Your vial shipped a day late due to cold-chain routing. No action needed.",
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
      status: "no_action",
    },
  ],
  transactions: [
    {
      id: "txn_1",
      date: "2026-07-02",
      product: "Tadalafil ODT · 30-day",
      quantity: 1,
      amount: 99,
      status: "Paid",
    },
    {
      id: "txn_2",
      date: "2026-06-14",
      product: "Tirzepatide Injection · 4-week",
      quantity: 1,
      amount: 279,
      status: "Paid",
    },
    {
      id: "txn_3",
      date: "2026-06-01",
      product: "Hair Restore MFK · 60 mL",
      quantity: 1,
      amount: 89,
      status: "Refunded",
    },
    {
      id: "txn_4",
      date: "2026-05-18",
      product: "Daily Multivitamin Complex",
      quantity: 2,
      amount: 64,
      status: "Paid",
    },
  ],
  supportTopics: [
    {
      id: "topic_1",
      title: "Refills & shipping",
      description: "When to renew, cold-chain, and tracking",
    },
    {
      id: "topic_2",
      title: "Side effects",
      description: "What is expected vs when to message care",
    },
    {
      id: "topic_3",
      title: "Billing & autoship",
      description: "Charges, pauses, and payment methods",
    },
    {
      id: "topic_4",
      title: "Labs & visits",
      description: "Ordering labs and reviewing results",
    },
  ],
  wearableDevices: defaultWearableDevices(),
  wearableReadings: [],
  bodyProfile: { ...emptyBodyProfile(), heightCm: 178, weightLb: 198, targetWeightLb: 175 },
  bodyGoals: [
    {
      id: "goal_mock_1",
      title: "Reach target weight",
      metric: "weight",
      targetValue: 175,
      unit: "lb",
      currentValue: 198,
      status: "active",
      createdAt: "2026-07-01T12:00:00.000Z",
      updatedAt: "2026-08-01T12:00:00.000Z",
    },
  ],
};
