// Section 1: the "graph machine". One slider feeds x into y = x/2 + 1.
// Each input leaves a dot at (x, y); sweeping all inputs reveals the line.
// Color story (kept consistent site-wide): horizontal/input = blue,
// vertical/output = green.

import { GraphCanvas } from './graph.js';
import { C } from './config.js';
import { fmt } from './equation.js';
import { tween, REDUCED } from './util.js';

const f = x => x / 2 + 1;

export function buildMachine(mount) {
  mount.insertAdjacentHTML('beforeend', `
    <div class="widget">
      <div class="eq-display machine-eq"></div>
      <div class="graph-wrap"><canvas aria-label="graph of the machine's answers"></canvas></div>
      <div class="controls">
        <div class="ctrl-row" style="--c:${C.blue}">
          <label class="ctrl-label" for="machine-x">input x</label>
          <input type="range" id="machine-x" min="-8" max="8" step="0.05" value="3">
          <output class="ctrl-value">3</output>
        </div>
        <div class="ctrl-row ctrl-actions">
          <button class="btn sweep-btn">plot every input</button>
          <button class="btn ghost clear-btn">↺ start over</button>
        </div>
      </div>
      <p class="machine-caption">Drag the slider — every run of the machine leaves a point behind.</p>
    </div>`);
  const root = mount.lastElementChild;
  const graph = new GraphCanvas(root.querySelector('canvas'), { xspan: 18 });
  const eqEl = root.querySelector('.machine-eq');
  const slider = root.querySelector('#machine-x');
  const valueEl = root.querySelector('.ctrl-value');
  const caption = root.querySelector('.machine-caption');

  const state = { x: 3, trail: new Map(), revealed: false };
  let sweep = null;

  function remember(x) {
    state.trail.set(Math.round(x * 5) / 5, true);
  }

  function render() {
    const { x } = state;
    const y = f(x);
    graph.grid();
    if (state.revealed) graph.curve(f, { color: C.red, width: 4, glow: true });
    for (const tx of state.trail.keys()) graph.point(tx, f(tx), { color: C.orange, r: 3.5, alpha: 0.55 });
    graph.guide(x, 0, x, y, C.blue);
    graph.guide(0, y, x, y, C.green);
    graph.point(x, y, { color: C.red, r: 7 });
    graph.label(`(${fmt(x)}, ${fmt(y)})`, x, y, { dy: -16, bg: true, color: C.ink });
    eqEl.innerHTML =
      `<var>y</var>&nbsp;=&nbsp;<span class="frac"><span class="num"><span class="echip" style="--c:${C.blue}">${fmt(x)}</span></span><span class="den">2</span></span>` +
      `&nbsp;+&nbsp;1&nbsp;=&nbsp;<span class="echip" style="--c:${C.green}">${fmt(y)}</span>`;
    valueEl.textContent = fmt(x);
  }

  slider.addEventListener('input', () => {
    if (sweep) { sweep.cancel(); sweep = null; }
    state.x = parseFloat(slider.value);
    remember(state.x);
    render();
  });

  root.querySelector('.sweep-btn').addEventListener('click', () => {
    if (sweep) sweep.cancel();
    const finish = () => {
      state.revealed = true;
      sweep = null;
      caption.textContent = 'Every input with its output, plotted at once — the points merge into a line. That line IS the function, drawn.';
      render();
    };
    if (REDUCED) {
      for (let x = -8; x <= 8; x += 0.25) remember(x);
      finish();
      return;
    }
    sweep = tween({
      from: -8, to: 8, dur: 3200,
      onUpdate: v => {
        state.x = v;
        slider.value = v;
        remember(v);
        render();
      },
      onDone: finish,
    });
  });

  root.querySelector('.clear-btn').addEventListener('click', () => {
    if (sweep) { sweep.cancel(); sweep = null; }
    state.trail.clear();
    state.revealed = false;
    state.x = 3;
    slider.value = 3;
    caption.textContent = 'Drag the slider — every run of the machine leaves a point behind.';
    render();
  });

  graph.onResize = render;
  render();
}
