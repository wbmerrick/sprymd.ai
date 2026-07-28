interface GreetingHeaderProps {
  name: string;
}

export function GreetingHeader({ name }: GreetingHeaderProps) {
  const first = name.trim().split(/\s+/)[0] || "there";
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <section aria-labelledby="dashboard-greeting" className="space-y-2">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#1EC8A5]">Your care dashboard</p>
      <h1 id="dashboard-greeting" className="text-3xl font-semibold tracking-tight text-white sm:text-4xl" style={{ fontFamily: "'Syne', sans-serif" }}>
        {hello}, {first}.
      </h1>
      <p className="max-w-xl text-sm text-zinc-400">
        Protocols, refills, and shipments for your account — in one place.
      </p>
    </section>
  );
}
