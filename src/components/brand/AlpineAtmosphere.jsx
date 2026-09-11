import imgAlpineAtmosphere from "../../assets/sprymd-alpine-atmosphere.webp";

const VARIANTS = {
  site: {
    imgOpacity: 0.62,
    overlay:
      "linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.58) 42%, rgba(0,0,0,0.86) 100%), radial-gradient(ellipse 70% 45% at 72% 18%, rgba(232,119,34,0.16), transparent 52%)",
    fixed: true,
  },
  hero: {
    imgOpacity: 0.92,
    overlay:
      "linear-gradient(105deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.46) 48%, rgba(0,0,0,0.58) 100%), radial-gradient(ellipse 55% 40% at 70% 22%, rgba(232,119,34,0.18), transparent 58%)",
    fixed: false,
  },
  close: {
    imgOpacity: 0.55,
    overlay:
      "radial-gradient(ellipse at center, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.86) 72%)",
    fixed: false,
  },
  dashboard: {
    imgOpacity: 0.26,
    overlay:
      "linear-gradient(180deg, rgba(5,5,5,0.66) 0%, rgba(5,5,5,0.90) 100%), radial-gradient(ellipse 70% 40% at 50% -10%, rgba(232,119,34,0.10), transparent 55%)",
    fixed: false,
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
        style={{ opacity: spec.imgOpacity, objectPosition: "center 32%" }}
      />
      <div className="absolute inset-0" style={{ background: spec.overlay }} />
    </div>
  );
}
