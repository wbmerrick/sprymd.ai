import imgAlpineAtmosphere from "../../assets/sprymd-alpine-atmosphere.webp";

const VARIANTS = {
  site: {
    imgOpacity: 1,
    overlay:
      "linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.12) 38%, rgba(0,0,0,0.40) 100%), radial-gradient(ellipse 60% 42% at 68% 20%, rgba(200, 158, 103,0.18), transparent 56%)",
    fixed: true,
    objectPosition: "center 58%",
  },
  hero: {
    imgOpacity: 1,
    overlay:
      "linear-gradient(105deg, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.22) 48%, rgba(0,0,0,0.18) 100%), radial-gradient(ellipse 55% 40% at 70% 22%, rgba(200, 158, 103,0.16), transparent 58%)",
    fixed: false,
    objectPosition: "center 58%",
  },
  close: {
    imgOpacity: 0.85,
    overlay:
      "radial-gradient(ellipse at center, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.55) 72%)",
    fixed: false,
    objectPosition: "center 58%",
  },
  dashboard: {
    imgOpacity: 0.42,
    overlay:
      "linear-gradient(180deg, rgba(5,5,5,0.42) 0%, rgba(5,5,5,0.72) 100%), radial-gradient(ellipse 70% 40% at 50% -10%, rgba(200, 158, 103,0.12), transparent 55%)",
    fixed: false,
    objectPosition: "center 58%",
  },
};

/**
 * SpryMD alpine lake atmosphere — Grok-customized brand photography
 * (coral alpenglow, navy water) used as a cinematic backdrop.
 */
export default function AlpineAtmosphere({ variant = "site", className = "", locked }) {
  const spec = VARIANTS[variant] || VARIANTS.site;
  const isFixed = locked ?? spec.fixed;
  const positionClass = isFixed ? "fixed" : "absolute";

  return (
    <div
      className={`${positionClass} inset-0 z-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <img
        src={imgAlpineAtmosphere}
        alt=""
        className="earth-distant absolute inset-0 h-full w-full"
        style={{ opacity: spec.imgOpacity, objectPosition: spec.objectPosition || "center 46%" }}
      />
      <div className="absolute inset-0" style={{ background: spec.overlay }} />
    </div>
  );
}
