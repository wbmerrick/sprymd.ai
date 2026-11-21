import { describe, expect, it } from "vitest";
import {
  isLocalAccountFallbackEnabled,
  localAuthDisabledError,
} from "@/lib/localAccountGate";

describe("isLocalAccountFallbackEnabled", () => {
  it("allows local accounts outside production", () => {
    expect(isLocalAccountFallbackEnabled({ prod: false })).toBe(true);
    expect(isLocalAccountFallbackEnabled({ prod: false, search: "" })).toBe(
      true,
    );
  });

  it("blocks local accounts in production without demo", () => {
    expect(isLocalAccountFallbackEnabled({ prod: true, search: "" })).toBe(
      false,
    );
    expect(
      isLocalAccountFallbackEnabled({ prod: true, search: "?auth=1" }),
    ).toBe(false);
  });

  it("allows local accounts in production when ?demo=1", () => {
    expect(
      isLocalAccountFallbackEnabled({ prod: true, search: "?demo=1" }),
    ).toBe(true);
    expect(
      isLocalAccountFallbackEnabled({
        prod: true,
        search: "/ops?view=todo&demo=1",
      }),
    ).toBe(true);
  });
});

describe("localAuthDisabledError", () => {
  it("sets a stable error code for UI handling", () => {
    const err = localAuthDisabledError("Local sign-in") as Error & {
      code?: string;
    };
    expect(err.code).toBe("local_auth_disabled");
    expect(err.message).toMatch(/production/i);
    expect(err.message).toMatch(/SpryMD Auth/i);
  });
});
