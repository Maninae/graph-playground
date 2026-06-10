// The copycat race: two pens draw left-to-right at the same speed.
// The black pen draws y = f(x); the blue pen draws y = f(x − 3), which means
// at every moment it performs the move the black pen made 3 steps ago.
// This is THE intuition for why "minus inside" slides a graph RIGHT.

import { GraphCanvas } from './graph.js';
import { C } from './config.js';
import { tween, easeLinear, REDUCED } from './util.js';

const DELAY = 3;
const f = x => 2.2 * Math.sin(1.1 * x) + 0.18 * x; // a wiggly "roller coaster"
const g = x => f(x - DELAY);

export function buildRace(mount) {
  mount.insertAdjacentHTML('beforeend', `
    <div class="widget race-widget">
      <div class="graph-wrap"><canvas aria-label="two pens drawing the same curve, one delayed"></canvas></div>
      <div class="controls">
        <div class="ctrl-row ctrl-actions">
          <button class="btn race-btn">🏁 run the race</button>
        </div>
      </div>
      <p class="race-caption">
        <strong style="color:${C.ink}">black pen</strong> draws y = wave(x).
        <strong style="color:${C.blue}">blue pen</strong> draws y = wave(x&hairsp;<span class="echip" style="--c:${C.blue}">−&hairsp;3</span>):
        the exact same dance, 3 steps late. A 3-step delay <em>is</em> a slide to the right.
      </p>
    </div>`);
  const root = mount.lastElementChild;
  const graph = new GraphCanvas(root.querySelector('canvas'), { xspan: 18, aspect: 0.6 });
  const btn = root.querySelector('.race-btn');

  const state = { t: null, done: false }; // t = current pen x, null = not started
  let run = null;

  function render() {
    graph.grid();
    if (state.t === null) {
      // Preview before the first run: both curves, faint.
      graph.curve(f, { color: C.ink, width: 3, alpha: 0.2 });
      graph.curve(g, { color: C.blue, width: 3, alpha: 0.2 });
      return;
    }
    const { t } = state;
    graph.curve(f, { color: C.ink, width: 3.5, xTo: t });
    graph.curve(g, { color: C.blue, width: 3.5, xTo: t, glow: true });
    // Echo arrow: the blue pen's height right now is the black curve's
    // height 3 units back.
    if (t - DELAY > graph.xmin + 0.4) {
      graph.point(t - DELAY, f(t - DELAY), { color: C.ink, r: 4, alpha: 0.45 });
      graph.arrow(t - DELAY, f(t - DELAY), t - 0.25, g(t), { color: C.blue, dash: [5, 5], width: 2 });
    }
    graph.point(t, f(t), { color: C.ink, r: 7 });
    graph.point(t, g(t), { color: C.blue, r: 7 });
    if (!state.done) {
      graph.label('me first!', t, f(t), { dy: -16, bg: true, color: C.ink });
      graph.label('copying, 3 late', t, g(t), { dy: 22, bg: true, color: C.blue });
    }
  }

  btn.addEventListener('click', () => {
    if (run) run.cancel();
    state.done = false;
    btn.textContent = '🏁 racing…';
    const finish = () => {
      state.t = graph.xmax;
      state.done = true;
      run = null;
      btn.textContent = '↺ run it again';
      render();
    };
    if (REDUCED) { finish(); return; }
    run = tween({
      from: graph.xmin, to: graph.xmax, dur: 6500, ease: easeLinear,
      onUpdate: v => { state.t = v; render(); },
      onDone: finish,
    });
  });

  graph.onResize = render;
  render();
}
