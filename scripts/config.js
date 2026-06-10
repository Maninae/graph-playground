// Shared constants: palette (mirrors CSS custom properties) and the shape library.

export const C = {
  ink: '#1f2b3e',
  inkSoft: 'rgba(31,43,62,0.6)',
  green: '#1fa862',   // k — slide up/down
  blue: '#2e66e5',    // h — slide left/right
  orange: '#f08a12',  // a — stretch/squish/flip
  pink: '#e84c7d',
  red: '#e8443a',     // brand / multi-knob curves
};

// Base shapes for the playground and boss level.
// f is the parent function; expr(inner) renders the equation body around
// the (x − h) chip markup; label is the kid-facing picker name.
export const SHAPES = {
  line:  { label: 'Line',    f: x => x,                          expr: i => `(${i})` },
  quad:  { label: 'U-curve', f: x => x * x,                      expr: i => `(${i})²` },
  cubic: { label: 'S-curve', f: x => (x * x * x) / 12,           expr: i => `(${i})³⁄₁₂` },
  abs:   { label: 'V-shape', f: x => Math.abs(x),                expr: i => `|${i}|` },
  wave:  { label: 'Wave',    f: x => 2.5 * Math.sin(1.25 * x),   expr: i => `wave(${i})` },
};
