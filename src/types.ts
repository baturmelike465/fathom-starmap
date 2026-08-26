/* Shared type definitions for the starmap engine. */

export interface StarNode {
  id: string;
  g: 'note' | 'log';
  w: number;           // inbound link count
  p: string;           // vault path
  d: string;           // date string YYYY-MM-DD
  dated: boolean;      // true when date came from the title, not filesystem
  b: number;           // file size in bytes
  x: number; y: number; z: number;     // world-space position
  vx: number; vy: number; vz: number;  // velocity
  r: number;           // base radius
  nbr: Set<number>;    // indices of linked neighbours
  tw: number;          // twinkle phase offset
  fam: string;         // constellation key
  sx: number; sy: number;   // screen position
  ss: number;          // screen scale
  sd: number;          // screen depth
  vis: number;         // 0 or 1 — visibility at current time position
  near: boolean;       // true if too close to the camera
  isNew: boolean;      // appeared since last loadData
  deg: number;         // neighbour count (nbr.size)
  nova: boolean;       // recent note — supernova effect
  nf: number;          // near-camera fade factor (0–1)
  // rendering state (set per frame)
  dim?: number;        // eased dim state for hover (0–1)
  litE?: number;       // eased lit state for focus (0–1)
  lblA?: number;       // eased label alpha (0–1)
  lblOn?: boolean;     // label currently displayed
  lblTier?: number;    // label priority tier (1–3)
  lblWant?: boolean;   // label wanted this frame
  lc?: { lbl: string; adv: number[]; tot: number };  // cached label metrics
  sdS?: number;        // stored screen depth
  hxA?: number;        // helix frozen angle
  [key: string]: any;
}

export interface StarLink {
  s: number;           // source index
  t: number;           // target index
  hl?: number;         // eased highlight (0–1)
  dm?: number;         // eased dim (0–1)
  shF?: number;        // shape fade factor
}

export interface BlackHole {
  x: number; y: number; z: number;
  tx: number; ty: number; tz: number;
  n: number;           // swallowed note count
  init: boolean;
  scr: number;         // screen radius
  sx: number; sy: number;
  ss: number; sd: number;
  near: boolean;
  nf: number;
  lens?: number;       // Einstein radius on screen
  rg?: number;         // galaxy radius reference
}

export interface DyingNode {
  x: number; y: number; z: number;
  fam: string;
  r: number;
  t: number;           // animation progress 0–1
  ph: number;          // random phase for spiral
}

export interface Projectable {
  x: number; y: number; z: number;
  sx: number; sy: number;
  ss: number; sd: number;
  near: boolean;
  nf: number;
}

export interface BackdropStar {
  x: number; y: number; z: number;
  b: number;           // brightness
  l: number;           // size layer (0–2)
}

export interface Particle {
  l: number;           // link offset
  t: number;           // position along link 0–1
  sp: number;          // speed
}

export interface CameraState {
  yaw: number;
  pitch: number;
  targetYaw: number;
  targetPitch: number;
  zoom: number;
  targetZoom: number;
  ctr: { x: number; y: number; z: number };
  focusIdx: number;
  flightMode: boolean;
  cam: { x: number; y: number; z: number };
  vel: { x: number; y: number; z: number };
}

export interface Settings extends Record<string, any> {
  repel: number; spring: number; len: number; center: number;
  heat: number; warp: number; shape: string;
  nodeSize: number; glow: number; nebula: number;
  linkAlpha: number; linkW: number; hue: number;
  twinkle: number; dust: number; stars: number;
  nameSize: number; names: number; novas: number; hole: number;
  spin: number; comets: number; meteors: number;
  thrust: number; vol: number;
}
