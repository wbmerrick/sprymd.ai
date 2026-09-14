/**
 * Typed feature flags for SpryMD.
 *
 * Every flag defaults to OFF. A flag is enabled only when its environment
 * variable is the exact string "true" — values like "TRUE", "1", "yes", or
 * " true" are intentionally treated as off so a typo can never accidentally
 * enable an unfinished feature in production.
 *
 * Flags are read from `import.meta.env` at module evaluation time; tests can
 * re-evaluate them with `vi.resetModules()` + `vi.stubEnv()` + dynamic import.
 */
export const flags = {
  /** Crypto payment rail (not yet implemented — keep off in production). */
  cryptoPayments: import.meta.env.VITE_CRYPTO_PAYMENTS_ENABLED === "true",
  /** Weight-loss treatment line (pending pharmacy partner). */
  weightLossLine: import.meta.env.VITE_FEATURE_WEIGHT_LOSS === "true",
  /** Secure patient–provider messaging. */
  messaging: import.meta.env.VITE_FEATURE_MESSAGING === "true",
  /** Prescription refill requests. */
  refills: import.meta.env.VITE_FEATURE_REFILLS === "true",
} as const;

/** Name of a known feature flag. */
export type FlagName = keyof typeof flags;

/**
 * Look up a feature flag by name.
 *
 * @param name - The flag to check.
 * @returns `true` only if the corresponding env var is exactly "true".
 */
export function getFlag(name: FlagName): boolean {
  return flags[name];
}
