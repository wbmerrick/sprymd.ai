import { useEffect, useRef, useState, type CSSProperties } from "react";

export type LaserLogoProps = {
  /** Increment to remount the SVG and restart CSS/SMIL animations from 0. */
  play: number;
  onComplete?: () => void;
  className?: string;
};

const ANIMATION_MS = 4100;

const containerStyle: CSSProperties = {
  width: "100%",
  aspectRatio: "4 / 1",
  overflow: "hidden",
  lineHeight: 0,
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/** Static end-state mark for prefers-reduced-motion. */
function StaticDarkLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 100"
      width="100%"
      role="img"
      aria-label="SpryMD"
    >
      <rect width="400" height="100" fill="#000000" />
      <g transform="translate(48, 34)">
        <circle cx="16" cy="16" r="15" fill="none" stroke="#FFFFFF" strokeWidth="1.75" />
        <path
          d="M10 20c0-3 2.5-5.5 5.5-5.5h1c3 0 5.5-2.5 5.5-5.5"
          fill="none"
          stroke="#E87722"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <circle cx="16" cy="16" r="2" fill="#E87722" />
      </g>
      <text
        x="96"
        y="62"
        style={{ fontFamily: "Outfit, system-ui, sans-serif", fontWeight: 600, fontSize: 42, letterSpacing: "-0.03em" }}
        fill="#FFFFFF"
      >
        Spry
        <tspan fill="#FFFFFF" opacity={0.55}>
          MD
        </tspan>
      </text>
      <line x1="96" y1="74" x2="248" y2="74" stroke="#E87722" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function LaserLogoSvg({ play }: { play: number }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    // Belt-and-suspenders: reset SMIL timeline after remount.
    try {
      svg.setCurrentTime?.(0);
    } catch {
      // Some browsers throw if no SMIL timeline exists yet.
    }
  }, [play]);

  return (
    <svg
      key={play}
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 100"
      width="100%"
      role="img"
      aria-label="SpryMD"
    >
      <defs>
        <style>{`
          .ll-bg { fill: #000000; }
          .ll-mark-ring { fill: none; stroke: #FFFFFF; stroke-width: 1.75; opacity: 0; animation: ll-fade-in 0.55s ease-out 1.55s forwards; }
          .ll-mark-path { fill: none; stroke: #E87722; stroke-width: 1.75; stroke-linecap: round; stroke-dasharray: 28; stroke-dashoffset: 28; animation: ll-draw 0.9s ease-out 1.7s forwards; }
          .ll-mark-dot { fill: #E87722; opacity: 0; animation: ll-fade-in 0.35s ease-out 2.35s forwards; }
          .ll-word { font-family: Outfit, system-ui, sans-serif; font-weight: 600; font-size: 42px; letter-spacing: -0.03em; fill: #FFFFFF; opacity: 0; animation: ll-fade-up 0.7s ease-out 2.55s forwards; }
          .ll-md { fill: #FFFFFF; opacity: 0; animation: ll-md-in 0.7s ease-out 2.75s forwards; }
          .ll-beam {
            stroke: #E87722;
            stroke-width: 2;
            stroke-linecap: round;
            filter: url(#ll-glow-${play});
            opacity: 0;
            animation: ll-beam-sweep 1.35s cubic-bezier(0.22, 1, 0.36, 1) 0.25s forwards;
          }
          .ll-scan {
            fill: url(#ll-scan-grad-${play});
            opacity: 0;
            animation: ll-scan-pass 1.2s ease-in-out 0.35s forwards;
          }
          .ll-underline {
            stroke: #E87722;
            stroke-width: 2;
            stroke-linecap: round;
            opacity: 0;
            animation: ll-fade-in 0.45s ease-out 3.2s forwards;
          }
          @keyframes ll-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes ll-fade-up {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes ll-md-in {
            from { opacity: 0; }
            to { opacity: 0.55; }
          }
          @keyframes ll-draw {
            to { stroke-dashoffset: 0; }
          }
          @keyframes ll-beam-sweep {
            0% { opacity: 0; stroke-dasharray: 0 420; }
            12% { opacity: 1; }
            70% { opacity: 1; stroke-dasharray: 420 0; }
            100% { opacity: 0; stroke-dasharray: 420 0; }
          }
          @keyframes ll-scan-pass {
            0% { opacity: 0; transform: translateX(-40px); }
            20% { opacity: 0.55; }
            80% { opacity: 0.35; }
            100% { opacity: 0; transform: translateX(360px); }
          }
        `}</style>
        <filter id={`ll-glow-${play}`} x="-40%" y="-200%" width="180%" height="500%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`ll-scan-grad-${play}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#E87722" stopOpacity="0" />
          <stop offset="50%" stopColor="#E87722" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#E87722" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect className="ll-bg" width="400" height="100" />

      <line className="ll-beam" x1="20" y1="50" x2="380" y2="50" />
      <rect className="ll-scan" x="0" y="18" width="48" height="64" />

      <g transform="translate(48, 34)">
        <circle className="ll-mark-ring" cx="16" cy="16" r="15" />
        <path className="ll-mark-path" d="M10 20c0-3 2.5-5.5 5.5-5.5h1c3 0 5.5-2.5 5.5-5.5" />
        <circle className="ll-mark-dot" cx="16" cy="16" r="2" />
        <animate attributeName="opacity" from="0" to="1" begin="1.5s" dur="0.4s" fill="freeze" />
      </g>

      <text className="ll-word" x="96" y="62">
        Spry
        <tspan className="ll-md">MD</tspan>
      </text>
      <line className="ll-underline" x1="96" y1="74" x2="248" y2="74" />
    </svg>
  );
}

export default function LaserLogo({ play, onComplete, className }: LaserLogoProps) {
  const reducedMotion = usePrefersReducedMotion();
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (reducedMotion) {
      onCompleteRef.current?.();
      return;
    }
    const id = window.setTimeout(() => {
      onCompleteRef.current?.();
    }, ANIMATION_MS);
    return () => window.clearTimeout(id);
  }, [play, reducedMotion]);

  return (
    <div className={className} style={containerStyle} data-laser-play={play}>
      {reducedMotion ? <StaticDarkLogo /> : <LaserLogoSvg play={play} />}
    </div>
  );
}
