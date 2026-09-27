import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { loadMasterOpsSnapshot, type MasterOpsSnapshot } from "@/lib/masterOps";
import { formatRelative } from "@/lib/dashboardFormat";

export default function MasterMembersPage() {
  const { email } = useOutletContext<{ email: string }>();
  const [snap, setSnap] = useState<MasterOpsSnapshot | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void loadMasterOpsSnapshot(email).then(setSnap);
  }, [email]);

  const filtered = useMemo(() => {
    if (!snap) return [];
    const q = query.trim().toLowerCase();
    if (!q) return snap.members.rows;
    return snap.members.rows.filter(
      (m) =>
        m.email.toLowerCase().includes(q) ||
        m.fullName.toLowerCase().includes(q) ||
        m.state.toLowerCase().includes(q),
    );
  }, [snap, query]);

  if (!snap) {
    return <p className="text-sm text-zinc-500">Loading member log…</p>;
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-400/90">Members</p>
        <h1 className="text-3xl font-semibold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
          Membership ledger
        </h1>
        <p className="max-w-2xl text-sm text-zinc-400">
          Every patient row on the platform — growth, Stripe linkage, and state coverage for compliance planning.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Total members" value={String(snap.members.total)} />
        <Stat label="New · 7d" value={String(snap.members.last7d)} />
        <Stat label="New · 30d" value={String(snap.members.last30d)} />
        <Stat label="Stripe linked" value={String(snap.members.withStripe)} />
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search name, email, or state…"
        className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none"
      />

      <section className="overflow-hidden rounded-2xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.14em] text-zinc-500">
              <tr>
                <th className="px-4 py-2 font-medium">Member</th>
                <th className="px-4 py-2 font-medium">State</th>
                <th className="px-4 py-2 font-medium">Joined</th>
                <th className="px-4 py-2 font-medium">Billing</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                    No members match.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="border-t border-white/5 text-zinc-300">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-white">{m.fullName}</p>
                      <p className="text-[11px] text-zinc-500">{m.email}</p>
                    </td>
                    <td className="px-4 py-2.5">{m.state || "—"}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{formatRelative(m.createdAt)}</td>
                    <td className="px-4 py-2.5">
                      {m.stripeCustomerId ? (
                        <span className="text-emerald-300">Linked</span>
                      ) : (
                        <span className="text-amber-200/90">Missing Stripe id</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
