import { defineConfig, type Plugin } from "vite";
import type { OutputBundle, OutputChunk } from "rollup";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { getSiteBrand, resolveSiteBrandId } from "./shared/siteBrand";
import { SITE_URL } from "./src/lib/seo";
import { SITEMAP_ROUTES } from "./src/seo/routes";

const BUILD_BRAND = getSiteBrand(resolveSiteBrandId(process.env.VITE_SITE_BRAND));

/**
 * Route prefix → lazily loaded page module (see React.lazy calls in src/App.tsx).
 * Deep links to these routes get <link rel="modulepreload"> hints for their
 * chunks so the page code downloads alongside the app shell instead of after it.
 */
const ROUTE_CHUNKS: Record<string, string> = {
  "/checkout": "src/pages/CashPayCheckout.tsx",
  "/checkout/success": "src/pages/CheckoutSuccess.tsx",
  "/intake": "src/pages/Intake.tsx",
  "/dashboard": "src/pages/dashboard/DashboardLayout.tsx",
  "/provider/notes": "src/pages/ProviderNote.tsx",
  "/visit": "src/pages/VisitRoom.tsx",
};

function collectChunkFiles(bundle: OutputBundle, chunk: OutputChunk, acc = new Set<string>()): Set<string> {
  if (acc.has(chunk.fileName)) return acc;
  acc.add(chunk.fileName);
  for (const imported of chunk.imports) {
    const dep = bundle[imported];
    if (dep && dep.type === "chunk") collectChunkFiles(bundle, dep, acc);
  }
  return acc;
}

function routePreloadPlugin(): Plugin {
  return {
    name: "sprymd-route-preload",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        const bundle = ctx.bundle;
        if (!bundle) return html;
        const chunks = Object.values(bundle).filter((item): item is OutputChunk => item.type === "chunk");
        // Vite already emits modulepreload tags for the entry's static graph.
        const alreadyPreloaded = new Set(chunks.filter((c) => c.isEntry).flatMap((c) => [c.fileName, ...c.imports]));
        // Rollup drops facadeModuleId when it merges several dynamic entries into
        // one chunk, so fall back to the chunk that contains the page module.
        const chunkForModule = (relativeId: string): OutputChunk | undefined => {
          const id = path.resolve(__dirname, relativeId);
          return (
            chunks.find((c) => c.facadeModuleId === id) ??
            chunks.find((c) => c.isDynamicEntry && c.moduleIds.includes(id)) ??
            chunks.find((c) => c.moduleIds.includes(id))
          );
        };
        const routeFiles: Record<string, string[]> = {};
        for (const [route, moduleId] of Object.entries(ROUTE_CHUNKS)) {
          const chunk = chunkForModule(moduleId);
          if (!chunk) continue;
          routeFiles[route] = [...collectChunkFiles(bundle, chunk)].filter((f) => !alreadyPreloaded.has(f)).map((f) => `/${f}`);
        }
        const script =
          `<script>(function(){var m=${JSON.stringify(routeFiles)};` +
          `var p=location.pathname.replace(/\\/+$/,"")||"/";` +
          `var k=Object.keys(m).sort(function(a,b){return b.length-a.length}).find(function(r){return p===r||p.indexOf(r+"/")===0});` +
          `(m[k]||[]).forEach(function(h){var l=document.createElement("link");l.rel="modulepreload";l.href=h;document.head.appendChild(l)})})();</script>`;
        return html.replace("</head>", `    ${script}\n  </head>`);
      },
    },
  };
}

/** Emits sitemap.xml from the indexable routes in src/seo/routes.ts at build time. */
function sitemapPlugin(): Plugin {
  return {
    name: "sprymd-sitemap",
    apply: "build",
    generateBundle() {
      const urls = SITEMAP_ROUTES.map((route) => {
        const loc = route.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${route.path}`;
        const extra = [
          route.changefreq ? `    <changefreq>${route.changefreq}</changefreq>` : null,
          route.priority != null ? `    <priority>${route.priority.toFixed(1)}</priority>` : null,
        ]
          .filter(Boolean)
          .join("\n");
        return `  <url>\n    <loc>${loc}</loc>\n${extra}\n  </url>`;
      });
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
      this.emitFile({ type: "asset", fileName: "sitemap.xml", source: xml });
    },
  };
}

/** Rewrites static index.html meta for GLPTN (and future) brand builds. */
function brandHtmlPlugin(): Plugin {
  return {
    name: "site-brand-html",
    transformIndexHtml(html) {
      if (BUILD_BRAND.id === "sprymd") return html;
      const og = `${BUILD_BRAND.siteUrl}${BUILD_BRAND.ogImagePath}`;
      return html
        .replaceAll("https://www.sprymd.ai", BUILD_BRAND.siteUrl)
        .replaceAll("SpryMD — Telehealth for Tennessee. Feel better. Stay strong.", BUILD_BRAND.defaultTitle)
        .replaceAll(
          "Licensed Tennessee doctors online for weight loss, ED, low T, sleep, mood, and primary care. Private visits, clear plans, medicine shipped to your door.",
          BUILD_BRAND.defaultDescription,
        )
        .replaceAll('content="SpryMD"', `content="${BUILD_BRAND.name}"`)
        .replaceAll('"name": "SpryMD"', `"name": "${BUILD_BRAND.name}"`)
        .replaceAll('"alternateName": "SpryMD.ai"', `"alternateName": "${BUILD_BRAND.name}"`)
        .replaceAll("support@sprymd.ai", BUILD_BRAND.supportEmail)
        .replaceAll("https://www.sprymd.ai/brand/sprymd-og-share.jpg", og)
        .replaceAll(
          "SpryMD — sunlit alpine peaks reflected in a dark teal lake",
          BUILD_BRAND.ogImageAlt,
        );
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: true,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    brandHtmlPlugin(),
    sitemapPlugin(),
    routePreloadPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  build: {
    rollupOptions: {
      output: {
        // Keep long-lived vendor code in its own cacheable chunks so marketing
        // copy changes do not invalidate React or the Supabase client.
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-supabase": ["@supabase/supabase-js"],
        },
      },
    },
  },
}));
