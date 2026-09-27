/**
 * Supabase persistence for patient care domains (patients-keyed).
 * Source of truth is the DB; patientCareStore keeps an in-memory cache and refreshes on action.
 */
import { supabase } from "@/integrations/supabase/client";
import { defaultWearableDevices, mergeWearableCatalog } from "@/data/wearables";
import type {
  BodyGoal,
  BodyProfile,
  DashboardLayoutConfig,
  MessageThread,
  NotificationItem,
  Shipment,
  Subscription,
  Transaction,
  Treatment,
  WearableDevice,
  WearableOAuthLink,
  WearableReading,
} from "@/types/dashboard";
import type { ClinicalCase, PatientCareRecord } from "@/lib/patientCareStore";
import { DEFAULT_DASHBOARD_WIDGETS } from "@/types/dashboard";

const LEGACY_CARE_KEY = "sprymd_patient_care_v1";

function emptyBodyProfile(): BodyProfile {
  return {
    heightCm: null,
    weightLb: null,
    targetWeightLb: null,
    updatedAt: new Date().toISOString(),
  };
}

function defaultDashboardLayout(): DashboardLayoutConfig {
  return {
    preset: "care_simple",
    widgets: [...DEFAULT_DASHBOARD_WIDGETS],
    pinnedDeviceIds: [],
    selectedMetrics: ["hr", "spo2", "weight", "glucose", "sleep_score"],
    updatedAt: new Date().toISOString(),
  };
}

function emailKey(email: string) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

export async function resolvePatientId(email: string): Promise<string | null> {
  const key = emailKey(email);
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (userId) {
    const { data } = await supabase.from("patients").select("id").eq("user_id", userId).maybeSingle();
    if (data?.id) return data.id as string;
  }
  const { data } = await supabase.from("patients").select("id").eq("email", key).maybeSingle();
  return (data?.id as string) || null;
}

function emptyRecord(email: string): PatientCareRecord {
  return {
    email: emailKey(email),
    treatments: [],
    notifications: [],
    shipments: [],
    subscriptions: [],
    messages: [],
    transactions: [],
    clinicalCases: [],
    wearableDevices: defaultWearableDevices(),
    wearableReadings: [],
    bodyProfile: emptyBodyProfile(),
    bodyGoals: [],
    dashboardLayout: defaultDashboardLayout(),
    oauthLinks: [],
    updatedAt: new Date().toISOString(),
  };
}

function mapTreatment(row: Record<string, unknown>): Treatment {
  return {
    id: String(row.id),
    medicationName: String(row.medication_name || ""),
    dosage: String(row.dosage || ""),
    goal: String(row.goal || ""),
    category: String(row.category || "Protocol"),
    startDate: String(row.start_date || ""),
    refillThroughDate: row.refill_through_date ? String(row.refill_through_date) : undefined,
    status: (row.status as Treatment["status"]) || "pending",
    refillsRemaining: Number(row.refills_remaining || 0),
    dosingInstructions: row.dosing_instructions ? String(row.dosing_instructions) : undefined,
    storage: row.storage ? String(row.storage) : undefined,
    howItWorks: row.how_it_works ? String(row.how_it_works) : undefined,
    sideEffects: Array.isArray(row.side_effects) ? (row.side_effects as string[]) : [],
    troubleshooting: row.troubleshooting ? String(row.troubleshooting) : undefined,
    warnings: row.warnings ? String(row.warnings) : undefined,
  };
}

/** Fetch full care record for a patient email from Supabase. */
export async function fetchPatientCareFromDb(email: string): Promise<PatientCareRecord> {
  const key = emailKey(email);
  const base = emptyRecord(key);
  const patientId = await resolvePatientId(key);
  if (!patientId) return base;

  const [
    treatmentsRes,
    ordersRes,
    subsRes,
    shipsRes,
    notesRes,
    casesRes,
    devicesRes,
    readingsRes,
    bodyRes,
    goalsRes,
    prefsRes,
    threadsRes,
  ] = await Promise.all([
    supabase.from("care_treatments").select("*").eq("patient_id", patientId),
    supabase.from("care_orders").select("*").eq("patient_id", patientId).order("created_at", { ascending: false }),
    supabase.from("care_subscriptions").select("*").eq("patient_id", patientId),
    supabase.from("care_shipments").select("*").eq("patient_id", patientId),
    supabase.from("care_notifications").select("*").eq("patient_id", patientId).eq("dismissed", false),
    supabase.from("care_clinical_cases").select("*").eq("patient_id", patientId),
    supabase.from("care_wearable_devices").select("*").eq("patient_id", patientId),
    supabase
      .from("care_wearable_readings")
      .select("*")
      .eq("patient_id", patientId)
      .order("recorded_at", { ascending: false })
      .limit(500),
    supabase.from("care_body_profiles").select("*").eq("patient_id", patientId).maybeSingle(),
    supabase.from("care_body_goals").select("*").eq("patient_id", patientId),
    supabase.from("care_patient_preferences").select("*").eq("patient_id", patientId).maybeSingle(),
    supabase
      .from("message_threads")
      .select("id, subject, preview, status, updated_at, urgency")
      .eq("patient_id", patientId)
      .order("updated_at", { ascending: false }),
  ]);

  const treatments = (treatmentsRes.data || []).map((r) => mapTreatment(r as Record<string, unknown>));

  const transactions: Transaction[] = (ordersRes.data || []).map((r) => ({
    id: String(r.id),
    date: String(r.created_at || new Date().toISOString()).slice(0, 10),
    product: String(r.label || r.mode || "Order"),
    quantity: 1,
    amount: Number(r.total || 0),
    status: String(r.status || "pending_review"),
  }));

  const subscriptions: Subscription[] = (subsRes.data || []).map((r) => ({
    id: String(r.id),
    treatmentId: String(r.treatment_id || ""),
    price: Number(r.price || 0),
    billingCadence: String(r.billing_cadence || "Monthly"),
    nextChargeDate: r.next_charge_date
      ? String(r.next_charge_date)
      : new Date().toISOString().slice(0, 10),
    autoshipEnabled: Boolean(r.autoship_enabled),
  }));

  const shipments: Shipment[] = (shipsRes.data || []).map((r) => ({
    id: String(r.id),
    treatmentId: String(r.treatment_id || ""),
    medicationName: String(r.medication_name || ""),
    nextShipmentDate: r.next_shipment_date ? String(r.next_shipment_date) : null,
    status: (r.status as Shipment["status"]) || "scheduled",
    quantity: Number(r.quantity || 1),
  }));

  const notifications: NotificationItem[] = (notesRes.data || []).map((r) => ({
    id: String(r.id),
    icon: String(r.icon || "pill"),
    title: String(r.title || ""),
    description: String(r.description || ""),
    timestamp: String(r.created_at || new Date().toISOString()),
    dismissed: false,
  }));

  const clinicalCases: ClinicalCase[] = (casesRes.data || []).map((r) => ({
    id: String(r.id),
    email: String(r.patient_email || key),
    treatmentId: r.treatment_id ? String(r.treatment_id) : undefined,
    conditionId: r.condition_id ? String(r.condition_id) : undefined,
    planName: r.plan_name ? String(r.plan_name) : undefined,
    intake: (r.intake as Record<string, unknown>) || {},
    status: (r.status as ClinicalCase["status"]) || "pending_review",
    createdAt: String(r.created_at || new Date().toISOString()),
    reviewedAt: r.reviewed_at ? String(r.reviewed_at) : undefined,
  }));

  const deviceRows = devicesRes.data || [];
  let wearableDevices: WearableDevice[] =
    deviceRows.length > 0
      ? deviceRows.map((r) => ({ ...(r.payload as WearableDevice), id: String(r.id) }))
      : defaultWearableDevices();
  wearableDevices = mergeWearableCatalog(wearableDevices);

  const wearableReadings: WearableReading[] = (readingsRes.data || []).map((r) => {
    const payload = (r.payload as WearableReading) || ({} as WearableReading);
    return {
      ...payload,
      id: String(r.id),
      deviceId: String(r.device_id),
      metric: String(r.metric || payload.metric || ""),
      value: r.value ?? payload.value,
      unit: r.unit ? String(r.unit) : payload.unit,
      recordedAt: String(r.recorded_at || payload.recordedAt || new Date().toISOString()),
    };
  });

  const body = bodyRes.data;
  const bodyProfile: BodyProfile = body
    ? {
        heightCm: body.height_cm != null ? Number(body.height_cm) : null,
        weightLb: body.weight_lb != null ? Number(body.weight_lb) : null,
        targetWeightLb: body.target_weight_lb != null ? Number(body.target_weight_lb) : null,
        updatedAt: String(body.updated_at || new Date().toISOString()),
      }
    : emptyBodyProfile();

  const bodyGoals: BodyGoal[] = (goalsRes.data || []).map((r) => ({
    id: String(r.id),
    title: String(r.title || ""),
    metric: r.metric as BodyGoal["metric"],
    targetValue: Number(r.target_value || 0),
    unit: String(r.unit || ""),
    currentValue: Number(r.current_value || 0),
    status: (r.status as BodyGoal["status"]) || "active",
    createdAt: String(r.created_at || new Date().toISOString()),
    updatedAt: String(r.updated_at || new Date().toISOString()),
  }));

  const prefs = prefsRes.data;
  const dashboardLayout = (prefs?.dashboard_layout as DashboardLayoutConfig) || defaultDashboardLayout();
  const oauthLinks = (prefs?.oauth_links as WearableOAuthLink[]) || [];

  const messages: MessageThread[] = (threadsRes.data || []).map((r) => ({
    id: String(r.id),
    subject: String(r.subject || ""),
    preview: String(r.preview || ""),
    status:
      r.status === "awaiting_patient" || r.status === "awaiting_staff" ? "action_required" : "no_action",
    updatedAt: String(r.updated_at || new Date().toISOString()),
    urgency: (r as { urgency?: string }).urgency as MessageThread["urgency"],
  }));

  return {
    email: key,
    treatments,
    notifications,
    shipments,
    subscriptions,
    messages,
    transactions,
    clinicalCases,
    wearableDevices,
    wearableReadings,
    bodyProfile,
    bodyGoals,
    dashboardLayout,
    oauthLinks,
    updatedAt: new Date().toISOString(),
  };
}

/** Persist full care record for a patient (replace-style write for mutable domains). */
export async function persistPatientCareToDb(care: PatientCareRecord): Promise<{ ok: boolean; error?: string }> {
  const patientId = await resolvePatientId(care.email);
  if (!patientId) {
    return { ok: false, error: "No patients row for authenticated user" };
  }

  try {
    // Preferences + body profile (upsert)
    await supabase.from("care_patient_preferences").upsert({
      patient_id: patientId,
      dashboard_layout: care.dashboardLayout || defaultDashboardLayout(),
      oauth_links: care.oauthLinks || [],
      updated_at: new Date().toISOString(),
    });

    await supabase.from("care_body_profiles").upsert({
      patient_id: patientId,
      height_cm: care.bodyProfile?.heightCm,
      weight_lb: care.bodyProfile?.weightLb,
      target_weight_lb: care.bodyProfile?.targetWeightLb,
      updated_at: new Date().toISOString(),
    });

    // Wearable devices as JSON payloads
    if (care.wearableDevices?.length) {
      const rows = care.wearableDevices.map((d) => ({
        patient_id: patientId,
        id: d.id,
        payload: d,
        updated_at: new Date().toISOString(),
      }));
      await supabase.from("care_wearable_devices").upsert(rows);
    }

    // Body goals — replace set
    await supabase.from("care_body_goals").delete().eq("patient_id", patientId);
    if (care.bodyGoals?.length) {
      await supabase.from("care_body_goals").insert(
        care.bodyGoals.map((g) => ({
          id: g.id?.startsWith("goal_") ? undefined : g.id,
          patient_id: patientId,
          title: g.title,
          metric: g.metric,
          target_value: g.targetValue,
          unit: g.unit,
          current_value: g.currentValue,
          status: g.status,
          created_at: g.createdAt,
          updated_at: g.updatedAt,
        })),
      );
    }

    // Notifications — sync dismissed by replacing active set is lossy; upsert current undismissed
    for (const n of care.notifications || []) {
      const isUuid = /^[0-9a-f-]{36}$/i.test(n.id);
      if (isUuid) {
        await supabase
          .from("care_notifications")
          .update({
            title: n.title,
            description: n.description,
            icon: n.icon,
            dismissed: false,
          })
          .eq("id", n.id)
          .eq("patient_id", patientId);
      } else {
        await supabase.from("care_notifications").insert({
          patient_id: patientId,
          icon: n.icon || "pill",
          title: n.title,
          description: n.description || "",
          dismissed: false,
          created_at: n.timestamp || new Date().toISOString(),
        });
      }
    }

    // Treatments upsert by uuid id when possible
    for (const t of care.treatments || []) {
      const row = {
        patient_id: patientId,
        medication_name: t.medicationName,
        dosage: t.dosage || "",
        goal: t.goal || "",
        category: t.category || "Protocol",
        start_date: t.startDate || new Date().toISOString().slice(0, 10),
        refill_through_date: t.refillThroughDate || null,
        status: t.status,
        refills_remaining: t.refillsRemaining ?? 0,
        dosing_instructions: t.dosingInstructions || null,
        storage: t.storage || null,
        how_it_works: t.howItWorks || null,
        side_effects: t.sideEffects || [],
        troubleshooting: t.troubleshooting || null,
        warnings: t.warnings || null,
      };
      if (/^[0-9a-f-]{36}$/i.test(t.id)) {
        await supabase.from("care_treatments").upsert({ id: t.id, ...row });
      } else {
        await supabase.from("care_treatments").insert(row);
      }
    }

    // Clinical cases
    for (const c of care.clinicalCases || []) {
      const row = {
        patient_id: patientId,
        patient_email: care.email,
        treatment_id: c.treatmentId && /^[0-9a-f-]{36}$/i.test(c.treatmentId) ? c.treatmentId : null,
        condition_id: c.conditionId || null,
        plan_name: c.planName || null,
        intake: c.intake || {},
        status: c.status,
        created_at: c.createdAt,
        reviewed_at: c.reviewedAt || null,
      };
      if (/^[0-9a-f-]{36}$/i.test(c.id)) {
        await supabase.from("care_clinical_cases").upsert({ id: c.id, ...row });
      } else {
        await supabase.from("care_clinical_cases").insert(row);
      }
    }

    // Shipments / subscriptions / orders — insert missing non-uuid rows
    for (const s of care.shipments || []) {
      if (/^[0-9a-f-]{36}$/i.test(s.id)) {
        await supabase
          .from("care_shipments")
          .update({
            medication_name: s.medicationName,
            next_shipment_date: s.nextShipmentDate || null,
            status: s.status,
            quantity: s.quantity ?? 1,
          })
          .eq("id", s.id);
      } else {
        await supabase.from("care_shipments").insert({
          patient_id: patientId,
          medication_name: s.medicationName,
          next_shipment_date: s.nextShipmentDate || null,
          status: s.status,
          quantity: s.quantity ?? 1,
        });
      }
    }

    for (const s of care.subscriptions || []) {
      if (/^[0-9a-f-]{36}$/i.test(s.id)) {
        await supabase
          .from("care_subscriptions")
          .update({
            price: s.price,
            billing_cadence: s.billingCadence,
            next_charge_date: s.nextChargeDate || null,
            autoship_enabled: s.autoshipEnabled,
          })
          .eq("id", s.id);
      } else if (s.treatmentId && /^[0-9a-f-]{36}$/i.test(s.treatmentId)) {
        await supabase.from("care_subscriptions").insert({
          patient_id: patientId,
          treatment_id: s.treatmentId,
          price: s.price,
          billing_cadence: s.billingCadence || "Monthly",
          next_charge_date: s.nextChargeDate || null,
          autoship_enabled: s.autoshipEnabled,
        });
      }
    }

    for (const tx of care.transactions || []) {
      if (/^[0-9a-f-]{36}$/i.test(tx.id)) continue;
      await supabase.from("care_orders").insert({
        patient_id: patientId,
        label: tx.product || "Order",
        mode: "cart",
        total: tx.amount,
        status: tx.status || "pending_review",
        created_at: tx.date ? `${tx.date}T12:00:00.000Z` : new Date().toISOString(),
      });
    }

    // Latest readings — append only new non-uuid ids
    const newReadings = (care.wearableReadings || []).filter((r) => !/^[0-9a-f-]{36}$/i.test(r.id)).slice(0, 50);
    if (newReadings.length) {
      await supabase.from("care_wearable_readings").insert(
        newReadings.map((r) => ({
          patient_id: patientId,
          device_id: r.deviceId,
          metric: r.metric,
          value: typeof r.value === "number" ? r.value : null,
          unit: r.unit || null,
          recorded_at: r.recordedAt,
          payload: r,
        })),
      );
      await supabase.rpc("care_prune_wearable_readings", {
        p_patient_id: patientId,
        p_keep: 500,
      });
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "persist failed" };
  }
}

/** One-time import from legacy localStorage blob, then clear the key. */
export async function migrateLegacyLocalCare(email: string): Promise<PatientCareRecord | null> {
  if (typeof localStorage === "undefined") return null;
  let store: Record<string, PatientCareRecord> = {};
  try {
    store = JSON.parse(localStorage.getItem(LEGACY_CARE_KEY) || "{}");
  } catch {
    return null;
  }
  const key = emailKey(email);
  const legacy = store[key];
  if (!legacy) return null;

  const patientId = await resolvePatientId(key);
  if (!patientId) return legacy;

  await persistPatientCareToDb({ ...legacy, email: key });
  delete store[key];
  if (Object.keys(store).length === 0) localStorage.removeItem(LEGACY_CARE_KEY);
  else localStorage.setItem(LEGACY_CARE_KEY, JSON.stringify(store));
  return legacy;
}

/** Staff: list clinical cases across patients (RLS allows active providers). */
export async function fetchClinicalCasesForReview(): Promise<ClinicalCase[]> {
  const { data, error } = await supabase
    .from("care_clinical_cases")
    .select("*")
    .in("status", ["pending_review", "needs_info"])
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r) => ({
    id: String(r.id),
    email: String(r.patient_email || ""),
    treatmentId: r.treatment_id ? String(r.treatment_id) : undefined,
    conditionId: r.condition_id ? String(r.condition_id) : undefined,
    planName: r.plan_name ? String(r.plan_name) : undefined,
    intake: (r.intake as Record<string, unknown>) || {},
    status: (r.status as ClinicalCase["status"]) || "pending_review",
    createdAt: String(r.created_at || new Date().toISOString()),
    reviewedAt: r.reviewed_at ? String(r.reviewed_at) : undefined,
  }));
}

export async function updateClinicalCaseStatus(
  caseId: string,
  status: ClinicalCase["status"],
): Promise<void> {
  await supabase
    .from("care_clinical_cases")
    .update({
      status,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", caseId);
}
