// Entry point: builds every interactive station on the page.

import { GraphCanvas } from './graph.js';
import { C, SHAPES } from './config.js';
import { fmt, chip, signedChip, innerX, eqGeneric } from './equation.js';
import { buildWidget } from './widgets.js';
import { buildMachine } from './machine.js';
import { buildRace } from './race.js';
import { buildChallenge } from './challenge.js';
import { initPopups } from './popups.js';
import { REDUCED } from './util.js';

// ---- Hero: an ambient curve that never stops playing with its own knobs ----
function buildHero() {
  const host = document.querySelector('.hero-bg');
  const graph = new GraphCanvas(host.querySelector('canvas'),
    { xspan: 26, fillParent: true, maxWidth: 4000 });
  const base = x => 2.8 * Math.sin(0.5 * x);
  let t = 0, visible = true, raf = null;

  function frame() {
    raf = null;
    t += 0.016;
    const a = 1 + 0.45 * Math.sin(t * 0.6);
    const h = 3.2 * Math.sin(t * 0.37);
    const k = 1.6 * Math.sin(t * 0.23);
    graph.ctx.clearRect(0, 0, graph.w, graph.h);
    graph.curve(base, { color: C.ink, width: 3, alpha: 0.1 });
    graph.curve(x => base(x - h), { color: C.blue, width: 3, alpha: 0.18 });
    graph.curve(x => base(x) + k, { color: C.green, width: 3, alpha: 0.18 });
    graph.curve(x => a * base(x - h) + k, { color: C.red, width: 4, alpha: 0.5, glow: true });
    if (visible && !REDUCED) raf = requestAnimationFrame(frame);
  }
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(frame);
  }).observe(host);
  frame();
}

buildHero();
buildMachine(document.querySelector('#w-machine'));

// ---- Step 2: slide up & down (k, green) ----
buildWidget(document.querySelector('#w-updown'), {
  id: 'updown',
  graph: { xspan: 18 },
  params: [{ key: 'c', label: 'shift up / down', color: C.green, min: -5, max: 5, step: 0.5, init: 1 }],
  fn: (ps, x) => x / 2 + ps.c,
  eq: ps => `y = <span class="frac"><span class="num">x</span><span class="den">2</span></span> ${signedChip(ps.c, C.green)}`,
  ghost: { c: 1 },
  arrows: [-6, -3, 0, 3, 6],
  arrowColor: C.green,
  pointAt: (ps, bx) => [bx, bx / 2 + ps.c],
  curveColor: C.green,
});

// ---- Step 3: slide sideways (h, blue) on a V-shape ----
buildWidget(document.querySelector('#w-sideways'), {
  id: 'sideways',
  graph: { xspan: 18 },
  params: [{ key: 'h', label: 'shift sideways', color: C.blue, min: -6, max: 6, step: 0.5, init: 3 }],
  fn: (ps, x) => Math.abs(x - ps.h) - 2,
  eq: ps => `y = |&hairsp;${innerX(ps.h)}&hairsp;| − 2`,
  ghost: { h: 0 },
  arrows: [-4, -2, 0, 2, 4],
  arrowColor: C.blue,
  pointAt: (ps, bx) => [bx + ps.h, Math.abs(bx) - 2],
  curveColor: C.blue,
});

buildRace(document.querySelector('#w-race'));

// ---- Step 4: stretch / squish / flip (a, orange) on a U-curve ----
buildWidget(document.querySelector('#w-stretch'), {
  id: 'stretch',
  graph: { xspan: 18, ycenter: 1.5 },
  params: [{ key: 'a', label: 'stretch / flip', color: C.orange, min: -3, max: 3, step: 0.25, init: 2 }],
  fn: (ps, x) => ps.a * x * x,
  eq: ps => `y = ${chip(fmt(ps.a), C.orange)}&hairsp;·&hairsp;x²`,
  ghost: { a: 1 },
  arrows: [-2, -1.5, -1, 1, 1.5, 2],
  arrowColor: C.orange,
  pointAt: (ps, bx) => [bx, ps.a * bx * bx],
  curveColor: C.orange,
});

// ---- Step 5: the playground — every shape, all three knobs ----
buildWidget(document.querySelector('#w-playground'), {
  id: 'play',
  graph: { xspan: 18 },
  shapes: Object.keys(SHAPES),
  params: [
    { key: 'a', label: 'a — stretch / flip', color: C.orange, min: -3, max: 3, step: 0.25, init: 1 },
    { key: 'h', label: 'h — shift sideways', color: C.blue, min: -6, max: 6, step: 0.5, init: 0 },
    { key: 'k', label: 'k — shift up / down', color: C.green, min: -5, max: 5, step: 0.5, init: 0 },
  ],
  fn: (ps, x, shape) => ps.a * SHAPES[shape].f(x - ps.h) + ps.k,
  eq: (ps, shape) => eqGeneric(shape, ps),
  ghost: { a: 1, h: 0, k: 0 },
  drag: ['h', 'k'],
  curveColor: C.red,
});

buildChallenge(document.querySelector('#w-boss'));
initPopups();
