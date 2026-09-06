import { Link } from "react-router-dom";
import { Target, LifeBuoy, ArrowRight } from "lucide-react";

export function QuickLinksFooter() {
  const tiles = [
    {
      to: "/dashboard/goals",
      title: "Manage goals",
      description: "Review protocols and refill windows",
      icon: Target,
    },
    {
      to: "/dashboard/support",
      title: "Help center",
      description: "Messages, topics, and care support",
      icon: LifeBuoy,
    },
  ];

  return (
    <section aria-labelledby="quick-links-heading" className="space-y-4">
      <h2 id="quick-links-heading" className="sr-only">
        Quick links
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {tiles.map((tile) => (
          <li key={tile.to}>
            <Link
              to={tile.to}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-5 transition hover:border-[#E87722]/40"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E87722]/15 text-[#E87722]">
                <tile.icon className="h-5 w-5" aria-hidden />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{tile.title}</p>
                <p className="text-sm text-zinc-500">{tile.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-500" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
