import { cn } from "@/lib/utils";

interface TabItem {
  id: string;
  label: string;
}

interface SimpleTabsProps {
  tabs: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function SimpleTabs({ tabs, activeId, onChange, className }: SimpleTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Orders views"
      className={cn("flex gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1", className)}
    >
      {tabs.map((tab) => {
        const selected = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            id={`tab-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex-1 rounded-full px-4 py-2 text-sm font-medium transition",
              selected ? "bg-white text-black" : "text-zinc-400 hover:text-white",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
