// Boss level: a dashed ghost curve appears; the player turns the knobs
// until their curve snaps onto it. Six curated rounds, easy → all knobs.

import { buildWidget } from './widgets.js';
import { C, SHAPES } from './config.js';
import { eqGeneric } from './equation.js';
import { confettiBurst } from './util.js';

const KNOBS = {
  a: { key: 'a', label: 'a — stretch / flip', color: C.orange, min: -3, max: 3, step: 0.05, init: 1 },
  h: { key: 'h', label: 'h — shift sideways', color: C.blue, min: -6, max: 6, step: 0.05, init: 0 },
  k: { key: 'k', label: 'k — shift up / down', color: C.green, min: -5, max: 5, step: 0.05, init: 0 },
};

// Sliders are continuous, so winning is tolerance-based; on a win the
// curve snaps to the exact target.
const TOL = { a: 0.1, h: 0.15, k: 0.15 };

const LEVELS = [
  { shape: 'line', controls: ['k'], fixed: { a: 0.5, h: 0 }, target: { k: 3 },
    hint: 'One knob: vertical translation.' },
  { shape: 'abs', controls: ['h'], fixed: { a: 1, k: -2 }, target: { h: -4 },
    hint: 'Horizontal shift — remember, signs work backwards inside.' },
  { shape: 'abs', controls: ['h', 'k'], fixed: { a: 1 }, target: { h: 3, k: 2 },
    hint: 'Two knobs. Park the vertex on the target’s vertex.' },
  { shape: 'quad', controls: ['a', 'k'], fixed: { h: 0 }, target: { a: 0.5, k: -3 },
    hint: 'Stretch or compress first, then translate.' },
  { shape: 'quad', controls: ['a', 'h'], fixed: { k: 1 }, target: { a: -1, h: 2 },
    hint: 'One of these knobs needs to go negative.' },
  { shape: 'wave', controls: ['a', 'h', 'k'], fixed: {}, target: { a: 2, h: 3, k: -1 },
    hint: 'Final round: all three. Sideways first, then height, then stretch.' },
];

export function buildChallenge(mount) {
  mount.insertAdjacentHTML('beforeend', `
    <div class="challenge">
      <div class="challenge-top">
        <div class="stars" aria-label="progress"></div>
        <p class="challenge-hint"></p>
      </div>
      <div class="challenge-mount"></div>
    </div>`);
  const root = mount.lastElementChild;
  const starsEl = root.querySelector('.stars');
  const hintEl = root.querySelector('.challenge-hint');
  const widgetMount = root.querySelector('.challenge-mount');

  const state = { level: 0, won: false };

  function drawStars() {
    starsEl.innerHTML = LEVELS.map((_, i) =>
      `<span class="star ${i < state.level ? 'earned' : ''} ${i === state.level ? 'current' : ''}">★</span>`
    ).join('');
  }

  function matched(params, level) {
    return level.controls.every(key => Math.abs(params[key] - level.target[key]) <= TOL[key]);
  }

  function loadLevel() {
    const level = LEVELS[state.level];
    state.won = false;
    widgetMount.innerHTML = '';
    hintEl.textContent = `Round ${state.level + 1} of ${LEVELS.length} — ${level.hint}`;
    drawStars();
    const full = ps => ({ ...level.fixed, ...ps });
    let widget = null;
    widget = buildWidget(widgetMount, {
      id: `boss${state.level}`,
      graph: { xspan: 18 },
      params: level.controls.map(key => KNOBS[key]),
      fn: (ps, x) => {
        const { a, h, k } = full(ps);
        return a * SHAPES[level.shape].f(x - h) + k;
      },
      eq: ps => eqGeneric(level.shape, full(ps)),
      target: level.target,
      curveColor: C.red,
      reset: false,
      onChange: ps => {
        if (state.won || !matched(ps, level)) return;
        state.won = true;
        setTimeout(() => {
          if (widget) {
            for (const key of level.controls) widget.setParam(key, level.target[key]);
            widget.render();
          }
          win();
        }, 350);
      },
    });
  }

  function win() {
    confettiBurst(widgetMount, [C.green, C.blue, C.orange, C.pink, C.red]);
    const last = state.level === LEVELS.length - 1;
    widgetMount.querySelector('.widget').insertAdjacentHTML('beforeend', `
      <div class="win-banner">
        <div class="win-text">${last
          ? '🏆 All six. y = a·f(x − h) + k is just three knobs to you now.'
          : '⭐ Nailed it!'}</div>
        <button class="btn next-btn">${last ? '↺ play again' : 'next round →'}</button>
      </div>`);
    widgetMount.querySelector('.next-btn').addEventListener('click', () => {
      state.level = last ? 0 : state.level + 1;
      loadLevel();
    });
    const earned = last ? LEVELS.length : state.level + 1;
    starsEl.innerHTML = LEVELS.map((_, i) =>
      `<span class="star ${i < earned ? 'earned' : ''}">★</span>`
    ).join('');
  }

  loadLevel();
}
