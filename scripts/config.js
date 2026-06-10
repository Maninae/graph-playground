// Shared constants: palette (mirrors CSS custom properties) and the shape library.

// Manim-inspired palette on near-black. "ink" is the default pen color
// (light, since the page is dark); "bg" is the page/panel base used for
// point rings and label plates on canvas.
export const C = {
  ink: '#e9edf7',
  inkSoft: 'rgba(233,237,247,0.62)',
  bg: '#0b0d15',
  green: '#7bd389',   // k — shift up/down
  blue: '#58c4dd',    // h — shift left/right
  orange: '#f5c857',  // a — stretch/flip
  pink: '#e07a9e',
  red: '#fc6255',     // player's curve / brand
};

// Base shapes for the playground and boss level.
// f is the parent function; expr(inner) renders the equation body around
// the (x − h) chip markup; label is the kid-facing picker name.
export const SHAPES = {
  line:  { label: 'Line',           f: x => x,                        expr: i => `(${i})` },
  quad:  { label: 'Parabola',       f: x => x * x,                    expr: i => `(${i})²` },
  cubic: { label: 'Cubic',          f: x => (x * x * x) / 12,
           expr: i => `<span class="frac"><span class="num">(${i})³</span><span class="den">12</span></span>` },
  abs:   { label: 'Absolute value', f: x => Math.abs(x),              expr: i => `|${i}|` },
  wave:  { label: 'Wave',           f: x => 2.5 * Math.sin(1.25 * x), expr: i => `wave(${i})` },
};
