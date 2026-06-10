# Graph Playground — agent onboarding

Interactive single-page site teaching how graphs move when you tweak their
equation (`y = a·f(x − h) + k`), aimed at kids and math-averse adults.
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
| `scripts/config.js` | Palette constants + the shape library (`SHAPES`) |
| `scripts/util.js` | Tweens, easing, reduced-motion flag, confetti |
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
  blue = h (sideways), orange = a (stretch/flip), red = the player's curve.
  They match across sliders, equation chips, arrows, and prose. Don't
  reassign them. CSS custom property `--c` carries the color into each
  `.ctrl-row` / `.echip`.
- **Equal-aspect axes.** `GraphCanvas` derives the y-range from the x-span
  and aspect ratio so 1 unit is the same length on both axes — slopes and
  shapes look true. Don't add independent y-scaling.
- **Step 3 uses a V-shape on purpose.** A line slid sideways looks identical
  to a line slid down (no landmark), which destroys the lesson. Any shape
  used to teach h must have a trackable corner/vertex.
- **Reduced motion**: every animation checks `REDUCED` from `util.js` and
  jumps to the final state. Keep that for anything new.
- Keep modules under ~300 lines (house rule) — split before they grow.

## How to…

- **Add a shape**: one entry in `SHAPES` (`config.js`) — `f` (parent
  function, should roughly fit y ∈ [−6, 6] for x ∈ [−7, 7]), `expr`
  (equation body around the `(x − h)` chip markup), `label`. The playground
  picker and `eqGeneric` pick it up automatically.
- **Add a boss round**: append to `LEVELS` in `challenge.js`. Targets must
  land exactly on slider steps (`a`: 0.25, `h`/`k`: 0.5) or the round is
  unwinnable — match tolerance is 0.01.
- **Add a section**: copy a `.step` block in `index.html`, mount a widget
  via `buildWidget` in `main.js`. Set the section's `--c` accent.
- **Add a popup**: `<button class="term" data-pop="foo">` + a
  `<template id="pop-foo">` containing 2–4 sentences and one external link.
