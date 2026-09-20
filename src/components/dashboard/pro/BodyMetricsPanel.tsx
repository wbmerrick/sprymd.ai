import { useEffect, useState } from "react";
import type { BodyGoal, BodyProfile } from "@/types/dashboard";
import { computeBmi, feetInchesToCm, heightCmToFeetInches } from "@/data/wearables";
import { ProPanel } from "./ProPanel";

export function BodyMetricsPanel({
  bodyProfile,
  bodyGoals,
  onUpdateBody,
}: {
  bodyProfile: BodyProfile;
  bodyGoals: BodyGoal[];
  onUpdateBody: (patch: Partial<Pick<BodyProfile, "heightCm" | "weightLb" | "targetWeightLb">>) => void;
}) {
  const fi = bodyProfile.heightCm != null ? heightCmToFeetInches(bodyProfile.heightCm) : { feet: 5, inches: 10 };
  const [feet, setFeet] = useState(String(fi.feet));
  const [inches, setInches] = useState(String(fi.inches));
  const [weight, setWeight] = useState(bodyProfile.weightLb != null ? String(bodyProfile.weightLb) : "");
  const [target, setTarget] = useState(bodyProfile.targetWeightLb != null ? String(bodyProfile.targetWeightLb) : "");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const next = bodyProfile.heightCm != null ? heightCmToFeetInches(bodyProfile.heightCm) : { feet: 5, inches: 10 };
    setFeet(String(next.feet));
    setInches(String(next.inches));
    setWeight(bodyProfile.weightLb != null ? String(bodyProfile.weightLb) : "");
    setTarget(bodyProfile.targetWeightLb != null ? String(bodyProfile.targetWeightLb) : "");
  }, [bodyProfile.heightCm, bodyProfile.weightLb, bodyProfile.targetWeightLb]);

  const bmi = computeBmi(bodyProfile.heightCm, bodyProfile.weightLb);
  const weightGoal = bodyGoals.find((g) => g.metric === "weight" && g.status !== "paused");
  const progress =
    weightGoal && bodyProfile.weightLb != null
      ? Math.min(
          100,
          Math.max(
            0,
            ((Math.max(bodyProfile.weightLb, weightGoal.targetValue) - bodyProfile.weightLb) /
              Math.max(1, Math.abs((weightGoal.currentValue || bodyProfile.weightLb) - weightGoal.targetValue) || 1)) *
              100,
          ),
        )
      : bodyProfile.targetWeightLb != null && bodyProfile.weightLb != null
        ? Math.min(
            100,
            Math.max(0, 100 - Math.abs(bodyProfile.weightLb - bodyProfile.targetWeightLb)),
          )
        : null;

  const save = () => {
    const f = Number(feet);
    const i = Number(inches);
    const w = weight.trim() === "" ? null : Number(weight);
    const t = target.trim() === "" ? null : Number(target);
    if (!Number.isFinite(f) || f < 3 || f > 8) {
      setFormError("Height feet must be between 3 and 8.");
      return;
    }
    if (!Number.isFinite(i) || i < 0 || i > 11) {
      setFormError("Height inches must be between 0 and 11.");
      return;
    }
    if (w != null && (!Number.isFinite(w) || w < 50 || w > 800)) {
      setFormError("Weight must be between 50 and 800 lb.");
      return;
    }
    if (t != null && (!Number.isFinite(t) || t < 50 || t > 800)) {
      setFormError("Target weight must be between 50 and 800 lb.");
      return;
    }
    setFormError("");
    onUpdateBody({
      heightCm: feetInchesToCm(f, i),
      weightLb: w,
      targetWeightLb: t,
    });
  };

  return (
    <ProPanel title="Height & weight" eyebrow="Your body" dense className="min-h-[220px]">
      <div className="grid grid-cols-3 gap-2 text-center">
        <MetricStat
          label="Height"
          value={
            bodyProfile.heightCm != null
              ? `${heightCmToFeetInches(bodyProfile.heightCm).feet}'${heightCmToFeetInches(bodyProfile.heightCm).inches}"`
              : "—"
          }
        />
        <MetricStat label="Weight" value={bodyProfile.weightLb != null ? `${bodyProfile.weightLb} lb` : "—"} />
        <MetricStat label="BMI" value={bmi != null ? String(bmi) : "—"} />
      </div>

      {weightGoal || bodyProfile.targetWeightLb != null ? (
        <div className="mt-3">
          <div className="mb-1 flex justify-between font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            <span>Goal progress</span>
            <span>
              {weightGoal
                ? `${weightGoal.currentValue ?? bodyProfile.weightLb ?? "—"} → ${weightGoal.targetValue} ${weightGoal.unit}`
                : `target ${bodyProfile.targetWeightLb} lb`}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#C89E67] transition-all duration-700"
              style={{ width: `${progress ?? 12}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="block">
          <span className="font-mono text-[10px] text-zinc-500">Feet</span>
          <input value={feet} onChange={(e) => setFeet(e.target.value)} className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-sm" />
        </label>
        <label className="block">
          <span className="font-mono text-[10px] text-zinc-500">Inches</span>
          <input value={inches} onChange={(e) => setInches(e.target.value)} className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-sm" />
        </label>
        <label className="block">
          <span className="font-mono text-[10px] text-zinc-500">Weight (lb)</span>
          <input value={weight} onChange={(e) => setWeight(e.target.value)} className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-sm" />
        </label>
        <label className="block">
          <span className="font-mono text-[10px] text-zinc-500">Target (lb)</span>
          <input value={target} onChange={(e) => setTarget(e.target.value)} className="mt-1 w-full rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-sm" />
        </label>
      </div>
      {formError ? <p className="mt-2 text-xs text-rose-300">{formError}</p> : null}
      <button
        type="button"
        onClick={save}
        className="mt-2 w-full rounded-md border border-white/15 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:border-[#C89E67]/40 hover:text-[#C89E67]"
      >
        Update body size
      </button>
    </ProPanel>
  );
}

function MetricStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/5 bg-white/[0.02] px-2 py-2">
      <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-0.5 font-mono text-sm tabular-nums text-white">{value}</p>
    </div>
  );
}
