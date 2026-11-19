import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getServiceTier } from "../../api/_lib/serviceTiers";
import * as apiVideoRoom from "../../api/_lib/videoRoom";
import { EVALUATION_PRODUCT } from "../../shared/program";
import * as sharedVideoRoom from "../../shared/videoRoom";

/**
 * /api builds as CommonJS (api/package.json) and /shared builds as ESM (root
 * package.json). An import from /api into /shared compiles fine but crashes the
 * deployed function at load with ERR_REQUIRE_ESM, which took down checkout, the
 * Stripe webhook and ops reconcile. These tests keep that from coming back.
 */
function tsFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return tsFiles(path);
    return path.endsWith(".ts") ? [path] : [];
  });
}

describe("api / shared module boundary", () => {
  it("no file under /api imports from /shared", () => {
    const offenders = tsFiles(join(process.cwd(), "api")).filter((file) =>
      /from\s+["'](?:\.\.\/)+shared\//.test(readFileSync(file, "utf8")),
    );
    expect(offenders).toEqual([]);
  });

  it("the api evaluation tier matches shared/program.ts", () => {
    const tier = getServiceTier("evaluation");
    expect(tier?.name).toBe(EVALUATION_PRODUCT.name);
    expect(tier?.description).toBe(EVALUATION_PRODUCT.description);
    expect(tier?.amountCents).toBe(EVALUATION_PRODUCT.amountCents);
  });

  it("the api video room rules match shared/videoRoom.ts", () => {
    const id = "3F2504E0-4F89-41D3-9A0C-0305E82C3301";
    for (const value of [id, "not-an-id", ""]) {
      expect(apiVideoRoom.isAppointmentId(value)).toBe(sharedVideoRoom.isAppointmentId(value));
    }
    expect(apiVideoRoom.visitRoomName(id)).toBe(sharedVideoRoom.visitRoomName(id));
    expect(apiVideoRoom.cleanDisplayName("  Pat\u0007 ", "Guest")).toBe(
      sharedVideoRoom.cleanDisplayName("  Pat\u0007 ", "Guest"),
    );
    const twilio = { TWILIO_ACCOUNT_SID: "a", TWILIO_API_KEY: "b", TWILIO_API_SECRET: "c" };
    for (const env of [
      {},
      { DAILY_API_KEY: "k" },
      twilio,
      { DAILY_API_KEY: "k", ...twilio },
      { VIDEO_VENDOR: "twilio", DAILY_API_KEY: "k" },
      { VIDEO_VENDOR: "off", DAILY_API_KEY: "k" },
    ]) {
      expect(apiVideoRoom.selectLiveVendor(env)).toBe(sharedVideoRoom.selectLiveVendor(env));
    }
  });
});
