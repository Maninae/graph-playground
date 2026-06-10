# Graph Playground — agent onboarding

Interactive single-page site teaching how graphs move when you tweak their
equation (`y = a·f(x − h) + k`), pitched at ~8th grade (algebra and quadratics
known) and math-averse adults.
Live at https://maninae.github.io/graph-playground/ (GitHub Pages, repo
`Maninae/graph-playground`, deploys from `main`, no build step).

## Run locally

ES modules require a server — `file://` will not work:

```
python3 -m http.server 8000   # then open http://localhost:8000
```

Plain HTML + CSS + vanilla JS. No frameworks, no bundler, no dependencies
beyond Google Fonts.

## Architecture

State lives in each section's builder; everything in `graph.js`/`util.js`/
`equation.js` is a stateless helper or a self-contained class. Dependency
direction: `main.js → section builders → graph/equation/util → config`.
No circular imports.

| File | Responsibility |
|------|----------------|
| `index.html` | All copy, section scaffolding, popup `<template>`s, cheat-sheet table |
| `styles/base.css` | Design tokens, reset, typography, callouts |
| `styles/components.css` | Widget cards, equation chips, sliders, buttons, popups, boss-level UI |
| `styles/sections.css` | Header, hero, step layout, cheat table, footer, responsive |
| `scripts/config.js` | Palette constants + the shape library (`SHAPES`: functions, notation, notes, asymptote/edge metadata) |
| `scripts/util.js` | Tweens, easing, reduced-motion flag, confetti, library card thumbnails |
| `scripts/graph.js` | `GraphCanvas`: retina canvas, math↔pixel mapping, grid/curve/point/arrow primitives |
| `scripts/equation.js` | Colored live equation chips (`fmt`, `chip`, `innerX`, `eqGeneric`) |
| `scripts/widgets.js` | `buildWidget`: the generic station (sliders + graph + equation + ghost/target/arrows/drag) |
| `scripts/machine.js` | Step 1: function-machine intro (drag x, sweep, reveal line) |
| `scripts/race.js` | Step 3: copycat-race animation (the minus-means-right intuition) |
| `scripts/challenge.js` | Boss level: 6 match-the-ghost rounds, stars, confetti |
| `scripts/popups.js` | Deep-dive popup cards from `<template id="pop-*">` |
| `scripts/main.js` | Wires every section; hero ambient animation; all per-section widget configs |

## Load-bearing conventions

- **Knob colors are pedagogy, not decoration.** Green = k (up/down),
  blue = h (sideways), yellow = a (stretch/flip; the CSS var is still named
  `--orange`), red = the player's curve. They match across sliders, equation
  chips, arrows, and prose. Don't reassign them. CSS custom property `--c`
  carries the color into each `.ctrl-row` / `.echip`. The look is
  3blue1brown-style: near-black blue page with fixed full-page gridlines,
  manim-bright glowing curves, STIX Two Text for headings/equations.
- **Equal-aspect axes.** `GraphCanvas` derives the y-range from the x-span
  and aspect ratio so 1 unit is the same length on both axes — slopes and
  shapes look true. Don't add independent y-scaling.
- **Step 3 uses an upside-down parabola dome on purpose.** A line slid
  sideways looks identical to a line slid down (no landmark), which destroys
  the lesson. Any shape used to teach h must have a trackable peak/vertex.
- **The race curve must be non-periodic.** With a sinusoid, "3 behind" is
  visually indistinguishable from some other phase shift, so the delayed-copy
  story collapses. `race.js` uses a sum of Gaussian bumps with one-of-a-kind
  landmarks (hill, dip, peak); keep that property if you change the curve.
- **Reduced motion**: every animation checks `REDUCED` from `util.js` and
  jumps to the final state. Keep that for anything new.
- Keep modules under ~300 lines (house rule) — split before they grow.

## How to…

- **Add a shape**: one entry in `SHAPES` (`config.js`) — required: `f`
  (parent function, should roughly fit y ∈ [−6, 6] for x ∈ [−7, 7]), `expr`
  (equation body around the rendered inside), `label`, `sub` (card formula),
  `note` (behavior blurb, HTML ok). Optional: `asymV`/`asymH` (dashed guides
  at x = h / y = k), `edge` (domain endpoint dot at (h, k)), `ycenter`
  (view center while selected), `thumbX`/`thumbY` (thumbnail window).
  The library card grid, notes, guides, and `eqGeneric` pick it up
  automatically. Discontinuous shapes are fine — `GraphCanvas.curve` breaks
  segments on non-finite values and on jumps > 3× the view height.
- **The b knob** (horizontal squeeze, pink) exists only in the library:
  the library `fn` is `a·f(b·(x − h)) + k`, and `eqGeneric` renders the b
  chip only when `b` is present in the params. Walkthrough and boss stay
  three-knob.
- **Add a boss round**: append to `LEVELS` in `challenge.js`. Sliders are
  near-continuous (step 0.01), so winning is tolerance-based (`TOL`:
  a ±0.1, h/k ±0.15) and the curve snaps to the exact target on a win.
  Keep targets well inside slider ranges.
- **Add a section**: copy a `.step` block in `index.html`, mount a widget
  via `buildWidget` in `main.js`. Set the section's `--c` accent.
- **Add a popup**: `<button class="term" data-pop="foo">` + a
  `<template id="pop-foo">` containing 2–4 sentences and one external link.
