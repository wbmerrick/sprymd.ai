import imgAlpine from "../sprymd-alpine-atmosphere.webp";
import imgOgShare from "./sprymd-og-share.webp";
import imgPortrait from "./sprymd-alpine-portrait.webp";
import imgCareDawn from "./sprymd-care-dawn.webp";
import imgCareDawnSmall from "./sprymd-care-dawn-960.webp";
import imgShopDusk from "./sprymd-shop-dusk.webp";
import imgShopDuskSmall from "./sprymd-shop-dusk-960.webp";
import imgMarkField from "./sprymd-mark-field.webp";
import imgTnRidge from "./sprymd-tn-ridge.webp";
import imgTnRidgeSmall from "./sprymd-tn-ridge-960.webp";
import imgHawaiiMark from "./sprymd-hawaii-mark.webp";
import imgHawaiiLagoon from "./sprymd-hawaii-lagoon.webp";
import imgHawaiiPortrait from "./sprymd-hawaii-portrait.webp";
import imgHawaiiDawn from "./sprymd-hawaii-dawn.webp";
import imgHawaiiDawnPortrait from "./sprymd-hawaii-dawn-portrait.webp";

/**
 * SpryMD brand photography kit — Grok-graded plates for future surfaces.
 * `src` is the Vite-bundled URL. `publicPath` is the static /brand copy
 * for OG tags, email, and CSS that cannot import modules. `srcSmall` is an
 * optional 960px rendition for narrow viewports (srcset / mobile CSS).
 */
export const brandPlates = {
  alpine: {
    id: "alpine",
    src: imgAlpine,
    publicPath: "/brand/sprymd-alpine-atmosphere.webp",
    ratio: "16:9",
    use: "Landing hero, close CTA, and dashboard atmosphere",
  },
  og: {
    id: "og",
    src: imgOgShare,
    publicPath: "/brand/sprymd-og-share.webp",
    ratio: "16:9",
    use: "Open Graph and Twitter share card — left third is shadowed for type",
  },
  portrait: {
    id: "portrait",
    src: imgPortrait,
    publicPath: "/brand/sprymd-alpine-portrait.webp",
    ratio: "9:16",
    use: "Mobile hero, stories, splash, and app lock screens",
  },
  care: {
    id: "care",
    src: imgCareDawn,
    srcSmall: imgCareDawnSmall,
    publicPath: "/brand/sprymd-care-dawn.webp",
    ratio: "16:9",
    use: "Doctor / PCP, sign-in, about — calmer dawn mist",
  },
  shop: {
    id: "shop",
    src: imgShopDusk,
    srcSmall: imgShopDuskSmall,
    publicPath: "/brand/sprymd-shop-dusk.webp",
    ratio: "16:9",
    use: "Marketplace and shop banners — warmer dusk",
  },
  mark: {
    id: "mark",
    src: imgMarkField,
    publicPath: "/brand/sprymd-mark-field.webp",
    ratio: "1:1",
    use: "App-icon field, avatar, PWA, and square social crops",
  },
  tn: {
    id: "tn",
    src: imgTnRidge,
    srcSmall: imgTnRidgeSmall,
    publicPath: "/brand/sprymd-tn-ridge.webp",
    ratio: "16:9",
    use: "Tennessee service-area and delivery storytelling",
  },
  hawaii: {
    id: "hawaii",
    src: imgHawaiiMark,
    publicPath: "/brand/sprymd-hawaii-mark.webp",
    ratio: "1:1",
    use: "Paradise mark field — Hawaiian remake of the peak-and-reflection emblem",
  },
  hawaiiWide: {
    id: "hawaiiWide",
    src: imgHawaiiLagoon,
    publicPath: "/brand/sprymd-hawaii-lagoon.webp",
    ratio: "16:9",
    use: "Dusk paradise still — catalog reuse for banners and close CTA",
  },
  hawaiiPortrait: {
    id: "hawaiiPortrait",
    src: imgHawaiiPortrait,
    publicPath: "/brand/sprymd-hawaii-portrait.webp",
    ratio: "9:16",
    use: "Mobile stories and splash — Hawaiian peak-and-lagoon",
  },
  hawaiiDawn: {
    id: "hawaiiDawn",
    src: imgHawaiiDawn,
    publicPath: "/brand/sprymd-hawaii-dawn.webp",
    ratio: "16:9",
    use: "Site background — golden dawn peak with turquoise lagoon reflection",
  },
  hawaiiDawnPortrait: {
    id: "hawaiiDawnPortrait",
    src: imgHawaiiDawnPortrait,
    publicPath: "/brand/sprymd-hawaii-dawn-portrait.webp",
    ratio: "9:16",
    use: "Mobile stories and splash — uploaded dawn peak-and-reflection still",
  },
};

export const brandPlateList = Object.values(brandPlates);
