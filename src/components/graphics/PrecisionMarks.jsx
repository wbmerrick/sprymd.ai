/**
 * Precision SVG instruments — orbit rings, telemetry, scan frames.
 * Used as decorative layers; keep stroke hairline, no soft purple glows.
 */

export function OrbitRings({ className = "", size = 420 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 420 420"
      fill="none"
      aria-hidden="true"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="orbitStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#C89E67" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#E6EDF3" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#C89E67" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <circle cx="210" cy="210" r="198" stroke="url(#orbitStroke)" strokeWidth="1" strokeDasharray="2 14" className="orbit-spin-slow" />
      <ellipse cx="210" cy="210" rx="168" ry="64" stroke="rgba(200, 158, 103,0.28)" strokeWidth="1" className="orbit-spin" />
      <ellipse cx="210" cy="210" rx="168" ry="64" stroke="rgba(230,237,243,0.12)" strokeWidth="1" transform="rotate(55 210 210)" className="orbit-spin-rev" />
      <circle cx="210" cy="210" r="46" stroke="rgba(200, 158, 103,0.45)" strokeWidth="1.25" />
      <circle cx="210" cy="210" r="8" fill="#C89E67" />
      <circle cx="210" cy="210" r="3" fill="#E6EDF3" />
      {/* Satellites */}
      <g className="orbit-spin">
        <circle cx="378" cy="210" r="3.5" fill="#C89E67" />
        <circle cx="42" cy="210" r="2.5" fill="rgba(230,237,243,0.7)" />
      </g>
      <g className="orbit-spin-rev">
        <rect x="205" y="44" width="10" height="10" rx="1" stroke="#C89E67" strokeWidth="1" fill="none" transform="rotate(45 210 49)" />
      </g>
    </svg>
  );
}

export function ScanFrame({ className = "", label = "SYS // LIVE" }) {
  return (
    <div className={className} aria-hidden="true" style={{ pointerEvents: "none", position: "absolute" }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
        <path d="M0 18 V0 H18" stroke="rgba(200, 158, 103,0.7)" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
        <path d="M82 0 H100 V18" stroke="rgba(200, 158, 103,0.7)" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
        <path d="M100 82 V100 H82" stroke="rgba(200, 158, 103,0.55)" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
        <path d="M18 100 H0 V82" stroke="rgba(200, 158, 103,0.55)" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(200, 158, 103,0.12)" strokeWidth="0.35" strokeDasharray="1 3" className="scan-line" vectorEffect="non-scaling-stroke" />
      </svg>
      <span
        style={{
          position: "absolute",
          top: 10,
          left: 12,
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.16em",
          color: "rgba(200, 158, 103,0.75)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
}

export function TelemetryStrip({ items = [], className = "" }) {
  const defaults = items.length
    ? items
    : [
        { k: "LATENCY", v: "12ms" },
        { k: "UPLINK", v: "SECURE" },
        { k: "PROTOCOLS", v: "ACTIVE" },
        { k: "CLINICIAN", v: "ONLINE" },
        { k: "RX QUEUE", v: "NOMINAL" },
      ];
  return (
    <div
      className={`telemetry-strip ${className}`}
      aria-hidden="true"
      style={{
        display: "flex",
        gap: "1.75rem",
        overflow: "hidden",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.14em",
        color: "rgba(230,237,243,0.45)",
        whiteSpace: "nowrap",
      }}
    >
      <div className="telemetry-track" style={{ display: "flex", gap: "1.75rem" }}>
        {[...defaults, ...defaults].map((row, i) => (
          <span key={`${row.k}-${i}`} style={{ display: "inline-flex", gap: "0.55rem", alignItems: "baseline" }}>
            <span style={{ color: "rgba(200, 158, 103,0.7)" }}>{row.k}</span>
            <span style={{ color: "rgba(230,237,243,0.85)" }}>{row.v}</span>
            <span style={{ opacity: 0.25 }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function GridHorizon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="hzFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C89E67" stopOpacity="0" />
          <stop offset="40%" stopColor="#C89E67" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#C89E67" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hzWash" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#071016" stopOpacity="0" />
          <stop offset="100%" stopColor="#040608" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <rect width="1200" height="400" fill="url(#hzWash)" />
      {Array.from({ length: 16 }).map((_, i) => {
        const y = 80 + i * 18 + i * i * 0.55;
        return <line key={`r${i}`} x1="0" y1={y} x2="1200" y2={y} stroke="rgba(200, 158, 103,0.08)" strokeWidth="1" />;
      })}
      {Array.from({ length: 25 }).map((_, i) => {
        const x = (i / 24) * 1200;
        return <line key={`c${i}`} x1="600" y1="70" x2={x} y2="400" stroke="rgba(200, 158, 103,0.07)" strokeWidth="1" />;
      })}
      <ellipse cx="600" cy="78" rx="220" ry="8" fill="url(#hzFade)" />
    </svg>
  );
}

export function HexMesh({ className = "" }) {
  return (
    <svg className={className} width="100%" height="100%" aria-hidden="true">
      <defs>
        <pattern id="hexPat" width="28" height="48" patternUnits="userSpaceOnUse" patternTransform="scale(1.2)">
          <path
            d="M14 0 L28 8 V24 L14 32 L0 24 V8 Z"
            fill="none"
            stroke="rgba(200, 158, 103,0.06)"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hexPat)" />
    </svg>
  );
}
