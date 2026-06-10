// GraphCanvas: a responsive, retina-aware canvas with math↔pixel mapping
// and drawing primitives (grid, curves, points, arrows, labels).
// Units are equal-aspect: 1 unit of x is the same length as 1 unit of y,
// so slopes and shapes look true. The y-range is derived from the x-span
// and the canvas aspect ratio.

import { C } from './config.js';

export class GraphCanvas {
  // opts: xspan (math units across), ycenter, aspect (h/w), maxWidth (px),
  //       fillParent (canvas height tracks parent height — used by the hero)
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.xspan = opts.xspan ?? 18;
    this.ycenter = opts.ycenter ?? 0;
    this.aspect = opts.aspect ?? 0.72;
    this.maxWidth = opts.maxWidth ?? 680;
    this.fillParent = opts.fillParent ?? false;
    this.onResize = null;
    this._ro = new ResizeObserver(() => this.resize());
    this._ro.observe(canvas.parentElement);
    this.resize();
  }

  resize() {
    const parent = this.canvas.parentElement;
    const w = Math.min(this.maxWidth, parent.clientWidth);
    if (!w) return;
    const h = this.fillParent ? parent.clientHeight : Math.round(w * this.aspect);
    const dpr = window.devicePixelRatio || 1;
    this.w = w;
    this.h = h;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.scale = w / this.xspan; // px per math unit, both axes
    this.xmin = -this.xspan / 2;
    this.xmax = this.xspan / 2;
    const yspan = h / this.scale;
    this.ymin = this.ycenter - yspan / 2;
    this.ymax = this.ycenter + yspan / 2;
    if (this.onResize) this.onResize();
  }

  setYCenter(v) {
    if (v === this.ycenter) return;
    this.ycenter = v;
    this.resize();
  }

  px(x) { return (x - this.xmin) * this.scale; }
  py(y) { return this.h - (y - this.ymin) * this.scale; }
  mathX(px) { return this.xmin + px / this.scale; }
  mathY(py) { return this.ymin + (this.h - py) / this.scale; }

  grid({ numbers = true } = {}) {
    const { ctx } = this;
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(132,170,235,0.10)';
    for (let x = Math.ceil(this.xmin); x <= Math.floor(this.xmax); x++) {
      ctx.beginPath(); ctx.moveTo(this.px(x), 0); ctx.lineTo(this.px(x), this.h); ctx.stroke();
    }
    for (let y = Math.ceil(this.ymin); y <= Math.floor(this.ymax); y++) {
      ctx.beginPath(); ctx.moveTo(0, this.py(y)); ctx.lineTo(this.w, this.py(y)); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(190,210,250,0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, this.py(0)); ctx.lineTo(this.w, this.py(0)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(this.px(0), 0); ctx.lineTo(this.px(0), this.h); ctx.stroke();
    if (!numbers) return;
    ctx.fillStyle = 'rgba(190,210,250,0.4)';
    ctx.font = '11px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    for (let x = Math.ceil(this.xmin / 2) * 2; x <= this.xmax; x += 2) {
      if (x !== 0) ctx.fillText(String(x), this.px(x), this.py(0) + 15);
    }
    ctx.textAlign = 'right';
    for (let y = Math.ceil(this.ymin / 2) * 2; y <= this.ymax; y += 2) {
      if (y !== 0) ctx.fillText(String(y), this.px(0) - 6, this.py(y) + 4);
    }
  }

  // Plot y = fn(x). opts: color, width, dash, alpha, glow, xTo (partial draw).
  curve(fn, opts = {}) {
    const { ctx } = this;
    const { color = C.ink, width = 3, dash = null, alpha = 1, glow = false } = opts;
    const xEnd = opts.xTo ?? this.xmax;
    if (xEnd <= this.xmin) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, this.w, this.h);
    ctx.clip();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineJoin = ctx.lineCap = 'round';
    if (dash) ctx.setLineDash(dash);
    if (glow) { ctx.shadowColor = color; ctx.shadowBlur = 14; }
    ctx.beginPath();
    const n = 400;
    const jump = 3 * (this.ymax - this.ymin); // discontinuity (e.g. 1/x): break, don't connect
    let started = false;
    let prevY = 0;
    for (let i = 0; i <= n; i++) {
      const x = this.xmin + ((xEnd - this.xmin) * i) / n;
      const y = fn(x);
      if (!Number.isFinite(y)) { started = false; continue; }
      if (started && Math.abs(y - prevY) > jump) started = false;
      const px = this.px(x);
      const py = Math.max(-2000, Math.min(4000, this.py(y)));
      if (started) ctx.lineTo(px, py);
      else { ctx.moveTo(px, py); started = true; }
      prevY = y;
    }
    ctx.stroke();
    ctx.restore();
  }

  point(x, y, { color = C.ink, r = 6, alpha = 1 } = {}) {
    const { ctx } = this;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(this.px(x), this.py(y), r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = C.bg;
    ctx.stroke();
    ctx.restore();
  }

  arrow(x1, y1, x2, y2, { color = C.inkSoft, width = 2.5, dash = null } = {}) {
    const { ctx } = this;
    const ax = this.px(x1), ay = this.py(y1), bx = this.px(x2), by = this.py(y2);
    const len = Math.hypot(bx - ax, by - ay);
    if (len < 10) return;
    const ang = Math.atan2(by - ay, bx - ax);
    const head = 8;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    if (dash) ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx - head * 0.8 * Math.cos(ang), by - head * 0.8 * Math.sin(ang));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx - head * Math.cos(ang - 0.45), by - head * Math.sin(ang - 0.45));
    ctx.lineTo(bx - head * Math.cos(ang + 0.45), by - head * Math.sin(ang + 0.45));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  guide(x1, y1, x2, y2, color) {
    const { ctx } = this;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(this.px(x1), this.py(y1));
    ctx.lineTo(this.px(x2), this.py(y2));
    ctx.stroke();
    ctx.restore();
  }

  label(text, x, y, { color = C.ink, dx = 0, dy = 0, align = 'center', bg = false, font = '700 13px Nunito, sans-serif' } = {}) {
    const { ctx } = this;
    const px = this.px(x) + dx, py = this.py(y) + dy;
    ctx.save();
    ctx.font = font;
    ctx.textAlign = align;
    if (bg) {
      const w = ctx.measureText(text).width + 12;
      ctx.fillStyle = 'rgba(11,13,21,0.85)';
      const bx = align === 'center' ? px - w / 2 : align === 'left' ? px - 6 : px - w + 6;
      ctx.beginPath();
      ctx.roundRect(bx, py - 12, w, 18, 6);
      ctx.fill();
    }
    ctx.fillStyle = color;
    ctx.fillText(text, px, py + 2);
    ctx.restore();
  }
}
