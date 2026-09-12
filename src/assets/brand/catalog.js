import imgAlpine from "../sprymd-alpine-atmosphere.webp";
import imgOgShare from "./sprymd-og-share.webp";
import imgPortrait from "./sprymd-alpine-portrait.webp";
import imgCareDawn from "./sprymd-care-dawn.webp";
import imgShopDusk from "./sprymd-shop-dusk.webp";
import imgMarkField from "./sprymd-mark-field.webp";
import imgTnRidge from "./sprymd-tn-ridge.webp";

/**
 * SpryMD brand photography kit — Grok-graded plates for future surfaces.
 * `src` is the Vite-bundled URL. `publicPath` is the static /brand copy
 * for OG tags, email, and CSS that cannot import modules.
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
    publicPath: "/brand/sprymd-care-dawn.webp",
    ratio: "16:9",
    use: "Doctor / PCP, sign-in, about — calmer dawn mist",
  },
  shop: {
    id: "shop",
    src: imgShopDusk,
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
    publicPath: "/brand/sprymd-tn-ridge.webp",
    ratio: "16:9",
    use: "Tennessee service-area and delivery storytelling",
  },
};

export const brandPlateList = Object.values(brandPlates);
