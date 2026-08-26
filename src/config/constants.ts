/* Named constants — every magic number in one place.
   Changing a value here changes it everywhere. */

// ---- plugin identity ----
export const VIEW_TYPE = 'fathom-starmap-view';

// ---- physics ----
export const DAMP = 0.86;          // velocity damping per step
export const FOCAL = 900;          // camera focal length
export const F2 = FOCAL / 0.9;    // flight-mode focal
export const ZMIN = 0.07;          // zoom range — deep enough to shrink 5k notes to a marble
export const ZMAX = 5;

// ---- galaxy shapes ----
export const SHAPES = ['natural', 'spiral', 'disc', 'ring', 'shell', 'helix', 'torus', 'clusters', 'cube'] as const;
export type ShapeName = typeof SHAPES[number];

// ---- constellations ----
export interface FamilyDef {
  name: string;
  color: string;
  rgb: string;
  seeds: string[];
  dispName?: string;
  snd?: number;
  [key: string]: any;
}

export const FAMS: Record<string, FamilyDef> = {
  // seeds ship EMPTY: with no custom seeds the plugin colors constellations by
  // top-level folder automatically. Power users can pin notes to constellations
  // by adding a "famSeeds" object to the plugin's data.json:
  //   "famSeeds": {"echo": ["My Hub Note", "Another Note"], ...}
  echo:     { name: 'Echo',     color: '#2EE6C8', rgb: '46,230,200',   seeds: [] },
  core:     { name: 'Core',     color: '#F0B34E', rgb: '240,179,78',   seeds: [] },
  chat:     { name: 'Chat',     color: '#FF6FB0', rgb: '255,111,176',  seeds: [] },
  graphify: { name: 'Projects', color: '#B48CFF', rgb: '180,140,255',  seeds: [] },
  clicky:   { name: 'Ventures', color: '#5E8CFF', rgb: '94,140,255',   seeds: [] },
  ambient:  { name: 'Ambient',  color: '#3FD98F', rgb: '63,217,143',   seeds: [] },
  venture:  { name: 'Legal',    color: '#FF8E5E', rgb: '255,142,94',   seeds: [] },
};

export const FAMORDER = ['echo', 'chat', 'ambient', 'clicky', 'graphify', 'venture', 'core'];

export const RNAME: Record<string, string> = {
  core: 'THE CORE', echo: 'ECHO', chat: 'CHAT', ambient: 'AMBIENT',
  clicky: 'VENTURES', graphify: 'PROJECTS', venture: 'LEGAL'
};

// ---- audio ----
export const PENTA = [523, 659, 587, 440, 494, 349, 392, 330, 698, 262, 784, 415];
export const SCALE = [220, 261.6, 329.6, 392, 523.25];

// ---- star name tiers ----
export const TIERCAP = [0, 12, 14, 12];

// ---- backdrop stars ----
export const BACKDROP_COUNT = 240;
export const BACKDROP_RADIUS_MIN = 1700;
export const BACKDROP_RADIUS_RANGE = 1200;
