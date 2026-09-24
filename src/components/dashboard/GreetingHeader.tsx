interface GreetingHeaderProps {
  name: string;
}

export function GreetingHeader({ name }: GreetingHeaderProps) {
  const first = name.trim().split(/\s+/)[0] || "there";
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <section aria-labelledby="dashboard-greeting" className="relative space-y-3 overflow-hidden pb-2">
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full opacity-40"
        style={{ background: "radial-gradient(circle, rgba(200, 158, 103,0.22), transparent 70%)" }}
        aria-hidden="true"
      />
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#C89E67]">Your health hub</p>
      <h1
        id="dashboard-greeting"
        className="text-3xl font-semibold tracking-tight text-white sm:text-4xl font-display"
      >
        {hello}, {first}.
      </h1>
      <p className="max-w-xl text-sm text-zinc-400">
        See your care plan, orders, goals, and health readings in one place.
      </p>
      <div className="h-px max-w-[7rem] bg-[#C89E67]/70" />
    </section>
  );
}
