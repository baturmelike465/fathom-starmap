# Fathom Starmap — Phase 2 architecture plan (for review)

**Status: proposal. No code has been changed.** This plan is here to be read and
approved (or edited) before any extraction begins. It maps the current single
`main.js` onto a modular TypeScript project and defines the build/test/release
plumbing. Every behaviour in `REQUIREMENTS.md` must survive the move.

---

## Guiding rules

1. **Behaviour-preserving.** The refactor changes structure, not what the plugin does.
   `REQUIREMENTS.md` is the acceptance checklist after every step.
2. **Always shippable.** The plugin must build and run after every commit. No
   "big-bang" rewrite.
3. **Mechanical first, risky last.** Do the safe, boring moves (build setup, TS
   conversion, pulling out constants) before touching the physics/render maths.
4. **One source of truth for numbers.** Every magic number becomes a named,
   documented constant in one place, so the "tuned look" is never lost or duplicated.

---

## Target folder layout

```
fathom-starmap/
├── manifest.json
├── package.json            # new — deps + build scripts
├── tsconfig.json           # new — TypeScript strict mode
├── biome.json              # new — lint + format
├── esbuild.config.mjs      # new — the standard Obsidian build
├── .gitignore              # new
├── versions.json
├── README.md
├── REQUIREMENTS.md
├── images/
├── src/
│   ├── main.ts             # plugin class + view registration (thin)
│   ├── view/
│   │   └── StarmapView.ts  # ItemView shell; wires modules together
│   ├── config/
│   │   ├── defaults.ts     # DEF values
│   │   ├── sliders.ts      # SLIDERS metadata, co-located with defaults
│   │   └── constants.ts    # all other magic numbers, named + commented
│   ├── data/
│   │   └── vault-graph.ts  # buildData: notes+links -> nodes/edges (pure-ish)
│   ├── physics/
│   │   ├── forces.ts       # repel / spring / center / heat / warp (pure)
│   │   └── shapes.ts       # natural, spiral, disc, ring, shell, helix, torus, clusters, cube
│   ├── rendering/
│   │   ├── project.ts      # 3D -> 2D projection + depth sort (pure)
│   │   ├── scene.ts        # per-frame draw orchestration
│   │   ├── stars.ts        # stars, glow, twinkle, names, supernovas
│   │   ├── links.ts        # link threads
│   │   ├── nebula.ts       # nebula fog + backdrop stars + stardust
│   │   ├── blackhole.ts    # accretion disk + gravitational lensing maths
│   │   └── palette.ts      # rotHue + family colour assignment
│   ├── audio/
│   │   └── soundscape.ts   # Web Audio drone, blips, fade-out
│   ├── camera/
│   │   ├── controls.ts     # drag / pinch / hover / click / right-click menu
│   │   └── flight.ts       # WASD flight mode
│   ├── features/
│   │   ├── search.ts       # type-ahead + fly-to
│   │   ├── timeline.ts     # time replay / scrubber
│   │   └── tour.ts         # guided tour
│   └── ui/
│       └── panel.ts        # settings panel (sliders, shape picker, restore defaults)
└── tests/
    ├── forces.test.ts
    ├── shapes.test.ts
    ├── vault-graph.test.ts
    └── palette.test.ts
```

## What each domain owns (mapped from today's code)

| Module | Comes from (today) | Notes |
|---|---|---|
| `config/*` | `DEF`, `SLIDERS`, scattered literals | Central home for all tunables |
| `data/vault-graph` | `buildData()` | Turn vault + link index into nodes/edges |
| `physics/forces` | the `step()` closure | Pure functions over node arrays |
| `physics/shapes` | shape-target code in `step()` | Position targets per shape |
| `rendering/project` | `project()`, `lensP()` | Pure geometry |
| `rendering/blackhole` | lens equation + disk draw | The astronomy maths, isolated & testable |
| `rendering/palette` | `rotHue()`, colour-pick loop | Family colours |
| `audio/soundscape` | AudioContext setup, blip, drone | Guarded start on user gesture |
| `camera/*` | pointer + key handlers | Split orbit vs flight |
| `features/*` | search / timeline / tour closures | Each self-contained |
| `ui/panel` | slider + panel DOM building | Reads config metadata |
| `view/StarmapView` | the class shell + `startEngine()` glue | Now just wires modules + owns the animation loop |

## Toolchain (standard Obsidian community-plugin setup)

- **TypeScript**, strict mode. Convert `.js` → `.ts` mechanically first (types added
  gradually), so nothing behaves differently on day one.
- **esbuild** bundling `src/main.ts` → `main.js` at the repo root (what Obsidian loads).
  Dev watch + production build scripts in `package.json`.
- **Biome** for lint + format (community defaults as the starting ruleset).
- **Vitest** for unit tests. Start with the pure logic that's easiest to pin down and
  most valuable to protect: `physics/forces`, `physics/shapes`, `data/vault-graph`,
  `rendering/palette`.
- **GitHub Actions CI**: on push/PR run lint, typecheck, test.
- **Release automation**: on merge/tag to `main`, build and publish a semver GitHub
  Release with `main.js` + `manifest.json` (+ `styles.css` if introduced) as assets —
  this is what BRAT and manual installs pull.
- **.gitignore** for a Node/TypeScript project (`node_modules/`, build junk, etc.).

## Phase 3 execution order (when approved)

Each numbered step is its own commit; the plugin builds and runs after each.

1. **Scaffold, no behaviour change:** add `package.json`, `tsconfig`, `biome`,
   `esbuild`, `.gitignore`, CI. Rename `main.js` → `src/main.ts` and make the build
   emit the same `main.js`. Verify the built output loads and behaves identically.
2. **Extract config:** pull `DEF`, `SLIDERS`, and every magic number into `config/`.
   Nothing else moves. This is the highest-value, lowest-risk change.
3. **Extract pure logic:** `data/vault-graph`, `physics/forces`, `physics/shapes`,
   `rendering/project`, `rendering/palette`. Add their unit tests. These are pure, so
   tests can lock in exact current output.
4. **Extract rendering:** `stars`, `links`, `nebula`, `blackhole`, `scene`.
5. **Extract audio, camera, flight.**
6. **Extract features:** `search`, `timeline`, `tour`, and the settings `panel`.
7. **Slim the view:** `StarmapView` becomes glue + the animation loop only.
8. **Final pass:** re-check every item in `REQUIREMENTS.md`; tidy names; confirm CI is
   green and a release builds.

## Risks & how they're handled

- **Losing the "tuned look."** Mitigated by moving `DEF`/constants verbatim in step 2
  and never editing values during the refactor.
- **Subtle maths drift** in physics/lensing. Mitigated by extracting those as pure
  functions with tests that assert current outputs before anything else moves.
- **Behaviour that only shows at runtime** (audio gesture gating, pointer edge cases).
  Mitigated by keeping each commit shippable and manually sanity-checking the view.

---

## Decisions I'd like from you before Phase 3

1. **Go / adjust:** approve this structure, or tell me what to change.
2. **Do it here or on your Mac?** I can run the whole refactor in this workspace and
   hand you the finished repo + a PR, or just hand you these two docs to run in Claude
   Code on your machine.
3. **How far in one go?** All the way to step 8, or stop after step 1–2 (scaffold +
   config) so you can eyeball it first.
4. **`styles.css`:** the plugin currently injects CSS from JS. Fine to keep, or split
   into `styles.css`? (Minor; either works.)
