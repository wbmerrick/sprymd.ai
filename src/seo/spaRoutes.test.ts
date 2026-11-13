import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  FORBIDDEN_SPA_CATCHALL_SOURCES,
  SPA_REWRITES,
} from "@shared/spaRoutes";

const root = join(__dirname, "../..");

describe("SPA routes / real HTTP 404", () => {
  it("lists the App.tsx surfaces that must soft-rewrite to index.html", () => {
    const sources = SPA_REWRITES.map((r) => r.source);
    expect(sources).toContain("/");
    expect(sources).toContain("/care/:slug");
    expect(sources).toContain("/checkout");
    expect(sources).toContain("/ops/:appointmentId");
    expect(sources).toContain("/provider/notes");
    expect(sources).toContain("/visit/:appointmentId");
  });

  it("vercel.json rewrites match shared/spaRoutes and have no catch-all soft-404", () => {
    const vercel = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8")) as {
      rewrites: { source: string; destination: string }[];
    };
    const sources = vercel.rewrites.map((r) => r.source);

    for (const forbidden of FORBIDDEN_SPA_CATCHALL_SOURCES) {
      expect(sources, `soft-404 catch-all must not be present: ${forbidden}`).not.toContain(
        forbidden,
      );
    }

    for (const route of SPA_REWRITES) {
      const hit = vercel.rewrites.find((r) => r.source === route.source);
      expect(hit, `missing rewrite for ${route.source}`).toBeTruthy();
      expect(hit?.destination).toBe("/index.html");
    }

    const spaCount = vercel.rewrites.filter((r) => r.destination === "/index.html").length;
    expect(spaCount).toBe(SPA_REWRITES.length);
  });

  it("ships a static 404.html for Vercel to return with HTTP 404", () => {
    const path = join(root, "public/404.html");
    expect(existsSync(path)).toBe(true);
    const html = readFileSync(path, "utf8");
    expect(html).toMatch(/Page not found/i);
    expect(html).toMatch(/noindex/);
    expect(html).toMatch(/Back to home/);
  });

  it("does not Netlify-style soft-404 every path via public/_redirects", () => {
    const redirects = readFileSync(join(root, "public/_redirects"), "utf8");
    expect(redirects).not.toMatch(/^\s*\/\*\s+\/index\.html\s+200\s*$/m);
  });
});
