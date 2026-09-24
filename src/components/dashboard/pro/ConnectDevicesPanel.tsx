import { useMemo, useState } from "react";
import { Check, Plus, Search, Watch } from "lucide-react";
import { WEARABLE_CATALOG, WEARABLE_IMAGES } from "@/data/wearables";
import type { WearableDevice, WearableKind } from "@/types/dashboard";
import { cn } from "@/lib/utils";

const TIERS = ["all", "clinical", "recovery", "metabolic", "sleep", "fitness"] as const;

export function ConnectDevicesPanel({
  devices,
  onConnect,
  onRegisterCustom,
  onClose,
}: {
  devices: WearableDevice[];
  onConnect: (id: WearableKind) => void;
  onRegisterCustom: (input: { brand: string; name: string; metrics?: string[] }) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<(typeof TIERS)[number]>("all");
  const [brand, setBrand] = useState("");
  const [name, setName] = useState("");
  const owned = useMemo(() => new Set(devices.filter((d) => d.owned).map((d) => d.id)), [devices]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WEARABLE_CATALOG.filter((d) => {
      if (tier !== "all" && d.tier !== tier) return false;
      if (!q) return true;
      return `${d.brand} ${d.name} ${d.metrics.join(" ")}`.toLowerCase().includes(q);
    });
  }, [query, tier]);

  const submitCustom = () => {
    if (!brand.trim() || !name.trim()) return;
    onRegisterCustom({ brand: brand.trim(), name: name.trim() });
    setBrand("");
    setName("");
  };

  return (
    <div className="rounded-lg border border-white/10 bg-[#0B0B0C] p-4 shadow-xl">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#C89E67]">Connect gear</p>
          <h2 className="text-lg font-semibold text-white font-display">
            Sync any wearable
          </h2>
          <p className="mt-1 max-w-xl text-sm text-zinc-400">
            Connect any OEM cloud with OAuth (Fitbit, Oura, WHOOP, Garmin, Dexcom, Withings, and more). Custom brands use generic OEM OAuth or file import.
          </p>
        </div>
        <button type="button" onClick={onClose} className="rounded px-2 py-1 text-xs text-zinc-400 hover:text-white">
          Close
        </button>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-2 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brand or device"
            className="w-full rounded-md border border-white/10 bg-black/40 py-2 pl-8 pr-3 text-sm text-white placeholder:text-zinc-600"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {TIERS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTier(t)}
              className={cn(
                "rounded px-2 py-1 font-mono text-[10px] uppercase tracking-wider",
                tier === t ? "bg-[#C89E67]/20 text-[#C89E67]" : "text-zinc-500 hover:text-zinc-200",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((d) => {
          const connected = owned.has(d.id);
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => onConnect(d.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 text-left transition",
                connected
                  ? "border-[#C89E67]/40 bg-[#C89E67]/10"
                  : "border-white/10 bg-white/[0.02] hover:border-white/25",
              )}
            >
              <img
                src={WEARABLE_IMAGES[d.imageKey] || WEARABLE_IMAGES.custom}
                alt=""
                className="h-10 w-10 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {d.brand} {d.name}
                </p>
                <p className="truncate font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                  {d.connector?.replace(/_/g, " ") || "file import"}{d.connector && d.connector !== "native_sim" && d.connector !== "file_import" ? " · OAuth" : ""} · {d.metrics.slice(0, 2).join(" · ")}
                </p>
              </div>
              {connected ? <Check className="h-4 w-4 text-[#C89E67]" /> : <Plus className="h-4 w-4 text-zinc-500" />}
            </button>
          );
        })}
      </div>

      <div className="rounded-lg border border-dashed border-white/15 bg-black/30 p-3">
        <div className="mb-2 flex items-center gap-2 text-[#C89E67]">
          <Watch className="h-4 w-4" />
          <p className="font-mono text-[10px] uppercase tracking-[0.16em]">Device not listed?</p>
        </div>
        <p className="mb-3 text-xs text-zinc-400">
          Add any wearable ever made. Then upload exports from the maker&apos;s app, or enter readings by hand.
        </p>
        <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Brand (e.g. Polar)"
            className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Model (e.g. H10)"
            className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          />
          <button
            type="button"
            onClick={submitCustom}
            disabled={!brand.trim() || !name.trim()}
            className="rounded-md bg-[#C89E67] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            Add device
          </button>
        </div>
      </div>
    </div>
  );
}
