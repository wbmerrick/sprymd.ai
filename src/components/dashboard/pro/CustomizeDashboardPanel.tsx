import { DEFAULT_DASHBOARD_WIDGETS, type DashboardLayoutConfig, type DashboardWidgetId } from "@/types/dashboard";
import { cn } from "@/lib/utils";

const PRESETS: { id: DashboardLayoutConfig["preset"]; label: string; hint: string }[] = [
  { id: "care_simple", label: "Care", hint: "Chart, actions, care plans" },
  { id: "clinical_terminal", label: "Full", hint: "Every panel" },
  { id: "device_ops", label: "Devices", hint: "Devices, body, readings" },
  { id: "custom", label: "Custom", hint: "Pick widgets yourself" },
];

const WIDGET_LABELS: Record<DashboardWidgetId, string> = {
  ticker: "Live numbers bar",
  chart: "Body readings chart",
  devices: "Your devices",
  actions: "Quick actions",
  body: "Height & weight",
  readings: "Recent readings",
  care: "Care plans",
  shipments: "Shipments",
};

export function CustomizeDashboardPanel({
  layout,
  onChange,
  onClose,
}: {
  layout: DashboardLayoutConfig;
  onChange: (patch: Partial<DashboardLayoutConfig>) => void;
  onClose: () => void;
}) {
  const widgets = layout.widgets?.length ? layout.widgets : DEFAULT_DASHBOARD_WIDGETS;
  const toggle = (id: DashboardWidgetId) => {
    const next = widgets.includes(id) ? widgets.filter((w) => w !== id) : [...widgets, id];
    onChange({ preset: "custom", widgets: next.length ? next : ["chart", "actions"] });
  };

  return (
    <div className="rounded-lg border border-white/10 bg-[#0B0B0C] p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#C89E67]">Your account</p>
          <h2 className="text-lg font-semibold text-white font-display">
            Customize dashboard
          </h2>
          <p className="mt-1 text-sm text-zinc-400">Saved to your account. Choose a layout or toggle panels.</p>
        </div>
        <button type="button" onClick={onClose} className="rounded px-2 py-1 text-xs text-zinc-400 hover:text-white">
          Close
        </button>
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() =>
              onChange({
                preset: p.id,
                widgets:
                  p.id === "care_simple"
                    ? ["ticker", "chart", "actions", "care", "shipments"]
                    : p.id === "device_ops"
                      ? ["ticker", "chart", "devices", "actions", "body", "readings"]
                      : p.id === "clinical_terminal"
                        ? [...DEFAULT_DASHBOARD_WIDGETS]
                        : widgets,
              })
            }
            className={cn(
              "rounded-lg border p-3 text-left transition",
              layout.preset === p.id
                ? "border-[#C89E67]/50 bg-[#C89E67]/10"
                : "border-white/10 hover:border-white/25",
            )}
          >
            <p className="text-sm font-medium text-white">{p.label}</p>
            <p className="text-xs text-zinc-500">{p.hint}</p>
          </button>
        ))}
      </div>

      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">Panels</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {DEFAULT_DASHBOARD_WIDGETS.map((id) => {
          const on = widgets.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className={cn(
                "rounded-md border px-3 py-2 text-left text-sm",
                on ? "border-[#C89E67]/40 bg-[#C89E67]/10 text-white" : "border-white/10 text-zinc-500",
              )}
            >
              {WIDGET_LABELS[id]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function widgetsForLayout(layout?: DashboardLayoutConfig | null): Set<DashboardWidgetId> {
  if (!layout) return new Set(DEFAULT_DASHBOARD_WIDGETS);
  if (layout.preset === "care_simple") {
    return new Set(["ticker", "chart", "actions", "care", "shipments"]);
  }
  if (layout.preset === "device_ops") {
    return new Set(["ticker", "chart", "devices", "actions", "body", "readings"]);
  }
  if (layout.preset === "clinical_terminal") {
    return new Set(DEFAULT_DASHBOARD_WIDGETS);
  }
  return new Set(layout.widgets?.length ? layout.widgets : DEFAULT_DASHBOARD_WIDGETS);
}
