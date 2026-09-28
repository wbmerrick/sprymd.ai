import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ProPanel({
  title,
  eyebrow,
  action,
  children,
  className,
  dense,
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  dense?: boolean;
}) {
  return (
    <section
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-[#0B0B0C]/90",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">{eyebrow}</p>
          ) : null}
          <h2
            className="truncate text-sm font-semibold text-white font-display"
          >
            {title}
          </h2>
        </div>
        {action}
      </header>
      <div className={cn("min-h-0 flex-1 overflow-auto", dense ? "p-2" : "p-3")}>{children}</div>
    </section>
  );
}
