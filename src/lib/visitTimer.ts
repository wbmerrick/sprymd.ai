/** Session clock for a two-party telehealth visit. */

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(remainder).padStart(2, "0");
  if (hours > 0) return `${hours}:${mm}:${ss}`;
  return `${mm}:${ss}`;
}

/**
 * Duration counts only after both parties have joined.
 * `bothJoinedAt` stays null until that moment, so a solo wait logs nothing.
 */
export function sessionDurationSeconds(
  bothJoinedAt: number | null,
  endAt: number | null,
  now: number,
): number {
  if (bothJoinedAt == null) return 0;
  const end = endAt ?? now;
  return Math.max(0, Math.floor((end - bothJoinedAt) / 1000));
}

export function shouldStartSessionClock(
  localJoined: boolean,
  remoteJoined: boolean,
  bothJoinedAt: number | null,
): boolean {
  return localJoined && remoteJoined && bothJoinedAt == null;
}
