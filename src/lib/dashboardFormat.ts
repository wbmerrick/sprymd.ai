import { format, formatDistanceToNow, parseISO, isValid } from "date-fns";

export function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = parseISO(iso);
  if (!isValid(d)) return "—";
  return format(d, "MMM d, yyyy");
}

export function formatDateRange(start: string, end: string): string {
  return `${formatShortDate(start)} – ${formatShortDate(end)}`;
}

export function formatRelative(iso: string): string {
  const d = parseISO(iso);
  if (!isValid(d)) return "";
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}
