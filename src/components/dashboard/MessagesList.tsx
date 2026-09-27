import { StatusChip } from "@/components/dashboard/StatusChip";
import { UrgencyBadge } from "@/components/dashboard/UrgencyBadge";
import { formatRelative } from "@/lib/dashboardFormat";
import type { MessageThread } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface MessagesListProps {
  messages: MessageThread[];
  selectedId?: string | null;
  onSelect?: (thread: MessageThread) => void;
}

export function MessagesList({ messages, selectedId, onSelect }: MessagesListProps) {
  if (messages.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-zinc-500">
        No messages yet. Start a conversation with your care team above.
      </p>
    );
  }

  return (
    <ul className="space-y-2" aria-label="Support messages">
      {messages.map((m) => (
        <li key={m.id}>
          <button
            type="button"
            onClick={() => onSelect?.(m)}
            className={cn(
              "w-full rounded-2xl border p-4 text-left transition",
              selectedId === m.id
                ? "border-[#C89E67]/50 bg-[#C89E67]/10"
                : "border-white/10 bg-white/[0.03] hover:border-[#C89E67]/35",
              m.urgency === "urgent" && selectedId !== m.id && "border-l-2 border-l-rose-400",
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-white">{m.subject}</h3>
              <div className="flex flex-wrap items-center gap-1.5">
                <UrgencyBadge urgency={m.urgency} />
                <StatusChip status={m.status} />
              </div>
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{m.preview}</p>
            <time className="mt-2 block text-[11px] text-zinc-600" dateTime={m.updatedAt}>
              {formatRelative(m.updatedAt)}
            </time>
          </button>
        </li>
      ))}
    </ul>
  );
}
