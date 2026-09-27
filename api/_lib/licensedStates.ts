/** Mirrored from /shared for Vercel API bundling — keep in sync with shared/. */
import { stateName } from "./usStates";

/**
 * States where a SpryMD provider may see a patient who is physically located
 * there at the time of the visit. Tennessee matches the current clinical
 * licensing claim on the site. Add a code only when a license is on file.
 */
export const LICENSED_STATE_CODES = ["TN"] as const;

export type LicensedStateCode = (typeof LICENSED_STATE_CODES)[number];

export function isLicensedState(code: string): boolean {
  const normalized = code.trim().toUpperCase();
  return (LICENSED_STATE_CODES as readonly string[]).includes(normalized);
}

export function licensedStateNames(): string[] {
  return LICENSED_STATE_CODES.map((code) => stateName(code) ?? code);
}
