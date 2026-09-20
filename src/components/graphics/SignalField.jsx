import { useEffect, useRef } from "react";

/**
 * Full-bleed WebGL-free canvas field — sparse nodes, laser-thin beams,
 * depth parallax. Tesla / Starlink visual language without purple glow kitsch.
 */
export default function SignalField({
  density = 48,
  accent = "#C89E67",
  className = "",
  interactive = true,
}) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.42 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const nodes = [];
    const beams = [];
    let t0 = performance.now();

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seed = () => {
      nodes.length = 0;
      beams.length = 0;
      const count = Math.max(24, Math.floor((w * h) / 28000) + density / 2);
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random(),
          y: Math.random(),
          z: 0.25 + Math.random() * 0.75,
          vx: (Math.random() - 0.5) * 0.00012,
          vy: (Math.random() - 0.5) * 0.00008,
          pulse: Math.random() * Math.PI * 2,
        });
      }
      for (let i = 0; i < Math.floor(count * 0.55); i++) {
        const a = Math.floor(Math.random() * count);
        let b = Math.floor(Math.random() * count);
        if (b === a) b = (b + 1) % count;
        beams.push({ a, b, phase: Math.random() * Math.PI * 2 });
      }
    };

    const onMove = (e) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / Math.max(rect.width, 1),
        y: (e.clientY - rect.top) / Math.max(rect.height, 1),
      };
    };

    const draw = (now) => {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);

      // Horizon wash — cool graphite → deep void
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "rgba(18, 28, 36, 0.55)");
      sky.addColorStop(0.45, "rgba(7, 10, 14, 0.15)");
      sky.addColorStop(1, "rgba(4, 6, 8, 0.75)");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Perspective grid (ground plane) — slate blue, cool and grounding
      const horizon = h * 0.58;
      const vanishX = w * (0.5 + (mouseRef.current.x - 0.5) * 0.04);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, horizon, w, h - horizon);
      ctx.clip();
      ctx.strokeStyle = "rgba(92, 126, 158, 0.09)";
      ctx.lineWidth = 1;
      const rows = 14;
      for (let i = 0; i <= rows; i++) {
        const p = i / rows;
        const y = horizon + Math.pow(p, 1.65) * (h - horizon);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      const cols = 18;
      for (let i = 0; i <= cols; i++) {
        const px = (i / cols) * w;
        ctx.beginPath();
        ctx.moveTo(vanishX, horizon - 8);
        ctx.lineTo(px, h);
        ctx.stroke();
      }
      ctx.restore();

      // Soft accent bloom near vanishing point
      const bloom = ctx.createRadialGradient(vanishX, horizon, 0, vanishX, horizon, w * 0.42);
      bloom.addColorStop(0, "rgba(200, 158, 103, 0.07)");
      bloom.addColorStop(0.45, "rgba(200, 158, 103, 0.02)");
      bloom.addColorStop(1, "transparent");
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Beams
      for (const beam of beams) {
        const na = nodes[beam.a];
        const nb = nodes[beam.b];
        if (!na || !nb) continue;
        const ax = (na.x + (mx - 0.5) * 0.02 * na.z) * w;
        const ay = (na.y + (my - 0.5) * 0.015 * na.z) * h;
        const bx = (nb.x + (mx - 0.5) * 0.02 * nb.z) * w;
        const by = (nb.y + (my - 0.5) * 0.015 * nb.z) * h;
        const dist = Math.hypot(ax - bx, ay - by);
        if (dist > Math.min(w, h) * 0.28) continue;
        const alpha = (0.04 + 0.08 * Math.sin(t * 1.2 + beam.phase)) * Math.min(na.z, nb.z);
        ctx.strokeStyle = `rgba(200, 158, 103, ${Math.max(0.02, alpha)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }

      // Nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > 1) n.vx *= -1;
        if (n.y < 0 || n.y > 1) n.vy *= -1;
        const x = (n.x + (mx - 0.5) * 0.03 * n.z) * w;
        const y = (n.y + (my - 0.5) * 0.02 * n.z) * h;
        const r = 0.6 + n.z * 1.8 + 0.4 * Math.sin(t * 2 + n.pulse);
        const a = 0.25 + n.z * 0.55;
        ctx.beginPath();
        ctx.fillStyle = `rgba(230, 237, 243, ${a * 0.55})`;
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        if (n.z > 0.7) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(200, 158, 103, ${0.15 + 0.2 * Math.sin(t * 3 + n.pulse)})`;
          ctx.arc(x, y, r * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Orbital ring — precision instrument
      const cx = w * 0.72;
      const cy = h * 0.38;
      const R = Math.min(w, h) * 0.22;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.08);
      ctx.strokeStyle = "rgba(200, 158, 103, 0.18)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 10]);
      ctx.beginPath();
      ctx.ellipse(0, 0, R, R * 0.38, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(230, 237, 243, 0.12)";
      ctx.beginPath();
      ctx.ellipse(0, 0, R * 0.72, R * 0.27, Math.PI / 5, 0, Math.PI * 2);
      ctx.stroke();
      // Tick marks
      for (let i = 0; i < 24; i++) {
        const ang = (i / 24) * Math.PI * 2;
        const x1 = Math.cos(ang) * R * 0.92;
        const y1 = Math.sin(ang) * R * 0.35;
        const x2 = Math.cos(ang) * R;
        const y2 = Math.sin(ang) * R * 0.38;
        ctx.strokeStyle = i % 6 === 0 ? accent : "rgba(230, 237, 243, 0.1)";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      // Sweep arc
      ctx.strokeStyle = `rgba(200, 158, 103, ${0.35 + 0.2 * Math.sin(t * 2)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.55, t % (Math.PI * 2), (t % (Math.PI * 2)) + 0.9);
      ctx.stroke();
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };

    const onResize = () => {
      resize();
      seed();
    };

    resize();
    seed();
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
    };
  }, [density, accent, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
      }}
    />
  );
}
