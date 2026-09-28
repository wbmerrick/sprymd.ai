import { Check } from "lucide-react";
import { PAYMENT_TRUST } from "@/config/trustCopy";

type PaymentTrustProps = {
  variant?: "dark" | "light";
  className?: string;
};

/**
 * Compact payment / insurance trust row for hero CTAs and pricing.
 * Copy is editable in `config/trustCopy.ts`.
 */
export default function PaymentTrust({ variant = "dark", className = "" }: PaymentTrustProps) {
  const items = [
    PAYMENT_TRUST.NO_INSURANCE,
    PAYMENT_TRUST.TRANSPARENT_PRICING,
    PAYMENT_TRUST.SIMPLE_PRICE,
  ];
  const ink = variant === "dark" ? "rgba(210,207,194,0.95)" : "hsl(152 18% 28%)";
  const accent = variant === "dark" ? "#C89E67" : "hsl(34 47% 45%)";
  const line = variant === "dark" ? "rgba(38,49,41,1)" : "hsl(44 15% 85%)";
  const bg = variant === "dark" ? "rgba(16,25,21,0.5)" : "hsl(45 30% 97%)";

  return (
    <ul
      className={`flex flex-wrap items-center gap-2 ${className}`}
      aria-label="Payment and insurance"
      style={{ listStyle: "none", margin: 0, padding: 0 }}
    >
      {items.map((label) => (
        <li
          key={label}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{
            border: `1px solid ${line}`,
            background: bg,
            color: ink,
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          <Check size={12} strokeWidth={2.25} color={accent} aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  );
}
