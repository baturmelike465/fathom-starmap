# Fathom Starmap — Requirements

**Purpose of this document.** This is the living record of *everything the plugin
currently does*. It exists so that a refactor can move code around freely without
losing a single behaviour: after any change, the plugin must still satisfy every
item below. If a behaviour is added or intentionally removed, it is changed here in
the same commit.

**Source of truth.** Compiled from `main.js` (v1.17.0, 1,845 lines) and `README.md`.
Where a detail was read directly from the code it is stated plainly; where it is
inferred from the README or from behaviour and not yet re-confirmed line-by-line, it
is marked _(confirm during extraction)_.

**Current shape of the code (context, not a requirement).** All behaviour lives in
one file: a `StarmapView extends ItemView` class (roughly lines 116–1831) whose
`startEngine()` method builds the entire engine as nested closures, plus a small
`FathomStarmapPlugin extends Plugin` class at the end. Tunables live in two
top-level objects, `DEF` (default values) and `SLIDERS` (slider metadata). This
structure is what the refactor changes; the behaviours below are what it must keep.

---

## 1. Plugin lifecycle & Obsidian integration

- Registers a custom view type `fathom-starmap-view`.
- Adds a left-ribbon icon (`star`, tooltip "Fathom Starmap") that opens the view.
- Adds a command "Open starmap" (id `open-fathom-starmap`) that opens the view.
- Opening reuses an existing starmap leaf if one is already open; otherwise it opens
  a new leaf and reveals it.
- Declares `isDesktopOnly: true` in the manifest — the plugin is desktop-only.
- On view close, tears down its resources (animation loop, audio context, listeners).
- Reads Obsidian's own resolved-link index and file metadata live; re-reads when the
  vault changes so edits show up in the map.

## 2. Data model — vault → galaxy

- Each note (markdown file) becomes one **star** (node).
- Each resolved link between notes becomes one **thread of light** (edge).
- Node attributes derived from the note: name, top-level folder ("family"), file
  **size** (drives mass/weight — the largest file is the heaviest object), and
  creation/first-seen **date** (drives the timeline).
- Notes are grouped into **families** by their top-level folder; families drive
  colour and constellation grouping.
- Only note metadata is used (names, folders, sizes, dates, link index). **Note
  contents are never read.**

## 3. Physics simulation

- Force-directed 3D layout: stars **repel** each other (`repel`), links act as
  **springs** that attract (`spring`, rest length `len`), and a **center** force
  (`center`) holds the whole galaxy together.
- Repulsion is O(n²) — every star pushes on every other star _(confirm during
  extraction; README states this explicitly)_.
- Optional **heat** force jitters stars ("boil the stars"); optional **time warp**
  (`warp`) scales simulation speed.
- The layout **settles and then freezes**: `warp` defaults to 0, so after the opening
  settle the simulation stops stepping and the galaxy idles at full framerate even on
  large vaults (tested at 2,000 and 5,000 notes per README). Turning `warp` up on a
  large vault (~1,500+ notes) intentionally makes the simulation heavy again.
- Simulation advances on a fixed-step accumulator (`stepAcc`) so motion is
  frame-rate independent.

## 4. Galaxy shapes

- One click reshapes the entire galaxy into any of: **natural, spiral, disc, ring,
  shell, helix, torus, clusters, cube.**
- **clusters** shape: each constellation drifts to its own island.
- Shape choice biases the target positions the physics relaxes toward.
- Default shape is `disc` (per `DEF`).

## 5. Rendering (Canvas 2D)

- Renders the whole scene to a 2D canvas each frame with a 3D→2D projection
  (`project`) and painter's-order depth sorting.
- **Stars**: size (`nodeSize`), **glow** (`glow`), **twinkle** (`twinkle`).
- **Links**: brightness (`linkAlpha`) and thickness (`linkW`).
- **Nebula fog** (`nebula`) painted around each constellation cluster.
- **Backdrop stars** (`stars`) and **stardust** (`dust`) as ambient background layers.
- **Universe hue** (`hue`, 0–360): rotates the hue of the entire palette via `rotHue`,
  recolouring families live.
- **Star names** (`names`) rendered at size `nameSize`.
- Honours `reduceMotion` — motion-heavy behaviours are toned down when the OS/user
  prefers reduced motion _(confirm exact scope during extraction; the flag is checked
  in ~16 places)_.

## 6. Constellations, families & colour

- Families = top-level folders; each family gets a distinct colour.
- Colours are auto-assigned to be maximally distinct (a hue-spacing search picks the
  most-separated hues, then the most-distinct saturation/lightness pairing).
- Constellation **names wheel on tilted 3D orbital rings** around the galaxy.
- **Legend**: clicking a family/legend entry **solos** that constellation.
- When `hue` is non-zero, family colours are rotated to match.

## 7. Black hole & gravitational lensing

- Notes in `Archive/` or `_to_delete/` are pulled into a **black hole** _(confirm
  folder list during extraction)_.
- The hole has a banded **accretion disk** and a **lensed halo**.
- **Real gravitational lensing**: the point-mass lens equation applied twice — (a)
  star positions behind the hole are deflected (a star dead-behind lands on the
  Einstein ring, with a secondary inverted image inside the ring), and (b) the painted
  sky around the horizon is re-rendered pulled toward the hole slice by slice, so fog,
  glow and text smear and wrap.
- Deleting/archiving a note animates it spiralling in.
- Hovering the hole shows how many notes it has swallowed.
- Strength/visibility controlled by the `hole` slider (0 hides it).

## 8. Camera & pointer controls

- **Drag** to orbit/rotate the galaxy.
- **Pinch** (two pointers) to zoom _(confirm: `ptrs.size===2` path)_.
- **Right-click** on a star opens a context menu (never starts a drag).
- **Click** on a star (when not flying, within a small movement threshold) opens the
  underlying note in Obsidian.
- **Hover** a star highlights it (and, with sound on, plays a per-constellation blip).
- **Esc** exits flight / zen mode.

## 9. Spaceship flight mode

- Press **W** to take off into flight mode.
- Mouse aims; **WASD** thrusts; **Shift** boosts; **Esc** lands.
- Thrust magnitude controlled by the `thrust` slider.
- Entering flight mode switches the view into an immersive ("zen") state _(confirm
  exact UI hide/show during extraction)_.

## 10. Search

- A search input finds any star by name (type-ahead results list).
- **Arrow keys** move the selection in the results; selecting flies the camera to that
  star.
- Empty query hides the results box.

## 11. Timeline / time replay

- A scrubber replays the vault's growth: stars appear in creation-date order from the
  first note onward.
- **Play** runs the replay automatically; reaching the end (or pressing play at the
  end) resets to the start.
- Visibility of each star is gated by whether its date is ≤ the current timeline
  position.

## 12. Supernovas (recent notes)

- Notes created/touched in the last few days pulse with a **supernova corona**.
- Intensity controlled by the `novas` slider.

## 13. Guided tour

- A tour steps the camera through hub notes / highlights, showing captions.
- Auto-advances after a hold interval (longer when `reduceMotion` is set); ends with a
  closing "Fathom Starmap" caption.
- Can be started and stopped; starting while running stops it.

## 14. Ambient soundscape (Web Audio)

- Optional ambient **drone** built from oscillators (e.g. layered low tones) plus
  filtered noise (solar-wind style) via the Web Audio API.
- **Blip** cue per constellation on hover; echo/response while flying.
- Volume via the `vol` slider; a sound toggle button starts/stops audio.
- Requires a user gesture to start the AudioContext; if it can't resume, the sound
  button reflects the failure and hides/marks itself.
- **Fades out** on stop rather than hard-cutting (called out positively by users).
- Audio context is closed on view close.

## 15. Comets & meteors

- Ambient **comets** (`comets`, up to ~250) drift through the scene.
- Periodic **meteor showers** (`meteors`).
- Both are decorative background motion, scaled by their sliders (0 = off).

## 16. Settings / control panel

- A slide-out panel exposes **every** tunable as a slider, grouped into sections:
  **forces, display, motion, sound** (from `SLIDERS[].sec`).
- Full slider set (24 controls): center force, repel force, link force, link distance,
  heat, time warp, star size, glow, nebula fog, link brightness, link thickness,
  universe hue, twinkle, stardust, backdrop stars, name size, star names, supernovas,
  black hole, idle spin, comets, meteor shower, flight thrust, volume.
- Each slider shows its live formatted value and updates the scene immediately.
- A **shape picker** lets the user switch galaxy shapes from the panel.
- **Restore defaults** resets all values to `DEF`.
- Settings are **persisted** via the plugin data store and reloaded on open.

## 17. Star interaction summary

- Click → open the note in Obsidian.
- Right-click → star context menu.
- Hover → highlight + optional audio blip.
- Search select / tour / timeline → camera behaviours as above.

## 18. Performance requirements

- After the initial settle, the frozen-physics idle must hold full framerate on large
  vaults (target: smooth at 5,000 notes).
- The one-time settle and any `warp`>0 physics is where cost is expected.
- _(Open item from user feedback: a GPU-load / performance pass is requested; not yet a
  guaranteed behaviour.)_

## 19. Accessibility

- Respects reduced-motion preference (`reduceMotion`) by lengthening/holding tour steps
  and toning down motion _(confirm full scope during extraction)_.

## 20. Privacy (hard requirement)

- **No network calls, no telemetry.** Nothing leaves the machine.
- Only Obsidian's link index and note metadata (names, folders, sizes, dates) are read
  — never note contents. This must remain true after the refactor.

---

## Known open items (from user/Reddit feedback — not yet built)

These are **not** current behaviours; they are captured here so the refactor leaves
room for them:

1. **Ignore/exclude folders** so large vaults aren't flooded (most-requested).
2. **Per-folder / per-region colour control** and showing all folders at once
   (folder cap was removed in v1.16.0).
3. **Desktop live-wallpaper** mode (promised in replies).
4. **Camera re-center / recenter control** — a user reported the galaxy stuck
   off-centre after the v1.16.0 fix; still unresolved.
5. **Performance pass** to reduce GPU load.
