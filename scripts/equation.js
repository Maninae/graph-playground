// Live equation rendering: colored "chips" in the formula match the
// slider knobs and the arrows on the graph (green = k, blue = h, orange = a).

import { C, SHAPES } from './config.js';

// Format a number for display: ≤2 decimals, real minus sign.
export function fmt(n) {
  const v = Math.round(n * 100) / 100;
  return (v < 0 ? '−' : '') + String(Math.abs(v));
}

export function chip(html, color) {
  return `<span class="echip" style="--c:${color}">${html}</span>`;
}

// "+ 3" / "− 2" trailing term (used for k and other added constants).
export function signedChip(v, color) {
  return chip(`${v < 0 ? '−' : '+'}&hairsp;${fmt(Math.abs(v))}`, color);
}

// The "x − h" inside the parentheses. The sign flip lives here:
// h = 3 renders "x − 3", h = −2 renders "x + 2".
export function innerX(h) {
  return `x&hairsp;${chip(`${h < 0 ? '+' : '−'}&hairsp;${fmt(Math.abs(h))}`, C.blue)}`;
}

// Full y = a·f(x − h) + k for any shape in the library.
export function eqGeneric(shapeKey, { a, h, k }) {
  const body = SHAPES[shapeKey].expr(innerX(h));
  return `y = ${chip(fmt(a), C.orange)}&hairsp;·&hairsp;${body} ${signedChip(k, C.green)}`;
}
