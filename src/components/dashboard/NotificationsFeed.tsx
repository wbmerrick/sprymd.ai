import { FlaskConical, MessageSquare, Pill, Truck, X } from "lucide-react";
import type { NotificationItem } from "@/types/dashboard";
import { formatRelative } from "@/lib/dashboardFormat";
import { Link } from "react-router-dom";

const ICONS: Record<string, typeof Pill> = {
  pill: Pill,
  truck: Truck,
  message: MessageSquare,
  lab: FlaskConical,
};

interface NotificationsFeedProps {
  items: NotificationItem[];
  onClear: () => void;
  onDismiss: (id: string) => void;
}

export function NotificationsFeed({ items, onClear, onDismiss }: NotificationsFeedProps) {
  const visible = items.filter((n) => !n.dismissed);

  return (
    <section aria-labelledby="notifications-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="notifications-heading" className="text-lg font-semibold text-white font-display">
          Notifications
        </h2>
        <div className="flex items-center gap-3 text-sm">
          {visible.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Clear all
            </button>
          )}
          <Link to="/dashboard/support" className="text-[#C89E67] hover:underline">
            See all
          </Link>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-6 text-sm text-zinc-500">
          You&apos;re all caught up. New care updates will show here.
        </p>
      ) : (
        <ul className="space-y-2">
          {visible.map((item) => {
            const Icon = ICONS[item.icon] || Pill;
            return (
              <li
                key={item.id}
                className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C89E67]/15 text-[#C89E67]">
                  <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-medium text-white">{item.title}</h3>
                    <button
                      type="button"
                      onClick={() => onDismiss(item.id)}
                      className="rounded-full p-1 text-zinc-500 hover:bg-white/5 hover:text-white"
                      aria-label={`Dismiss ${item.title}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-zinc-400">{item.description}</p>
                  <time className="mt-2 block text-[11px] uppercase tracking-wide text-zinc-600" dateTime={item.timestamp}>
                    {formatRelative(item.timestamp)}
                  </time>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
