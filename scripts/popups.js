// Deep-dive popups: <button class="term" data-pop="id"> opens the matching
// <template id="pop-id"> as a floating card near the trigger. One open at a
// time; closes on outside click or Escape.

import { clamp } from './util.js';

export function initPopups() {
  let card = null;

  function close() {
    if (card) { card.remove(); card = null; }
  }

  function open(trigger) {
    close();
    const tpl = document.getElementById('pop-' + trigger.dataset.pop);
    if (!tpl) return;
    card = document.createElement('div');
    card.className = 'popup';
    card.setAttribute('role', 'dialog');
    card.innerHTML = tpl.innerHTML + '<button class="popup-close" aria-label="close">×</button>';
    document.body.appendChild(card);
    const r = trigger.getBoundingClientRect();
    const w = Math.min(330, window.innerWidth - 24);
    card.style.width = w + 'px';
    card.style.left = clamp(r.left + r.width / 2 - w / 2, 12, window.innerWidth - w - 12) + 'px';
    card.style.top = r.bottom + window.scrollY + 10 + 'px';
    card.querySelector('.popup-close').addEventListener('click', close);
  }

  document.addEventListener('click', e => {
    const t = e.target.closest('.term');
    if (t) {
      if (card && card.dataset.for === t.dataset.pop) { close(); return; }
      open(t);
      card.dataset.for = t.dataset.pop;
      return;
    }
    if (card && !e.target.closest('.popup')) close();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
}
