import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { applyHead } from "@/lib/seo";
import { NOT_FOUND_META } from "@/seo/routes";

const NotFound = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    applyHead({
      pageTitle: NOT_FOUND_META.pageTitle,
      description: NOT_FOUND_META.description,
      path: pathname,
      noindex: true,
    });
  }, [pathname]);

  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-background px-6 py-24 text-foreground">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">404</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-5xl">Page not found</h1>
        <p className="mt-4 text-base leading-relaxed text-foreground/75">
          We couldn&rsquo;t find{" "}
          <code className="rounded bg-foreground/10 px-1.5 py-0.5 text-sm">{pathname}</code>. The link may be
          out of date, or the page may have moved.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-coral-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Back to home
          </Link>
          <Link
            to="/#landing-conditions"
            className="inline-flex items-center justify-center rounded-full border border-foreground/25 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-foreground/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Start your visit
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center rounded-full px-4 py-3 text-sm font-semibold text-foreground/80 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Contact support
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
