/** Minimal branded placeholder shown while a lazily loaded route chunk downloads. */
const RouteFallback = () => (
  <div
    role="status"
    aria-live="polite"
    className="flex min-h-screen items-center justify-center bg-background text-foreground"
  >
    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70 motion-safe:animate-pulse">
      Loading…
    </span>
  </div>
);

export default RouteFallback;
