import { cn } from "@/lib/utils";

type MedicalDisclaimerProps = {
  variant: "marketing" | "portal";
  className?: string;
};

const marketingCopy =
  "SpryMD.ai is a telehealth platform. Content on this site is for general information only and is not medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with questions about a medical condition.";

const portalCopy =
  "Telehealth services are provided by William Merrick, DO, a licensed physician in Tennessee. Completing an intake or payment does not guarantee a prescription; treatment decisions are made solely at the physician's discretion. This service is not for emergencies — call 911 or go to the nearest emergency department for urgent symptoms.";

const MedicalDisclaimer = ({ variant, className }: MedicalDisclaimerProps) => (
  <p
    className={cn(
      "font-body text-muted-foreground italic",
      variant === "marketing" ? "text-xs text-center max-w-2xl mx-auto" : "text-[11px] text-center",
      className,
    )}
    role="note"
  >
    {variant === "marketing" ? marketingCopy : portalCopy}
  </p>
);

export default MedicalDisclaimer;
