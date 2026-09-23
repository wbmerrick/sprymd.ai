import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { SITE_URL } from "./src/lib/seo";
import { SITEMAP_ROUTES } from "./src/seo/routes";

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

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), sitemapPlugin()].filter(Boolean),
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
