// Live equation rendering: colored "chips" in the formula match the
// slider knobs and the arrows on the graph (green = k, blue = h, orange = a).

import { C, SHAPES } from './config.js';

// Format a number for display: always exactly 2 decimals (constant width,
// no layout flicker while sliding), real minus sign.
export function fmt(n) {
  const v = Math.round(n * 100) / 100;
  return (v < 0 ? '−' : '') + Math.abs(v).toFixed(2);
}

export function chip(html, color) {
  return `<span class="echip" style="--c:${color}">${html}</span>`;
}

// "+ 3" / "− 2" trailing term (used for k and other added constants).
export function signedChip(v, color) {
  return chip(`${v < 0 ? '−' : '+'}&hairsp;${fmt(Math.abs(v))}`, color);
}

// The inside of the function. The sign flip lives here: h = 3 renders
// "x − 3", h = −2 renders "x + 2". With b defined (library), the whole
// thing becomes "b·(x − h)".
export function innerX(h, b) {
  const hPart = `<var>x</var>&hairsp;${chip(`${h < 0 ? '+' : '−'}&hairsp;${fmt(Math.abs(h))}`, C.blue)}`;
  if (b === undefined) return hPart;
  return `${chip(fmt(b), C.pink)}·(${hPart})`;
}

// Full y = a·f(b·(x − h)) + k for any shape in the library.
// b is optional: walkthrough and boss equations omit it.
export function eqGeneric(shapeKey, { a, b, h, k }) {
  const body = SHAPES[shapeKey].expr(innerX(h, b));
  return `<var>y</var> = ${chip(fmt(a), C.orange)}&hairsp;·&hairsp;${body} ${signedChip(k, C.green)}`;
}

// The simplified, textbook form of the same equation — used when a round is
// won. Drops the noise: no "1·", no "+ 0", no "(x − 0)", integers stay
// integers. Knob colors are kept as plain colored text (no chip boxes).
export function eqClean(shapeKey, { a, h, k }) {
  const num = n => {
    const v = Math.round(n * 100) / 100;
    return (v < 0 ? '−' : '') + String(Math.abs(v));
  };
  const span = (t, c) => `<span style="color:${c}">${t}</span>`;
  const inner = h === 0
    ? '<var>x</var>'
    : `<var>x</var> ${span(`${h < 0 ? '+' : '−'} ${num(Math.abs(h))}`, C.blue)}`;
  const body = shapeKey === 'line' && h === 0 ? inner : SHAPES[shapeKey].expr(inner);
  let aPart = '';
  if (a === -1) aPart = span('−', C.orange);
  else if (a !== 1) aPart = span(num(a), C.orange) + '·';
  const kPart = k === 0 ? '' : ` ${span(`${k < 0 ? '−' : '+'} ${num(Math.abs(k))}`, C.green)}`;
  return `<var>y</var> = ${aPart}${body}${kPart}`;
}
