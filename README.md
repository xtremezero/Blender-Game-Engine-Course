# The Complete Game Development Curriculum — Interactive Deck

A **357-slide**, self-contained interactive presentation covering the full classic
game-engine syllabus: 3D foundations → modeling → materials/lighting → physics →
logic systems → GLSL shaders → networking → character animation → production
practice → complete engine reference → glossary.

Built as a **zero-dependency HTML/CSS/JS application** — no build step, no CDN,
no internet. Just open `index.html`.

---

## Running

Double-click **`index.html`** (works from `file://`), or serve it:

```bash
cd bge-curriculum
python -m http.server 8000
# then open http://localhost:8000
```

Verified on modern Chromium/Firefox/Edge. No installation, no framework, no network calls.

## Controls

| Input | Action |
|---|---|
| `→` `↓` `Space` `PgDn` | Next slide |
| `←` `↑` `PgUp` | Previous slide |
| `Home` / `End` | First / last slide |
| `T` or `/` | Contents sidebar (+ full-text search) |
| `O` | Overview grid of all slides (+ filter) |
| `F` | Fullscreen |
| `?` | Keyboard help |
| `Esc` | Close overlays |
| Swipe | Navigate on touch devices |
| Copy button | On every code block (clipboard + fallback) |
| `Ctrl+P` | Print / export **all slides to PDF** (landscape, one slide per page) |

Progress (slides viewed %, last position) persists in `localStorage`; the ⟲ button resets it.

## Structure

```
bge-curriculum/
├── index.html            # app shell + script manifest
├── css/style.css         # design system (slides, callouts, tables, code, chrome)
├── js/app.js             # deck engine: render, nav, TOC, search, overview,
│                         #   syntax highlighter, copy buttons, print export
└── js/slides/
    ├── meta.js           # PARTS + CHAPTERS registry + SLIDES array
    ├── ch01–ch04.js      # Part I   — Foundations & Quickstart        (84 slides)
    ├── ch05–ch08.js      # Part II  — Beginner & Intermediate Games  (107 slides)
    ├── ch09–ch12.js      # Part III — Advanced Systems & Projects     (97 slides)
    ├── ch13a/13b.js      # Part IV  — The Engine Reference            (53 slides)
    └── ch14.js           # Part IV  — Appendix & Glossary             (16 slides)
```

## Slide model

Each chapter file pushes plain objects into the global `SLIDES` array
(loaded as classic scripts — `file://`-safe, no modules):

```js
SLIDES.push(
  { ch: 5, t: "Slide title", k: "chapter",   // kind: cover|divider|chapter|content(omit)
    h: `<h3>Body HTML</h3>
         <div class="callout best"><div class="co-label">&#10003 Best Practice</div><p>…</p></div>
         <pre data-lang="python"><code>escaped code…</code></pre>` }
);
```

- `ch` → chapter number (TOC grouping via `CHAPTERS` in `meta.js`)
- `t` → title (TOC + overview + search index)
- `h` → body HTML; code blocks declare `data-lang` for the highlighter
  (`python`, `glsl`, `js`, `c`, `bash`, `text`) and get a copy button automatically
- Content callouts: `.callout` + `best` | `pitfall` | `tip` | `note` | `term`

**To add slides:** append entries to any `chXX.js` (or a new file + a `<script>` tag in
`index.html` before `app.js`). Everything (TOC, search, overview, counters, print) rebuilds
itself from the registry.

## Content map

| Part | Chapters | Projects & systems |
|---|---|---|
| I | 01–04 | Foreword · Quickstart face-mapping · 3D/engine theory · Blender tooling |
| II | 05–08 | Pumpkin Run (environment/materials/light/sound) · Tube Cleaner (guns/AI/scrolling) · Pinball (Bullet mechanics) · SubRacer (sensors/actuators/GLSL mist) |
| III | 09–12 | Threaded server + netcode · Armature rigging & runtime animation · Flying Buddha logic/message architecture · Yo Frankie! states/levels/split-screen |
| IV | 13–14 | Full engine reference (materials, logic bricks, physics, Python API, performance) · Installation, migration, glossary |

## Notes & caveats

- Engine specifics target the classic BGE API (2.6–2.7x era, UPBGE-compatible);
  Chapters 1/12/14 map every concept to UPBGE/Godot/Unity/Unreal.
- The syntax highlighter is intentionally tiny (regex tokenizer) — tuned for the
  languages used in the deck, not a general-purpose highlighter.
- Printing 363 slides is heavy (~few seconds to build the print DOM) but produces
  a clean one-slide-per-page landscape PDF.
- A served (`http://localhost`) run is only needed if you want the prettiest
  clipboard API behavior; `file://` works with the built-in fallback.
