// Stateless helpers: easing, tweens, reduced-motion flag, confetti.

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeLinear = t => t;

export const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Animate a number from→to over dur ms. Returns {cancel}.
export function tween({ from, to, dur = 800, ease = easeInOut, onUpdate, onDone }) {
  let raf, start;
  const step = now => {
    if (start === undefined) start = now;
    const t = clamp((now - start) / dur, 0, 1);
    onUpdate(lerp(from, to, ease(t)), t);
    if (t < 1) raf = requestAnimationFrame(step);
    else if (onDone) onDone();
  };
  raf = requestAnimationFrame(step);
  return { cancel: () => cancelAnimationFrame(raf) };
}

// Run tween specs one after another. Each spec: {from, to, dur, ease, onUpdate}.
export function chain(specs, onAllDone) {
  let cur = null, i = 0, cancelled = false;
  const next = () => {
    if (cancelled) return;
    if (i >= specs.length) { if (onAllDone) onAllDone(); return; }
    cur = tween({ ...specs[i++], onDone: next });
  };
  next();
  return { cancel: () => { cancelled = true; if (cur) cur.cancel(); } };
}

// Celebration burst over a host element (host must be position:relative).
export function confettiBurst(host, colors) {
  const rect = host.getBoundingClientRect();
  const cv = document.createElement('canvas');
  cv.className = 'confetti-layer';
  cv.width = rect.width;
  cv.height = rect.height;
  host.appendChild(cv);
  const ctx = cv.getContext('2d');
  const parts = [];
  for (let i = 0; i < 90; i++) {
    parts.push({
      x: rect.width / 2 + (i / 90 - 0.5) * rect.width * 0.5,
      y: rect.height * 0.35,
      vx: (i % 2 ? 1 : -1) * (1 + (i * 7) % 50 / 10),
      vy: -(4 + (i * 13) % 60 / 10),
      s: 5 + (i * 11) % 7,
      rot: (i * 37) % 360,
      vr: ((i * 17) % 10) - 5,
      c: colors[i % colors.length],
    });
  }
  let frames = 0;
  const loop = () => {
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.18; p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.globalAlpha = clamp(1.4 - frames / 70, 0, 1);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
      ctx.restore();
    }
    if (++frames < 100) requestAnimationFrame(loop);
    else cv.remove();
  };
  requestAnimationFrame(loop);
}
