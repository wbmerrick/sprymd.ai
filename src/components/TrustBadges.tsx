import { useEffect } from "react";
import { Lock, ShieldCheck, UserCheck, EyeOff, type LucideIcon } from "lucide-react";
import { COMPLIANCE } from "@/config/compliance";

type Badge = {
  flag: boolean;
  label: string;
  icon: LucideIcon;
  /** Official LegitScript seal slot — never a homemade image. */
  legitScriptSlot?: boolean;
};

const BADGES: Badge[] = [
  { flag: COMPLIANCE.HIPAA_COMPLIANT, label: "HIPAA-Compliant Platform", icon: ShieldCheck },
  { flag: COMPLIANCE.SECURE_CHECKOUT, label: "Secure, Encrypted Checkout", icon: Lock },
  { flag: COMPLIANCE.CONFIDENTIAL, label: "100% Confidential", icon: EyeOff },
  { flag: COMPLIANCE.LICENSED_PROVIDERS, label: "Licensed U.S. Providers", icon: UserCheck },
  {
    flag: COMPLIANCE.LEGITSCRIPT_CERTIFIED,
    label: "LegitScript Certified",
    icon: ShieldCheck,
    legitScriptSlot: true,
  },
];

type TrustBadgesProps = {
  /** Visual variant for dark marketing surfaces vs light pages. */
  variant?: "dark" | "light";
  className?: string;
  /** Optional aria-label for the badge group. */
  "aria-label"?: string;
};

/**
 * Compliance trust badges. Each badge renders only when its flag in
 * `config/compliance.ts` is true. LegitScript uses the official embed script
 * slot when certified — never a self-made seal image.
 */
export default function TrustBadges({
  variant = "dark",
  className = "",
  "aria-label": ariaLabel = "Trust and compliance",
}: TrustBadgesProps) {
  const visible = BADGES.filter((b) => b.flag);
  const legitScript = visible.find((b) => b.legitScriptSlot);
  const ink = variant === "dark" ? "rgba(244,241,232,0.78)" : "hsl(152 18% 20%)";
  const line = variant === "dark" ? "rgba(38,49,41,1)" : "hsl(44 15% 85%)";
  const bg = variant === "dark" ? "rgba(16,25,21,0.65)" : "hsl(45 30% 97%)";

  useEffect(() => {
    if (!legitScript || !COMPLIANCE.LEGITSCRIPT_SEAL_SCRIPT_URL) return;
    const id = "legitscript-seal-script";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.src = COMPLIANCE.LEGITSCRIPT_SEAL_SCRIPT_URL;
    script.async = true;
    document.body.appendChild(script);
  }, [legitScript]);

  if (visible.length === 0) return null;

  return (
    <ul
      className={`flex flex-wrap items-center gap-2 ${className}`}
      aria-label={ariaLabel}
      style={{ listStyle: "none", margin: 0, padding: 0 }}
    >
      {visible.map(({ label, icon: Icon, legitScriptSlot }) => (
        <li key={label}>
          {legitScriptSlot ? (
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
              style={{ border: `1px solid ${line}`, background: bg, color: ink, fontSize: 12 }}
              data-legitscript-seal
            >
              {/* Official LegitScript seal mounts here when LEGITSCRIPT_SEAL_SCRIPT_URL is set. */}
              <span className="sr-only">LegitScript Certified</span>
              <Icon size={13} strokeWidth={1.75} aria-hidden="true" />
              <span>{label}</span>
            </div>
          ) : (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{
                border: `1px solid ${line}`,
                background: bg,
                color: ink,
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: "0.01em",
              }}
            >
              <Icon size={13} strokeWidth={1.75} aria-hidden="true" />
              {label}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
