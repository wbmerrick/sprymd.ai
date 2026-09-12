import { brandPlates } from "../../assets/brand/catalog";

const VARIANTS = {
  site: {
    imgOpacity: 1,
    overlay:
      "linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.12) 38%, rgba(0,0,0,0.40) 100%), radial-gradient(ellipse 60% 42% at 68% 20%, rgba(232,119,34,0.18), transparent 56%)",
    fixed: true,
    objectPosition: "center 58%",
  },
  hero: {
    imgOpacity: 1,
    overlay:
      "linear-gradient(105deg, rgba(0,0,0,0.58) 0%, rgba(0,0,0,0.22) 48%, rgba(0,0,0,0.18) 100%), radial-gradient(ellipse 55% 40% at 70% 22%, rgba(232,119,34,0.16), transparent 58%)",
    fixed: false,
    objectPosition: "center 58%",
  },
  panel: {
    imgOpacity: 0.88,
    overlay:
      "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.62) 100%), radial-gradient(ellipse at 70% 20%, rgba(232,119,34,0.14), transparent 55%)",
    fixed: false,
    objectPosition: "center 46%",
  },
  banner: {
    imgOpacity: 0.7,
    overlay:
      "linear-gradient(100deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.42) 55%, rgba(0,0,0,0.22) 100%)",
    fixed: false,
    objectPosition: "center 40%",
  },
  wash: {
    imgOpacity: 0.34,
    overlay:
      "linear-gradient(180deg, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.82) 100%), radial-gradient(ellipse 70% 40% at 50% -10%, rgba(232,119,34,0.10), transparent 55%)",
    fixed: false,
    objectPosition: "center 50%",
  },
};

/**
 * Reusable SpryMD atmosphere layer. Pick a catalog `plate` and a `variant`
 * overlay so future screens can reuse the kit without one-off CSS.
 */
export default function BrandAtmosphere({
  plate = "alpine",
  variant = "site",
  className = "",
  locked,
}) {
  const asset = brandPlates[plate] || brandPlates.alpine;
  const spec = VARIANTS[variant] || VARIANTS.site;
  const isFixed = locked ?? spec.fixed;
  const positionClass = isFixed ? "fixed" : "absolute";

  return (
    <div
      className={`${positionClass} inset-0 z-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
      data-brand-plate={asset.id}
    >
      <img
        src={asset.src}
        alt=""
        className="earth-distant absolute inset-0 h-full w-full"
        style={{ opacity: spec.imgOpacity, objectPosition: spec.objectPosition }}
      />
      <div className="absolute inset-0" style={{ background: spec.overlay }} />
    </div>
  );
}
