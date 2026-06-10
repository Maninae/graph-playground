# 📈 Graph Playground

**Slide it. Stretch it. Flip it.** An interactive playground for *feeling* how
graphs move when you tweak their equation — built for kids, and for every
adult who stared at `y = 2(x − 3) + 1` and felt nothing move.

**Play it: [maninae.github.io/graph-playground](https://maninae.github.io/graph-playground/)**

## Why

Why does subtracting 3 *inside* the parentheses slide a graph to the
**right**? Textbooks state the rule next to two static pictures and move on.
Some kids see it instantly; most memorize it, miss it on the test, and decide
math isn't for them.

This site replaces the prose with knobs:

- 🟢 **A function-machine intro** — drag x, watch the answer plot itself, sweep
  every input until the dots melt into a line
- 🔵 **The copycat race** — two pens draw at once; the blue pen copies the black
  pen's every move, 3 steps late. A delay *is* a slide to the right
- 🟠 **Ghost curves and per-point arrows** — every transformation shows where
  each dot came from and where it went
- 🎮 **A boss level** — six rounds of match-the-dashed-ghost, with confetti

No formulas to memorize. Three color-coded knobs (`a`, `h`, `k`) that mean the
same thing in every slider, equation, and arrow on the page.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Plain HTML/CSS/JS — no build step, no dependencies. See `CLAUDE.md` for
architecture notes.
