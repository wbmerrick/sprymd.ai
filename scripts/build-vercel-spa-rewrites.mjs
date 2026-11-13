#!/usr/bin/env node
/**
 * Rebuilds the SPA → /index.html rewrite block in vercel.json from shared/spaRoutes.ts.
 * Run: node scripts/build-vercel-spa-rewrites.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const routesPath = join(root, "shared/spaRoutes.ts");
const vercelPath = join(root, "vercel.json");

const routesSrc = readFileSync(routesPath, "utf8");
const sources = [...routesSrc.matchAll(/source:\s*"([^"]+)"/g)].map((m) => m[1]);
if (sources.length < 10) {
  console.error("Failed to parse SPA_REWRITES from shared/spaRoutes.ts");
  process.exit(1);
}

const spaRewrites = sources.map((source) => ({
  source,
  destination: "/index.html",
}));

const vercel = JSON.parse(readFileSync(vercelPath, "utf8"));
const apiRewrites = (vercel.rewrites || []).filter(
  (r) => typeof r?.source === "string" && r.source.startsWith("/api"),
);
vercel.rewrites = [...apiRewrites, ...spaRewrites];

writeFileSync(vercelPath, `${JSON.stringify(vercel, null, 2)}\n`);
console.log(`Wrote ${spaRewrites.length} SPA rewrites to vercel.json (${apiRewrites.length} api rewrite(s) kept).`);
