import { isClinicianEmail, isOwnerEmail, isStaffAllowlistEmail } from "@/lib/masterAccount";

/** Post-auth landing path by account role. */
export function postAuthDashboardPath(email?: string | null): string {
  if (isOwnerEmail(email)) return "/master";
  if (isClinicianEmail(email) || isStaffAllowlistEmail(email)) return "/staff";
  return "/dashboard";
}

/** Clinical staff workspace (includes owners who may deep-link to /staff). */
export function isStaffDashboardEmail(email?: string | null): boolean {
  return isClinicianEmail(email);
}

export function isMasterDashboardEmail(email?: string | null): boolean {
  return isOwnerEmail(email);
}
