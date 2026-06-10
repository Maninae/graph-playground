// buildWidget: the generic interactive station used by every section.
// Renders an equation display, a graph, and one colored slider per knob.
// Config:
//   graph        — GraphCanvas options ({xspan, ycenter, aspect})
//   params       — [{key, label, color, min, max, step, init}]
//   fn(ps, x, shape) — the plotted function
//   eq(ps, shape)    — HTML for the equation display
//   ghost        — param object for a faint reference curve (optional)
//   target       — param object for a dashed goal curve (optional, boss level)
//   arrows       — base-x positions for ghost→current point arrows (optional)
//   pointAt(ps, baseX) — where the point "born at baseX" sits under ps
//   shapes       — shape keys for a picker (optional); state.shape tracks it
//   drag         — param keys driven by dragging the canvas, e.g. ['h','k']
//   curveColor, arrowColor, onChange(ps)

import { GraphCanvas } from './graph.js';
import { C, SHAPES } from './config.js';
import { clamp, chain } from './util.js';

export function buildWidget(mount, cfg) {
  mount.insertAdjacentHTML('beforeend', `
    <div class="widget">
      ${cfg.shapes ? '<div class="shape-picker" role="tablist"></div>' : ''}
      <div class="eq-display"></div>
      <div class="graph-wrap">
        <canvas aria-label="interactive graph"></canvas>
        ${cfg.drag ? '<span class="drag-hint">drag the curve directly</span>' : ''}
      </div>
      <div class="controls"></div>
    </div>`);
  const root = mount.lastElementChild;
  const eqEl = root.querySelector('.eq-display');
  const graph = new GraphCanvas(root.querySelector('canvas'), cfg.graph || {});
  const controls = root.querySelector('.controls');

  const params = {};
  const state = { shape: cfg.shapes ? cfg.shapes[0] : null };
  let wiggling = null;

  if (cfg.shapes) {
    const picker = root.querySelector('.shape-picker');
    for (const key of cfg.shapes) {
      picker.insertAdjacentHTML('beforeend',
        `<button role="tab" data-shape="${key}" class="${key === state.shape ? 'active' : ''}">${SHAPES[key].label}</button>`);
    }
    picker.addEventListener('click', e => {
      const btn = e.target.closest('button[data-shape]');
      if (!btn) return;
      state.shape = btn.dataset.shape;
      picker.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
      render();
    });
  }

  const inputs = {}, chips = {};
  for (const p of cfg.params) {
    params[p.key] = p.init;
    controls.insertAdjacentHTML('beforeend', `
      <div class="ctrl-row" style="--c:${p.color}">
        <label class="ctrl-label" for="sl-${cfg.id}-${p.key}">${p.label}</label>
        <input type="range" id="sl-${cfg.id}-${p.key}" data-key="${p.key}"
               min="${p.min}" max="${p.max}" step="${p.step}" value="${p.init}">
        <output class="ctrl-value">${disp(p.init)}</output>
        <button class="wiggle-btn" data-key="${p.key}" title="watch this knob move by itself">▶</button>
      </div>`);
    const row = controls.lastElementChild;
    inputs[p.key] = row.querySelector('input');
    chips[p.key] = row.querySelector('output');
  }
  if (cfg.reset !== false) {
    controls.insertAdjacentHTML('beforeend',
      `<div class="ctrl-row ctrl-actions"><button class="btn ghost reset-btn">↺ reset</button></div>`);
    controls.querySelector('.reset-btn').addEventListener('click', () => {
      stopWiggle();
      for (const p of cfg.params) setParam(p.key, p.init);
      render();
    });
  }

  function disp(v) {
    const r = Math.round(v * 100) / 100;
    return (r < 0 ? '−' : '') + Math.abs(r).toFixed(2);
  }

  function setParam(key, v) {
    params[key] = v;
    inputs[key].value = v;
    chips[key].textContent = disp(v);
  }

  function stopWiggle() {
    if (wiggling) { wiggling.cancel(); wiggling = null; }
  }

  controls.addEventListener('input', e => {
    if (!e.target.matches('input[type=range]')) return;
    stopWiggle();
    setParam(e.target.dataset.key, parseFloat(e.target.value));
    render();
  });

  controls.addEventListener('click', e => {
    const btn = e.target.closest('.wiggle-btn');
    if (!btn) return;
    stopWiggle();
    const p = cfg.params.find(q => q.key === btn.dataset.key);
    const upd = v => { setParam(p.key, Math.round(v / p.step) * p.step); render(); };
    wiggling = chain([
      { from: params[p.key], to: p.max, dur: 900, onUpdate: upd },
      { from: p.max, to: p.min, dur: 1400, onUpdate: upd },
      { from: p.min, to: p.init, dur: 900, onUpdate: upd },
    ], () => { wiggling = null; });
  });

  if (cfg.drag) {
    const cv = graph.canvas;
    let start = null;
    cv.style.touchAction = 'none';
    cv.addEventListener('pointerdown', e => {
      stopWiggle();
      start = { x: e.clientX, y: e.clientY, ps: { ...params } };
      cv.setPointerCapture(e.pointerId);
    });
    cv.addEventListener('pointermove', e => {
      if (!start) return;
      const dx = (e.clientX - start.x) / graph.scale;
      const dy = -(e.clientY - start.y) / graph.scale;
      for (const key of cfg.drag) {
        const p = cfg.params.find(q => q.key === key);
        const delta = key === 'h' ? dx : dy;
        const v = clamp(Math.round((start.ps[key] + delta) / p.step) * p.step, p.min, p.max);
        setParam(key, v);
      }
      render();
    });
    cv.addEventListener('pointerup', () => { start = null; });
  }

  const fnFor = ps => x => cfg.fn(ps, x, state.shape);

  function render() {
    graph.grid();
    if (cfg.ghost) graph.curve(fnFor(cfg.ghost), { color: C.ink, alpha: 0.22, width: 3 });
    if (cfg.target) graph.curve(fnFor(cfg.target), { color: C.ink, alpha: 0.75, width: 3, dash: [9, 8] });
    if (cfg.arrows && cfg.ghost && cfg.pointAt) {
      for (const bx of cfg.arrows) {
        const [gx, gy] = cfg.pointAt(cfg.ghost, bx);
        const [cx, cy] = cfg.pointAt(params, bx);
        if (Math.hypot(cx - gx, cy - gy) > 0.3) {
          graph.point(gx, gy, { color: C.ink, r: 4, alpha: 0.3 });
          graph.arrow(gx, gy, cx, cy, { color: cfg.arrowColor || C.inkSoft });
        }
      }
    }
    graph.curve(fnFor(params), { color: cfg.curveColor || C.red, width: 4, glow: true });
    if (cfg.decorate) cfg.decorate(graph, params, state.shape);
    eqEl.innerHTML = cfg.eq(params, state.shape);
    if (cfg.onChange) cfg.onChange(params);
  }

  graph.onResize = render;
  render();
  return { root, graph, params, state, render, setParam };
}
