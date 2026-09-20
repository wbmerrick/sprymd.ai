import { Link } from "react-router-dom";
import { StatusChip } from "@/components/dashboard/StatusChip";
import { formatRelative } from "@/lib/dashboardFormat";
import type { MessageThread } from "@/types/dashboard";

interface MessagesListProps {
  messages: MessageThread[];
}

export function MessagesList({ messages }: MessagesListProps) {
  return (
    <ul className="space-y-2" aria-label="Support messages">
      {messages.map((m) => (
        <li key={m.id}>
          <Link
            to="/dashboard/support"
            className="block rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#C89E67]/35"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-white">{m.subject}</h3>
              <StatusChip status={m.status} />
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{m.preview}</p>
            <time className="mt-2 block text-[11px] text-zinc-600" dateTime={m.updatedAt}>
              {formatRelative(m.updatedAt)}
            </time>
          </Link>
        </li>
      ))}
    </ul>
  );
}
