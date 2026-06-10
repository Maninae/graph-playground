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
  pink: '#e07a9e',    // b — horizontal squeeze/widen (library only)
  red: '#fc6255',     // player's curve / brand
};

const frac = (num, den) =>
  `<span class="frac"><span class="num">${num}</span><span class="den">${den}</span></span>`;

// The function library. Per shape:
//   f       — parent function (pure; the widget applies a·f(b(x−h))+k)
//   expr(i) — equation body around the rendered inside `i`
//   label / sub — picker card text (sub is the small formula)
//   note    — behavior blurb shown under the library graph (HTML ok)
//   asymV / asymH — draw dashed asymptote guides at x = h / y = k
//   edge    — mark the domain endpoint at (h, k) (square root)
//   ycenter — vertical view center while this shape is selected
//   thumbX / thumbY — sampling window for the picker thumbnail
export const SHAPES = {
  line: {
    label: 'Line', sub: 'x',
    f: x => x,
    expr: i => `(${i})`,
    note: 'The simplest machine: output equals input. No landmarks at all — which is why a sideways slide on a line can masquerade as a vertical one.',
  },
  quad: {
    label: 'Parabola', sub: 'x²',
    f: x => x * x,
    expr: i => `(${i})²`,
    note: 'The vertex sits exactly at (h, k) — two knobs you can read straight off the picture. Negative a flips the bowl into a dome.',
  },
  cubic: {
    label: 'Cubic', sub: 'x³⁄12',
    f: x => (x * x * x) / 12,
    expr: i => frac(`(${i})³`, '12'),
    thumbY: [-6, 6],
    note: 'Flat in the middle, steep at the ends, and point-symmetric: its center rides at (h, k).',
  },
  abs: {
    label: 'Absolute value', sub: '|x|',
    f: x => Math.abs(x),
    expr: i => `|${i}|`,
    note: 'Straight lines everywhere except one corner that never smooths out — and the corner parks at (h, k).',
  },
  sqrt: {
    label: 'Square root', sub: '√x',
    f: x => Math.sqrt(x),
    expr: i => `√(${i})`,
    edge: true, ycenter: 1, thumbX: [-1.5, 8.5],
    note: 'Only exists where the inside is ≥ 0, so the curve <em>starts</em> at the marked point (h, k) and grows rightward — fast at first, then lazier forever. Negative b makes it grow leftward instead.',
  },
  inv: {
    label: 'Reciprocal', sub: '1⁄x',
    f: x => 1 / x,
    expr: i => frac('1', i),
    asymV: true, asymH: true,
    note: 'Two branches hugging two <button class="term" data-pop="asym">asymptotes</button>. h drags the vertical one, k drags the horizontal one — the curve chases them forever and never touches.',
  },
  exp: {
    label: 'Exponential', sub: '2ˣ',
    f: x => Math.pow(2, x),
    expr: i => `2<sup>${i}</sup>`,
    asymH: true, ycenter: 2.5, thumbY: [-1, 7],
    note: 'Doubles with every step right: … ¼, ½, 1, 2, 4, 8 … It hugs its floor y = k on the left and rockets off on the right. The floor is an <button class="term" data-pop="asym">asymptote</button>.',
  },
  log: {
    label: 'Logarithm', sub: 'log₂x',
    f: x => Math.log2(x),
    expr: i => `log₂(${i})`,
    asymV: true, thumbX: [-0.5, 9.5],
    note: 'The exponential’s mirror: it answers “how many doublings does it take to reach x?” It climbs forever — ever more slowly — behind a wall at x = h it can never cross.',
  },
  sine: {
    label: 'Sine', sub: 'sin x',
    f: x => 2.5 * Math.sin(1.25 * x),
    expr: i => `sin(${i})`,
    note: 'The endless wave (<button class="term" data-pop="sine">why “sine”?</button>). b sets how fast it cycles — squeeze the swells together or stretch them apart — and a sets how tall they are.',
  },
};
