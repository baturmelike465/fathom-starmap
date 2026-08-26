var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => FathomStarmapPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");

// src/config/constants.ts
var VIEW_TYPE = "fathom-starmap-view";
var DAMP = 0.86;
var FOCAL = 900;
var F2 = FOCAL / 0.9;
var ZMIN = 0.07;
var ZMAX = 5;
var FAMS = {
  // seeds ship EMPTY: with no custom seeds the plugin colors constellations by
  // top-level folder automatically. Power users can pin notes to constellations
  // by adding a "famSeeds" object to the plugin's data.json:
  //   "famSeeds": {"echo": ["My Hub Note", "Another Note"], ...}
  echo: { name: "Echo", color: "#2EE6C8", rgb: "46,230,200", seeds: [] },
  core: { name: "Core", color: "#F0B34E", rgb: "240,179,78", seeds: [] },
  chat: { name: "Chat", color: "#FF6FB0", rgb: "255,111,176", seeds: [] },
  graphify: { name: "Projects", color: "#B48CFF", rgb: "180,140,255", seeds: [] },
  clicky: { name: "Ventures", color: "#5E8CFF", rgb: "94,140,255", seeds: [] },
  ambient: { name: "Ambient", color: "#3FD98F", rgb: "63,217,143", seeds: [] },
  venture: { name: "Legal", color: "#FF8E5E", rgb: "255,142,94", seeds: [] }
};
var FAMORDER = ["echo", "chat", "ambient", "clicky", "graphify", "venture", "core"];
var RNAME = {
  core: "THE CORE",
  echo: "ECHO",
  chat: "CHAT",
  ambient: "AMBIENT",
  clicky: "VENTURES",
  graphify: "PROJECTS",
  venture: "LEGAL"
};
var PENTA = [523, 659, 587, 440, 494, 349, 392, 330, 698, 262, 784, 415];
var SCALE = [220, 261.6, 329.6, 392, 523.25];
var TIERCAP = [0, 12, 14, 12];
var BACKDROP_COUNT = 240;
var BACKDROP_RADIUS_MIN = 1700;
var BACKDROP_RADIUS_RANGE = 1200;

// src/config/defaults.ts
var DEF = {
  repel: 2600,
  spring: 0.02,
  len: 80,
  center: 3e-4,
  heat: 0,
  warp: 0,
  shape: "disc",
  nodeSize: 0.4,
  glow: 2,
  nebula: 0.35,
  linkAlpha: 0.85,
  linkW: 0.8,
  hue: 0,
  twinkle: 2.5,
  dust: 0.85,
  stars: 2.5,
  nameSize: 0.85,
  names: 2,
  novas: 2,
  hole: 2,
  spin: 1,
  comets: 250,
  meteors: 10,
  thrust: 1,
  vol: 1,
  exclude: ""
};

// src/config/sliders.ts
var SLIDERS = [
  { sec: "forces", key: "center", label: "center force", min: -6e-4, max: 1e-3, step: 5e-5 },
  { sec: "forces", key: "repel", label: "repel force", min: 400, max: 9e3, step: 100 },
  { sec: "forces", key: "spring", label: "link force", min: 1e-3, max: 0.08, step: 2e-3 },
  { sec: "forces", key: "len", label: "link distance", min: 10, max: 300, step: 5 },
  { sec: "forces", key: "heat", label: "heat (boil the stars)", min: 0, max: 2.5, step: 0.05 },
  { sec: "forces", key: "warp", label: "time warp", min: 0, max: 3, step: 0.1 },
  { sec: "display", key: "nodeSize", label: "star size", min: 0.4, max: 2.5, step: 0.05 },
  { sec: "display", key: "glow", label: "glow", min: 0, max: 2.2, step: 0.05 },
  { sec: "display", key: "nebula", label: "nebula fog", min: 0, max: 2.2, step: 0.05 },
  { sec: "display", key: "linkAlpha", label: "link brightness", min: 0, max: 2.5, step: 0.05 },
  { sec: "display", key: "linkW", label: "link thickness", min: 0.3, max: 3, step: 0.05 },
  { sec: "display", key: "hue", label: "universe hue", min: 0, max: 360, step: 5 },
  { sec: "display", key: "twinkle", label: "twinkle", min: 0, max: 2.5, step: 0.05 },
  { sec: "display", key: "dust", label: "stardust", min: 0, max: 2.5, step: 0.05 },
  { sec: "display", key: "stars", label: "backdrop stars", min: 0, max: 2.5, step: 0.05 },
  { sec: "display", key: "nameSize", label: "name size", min: 0.4, max: 2.2, step: 0.05 },
  { sec: "display", key: "names", label: "star names", min: 0, max: 2, step: 0.05 },
  { sec: "display", key: "novas", label: "supernovas", min: 0, max: 2, step: 0.05 },
  { sec: "display", key: "hole", label: "black hole", min: 0, max: 2, step: 0.05 },
  { sec: "motion", key: "spin", label: "idle spin", min: 0, max: 4, step: 0.1 },
  { sec: "motion", key: "comets", label: "comets", min: 0, max: 250, step: 5 },
  { sec: "motion", key: "meteors", label: "meteor shower", min: 0, max: 10, step: 0.5 },
  { sec: "motion", key: "thrust", label: "flight thrust", min: 0.3, max: 4, step: 0.1 },
  { sec: "sound", key: "vol", label: "volume", min: 0, max: 2, step: 0.05 }
];

// src/config/styles.ts
var CSS = `
.fsm-root{position:absolute;inset:0;overflow:hidden;background:#04060C;color:#C9D4E8;font-family:var(--font-monospace),Menlo,monospace}
.fsm-root canvas{position:absolute;inset:0;cursor:grab;touch-action:none}
.fsm-root canvas.fsm-drag{cursor:grabbing}
.fsm-cart{position:absolute;top:18px;left:22px;pointer-events:none;z-index:2}
.fsm-cart h1{font-family:Georgia,serif;font-weight:400;font-style:italic;font-size:clamp(20px,3vw,32px);color:#F2F6FF;margin:0;line-height:1.05}
.fsm-cart h1 em{color:#2EE6C8}
.fsm-cart p{margin:6px 0 0;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#55648A}
.fsm-legend{position:absolute;left:22px;bottom:56px;z-index:2;display:flex;flex-direction:column;gap:6px;font-size:10px;letter-spacing:.06em;max-height:46vh;overflow-y:auto;scrollbar-width:thin;padding-right:6px}
.fsm-legend .fsm-row{display:flex;align-items:center;gap:8px;color:#93A3C2;cursor:pointer;user-select:none;transition:opacity .25s}
.fsm-legend .fsm-row.fsm-off{opacity:.28}
.fsm-legend .fsm-dot{width:8px;height:8px;border-radius:50%;flex:none}
.fsm-tip{position:absolute;z-index:3;pointer-events:none;max-width:320px;background:rgba(8,12,24,.93);border:1px solid rgba(46,230,200,.28);padding:7px 11px;font-size:11px;color:#DCE6F7;border-radius:3px;display:none;line-height:1.5}
.fsm-tip .fsm-kind{font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:#2EE6C8;display:block;margin-bottom:2px}
.fsm-search{position:absolute;top:18px;right:22px;z-index:4;width:min(260px,60%)}
.fsm-search input{width:100%;background:rgba(8,12,24,.85);border:1px solid rgba(120,140,185,.3);color:#EAF1FC;font:11px var(--font-monospace),monospace;padding:8px 11px;border-radius:3px;outline:none}
.fsm-search input:focus{border-color:rgba(46,230,200,.6)}
.fsm-results{margin-top:4px;background:rgba(8,12,24,.95);border:1px solid rgba(120,140,185,.25);border-radius:3px;overflow:hidden auto;display:none;max-height:240px}
.fsm-results div{padding:6px 11px;font-size:10px;color:#B9C6DE;cursor:pointer;border-left:2px solid transparent;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fsm-results div:hover,.fsm-results div.fsm-sel{background:rgba(46,230,200,.08);color:#F2F6FF}
.fsm-timeline{position:absolute;left:50%;transform:translateX(-50%);bottom:14px;z-index:4;display:flex;align-items:center;gap:10px;width:min(500px,84%);background:rgba(8,12,24,.75);border:1px solid rgba(120,140,185,.22);padding:8px 12px;border-radius:4px}
.fsm-timeline button{background:none;border:1px solid rgba(46,230,200,.45);color:#2EE6C8;font:10px var(--font-monospace),monospace;padding:4px 9px;border-radius:3px;cursor:pointer;letter-spacing:.08em;flex:none}
.fsm-timeline button:hover{background:rgba(46,230,200,.12)}
.fsm-timeline input[type=range]{flex:1;accent-color:#2EE6C8;cursor:pointer}
.fsm-timeline .fsm-date{font-size:9px;color:#8FA0C0;letter-spacing:.1em;flex:none;min-width:82px;text-align:right}
.fsm-util{position:absolute;right:22px;z-index:4;background:none;border:1px solid rgba(120,140,185,.3);color:#8FA0C0;font:12px var(--font-monospace),monospace;width:32px;height:28px;border-radius:3px;cursor:pointer}
.fsm-util.fsm-on{border-color:rgba(46,230,200,.6);color:#2EE6C8}
.fsm-caption{position:absolute;left:50%;transform:translateX(-50%);bottom:66px;z-index:3;pointer-events:none;max-width:88%;text-align:center;font-family:Georgia,serif;font-style:italic;font-size:clamp(14px,2vw,20px);color:#EAF1FC;opacity:0;transition:opacity .8s;text-shadow:0 2px 12px rgba(0,0,0,.8);line-height:1.35}
.fsm-caption .fsm-sub{display:block;font:9px var(--font-monospace),monospace;letter-spacing:.16em;text-transform:uppercase;color:#8FA0C0;margin-top:5px;font-style:normal}
.fsm-caption.fsm-show{opacity:1}
.fsm-shot{position:absolute;inset:0;z-index:9;background:rgba(2,4,9,.9);display:none;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:4%}
.fsm-shot.fsm-show{display:flex}
.fsm-shot img{max-width:92%;max-height:74%;border:1px solid rgba(120,140,185,.35);border-radius:4px}
.fsm-shot p{font-size:10px;letter-spacing:.1em;color:#8FA0C0;text-transform:uppercase;margin:0}
.fsm-shot button{background:none;border:1px solid rgba(46,230,200,.5);color:#2EE6C8;font:10px var(--font-monospace),monospace;padding:6px 14px;border-radius:3px;cursor:pointer}
.fsm-root.fsm-zen .fsm-cart,.fsm-root.fsm-zen .fsm-legend,.fsm-root.fsm-zen .fsm-search,
.fsm-root.fsm-zen .fsm-timeline,.fsm-root.fsm-zen .fsm-hidezen,.fsm-root.fsm-zen .fsm-tip{display:none!important}
.fsm-panel{position:absolute;top:58px;right:60px;z-index:5;width:238px;max-height:calc(100% - 130px);overflow-y:auto;background:rgba(8,12,24,.94);border:1px solid rgba(120,140,185,.28);border-radius:5px;padding:12px 14px;display:none}
.fsm-panel.fsm-show{display:block}
.fsm-panel h4{margin:10px 0 6px;font:600 9px var(--font-monospace),monospace;letter-spacing:.16em;text-transform:uppercase;color:#2EE6C8}
.fsm-panel h4:first-child{margin-top:0}
.fsm-prow{margin:7px 0}
.fsm-prow .fsm-plbl{display:flex;justify-content:space-between;font-size:10px;color:#93A3C2;margin-bottom:3px}
.fsm-prow .fsm-pval{color:#DCE6F7}
.fsm-prow input[type=range]{width:100%;accent-color:#2EE6C8;cursor:pointer;height:3px}
.fsm-preset{background:none;border:1px solid rgba(120,140,185,.35);color:#93A3C2;font:10px var(--font-monospace),monospace;padding:4px 10px;border-radius:3px;cursor:pointer;margin-top:10px}
.fsm-preset:hover{border-color:rgba(46,230,200,.5);color:#2EE6C8}
`;

// src/utils/color.ts
function rotHue(hex, deg) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h /= 6;
  }
  h = (h + deg / 360) % 1;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (x) => {
    x = (x % 1 + 1) % 1;
    return x < 1 / 6 ? p + (q - p) * 6 * x : x < 0.5 ? q : x < 2 / 3 ? p + (q - p) * (2 / 3 - x) * 6 : p;
  };
  const R = Math.round(f(h + 1 / 3) * 255);
  const G = Math.round(f(h) * 255);
  const B = Math.round(f(h - 1 / 3) * 255);
  return { css: "rgb(" + R + "," + G + "," + B + ")", rgb: R + "," + G + "," + B };
}

// src/utils/hash.ts
function hash(a, b) {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// src/logic/hull.ts
function hull(pts) {
  if (pts.length < 3) return null;
  pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [];
  const up = [];
  for (const p of pts) {
    while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop();
    lo.push(p);
  }
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop();
    up.push(p);
  }
  lo.pop();
  up.pop();
  return lo.concat(up);
}

// src/logic/shapes.ts
function applyShape(nodes, S, view) {
  const shp = S.shape || "natural";
  let shpR = 0;
  if (shp !== "natural" && shp !== "disc" && shp !== "spiral") {
    let sm = 0;
    for (const n of nodes) sm += Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z);
    shpR = sm / nodes.length;
  }
  let clC = null;
  if (shp === "clusters") {
    if (!view.clR) view.clR = shpR || 1;
    const CR = view.clR * 1.6;
    clC = {};
    let ci = 0;
    for (const k of view.famOrder || FAMORDER) {
      const ca = ci * 2.399;
      clC[k] = [Math.cos(ca) * CR, (ci % 3 - 1) * CR * 0.45, Math.sin(ca) * CR];
      ci++;
    }
  }
  for (const n of nodes) {
    n.vx -= n.x * S.center * n.deg;
    n.vy -= n.y * S.center * n.deg;
    n.vz -= n.z * S.center * n.deg;
    if (shp === "disc" || shp === "spiral" || shp === "ring") {
      n.vy -= n.y * 0.05;
    }
    if (shp === "spiral") {
      const r = Math.sqrt(n.x * n.x + n.z * n.z);
      if (r > 26) {
        const th = Math.atan2(n.z, n.x);
        let e = (th - 1.4 * Math.log(r)) % Math.PI;
        if (e < -Math.PI / 2) e += Math.PI;
        if (e >= Math.PI / 2) e -= Math.PI;
        const dth = -e * 0.045;
        n.vx += -Math.sin(th) * r * dth;
        n.vz += Math.cos(th) * r * dth;
      }
    } else if (shp === "ring") {
      const r = Math.sqrt(n.x * n.x + n.z * n.z) || 1;
      const f = (shpR - r) * 0.03;
      n.vx += n.x / r * f;
      n.vz += n.z / r * f;
    } else if (shp === "shell") {
      const r = Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z) || 1;
      const f = (shpR - r) * 0.035;
      n.vx += n.x / r * f;
      n.vy += n.y / r * f;
      n.vz += n.z / r * f;
    } else if (shp === "helix") {
      const r = Math.sqrt(n.x * n.x + n.z * n.z) || 1;
      const f = (shpR * 0.75 - r) * 0.014;
      n.vx += n.x / r * f;
      n.vz += n.z / r * f;
      if (n.hxA === void 0) n.hxA = n.y * 0.012;
      const ang = Math.atan2(n.z, n.x);
      let e = (ang - n.hxA) % Math.PI;
      if (e < -Math.PI / 2) e += Math.PI;
      if (e >= Math.PI / 2) e -= Math.PI;
      const dth = -e * 0.03;
      n.vx += -Math.sin(ang) * r * dth;
      n.vz += Math.cos(ang) * r * dth;
    } else if (shp === "torus") {
      const r = Math.sqrt(n.x * n.x + n.z * n.z) || 1;
      const dr = r - shpR;
      const d = Math.sqrt(dr * dr + n.y * n.y) || 1;
      const f = (shpR * 0.16 - d) * 0.03;
      n.vx += n.x / r * (dr / d) * f;
      n.vy += n.y / d * f;
      n.vz += n.z / r * (dr / d) * f;
    } else if (shp === "clusters" && clC) {
      const cc = clC[n.fam] || clC.core;
      if (cc) {
        n.vx += (cc[0] - n.x) * 6e-3;
        n.vy += (cc[1] - n.y) * 6e-3;
        n.vz += (cc[2] - n.z) * 6e-3;
      }
    } else if (shp === "cube") {
      const hs = shpR * 0.75 || 1;
      let tx = Math.max(-hs, Math.min(hs, n.x));
      let ty = Math.max(-hs, Math.min(hs, n.y));
      let tz = Math.max(-hs, Math.min(hs, n.z));
      const ax2 = Math.abs(n.x), ay2 = Math.abs(n.y), az2 = Math.abs(n.z);
      if (ax2 >= ay2 && ax2 >= az2) tx = (n.x < 0 ? -1 : 1) * hs;
      else if (ay2 >= az2) ty = (n.y < 0 ? -1 : 1) * hs;
      else tz = (n.z < 0 ? -1 : 1) * hs;
      n.vx += (tx - n.x) * 0.012;
      n.vy += (ty - n.y) * 0.012;
      n.vz += (tz - n.z) * 0.012;
    }
  }
}

// src/logic/forces.ts
function physicsStep(nodes, links, S, alpha, view) {
  const shpS = S.shape || "natural";
  const spr = S.spring * (shpS === "natural" ? 1 : 0.3);
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    for (let j = i + 1; j < nodes.length; j++) {
      const b = nodes[j];
      let dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
      let d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < 1) d2 = 1;
      if (d2 > 16e4) continue;
      const f = S.repel / d2, d = Math.sqrt(d2);
      dx /= d;
      dy /= d;
      dz /= d;
      a.vx += dx * f;
      a.vy += dy * f;
      a.vz += dz * f;
      b.vx -= dx * f;
      b.vy -= dy * f;
      b.vz -= dz * f;
    }
  }
  for (const l of links) {
    const a = nodes[l.s], b = nodes[l.t];
    const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
    const f = spr * (d - S.len) / d;
    const wa = 1 / Math.sqrt(a.deg), wb = 1 / Math.sqrt(b.deg);
    a.vx += dx * f * wa;
    a.vy += dy * f * wa;
    a.vz += dz * f * wa;
    b.vx -= dx * f * wb;
    b.vy -= dy * f * wb;
    b.vz -= dz * f * wb;
  }
  const jitter = S.heat * 0.6;
  applyShape(nodes, S, view);
  for (const n of nodes) {
    if (jitter) {
      n.vx += (Math.random() - 0.5) * jitter;
      n.vy += (Math.random() - 0.5) * jitter;
      n.vz += (Math.random() - 0.5) * jitter;
    }
    n.vx *= DAMP;
    n.vy *= DAMP;
    n.vz *= DAMP;
    const m = Math.max(alpha, jitter ? 0.5 : 0);
    n.x += n.vx * m;
    n.y += n.vy * m;
    n.z += n.vz * m;
  }
}

// src/logic/projection.ts
function project(n, cam, W, H) {
  const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
  const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
  if (cam.flightMode) {
    const nx2 = n.x - cam.cam.x, ny2 = n.y - cam.cam.y, nz2 = n.z - cam.cam.z;
    let x2 = nx2 * cy + nz2 * sy, z2 = -nx2 * sy + nz2 * cy;
    const y2 = ny2 * cp - z2 * sp;
    z2 = ny2 * sp + z2 * cp;
    n.near = z2 < 70;
    n.nf = Math.min(1, Math.max(0, (z2 - 70) / 140));
    const s2 = Math.min(8, F2 / Math.max(70, z2));
    n.sx = W / 2 + x2 * s2;
    n.sy = H / 2 + y2 * s2;
    n.ss = s2;
    n.sd = z2 - FOCAL / (0.9 * cam.zoom);
    return;
  }
  const nx = n.x - cam.ctr.x, ny = n.y - cam.ctr.y, nz = n.z - cam.ctr.z;
  let x = nx * cy + nz * sy, z = -nx * sy + nz * cy;
  const y = ny * cp - z * sp;
  z = ny * sp + z * cp;
  const den = FOCAL + z * cam.zoom * 0.9;
  n.near = den < 140;
  n.nf = Math.min(1, Math.max(0, (den - 140) / 200));
  const s = Math.min(6, FOCAL / Math.max(140, den) * cam.zoom);
  n.sx = W / 2 + x * s;
  n.sy = H / 2 + y * s;
  n.ss = s;
  n.sd = z;
}
function lensPoint(p, hole) {
  const thE = hole.lens || 0;
  if (thE <= 0 || hole.near || p.sd <= hole.sd + 10) return;
  const dx = p.sx - hole.sx, dy = p.sy - hole.sy;
  const b = Math.sqrt(dx * dx + dy * dy) || 1e-3;
  if (b > thE * 7) return;
  const k = (b + Math.sqrt(b * b + 4 * thE * thE)) / 2 / b;
  p.sx = hole.sx + dx * k;
  p.sy = hole.sy + dy * k;
}

// src/logic/palette.ts
function hslCol(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return Math.round((l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255);
  };
  const r = f(0), g = f(8), b = f(4);
  return {
    css: "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join(""),
    rgb: r + "," + g + "," + b
  };
}
function hueOfHex(hx) {
  const r = parseInt(hx.slice(1, 3), 16) / 255;
  const g = parseInt(hx.slice(3, 5), 16) / 255;
  const b = parseInt(hx.slice(5, 7), 16) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  if (mx === mn) return 0;
  const d = mx - mn;
  let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return h * 60;
}
function rgbDist(a, b) {
  const p = a.split(",").map(Number);
  const q = b.split(",").map(Number);
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
}
function dynColFor(di, basePal, dynCols) {
  while (dynCols.length <= di) {
    const used = FAMORDER.map((x) => hueOfHex(basePal[x] || FAMS[x].color)).concat(dynCols.map((c) => c.hue));
    let bestH = 0, bestGap = -1;
    for (let h = 0; h < 360; h += 3) {
      let mg = 360;
      for (const u of used) {
        let g2 = Math.abs(h - u) % 360;
        if (g2 > 180) g2 = 360 - g2;
        if (g2 < mg) mg = g2;
      }
      if (mg > bestGap) {
        bestGap = mg;
        bestH = h;
      }
    }
    const others = FAMORDER.map((x) => FAMS[x].rgb).concat(dynCols.map((c) => c.rgb));
    let best = null, bestD = -1;
    for (const [s2, l] of [[0.68, 0.63], [0.5, 0.72], [0.8, 0.53]]) {
      const cand = hslCol(bestH, s2, l);
      let mn = 1e9;
      for (const o of others) {
        const d2 = rgbDist(cand.rgb, o);
        if (d2 < mn) mn = d2;
      }
      if (mn > bestD) {
        bestD = mn;
        best = { ...cand, hue: bestH };
      }
    }
    dynCols.push(best);
  }
  return dynCols[di];
}
function ensureFam(k, famOrder, basePal, dynCols, puffs, glows, makePuff, makeGlowSprite, S, famF) {
  if (FAMS[k]) return k;
  const di = famOrder.length - FAMORDER.length;
  const col = dynColFor(di, basePal, dynCols);
  FAMS[k] = {
    name: k,
    color: col.css,
    rgb: col.rgb,
    seeds: [],
    snd: PENTA[(FAMORDER.length + di) % PENTA.length] * (di >= PENTA.length ? 0.5 : 1)
  };
  basePal[k] = col.css;
  if (S.hue) {
    const r2 = rotHue(col.css, S.hue);
    FAMS[k].color = r2.css;
    FAMS[k].rgb = r2.rgb;
  }
  puffs[k] = makePuff(FAMS[k].color);
  glows[k] = makeGlowSprite(FAMS[k].color);
  famOrder.push(k);
  if (famF) famF[k] = 0;
  return k;
}

// src/audio/soundscape.ts
function createSoundEngine(dead) {
  let AC = null;
  let droneGain = null;
  let spaceEcho = null;
  let soundOn = false;
  function start() {
    try {
      AC = new (window.AudioContext || window.webkitAudioContext)();
    } catch (_) {
      return;
    }
    droneGain = AC.createGain();
    droneGain.gain.value = 0;
    droneGain.connect(AC.destination);
    spaceEcho = AC.createDelay(3);
    spaceEcho.delayTime.value = 0.48;
    const fb = AC.createGain();
    fb.gain.value = 0.5;
    const damp = AC.createBiquadFilter();
    damp.type = "lowpass";
    damp.frequency.value = 1600;
    spaceEcho.connect(damp);
    damp.connect(fb);
    fb.connect(spaceEcho);
    const eo = AC.createGain();
    eo.gain.value = 0.7;
    spaceEcho.connect(eo);
    eo.connect(droneGain);
    for (const [f, g0] of [[52, 0.055], [55.5, 0.045]]) {
      const o = AC.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      const g = AC.createGain();
      g.gain.value = g0;
      o.connect(g);
      g.connect(droneGain);
      o.start();
    }
    const len = 2 * AC.sampleRate;
    const buf = AC.createBuffer(1, len, AC.sampleRate);
    const ch = buf.getChannelData(0);
    let lp = 0;
    for (let i = 0; i < len; i++) {
      lp = lp * 0.97 + (Math.random() * 2 - 1) * 0.03;
      ch[i] = lp * 3;
    }
    const noise = AC.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const bp = AC.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 420;
    bp.Q.value = 0.7;
    const ng = AC.createGain();
    ng.gain.value = 0.16;
    noise.connect(bp);
    bp.connect(ng);
    ng.connect(droneGain);
    ng.connect(spaceEcho);
    const lfo = AC.createOscillator();
    lfo.frequency.value = 0.045;
    const lg = AC.createGain();
    lg.gain.value = 260;
    lfo.connect(lg);
    lg.connect(bp.frequency);
    lfo.start();
    noise.start();
    const ping = () => {
      if (dead()) return;
      if (soundOn && AC.state === "running") {
        const f = SCALE[Math.floor(Math.random() * SCALE.length)] * (Math.random() < 0.3 ? 0.5 : 1);
        const o = AC.createOscillator();
        o.type = "sine";
        o.frequency.setValueAtTime(f, AC.currentTime);
        o.frequency.exponentialRampToValueAtTime(f * 0.985, AC.currentTime + 2.5);
        const g = AC.createGain();
        g.gain.setValueAtTime(0, AC.currentTime);
        g.gain.linearRampToValueAtTime(0.05, AC.currentTime + 0.06);
        g.gain.exponentialRampToValueAtTime(1e-4, AC.currentTime + 3.5);
        o.connect(g);
        g.connect(droneGain);
        g.connect(spaceEcho);
        o.start();
        o.stop(AC.currentTime + 3.6);
      }
      setTimeout(ping, 2500 + Math.random() * 5500);
    };
    setTimeout(ping, 1200);
  }
  async function toggle(vol) {
    if (!AC) start();
    if (!AC) return false;
    if (AC.state !== "running") {
      try {
        await AC.resume();
      } catch (_) {
      }
    }
    if (AC.state !== "running") return false;
    soundOn = !soundOn;
    droneGain.gain.setTargetAtTime(soundOn ? 0.9 * vol : 0, AC.currentTime, 1.2);
    return soundOn;
  }
  function applyVol(vol) {
    if (AC && droneGain && soundOn) {
      droneGain.gain.setTargetAtTime(0.9 * vol, AC.currentTime, 0.4);
    }
  }
  function blip(fam) {
    if (!soundOn || !AC || AC.state !== "running") return;
    const base = FAMS[fam] && FAMS[fam].snd || 480;
    const o = AC.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(base, AC.currentTime);
    o.frequency.exponentialRampToValueAtTime(base * 0.97, AC.currentTime + 0.9);
    const g = AC.createGain();
    g.gain.setValueAtTime(0, AC.currentTime);
    g.gain.linearRampToValueAtTime(0.05, AC.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(1e-4, AC.currentTime + 1.1);
    o.connect(g);
    g.connect(droneGain);
    g.connect(spaceEcho);
    o.start();
    o.stop(AC.currentTime + 1.2);
  }
  function supernova() {
    if (!soundOn || !AC || AC.state !== "running") return;
    const len2 = AC.sampleRate * 1.2;
    const buf = AC.createBuffer(1, len2, AC.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len2; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len2, 2.5);
    const src = AC.createBufferSource();
    src.buffer = buf;
    const lp = AC.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 400;
    const g = AC.createGain();
    g.gain.value = 0.5;
    src.connect(lp);
    lp.connect(g);
    g.connect(droneGain);
    g.connect(spaceEcho);
    src.start();
    const o = AC.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(90, AC.currentTime);
    o.frequency.exponentialRampToValueAtTime(28, AC.currentTime + 1.4);
    const og = AC.createGain();
    og.gain.setValueAtTime(0.4, AC.currentTime);
    og.gain.exponentialRampToValueAtTime(1e-3, AC.currentTime + 1.6);
    o.connect(og);
    og.connect(droneGain);
    o.start();
    o.stop(AC.currentTime + 1.7);
  }
  return {
    start,
    toggle,
    blip,
    supernova,
    applyVol,
    get on() {
      return soundOn;
    },
    get ctx() {
      return AC;
    }
  };
}

// src/wallpaper/template.ts
function wallpaperHTML(dataJSON, settingsJSON, familiesJSON) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Fathom Starmap</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:#03050A;cursor:default}
canvas{display:block;width:100%;height:100%}
#info{position:fixed;bottom:12px;right:16px;color:rgba(160,175,210,0.35);
  font:11px/1.4 Menlo,Consolas,monospace;pointer-events:none;text-align:right}
</style></head><body>
<canvas id="c"></canvas>
<div id="info">fathom starmap wallpaper</div>
<script>
(function(){
"use strict";
// ---- embedded data ----
var DATA=${dataJSON};
var S=${settingsJSON};
var FAMS=${familiesJSON};

// ---- helpers ----
function hash(a,b){var x=Math.sin(a*127.1+b*311.7)*43758.5453;return x-Math.floor(x);}
function rotHue(hex,deg){
  var r=parseInt(hex.slice(1,3),16)/255,g=parseInt(hex.slice(3,5),16)/255,b=parseInt(hex.slice(5,7),16)/255;
  var mx=Math.max(r,g,b),mn=Math.min(r,g,b),h=0,s=0,l=(mx+mn)/2;
  if(mx!==mn){var d=mx-mn;s=l>0.5?d/(2-mx-mn):d/(mx+mn);
    h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6;}
  h=(h+deg/360)%1;var q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q;
  var f=function(x){x=(x%1+1)%1;return x<1/6?p+(q-p)*6*x:x<0.5?q:x<2/3?p+(q-p)*(2/3-x)*6:p;};
  var R=Math.round(f(h+1/3)*255),G=Math.round(f(h)*255),B=Math.round(f(h-1/3)*255);
  return {css:'rgb('+R+','+G+','+B+')',rgb:R+','+G+','+B};
}
function FC(k){
  if(S.hue&&FAMS[k])return rotHue(FAMS[k].color,S.hue);
  return FAMS[k]||{color:'#888',rgb:'136,136,136'};
}

// ---- canvas ----
var canvas=document.getElementById('c'),ctx=canvas.getContext('2d');
var W=0,H=0,DPR=1;
var fogCv=document.createElement('canvas'),fogCtx=fogCv.getContext('2d');
function resize(){
  DPR=Math.min(window.devicePixelRatio||1,2);
  W=window.innerWidth;H=window.innerHeight;
  canvas.width=W*DPR;canvas.height=H*DPR;
  fogCv.width=Math.max(2,Math.round(W*0.7));fogCv.height=Math.max(2,Math.round(H*0.7));
}
window.addEventListener('resize',resize);resize();

// ---- unpack nodes & links ----
var nodes=DATA.nodes,links=DATA.links;
for(var i=0;i<nodes.length;i++){
  var n=nodes[i];n.nbr=new Set(n.nbrArr||[]);n.sx=0;n.sy=0;n.ss=1;n.sd=0;n.near=false;n.nf=1;
}

// ---- backdrop stars ----
var BACKDROP_COUNT=240,BACKDROP_RADIUS_MIN=1700,BACKDROP_RADIUS_RANGE=1200;
var stars=[];
for(var i=0;i<BACKDROP_COUNT;i++){
  var u=hash(i,7)*2-1,th2=hash(i,13)*6.283;
  var rr=BACKDROP_RADIUS_MIN+hash(i,29)*BACKDROP_RADIUS_RANGE,sq=Math.sqrt(Math.max(0,1-u*u));
  stars.push({x:Math.cos(th2)*sq*rr,y:u*rr*0.85,z:Math.sin(th2)*sq*rr,b:0.25+hash(i,3)*0.6,l:i%3});
}

// ---- glow sprites ----
var glows={};
function makeGlow(fam){
  var c=document.createElement('canvas');c.width=128;c.height=128;
  var g=c.getContext('2d');
  var col=FC(fam);
  var gr=g.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,'rgba('+col.rgb+',0.45)');gr.addColorStop(0.4,'rgba('+col.rgb+',0.12)');
  gr.addColorStop(1,'rgba('+col.rgb+',0)');
  g.fillStyle=gr;g.fillRect(0,0,128,128);
  return c;
}
// ---- fog puff sprites ----
var puffs={};
function makePuff(fam){
  var c=document.createElement('canvas');c.width=64;c.height=64;
  var g=c.getContext('2d');
  var col=FC(fam);
  var gr=g.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,'rgba('+col.rgb+',0.22)');gr.addColorStop(0.5,'rgba('+col.rgb+',0.07)');
  gr.addColorStop(1,'rgba('+col.rgb+',0)');
  g.fillStyle=gr;g.fillRect(0,0,64,64);
  return c;
}
var famSet={};
for(var i=0;i<nodes.length;i++){famSet[nodes[i].fam]=true;}
for(var k in famSet){if(!glows[k])glows[k]=makeGlow(k);if(!puffs[k])puffs[k]=makePuff(k);}

// ---- particles (comets) ----
var particles=[];
var N=Math.round(S.comets||0);
for(var i=0;i<N;i++)particles.push({l:i*97,t:(i*0.137)%1,sp:0.0012+((i*53)%100)/100*0.002});

// ---- camera ----
var FOCAL=900;
var yaw=0.4,pitch=0.18,zoom=1;
var ctr={x:0,y:0,z:0};
// centre on the galaxy's centroid
var gcx=0,gcy=0,gcz=0;
for(var i=0;i<nodes.length;i++){gcx+=nodes[i].x;gcy+=nodes[i].y;gcz+=nodes[i].z;}
if(nodes.length){gcx/=nodes.length;gcy/=nodes.length;gcz/=nodes.length;}
ctr.x=gcx;ctr.y=gcy;ctr.z=gcz;

// ---- anchors for fog (high-weight nodes) ----
var anchors=[];
for(var i=0;i<nodes.length;i++){if(nodes[i].w>=3||nodes[i].g!=='log')anchors.push(nodes[i]);}
if(anchors.length>80)anchors.sort(function(a,b){return b.w-a.w;});
anchors=anchors.slice(0,80);

// ---- projection ----
function projectNode(n){
  var cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
  var nx=n.x-ctr.x,ny=n.y-ctr.y,nz=n.z-ctr.z;
  var x=nx*cy+nz*sy,z=-nx*sy+nz*cy;
  var y=ny*cp-z*sp; z=ny*sp+z*cp;
  var den=FOCAL+z*zoom*0.9;
  n.near=den<140;
  n.nf=Math.min(1,Math.max(0,(den-140)/200));
  var s=Math.min(6,FOCAL/Math.max(140,den)*zoom);
  n.sx=W/2+x*s; n.sy=H/2+y*s; n.ss=s; n.sd=z;
}

// ---- draw order (big stars behind) ----
var ord=[];
for(var i=0;i<nodes.length;i++)ord.push(i);
ord.sort(function(a,b){return (nodes[b].r-nodes[a].r)||(a-b);});

// ---- shooting star ----
var shoot=null,shootTimer=1600;

// ---- render loop ----
var t0=performance.now();
var famF={};for(var k in famSet)famF[k]=0;

function frame(now){
  var t=(now-t0)/1000;
  // gentle idle spin
  yaw+=0.00035*(S.spin||1);
  // project all nodes
  for(var i=0;i<nodes.length;i++)projectNode(nodes[i]);

  // ---- background ----
  ctx.setTransform(DPR,0,0,DPR,0,0);
  var bg=ctx.createRadialGradient(W/2,H*0.42,0,W/2,H*0.42,Math.max(W,H)*0.8);
  bg.addColorStop(0,'#080D1A');bg.addColorStop(1,'#03050A');
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);

  // ---- backdrop stars ----
  if(S.stars>0.02){
    var sp={x:0,y:0,z:0,sx:0,sy:0,ss:1,sd:0,near:false,nf:1};
    for(var si=0;si<stars.length;si++){
      var s2=stars[si];sp.x=s2.x;sp.y=s2.y;sp.z=s2.z;
      projectNode(sp);if(sp.near)continue;
      if(sp.sx<-4||sp.sx>W+4||sp.sy<-4||sp.sy>H+4)continue;
      var twk=0.6+0.4*Math.sin(t*1.1+s2.x*0.02);
      ctx.fillStyle='rgba(190,205,235,'+Math.min(0.9,0.12*s2.b*twk*(s2.l+1)*S.stars)+')';
      ctx.fillRect(sp.sx,sp.sy,s2.l>1?1.6:1,s2.l>1?1.6:1);
    }
  }

  // ---- eased dim/lit (simplified: no hover in wallpaper) ----
  for(var i=0;i<nodes.length;i++){
    var n=nodes[i];n.dim=(n.dim||0)*0.91;n.litE=(n.litE||0)*0.85;
  }
  for(var li=0;li<links.length;li++){var l=links[li];l.hl=(l.hl||0)*0.88;l.dm=(l.dm||0)*0.91;}

  // ---- nebula fog ----
  if(S.nebula>0.02){
    fogCtx.setTransform(1,0,0,1,0,0);
    fogCtx.clearRect(0,0,fogCv.width,fogCv.height);
    fogCtx.setTransform(0.7,0,0,0.7,0,0);
    fogCtx.globalCompositeOperation='lighter';
    for(var ai=0;ai<anchors.length;ai++){
      var n=anchors[ai];if(n.near)continue;
      var sprite=puffs[n.fam];if(!sprite)continue;
      var baseR=Math.min(420,(62+n.w*5.5)*n.ss);
      var ext=baseR*2.4;
      if(n.sx<-ext||n.sx>W+ext||n.sy<-ext||n.sy>H+ext)continue;
      var puffN=n.ss>1.8?8:(n.w>=10?16:12);
      for(var p=0;p<puffN;p++){
        var h1=hash(ai,p),h2=hash(ai,p+50),h3=hash(ai,p+100);
        var ang=h1*6.283+t*0.03*(h2-0.5);
        var dist=baseR*(0.15+h2*0.75),R=baseR*(0.55+h3*0.9);
        var a=0.09*S.nebula*(0.6+0.4*Math.sin(t*0.2+h1*6.283))*(n.nf===undefined?1:n.nf);
        if(a<0.009)continue;
        fogCtx.globalAlpha=Math.max(0.008,a);
        fogCtx.drawImage(sprite,n.sx+Math.cos(ang)*dist-R,n.sy+Math.sin(ang)*dist-R,R*2,R*2);
      }
      if(S.dust>0.02){
        fogCtx.fillStyle='rgba('+FC(n.fam).rgb+',0.5)';
        for(var d=0;d<18;d++){
          var h1=hash(ai+300,d),h2=hash(ai+400,d);
          var ang=h1*6.283,dist=baseR*(0.2+h2*0.9);
          var twk2=0.25+0.45*Math.sin(t*1.6+h1*40);
          fogCtx.globalAlpha=Math.min(0.9,0.35*twk2*S.dust);
          fogCtx.fillRect(n.sx+Math.cos(ang)*dist,n.sy+Math.sin(ang)*dist,2.6,2.6);
        }
      }
    }
    fogCtx.globalAlpha=1;
    ctx.globalCompositeOperation='screen';
    ctx.drawImage(fogCv,0,0,W,H);
    ctx.globalCompositeOperation='source-over';
  }

  // ---- shooting star ----
  if(shoot){
    shoot.t+=0.03;
    if(shoot.t>1)shoot=null;
    else{
      var sx=shoot.x+shoot.dx*shoot.t,sy=shoot.y+shoot.dy*shoot.t;
      var g=ctx.createLinearGradient(sx,sy,sx-shoot.dx*0.12,sy-shoot.dy*0.12);
      g.addColorStop(0,'rgba(220,240,255,0.9)');g.addColorStop(1,'rgba(220,240,255,0)');
      ctx.strokeStyle=g;ctx.lineWidth=1.4;
      ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx-shoot.dx*0.12,sy-shoot.dy*0.12);ctx.stroke();
    }
  }else if(S.meteors>0.01&&--shootTimer<=0){
    shootTimer=Math.max(20,(1600+((now|0)%1400))/S.meteors);
    var fromLeft=((now|0)%2)===0;
    shoot={x:fromLeft?-50:W+50,y:H*0.12+((now|0)%Math.max(1,H*0.45|0)),dx:(fromLeft?1:-1)*(W*0.5),dy:H*0.22,t:0};
  }

  // ---- links ----
  for(var li=0;li<links.length;li++){
    var l=links[li],a=nodes[l.s],b=nodes[l.t];
    if(a.near||b.near)continue;
    var depth=Math.max(0.15,Math.min(1,1-((a.sd+b.sd)/2)/420));
    var col=a.fam===b.fam?FC(a.fam).rgb:'120,140,185';
    var baseA=a.fam===b.fam?Math.min(0.9,0.24*depth*S.linkAlpha):Math.min(0.9,0.10*depth*S.linkAlpha);
    var nf2=Math.min(a.nf===undefined?1:a.nf,b.nf===undefined?1:b.nf);
    var alpha2=baseA*nf2;
    if(alpha2<0.01)continue;
    ctx.strokeStyle='rgba('+col+','+Math.min(0.95,alpha2)+')';
    ctx.lineWidth=0.55*S.linkW;
    ctx.beginPath();ctx.moveTo(a.sx,a.sy);ctx.lineTo(b.sx,b.sy);ctx.stroke();
  }

  // ---- particles (comets) ----
  if(links.length)for(var pi=0;pi<particles.length;pi++){
    var p=particles[pi];
    p.t+=p.sp;if(p.t>1){p.t=0;p.l=(p.l+37);}
    var l=links[p.l%links.length],a=nodes[l.s],b=nodes[l.t];
    if(a.near||b.near)continue;
    var x=a.sx+(b.sx-a.sx)*p.t,y=a.sy+(b.sy-a.sy)*p.t;
    ctx.fillStyle='rgba(200,235,255,0.7)';
    ctx.beginPath();ctx.arc(x,y,0.9,0,7);ctx.fill();
  }

  // ---- glows ----
  if(S.glow>0.01){
    ctx.globalCompositeOperation='screen';
    for(var oi=0;oi<ord.length;oi++){
      var n=nodes[ord[oi]];if(n.near)continue;
      var depth=Math.max(0.25,Math.min(1.15,1-n.sd/500));
      var twA=0.18*S.twinkle;
      var tw=1-twA+twA*Math.sin(t*1.4+n.tw*6.283);
      var rad=Math.min(70,n.r*n.ss*S.nodeSize);
      var gr=Math.min(320,rad*(n.g==='log'?4:6)*Math.min(1.6,S.glow));
      if(n.sx<-gr-20||n.sx>W+gr+20||n.sy<-gr-20||n.sy>H+gr+20)continue;
      var gSprite=glows[n.fam];if(!gSprite)continue;
      ctx.globalAlpha=Math.min(0.75,0.4*tw*depth*S.glow*(n.nf===undefined?1:n.nf));
      ctx.drawImage(gSprite,n.sx-gr,n.sy-gr,gr*2,gr*2);
    }
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  }

  // ---- stars (solid dots) ----
  for(var oi=0;oi<ord.length;oi++){
    var n=nodes[ord[oi]],c=FC(n.fam);if(n.near)continue;
    var depth=Math.max(0.25,Math.min(1.15,1-n.sd/500));
    var twA=0.18*S.twinkle;
    var tw=1-twA+twA*Math.sin(t*1.4+n.tw*6.283);
    var rad=Math.min(70,n.r*n.ss*S.nodeSize);
    if(n.sx<-150||n.sx>W+150||n.sy<-150||n.sy>H+150)continue;
    // supernova ring
    if(n.nova&&S.novas>0.02){
      var ph=(t*0.28+n.tw)%1;
      ctx.strokeStyle='rgba('+c.rgb+','+(0.35*(1-ph)*depth*Math.min(1.5,S.novas)*(n.nf===undefined?1:n.nf))+')';
      ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(n.sx,n.sy,rad*(1.6+ph*2.2),0,7);ctx.stroke();
    }
    var nf3=n.nf===undefined?1:n.nf;
    ctx.globalAlpha=Math.min(1,0.35+0.65*depth)*nf3;
    ctx.fillStyle=(n.g==='log'?'rgba('+c.rgb+',0.75)':c.color||c.main||c.css);
    ctx.beginPath();ctx.arc(n.sx,n.sy,Math.max(0.8,rad),0,7);ctx.fill();
    if(n.g!=='log'){
      ctx.fillStyle='rgba(255,255,255,'+(0.55*tw*depth*nf3)+')';
      ctx.beginPath();ctx.arc(n.sx,n.sy,rad*0.38,0,7);ctx.fill();
    }
    ctx.globalAlpha=1;
  }

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
})();
<\/script></body></html>`;
}

// src/wallpaper/export.ts
function exportWallpaper(nodes, links, settings) {
  const exportNodes = nodes.map((n, i) => ({
    id: n.id,
    g: n.g,
    w: n.w,
    fam: n.fam,
    x: n.x,
    y: n.y,
    z: n.z,
    r: n.r,
    tw: n.tw,
    nova: n.nova || false,
    nbrArr: Array.from(n.nbr || [])
  }));
  const exportLinks = links.map((l) => ({ s: l.s, t: l.t }));
  const exportFams = {};
  for (const k of Object.keys(FAMS)) {
    exportFams[k] = { color: FAMS[k].color, rgb: FAMS[k].rgb };
  }
  const wpSettings = { ...settings };
  wpSettings.exclude = void 0;
  wpSettings.vol = void 0;
  wpSettings.warp = 0;
  wpSettings.heat = 0;
  const dataJSON = JSON.stringify({ nodes: exportNodes, links: exportLinks });
  const settingsJSON = JSON.stringify(wpSettings);
  const familiesJSON = JSON.stringify(exportFams);
  return wallpaperHTML(dataJSON, settingsJSON, familiesJSON);
}

// src/main.ts
var StarmapView = class extends import_obsidian.ItemView {
  plugin;
  root;
  S;
  dead = false;
  rafId = 0;
  ro = null;
  AC = null;
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
  }
  getViewType() {
    return VIEW_TYPE;
  }
  getDisplayText() {
    return "Fathom Starmap";
  }
  getIcon() {
    return "star";
  }
  buildData() {
    const app = this.app;
    const exList = (this.S && this.S.exclude || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    const files = app.vault.getMarkdownFiles().filter((f) => {
      if (/^(_to_delete|copilot|Archive)\//.test(f.path)) return false;
      if (f.path.split("/").some((s) => s.startsWith("."))) return false;
      if (exList.length) {
        const top = f.path.split("/")[0].toLowerCase();
        if (exList.some((ex) => top === ex)) return false;
      }
      return true;
    });
    const byPath = {}, nodes = [];
    const group = (p) => /log|journal|daily|session/i.test(p.split("/")[0]) && p.indexOf("/") >= 0 ? "log" : "note";
    for (const f of files) {
      const name = f.basename;
      const m = name.match(/^(\d{4}-\d{2}-\d{2})/);
      const d = m ? m[1] : new Date(f.stat.ctime).toISOString().slice(0, 10);
      byPath[f.path] = name;
      nodes.push({ id: name, p: f.path, g: group(f.path), d, dated: !!m, b: f.stat.size, w: 0 });
    }
    const idxByName = {};
    nodes.forEach((n, i) => idxByName[n.id] = i);
    const linkSet = /* @__PURE__ */ new Set(), resolved = app.metadataCache.resolvedLinks;
    for (const src in resolved) {
      if (!(src in byPath)) continue;
      for (const tgt in resolved[src]) {
        if (!(tgt in byPath)) continue;
        const s = byPath[src], t = byPath[tgt];
        if (s !== t) linkSet.add(s + "" + t);
      }
    }
    const links = [...linkSet].map((k) => {
      const i = k.indexOf("");
      return { s: k.slice(0, i), t: k.slice(i + 1) };
    });
    for (const l of links) nodes[idxByName[l.t]].w++;
    const swallowed = app.vault.getMarkdownFiles().filter((f) => /^(_to_delete|Archive)\//.test(f.path)).length;
    return { nodes, links, swallowed };
  }
  async onOpen() {
    const root = this.contentEl.createDiv({ cls: "fsm-root" });
    this.root = root;
    let st = document.getElementById("fsm-style");
    if (!st) {
      st = document.createElement("style");
      st.id = "fsm-style";
      document.head.appendChild(st);
    }
    st.textContent = CSS;
    root.innerHTML = `
      <canvas></canvas>
      <div class="fsm-cart"><h1>Fathom <em>Starmap</em></h1><p class="fsm-stats"></p></div>
      <div class="fsm-search fsm-hidezen"><input type="text" placeholder="search the brain\u2026" spellcheck="false"><div class="fsm-results"></div></div>
      <button class="fsm-util fsm-hidezen fsm-snd" style="top:58px" title="ambient sound">&#9834;</button>
      <button class="fsm-util fsm-zenb" style="top:92px" title="zen \u2014 hide UI (Esc exits)">&#9681;</button>
      <button class="fsm-util fsm-hidezen fsm-shotb" style="top:126px" title="capture a still">&#10047;</button>
      <button class="fsm-util fsm-hidezen fsm-boomb" style="top:160px" title="supernova">&#10038;</button>
      <button class="fsm-util fsm-hidezen fsm-refb" style="top:194px" title="re-read the vault">&#8635;</button>
      <div class="fsm-legend"></div>
      <div class="fsm-timeline"><button class="fsm-play">&#9654;</button><button class="fsm-tourb">&#10022;</button><input class="fsm-scrub" type="range" min="0" max="1" value="1"><span class="fsm-date"></span></div>
      <div class="fsm-caption"></div>
      <div class="fsm-tip"><span class="fsm-kind"></span><span class="fsm-name"></span></div>
      <div class="fsm-shot"><img alt=""><p>right-click the image to save it</p><button>close</button></div>
      <button class="fsm-util fsm-hidezen fsm-gearb" style="top:228px" title="galaxy settings">&#9881;</button>
      <div class="fsm-panel fsm-hidezen"></div>`;
    this.S = Object.assign({}, DEF, await this.plugin.loadData() || {});
    if (this.S.famSeeds) {
      for (const k in this.S.famSeeds) if (FAMS[k]) FAMS[k].seeds = this.S.famSeeds[k];
    }
    this.startEngine();
  }
  onClose() {
    this.dead = true;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.ro) this.ro.disconnect();
    if (this.AC) {
      try {
        this.AC.close();
      } catch (_) {
      }
    }
    return Promise.resolve();
  }
  startEngine() {
    const view = this, app = this.app, root = this.root;
    const S = this.S;
    const $ = (sel) => root.querySelector(sel);
    const canvas = $("canvas"), ctx = canvas.getContext("2d");
    const tip = $(".fsm-tip"), tipKind = $(".fsm-kind"), tipName = $(".fsm-name");
    const captionEl = $(".fsm-caption");
    let W = 0, H = 0, DPR = 1;
    const fogCv = document.createElement("canvas"), fogCtx = fogCv.getContext("2d");
    const resize = () => {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = root.clientWidth || 600;
      H = root.clientHeight || 400;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      fogCv.width = Math.max(2, Math.round(W * 0.7));
      fogCv.height = Math.max(2, Math.round(H * 0.7));
    };
    this.ro = new ResizeObserver(resize);
    this.ro.observe(root);
    resize();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let nodes = [], links = [], idx = {}, dates = [], anchors = [];
    const hole = { x: 0, y: 0, z: 0, tx: 0, ty: 0, tz: 0, n: 0, init: false, scr: 0, sx: 0, sy: 0, ss: 1, sd: 0, near: false, nf: 1 };
    const dying = [];
    const FC = (f) => FAMS[f];
    const FNAME = (f) => FAMS[f].dispName || FAMS[f].name;
    const loadData = () => {
      const D = view.buildData();
      const prevMap = {};
      for (const o of nodes) prevMap[o.id] = o;
      const hadPrev = nodes.length > 0;
      idx = {};
      nodes = D.nodes.map((n, i) => {
        idx[n.id] = i;
        const k = i + 0.5, phi = Math.acos(1 - 2 * k / D.nodes.length), th = Math.PI * (1 + Math.sqrt(5)) * k, r = 120 * Math.max(1, Math.cbrt(D.nodes.length / 150));
        const mass = Math.cbrt(n.b || 600);
        const nn = {
          id: n.id,
          g: n.g,
          w: n.w,
          p: n.p,
          d: n.d,
          dated: n.dated,
          b: n.b,
          x: r * Math.sin(phi) * Math.cos(th),
          y: r * Math.sin(phi) * Math.sin(th),
          z: r * Math.cos(phi),
          vx: 0,
          vy: 0,
          vz: 0,
          r: n.g === "log" ? Math.min(4.2, 2.1 + mass * 0.055) : Math.max(3.4, 2.4 + Math.sqrt(n.w) * 1.6 + mass * 0.13),
          nbr: /* @__PURE__ */ new Set(),
          tw: i * 0.618 % 1,
          fam: null,
          sx: 0,
          sy: 0,
          ss: 1,
          sd: 0,
          vis: 1,
          near: false,
          isNew: false
        };
        const o = prevMap[n.id];
        if (o) {
          nn.x = o.x;
          nn.y = o.y;
          nn.z = o.z;
          nn.vx = o.vx;
          nn.vy = o.vy;
          nn.vz = o.vz;
          nn.sdS = o.sdS;
          nn.dim = o.dim;
          nn.litE = o.litE;
          nn.lblA = o.lblA;
          nn.lblOn = o.lblOn;
          nn.lc = o.lc;
          nn.tw = o.tw;
          nn.nf = o.nf;
        } else nn.isNew = hadPrev;
        return nn;
      });
      links = D.links.map((l) => {
        const s = idx[l.s], t = idx[l.t];
        nodes[s].nbr.add(t);
        nodes[t].nbr.add(s);
        return { s, t };
      });
      nodes.forEach((n) => n.deg = n.nbr.size || 1);
      {
        const q = [];
        let seedHits = 0;
        for (const k of FAMORDER) for (const s of FAMS[k].seeds) {
          const i = idx[s];
          if (i !== void 0) {
            if (k !== "core") seedHits++;
            if (!nodes[i].fam) {
              nodes[i].fam = k;
              q.push(i);
            }
          }
        }
        while (q.length) {
          const i = q.shift();
          for (const j of nodes[i].nbr) if (!nodes[j].fam) {
            nodes[j].fam = nodes[i].fam;
            q.push(j);
          }
        }
        nodes.forEach((n) => {
          if (!n.fam) n.fam = "core";
        });
        view.genFam = seedHits < 3;
        for (const k of FAMORDER) FAMS[k].dispName = FAMS[k].name;
        if (view.genFam) {
          const folders = {};
          for (const n of nodes) {
            if (!n.p || n.p.indexOf("/") < 0) continue;
            const f = n.p.split("/")[0];
            folders[f] = (folders[f] || 0) + 1;
          }
          const top = Object.keys(folders).sort((a, b) => folders[b] - folders[a]);
          const slots = FAMORDER.filter((k) => k !== "core");
          const fmap = {};
          top.forEach((f, i) => {
            const k = i < slots.length ? slots[i] : view.ensureFam("dyn" + (i - slots.length));
            fmap[f] = k;
            FAMS[k].dispName = f;
          });
          FAMS.core.dispName = top.length ? "root notes" : "notes";
          for (const n of nodes) {
            const f = n.p && n.p.indexOf("/") >= 0 ? n.p.split("/")[0] : null;
            n.fam = f && fmap[f] ? fmap[f] : "core";
          }
        }
        view.famCounts = {};
        for (const n of nodes) view.famCounts[n.fam] = (view.famCounts[n.fam] || 0) + 1;
        if (view.rebuildLegend) view.rebuildLegend();
      }
      const maxD = nodes.reduce((m, n) => n.d > m ? n.d : m, "");
      const dayN = (s) => {
        const p = s.split("-");
        return +p[0] * 372 + +p[1] * 31 + +p[2];
      };
      nodes.forEach((n) => {
        n.nova = n.dated && dayN(maxD) - dayN(n.d) <= 9;
      });
      for (const nn of nodes) {
        if (!nn.isNew || !nn.nbr.size) continue;
        const nb = nodes[[...nn.nbr][0]];
        if (nb && !nb.isNew) {
          nn.x = nb.x + (Math.random() - 0.5) * 26;
          nn.y = nb.y + (Math.random() - 0.5) * 26;
          nn.z = nb.z + (Math.random() - 0.5) * 26;
        }
      }
      if (hadPrev) {
        for (const oid in prevMap) {
          if (idx[oid] === void 0) {
            const o = prevMap[oid];
            if (dying.length > 80) dying.shift();
            dying.push({ x: o.x, y: o.y, z: o.z, fam: o.fam || "core", r: o.r || 3, t: 0, ph: Math.random() * 6.283 });
            showCaption("&ldquo;" + esc(oid) + "&rdquo;", "swallowed by the black hole", 3600);
          }
        }
      }
      hole.n = D.swallowed || 0;
      anchors = nodes.filter((n) => n.w >= 5 || FAMS[n.fam].seeds.includes(n.id) && n.w >= 1);
      dates = [...new Set(nodes.map((n) => n.d))].sort();
      scrub.max = String(dates.length - 1);
      scrub.value = String(dates.length - 1);
      timePos = dates.length - 1;
      const vn = app.vault && app.vault.getName ? app.vault.getName() : "your vault";
      $(".fsm-stats").textContent = `${String(vn).toLowerCase()} \xB7 ${nodes.length} notes \xB7 ${links.length} links \xB7 live`;
      alpha = hadPrev ? Math.max(alpha, 0.3) : D.nodes.length > 2500 ? 0.6 : 1;
      if (hadPrev) focusIdx = -1;
      applyTime();
    };
    const scrub = $(".fsm-scrub"), dateLbl = $(".fsm-date"), playBtn = $(".fsm-play"), tourBtn = $(".fsm-tourb");
    const qInput = $(".fsm-search input"), resBox = $(".fsm-results");
    let timePos = 0, playing = false, playAcc = 0;
    let capTimer = null;
    const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const showCaption = (main, sub, ms) => {
      captionEl.innerHTML = main + (sub ? '<span class="fsm-sub">' + sub + "</span>" : "");
      captionEl.classList.add("fsm-show");
      clearTimeout(capTimer);
      if (ms) capTimer = setTimeout(() => captionEl.classList.remove("fsm-show"), ms);
    };
    const hideCaption = () => {
      clearTimeout(capTimer);
      captionEl.classList.remove("fsm-show");
    };
    const applyTime = () => {
      const cur = dates[timePos];
      dateLbl.textContent = cur + (timePos === dates.length - 1 ? " \xB7 now" : "");
      let vis = 0;
      for (const n of nodes) {
        n.vis = n.d <= cur ? 1 : 0;
        vis += n.vis;
      }
      if (timePos < dates.length - 1) dateLbl.textContent = cur + " \xB7 " + vis;
      if (playing) {
        const born = nodes.filter((n) => n.d === cur && n.g === "log");
        if (born.length) {
          const title = born[0].id.replace(/^\d{4}-\d{2}-\d{2}\s*/, "");
          showCaption("&ldquo;" + esc(title) + "&rdquo;", cur, 3200);
        }
      }
    };
    scrub.addEventListener("input", () => {
      timePos = +scrub.value;
      playing = false;
      playBtn.innerHTML = "&#9654;";
      hideCaption();
      applyTime();
    });
    playBtn.addEventListener("click", () => {
      if (playing) {
        playing = false;
        playBtn.innerHTML = "&#9654;";
        return;
      }
      playing = true;
      playBtn.innerHTML = "&#10074;&#10074;";
      if (timePos >= dates.length - 1) {
        timePos = 0;
        scrub.value = "0";
        applyTime();
      }
    });
    let famSolo = null;
    const legend = $(".fsm-legend");
    view.rebuildLegend = () => {
      legend.innerHTML = "";
      famSolo = null;
      const lFams = ["core"].concat((view.famOrder || FAMORDER).filter((x) => x !== "core"));
      for (const k of lFams) {
        if (view.famCounts && !view.famCounts[k]) continue;
        const f = FAMS[k];
        const row = document.createElement("div");
        row.className = "fsm-row";
        row.dataset.fam = k;
        row.innerHTML = '<span class="fsm-dot" style="background:' + f.color + ";box-shadow:0 0 8px " + f.color + '"></span>' + FNAME(k).toLowerCase();
        row.addEventListener("click", () => {
          famSolo = famSolo === k ? null : k;
          legend.querySelectorAll(".fsm-row").forEach((r) => r.classList.toggle("fsm-off", famSolo !== null && r.dataset.fam !== famSolo));
        });
        legend.appendChild(row);
      }
    };
    view.rebuildLegend();
    const sndBtn = $(".fsm-snd");
    const sound = createSoundEngine(() => view.dead);
    sndBtn.addEventListener("click", async () => {
      const nowOn = await sound.toggle(S.vol);
      view.AC = sound.ctx;
      if (nowOn === false && !sound.ctx) {
        sndBtn.style.display = "none";
        return;
      }
      if (nowOn === false && sound.ctx && sound.ctx.state !== "running") {
        sndBtn.textContent = "\u2715";
        return;
      }
      sndBtn.classList.toggle("fsm-on", nowOn);
    });
    view.applyVol = () => sound.applyVol(S.vol);
    const blip = (fam) => sound.blip(fam);
    const makePuff = (color) => {
      const s = 512, cv = document.createElement("canvas");
      cv.width = cv.height = s;
      const c = cv.getContext("2d");
      for (let i = 0; i < 9; i++) {
        const ang = i * 0.72, dist = s * (0.03 + i * 0.012);
        const ox = s / 2 + Math.cos(ang) * dist, oy = s / 2 + Math.sin(ang) * dist;
        const r0 = s * (0.38 + i * 0.015);
        const g = c.createRadialGradient(ox, oy, 0, ox, oy, r0);
        const peak = 0.14 - i * 0.012;
        g.addColorStop(0, "rgba(255,255,255," + Math.max(0.02, peak) + ")");
        g.addColorStop(0.3, "rgba(255,255,255," + Math.max(0.01, peak * 0.6) + ")");
        g.addColorStop(0.7, "rgba(255,255,255," + Math.max(5e-3, peak * 0.15) + ")");
        g.addColorStop(1, "rgba(255,255,255,0)");
        c.fillStyle = g;
        c.fillRect(0, 0, s, s);
      }
      c.globalCompositeOperation = "source-in";
      c.fillStyle = color;
      c.fillRect(0, 0, s, s);
      return cv;
    };
    const puffs = {};
    for (const k in FAMS) puffs[k] = makePuff(FAMS[k].color);
    const makeGlowSprite = (color) => {
      const s = 256, cv = document.createElement("canvas");
      cv.width = cv.height = s;
      const c = cv.getContext("2d");
      const g = c.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.15, "rgba(255,255,255,0.7)");
      g.addColorStop(0.35, "rgba(255,255,255,0.3)");
      g.addColorStop(0.6, "rgba(255,255,255,0.08)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, s, s);
      c.globalCompositeOperation = "source-in";
      c.fillStyle = color;
      c.fillRect(0, 0, s, s);
      return cv;
    };
    const glows = {};
    for (const k in FAMS) glows[k] = makeGlowSprite(FAMS[k].color);
    const BASEPAL = {};
    for (const k in FAMS) BASEPAL[k] = FAMS[k].color;
    const applyHue = () => {
      for (const k in FAMS) {
        const r = rotHue(BASEPAL[k], S.hue);
        const c = S.hue ? r.css : BASEPAL[k];
        FAMS[k].color = c;
        FAMS[k].rgb = r.rgb;
        puffs[k] = makePuff(c);
        glows[k] = makeGlowSprite(c);
        const dot = legend.querySelector('.fsm-row[data-fam="' + k + '"] .fsm-dot');
        if (dot) {
          dot.style.background = c;
          dot.style.boxShadow = "0 0 8px " + c;
        }
      }
    };
    view.applyHue = applyHue;
    if (S.hue) applyHue();
    view.famOrder = FAMORDER.slice();
    FAMORDER.forEach((k, i) => {
      FAMS[k].snd = PENTA[i];
    });
    const dynCols = [];
    view.ensureFam = (k) => ensureFam(k, view.famOrder, BASEPAL, dynCols, puffs, glows, makePuff, makeGlowSprite, S, view.famF);
    const stars = [];
    for (let i = 0; i < BACKDROP_COUNT; i++) {
      const u = hash(i, 7) * 2 - 1, th2 = hash(i, 13) * 6.283;
      const rr = BACKDROP_RADIUS_MIN + hash(i, 29) * BACKDROP_RADIUS_RANGE, sq = Math.sqrt(Math.max(0, 1 - u * u));
      stars.push({ x: Math.cos(th2) * sq * rr, y: u * rr * 0.85, z: Math.sin(th2) * sq * rr, b: 0.25 + hash(i, 3) * 0.6, l: i % 3 });
    }
    let shoot = null, shootTimer = 1600;
    const particles = [];
    const rebuildParticles = () => {
      particles.length = 0;
      const N = reduceMotion ? 0 : Math.round(S.comets);
      for (let i = 0; i < N; i++) particles.push({ l: i * 97, t: i * 0.137 % 1, sp: 12e-4 + i * 53 % 100 / 100 * 2e-3 });
    };
    rebuildParticles();
    view.rebuildParticles = rebuildParticles;
    view.getGraphData = () => ({ nodes, links, S });
    let alpha = 1;
    const step = () => {
      physicsStep(nodes, links, S, alpha, view);
      if (alpha > 0.1) alpha *= nodes.length > 2500 ? 0.991 : nodes.length > 1200 ? 0.996 : 0.999;
    };
    let yaw = 0.4, pitch = 0.18, targetYaw = 0.4, targetPitch = 0.18, zoom = 1, targetZoom = 1;
    let ctr = { x: 0, y: 0, z: 0 }, focusIdx = -1;
    const autoSpin = !reduceMotion;
    let flightMode = false;
    const cam = { x: 0, y: 0, z: 0 }, vel = { x: 0, y: 0, z: 0 };
    const axes = () => {
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      return { fwd: [-cp * sy, sp, cp * cy], rgt: [cy, 0, sy], up: [-sp * sy, -cp, sp * cy] };
    };
    const enterFlight = () => {
      if (flightMode) return;
      flightMode = true;
      focusIdx = -1;
      const { fwd } = axes();
      const D = FOCAL / (0.9 * zoom);
      cam.x = ctr.x - fwd[0] * D;
      cam.y = ctr.y - fwd[1] * D;
      cam.z = ctr.z - fwd[2] * D;
      vel.x = vel.y = vel.z = 0;
      targetYaw = yaw;
      targetPitch = pitch;
      try {
        const r = canvas.requestPointerLock();
        if (r && r.catch) r.catch(() => {
        });
      } catch (_) {
      }
      showCaption("flight mode", "mouse aims \xB7 wasd thrust \xB7 shift boost \xB7 esc to land", 2800);
    };
    const exitFlight = () => {
      if (!flightMode) return;
      flightMode = false;
      const { fwd } = axes();
      const D = FOCAL / (0.9 * zoom);
      ctr.x = cam.x + fwd[0] * D;
      ctr.y = cam.y + fwd[1] * D;
      ctr.z = cam.z + fwd[2] * D;
      vel.x = vel.y = vel.z = 0;
      try {
        if (document.pointerLockElement === canvas) document.exitPointerLock();
      } catch (_) {
      }
    };
    this.registerDomEvent(document, "pointerlockchange", () => {
      if (flightMode && document.pointerLockElement !== canvas) exitFlight();
    });
    const projectNode = (n) => {
      const camState = { yaw, pitch, zoom, flightMode, ctr, cam, vel, targetYaw, targetPitch, targetZoom, focusIdx };
      project(n, camState, W, H);
    };
    const lensP = (p) => lensPoint(p, hole);
    let selRes = 0, curMatches = [];
    const flyTo = (i) => {
      exitFlight();
      focusIdx = i;
      targetZoom = 2.2;
      qInput.blur();
      resBox.style.display = "none";
      qInput.value = nodes[i].id;
    };
    const renderResults = () => {
      resBox.innerHTML = "";
      curMatches.forEach((i, k) => {
        const div = document.createElement("div");
        div.textContent = nodes[i].id;
        div.style.borderLeftColor = FC(nodes[i].fam).color;
        if (k === selRes) div.classList.add("fsm-sel");
        div.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          flyTo(i);
        });
        resBox.appendChild(div);
      });
      resBox.style.display = curMatches.length ? "block" : "none";
    };
    qInput.addEventListener("input", () => {
      const q = qInput.value.trim().toLowerCase();
      focusIdx = -1;
      selRes = 0;
      if (!q) {
        curMatches = [];
        resBox.style.display = "none";
        return;
      }
      curMatches = nodes.map((n, i) => i).filter((i) => nodes[i].id.toLowerCase().includes(q)).slice(0, 8);
      renderResults();
    });
    qInput.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        selRes = Math.min(selRes + 1, curMatches.length - 1);
        renderResults();
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        selRes = Math.max(selRes - 1, 0);
        renderResults();
        e.preventDefault();
      } else if (e.key === "Enter" && curMatches.length) {
        flyTo(curMatches[selRes]);
      } else if (e.key === "Escape") {
        qInput.value = "";
        curMatches = [];
        resBox.style.display = "none";
        focusIdx = -1;
        targetZoom = 1;
      }
      e.stopPropagation();
    });
    let tour = null;
    const famStats = (k) => {
      const m = nodes.filter((n) => n.fam === k);
      let lk = 0;
      for (const l of links) if (nodes[l.s].fam === k && nodes[l.t].fam === k) lk++;
      return { count: m.length, links: lk, hub: m.reduce((a, b) => b.w > a.w ? b : a, m[0]) };
    };
    const tourStop = () => {
      tour = null;
      tourBtn.innerHTML = "&#10022;";
      focusIdx = -1;
      targetZoom = 1;
      hideCaption();
    };
    const tourGo = (step2) => {
      const TO = ["core"].concat((view.famOrder || FAMORDER).filter((x) => x !== "core"));
      if (step2 >= TO.length) {
        tourStop();
        showCaption("Fathom <em>Starmap</em>", "end of tour", 3600);
        return;
      }
      tour = { step: step2, hold: 0 };
      const k = TO[step2], s = famStats(k);
      if (!s.hub) {
        tourGo(step2 + 1);
        return;
      }
      focusIdx = nodes.indexOf(s.hub);
      targetZoom = 1.8;
      showCaption(FNAME(k), s.count + " notes \xB7 " + s.links + " internal links", 0);
    };
    tourBtn.addEventListener("click", () => {
      if (tour) {
        tourStop();
        return;
      }
      exitFlight();
      playing = false;
      playBtn.innerHTML = "&#9654;";
      tourBtn.innerHTML = "&#9632;";
      tourGo(0);
    });
    $(".fsm-zenb").addEventListener("click", () => root.classList.toggle("fsm-zen"));
    const shot = $(".fsm-shot");
    $(".fsm-shotb").addEventListener("click", () => {
      view.wantShot = true;
    });
    shot.querySelector("button").addEventListener("click", () => shot.classList.remove("fsm-show"));
    $(".fsm-refb").addEventListener("click", () => {
      loadData();
      showCaption("re-sounded", "vault re-read live", 2e3);
    });
    $(".fsm-boomb").addEventListener("click", () => {
      alpha = 1;
      for (const n of nodes) {
        const d = Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z) || 1;
        const k = 26 + Math.random() * 20;
        n.vx += n.x / d * k + (Math.random() - 0.5) * 10;
        n.vy += n.y / d * k + (Math.random() - 0.5) * 10;
        n.vz += n.z / d * k + (Math.random() - 0.5) * 10;
      }
      sound.supernova();
    });
    {
      const panel = $(".fsm-panel");
      const gear = $(".fsm-gearb");
      gear.addEventListener("click", () => {
        panel.classList.toggle("fsm-show");
        gear.classList.toggle("fsm-on");
      });
      let saveT = null;
      const save = () => {
        clearTimeout(saveT);
        saveT = setTimeout(() => view.plugin.saveData(Object.assign({}, S)), 500);
      };
      const inputs = {};
      const fmt = (k, v) => k === "center" ? v.toFixed(5) : k === "spring" ? v.toFixed(3) : v >= 10 ? Math.round(v) : (+v).toFixed(2);
      let lastSec = "";
      for (const sl of SLIDERS) {
        if (sl.sec !== lastSec) {
          lastSec = sl.sec;
          const h = document.createElement("h4");
          h.textContent = sl.sec;
          panel.appendChild(h);
        }
        const row = document.createElement("div");
        row.className = "fsm-prow";
        row.innerHTML = '<div class="fsm-plbl"><span>' + sl.label + '</span><span class="fsm-pval"></span></div>';
        const inp = document.createElement("input");
        inp.type = "range";
        inp.min = String(sl.min);
        inp.max = String(sl.max);
        inp.step = String(sl.step);
        inp.value = String(S[sl.key]);
        const val = row.querySelector(".fsm-pval");
        val.textContent = fmt(sl.key, S[sl.key]);
        inp.addEventListener("input", () => {
          S[sl.key] = parseFloat(inp.value);
          val.textContent = fmt(sl.key, S[sl.key]);
          if (sl.sec === "forces") alpha = Math.max(alpha, 0.55);
          if (sl.key === "hue" && view.applyHue) view.applyHue();
          if (sl.key === "comets" && view.rebuildParticles) view.rebuildParticles();
          if (sl.key === "vol" && view.applyVol) view.applyVol();
          save();
        });
        row.appendChild(inp);
        panel.appendChild(row);
        inputs[sl.key] = { inp, val };
      }
      const shHead = document.createElement("h4");
      shHead.textContent = "galaxy shape";
      panel.appendChild(shHead);
      const shRow = document.createElement("div");
      shRow.style.display = "flex";
      shRow.style.flexWrap = "wrap";
      shRow.style.gap = "6px";
      const SHAPES = ["natural", "spiral", "disc", "ring", "shell", "helix", "torus", "clusters", "cube"];
      const shBtns = {};
      const paintShapes = () => {
        for (const k in shBtns) {
          const on = (S.shape || "natural") === k;
          shBtns[k].style.borderColor = on ? "rgba(46,230,200,.7)" : "rgba(120,140,185,.35)";
          shBtns[k].style.color = on ? "#2EE6C8" : "#93A3C2";
        }
      };
      for (const nm of SHAPES) {
        const b = document.createElement("button");
        b.className = "fsm-preset";
        b.textContent = nm;
        b.style.marginTop = "4px";
        b.addEventListener("click", () => {
          S.shape = nm;
          alpha = 1;
          view.clR = 0;
          for (const nn of nodes) nn.hxA = void 0;
          if (nm !== "natural" && targetPitch < 0.35) targetPitch = 0.55;
          paintShapes();
          save();
        });
        shRow.appendChild(b);
        shBtns[nm] = b;
      }
      panel.appendChild(shRow);
      paintShapes();
      const exHead = document.createElement("h4");
      exHead.textContent = "exclude folders";
      panel.appendChild(exHead);
      const exRow = document.createElement("div");
      exRow.className = "fsm-prow";
      exRow.innerHTML = '<div class="fsm-plbl"><span>folder names (comma-separated)</span></div>';
      const exInp = document.createElement("input");
      exInp.type = "text";
      exInp.value = S.exclude || "";
      exInp.placeholder = "e.g. templates, daily, archive";
      exInp.style.cssText = "width:100%;background:rgba(20,25,40,.6);border:1px solid rgba(120,140,185,.3);color:#c8d0e0;padding:5px 8px;border-radius:4px;font-size:12px;margin-top:4px;";
      exInp.addEventListener("change", () => {
        S.exclude = exInp.value;
        save();
        loadData();
      });
      exRow.appendChild(exInp);
      panel.appendChild(exRow);
      const reset = document.createElement("button");
      reset.className = "fsm-preset";
      reset.textContent = "restore defaults";
      reset.addEventListener("click", () => {
        Object.assign(S, DEF);
        for (const sl of SLIDERS) {
          inputs[sl.key].inp.value = String(S[sl.key]);
          inputs[sl.key].val.textContent = fmt(sl.key, S[sl.key]);
        }
        exInp.value = S.exclude || "";
        alpha = 1;
        paintShapes();
        if (view.applyHue) view.applyHue();
        if (view.rebuildParticles) view.rebuildParticles();
        if (view.applyVol) view.applyVol();
        loadData();
        save();
      });
      panel.appendChild(reset);
    }
    let hover = -1, dragging = false, px = 0, py = 0, idleT = 0, downX = 0, downY = 0, lastBlip = -1;
    let mouseOver = false;
    root.addEventListener("mouseenter", () => mouseOver = true);
    root.addEventListener("mouseleave", () => mouseOver = false);
    const rel = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const hiddenN = (n) => !n.vis || n.near || famSolo && n.fam !== famSolo;
    const pick = (mx, my) => {
      let best = -1, bd = 1e9;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (hiddenN(n)) continue;
        const dx = n.sx - mx, dy = n.sy - my, d = dx * dx + dy * dy;
        const rr = Math.max(n.r * n.ss + 6, 11);
        if (d < rr * rr && d < bd) {
          bd = d;
          best = i;
        }
      }
      return best;
    };
    const ptrs = /* @__PURE__ */ new Map();
    let pinchStart = 0, pinchZoom0 = 1;
    canvas.addEventListener("pointermove", (e) => {
      const m = rel(e);
      if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, { x: m.x, y: m.y });
      if (ptrs.size === 2) {
        const [a, b] = [...ptrs.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        targetZoom = Math.min(ZMAX, Math.max(ZMIN, pinchZoom0 * (d / pinchStart)));
        idleT = 0;
        return;
      }
      if (dragging) {
        targetYaw -= (m.x - px) * 5e-3;
        targetPitch = Math.max(-1.2, Math.min(1.2, targetPitch + (m.y - py) * 4e-3));
        px = m.x;
        py = m.y;
        idleT = 0;
        return;
      }
      if (flightMode) {
        const mx = e.movementX || 0, my = e.movementY || 0;
        targetYaw -= mx * 24e-4;
        targetPitch = Math.max(-1.35, Math.min(1.35, targetPitch + my * 19e-4));
        hover = -1;
        tip.style.display = "none";
        idleT = 0;
        return;
      }
      hover = pick(m.x, m.y);
      if (hover >= 0) {
        const n = nodes[hover];
        if (hover !== lastBlip) {
          blip(n.fam);
          lastBlip = hover;
        }
        tip.style.display = "block";
        tip.style.left = Math.min(m.x + 14, W - 330) + "px";
        tip.style.top = Math.min(m.y + 12, H - 64) + "px";
        tipKind.textContent = FNAME(n.fam) + " \xB7 " + n.d + (n.w ? " \xB7 " + n.w + " inbound" : "");
        tipKind.style.color = FAMS[n.fam].color;
        tipName.textContent = n.id;
        canvas.style.cursor = "pointer";
      } else if (hole.scr > 0 && Math.hypot(m.x - hole.sx, m.y - hole.sy) < hole.scr * 1.2) {
        tip.style.display = "block";
        tip.style.left = Math.min(m.x + 14, W - 330) + "px";
        tip.style.top = Math.min(m.y + 12, H - 64) + "px";
        tipKind.textContent = "the black hole";
        tipKind.style.color = "#F0B34E";
        tipName.textContent = (hole.n || 0) + " notes swallowed \xB7 Archive + _to_delete";
        canvas.style.cursor = "default";
      } else {
        tip.style.display = "none";
        canvas.style.cursor = "grab";
        lastBlip = -1;
      }
    });
    canvas.addEventListener("pointerdown", (e) => {
      if (e.button === 2) {
        dragging = false;
        return;
      }
      if (tour) tourStop();
      canvas.setPointerCapture(e.pointerId);
      const m = rel(e);
      ptrs.set(e.pointerId, { x: m.x, y: m.y });
      if (ptrs.size === 2) {
        const [a, b] = [...ptrs.values()];
        pinchStart = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        pinchZoom0 = targetZoom;
        dragging = false;
        return;
      }
      dragging = true;
      px = m.x;
      py = m.y;
      downX = m.x;
      downY = m.y;
      canvas.classList.add("fsm-drag");
      tip.style.display = "none";
    });
    canvas.addEventListener("pointerup", (e) => {
      ptrs.delete(e.pointerId);
      if (ptrs.size > 0) {
        dragging = false;
        return;
      }
      dragging = false;
      canvas.classList.remove("fsm-drag");
      const m = rel(e);
      const dx = m.x - downX, dy = m.y - downY;
      if (dx * dx + dy * dy < 25 && !flightMode) {
        const hit = pick(m.x, m.y);
        if (hit >= 0 && nodes[hit].p) {
          app.workspace.openLinkText(nodes[hit].p, "", true);
        } else if (hit < 0 && focusIdx >= 0) {
          focusIdx = -1;
          targetZoom = 1;
        }
      }
    });
    canvas.addEventListener("pointercancel", (e) => {
      ptrs.delete(e.pointerId);
      dragging = false;
      canvas.classList.remove("fsm-drag");
    });
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      targetZoom = Math.min(ZMAX, Math.max(ZMIN, targetZoom * (e.deltaY < 0 ? 1.1 : 0.9)));
    }, { passive: false });
    canvas.addEventListener("pointerleave", () => {
      hover = -1;
      tip.style.display = "none";
    });
    canvas.addEventListener("dblclick", () => {
      exitFlight();
      focusIdx = -1;
      targetZoom = 1;
      targetYaw = 0.4;
      targetPitch = 0.18;
    });
    canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      const m = rel(e);
      const hit = pick(m.x, m.y);
      if (hit < 0 || !nodes[hit].p) return;
      const file = app.vault.getAbstractFileByPath(nodes[hit].p);
      if (!file) return;
      tip.style.display = "none";
      const menu = new import_obsidian.Menu();
      menu.addItem((it) => it.setTitle("Open").setIcon("file").onClick(() => app.workspace.openLinkText(nodes[hit].p, "", false)));
      menu.addItem((it) => it.setTitle("Open in new tab").setIcon("file-plus").onClick(() => app.workspace.openLinkText(nodes[hit].p, "", true)));
      menu.addSeparator();
      app.workspace.trigger("file-menu", menu, file, "fathom-starmap");
      menu.showAtPosition({ x: e.clientX, y: e.clientY });
    });
    const keys = /* @__PURE__ */ new Set();
    this.registerDomEvent(document, "keydown", (e) => {
      if (e.key === "Escape") {
        root.classList.remove("fsm-zen");
        exitFlight();
        return;
      }
      if (!(mouseOver || flightMode)) return;
      if (document.activeElement === qInput) return;
      const k = e.key.toLowerCase();
      if ("wasdqe".includes(k) && k.length === 1) {
        keys.add(k);
        enterFlight();
        e.preventDefault();
      }
      if (e.key === "Shift") keys.add("shift");
    });
    this.registerDomEvent(document, "keyup", (e) => {
      keys.delete(e.key.toLowerCase());
      if (e.key === "Shift") keys.delete("shift");
    });
    loadData();
    let refT = null;
    this.registerEvent(app.metadataCache.on("resolved", () => {
      clearTimeout(refT);
      refT = setTimeout(() => {
        if (!view.dead && !dragging && !flightMode) loadData();
      }, 2e4);
    }));
    const order = () => nodes.map((_, i) => i).sort((a, b) => nodes[b].r - nodes[a].r || a - b);
    let ord = order();
    const famF = {};
    view.famF = famF;
    for (const k in FAMS) famF[k] = 0;
    let t0 = performance.now();
    let skipNext = false, idleFrames = 0;
    const frame = (now) => {
      if (view.dead) return;
      const t = (now - t0) / 1e3;
      const isIdle = alpha < 5e-3 && !dragging && !flightMode && hover < 0 && !playing && !tour && S.warp === 0 && S.heat < 0.01 && focusIdx < 0 && dying.length === 0;
      if (isIdle) idleFrames++;
      else idleFrames = 0;
      if (idleFrames > 60) {
        const skip = reduceMotion ? idleFrames % 3 !== 0 : idleFrames % 2 !== 0;
        if (skip) {
          view.rafId = requestAnimationFrame(frame);
          return;
        }
      }
      if (nodes.length) {
        let effWarp = S.warp;
        if (alpha > 0.12) effWarp = Math.max((S.shape || "natural") !== "natural" ? 2 : 1, effWarp);
        else if (reduceMotion) effWarp = 0;
        else if (S.heat > 0.01) effWarp = Math.max(1, effWarp);
        view.stepAcc = (view.stepAcc || 0) + effWarp;
        while (view.stepAcc >= 1) {
          step();
          view.stepAcc--;
        }
        view.alphaNow = alpha;
        view.warpNow = effWarp;
        idleT++;
        if (autoSpin && !dragging && !flightMode && idleT > 140) targetYaw += 35e-5 * S.spin;
        yaw += (targetYaw - yaw) * 0.08;
        pitch += (targetPitch - pitch) * 0.08;
        zoom += (targetZoom - zoom) * 0.08;
        if (flightMode) {
          idleT = 0;
          const { fwd, rgt, up } = axes();
          const acc = (keys.has("shift") ? 0.45 : 0.15) * S.thrust;
          const th = (v, k) => {
            vel.x += v[0] * k * acc;
            vel.y += v[1] * k * acc;
            vel.z += v[2] * k * acc;
          };
          if (keys.has("w")) th(fwd, 1);
          if (keys.has("s")) th(fwd, -1);
          if (keys.has("d")) th(rgt, 1);
          if (keys.has("a")) th(rgt, -1);
          if (keys.has("e")) th(up, 1);
          if (keys.has("q")) th(up, -1);
          vel.x *= 0.965;
          vel.y *= 0.965;
          vel.z *= 0.965;
          cam.x += vel.x;
          cam.y += vel.y;
          cam.z += vel.z;
        } else {
          const tgt = focusIdx >= 0 ? nodes[focusIdx] : view.gCtr || { x: 0, y: 0, z: 0 };
          const ease = 0.12;
          ctr.x += (tgt.x - ctr.x) * ease;
          ctr.y += (tgt.y - ctr.y) * ease;
          ctr.z += (tgt.z - ctr.z) * ease;
        }
        if (tour) {
          tour.hold++;
          if (tour.hold > (reduceMotion ? 90 : 420)) tourGo(tour.step + 1);
        }
        if (playing) {
          playAcc++;
          if (playAcc >= (reduceMotion ? 1 : 14)) {
            playAcc = 0;
            timePos++;
            if (timePos >= dates.length - 1) {
              timePos = dates.length - 1;
              playing = false;
              playBtn.innerHTML = "&#9654;";
            }
            scrub.value = String(timePos);
            applyTime();
          }
        }
        for (const n of nodes) {
          projectNode(n);
          lensP(n);
        }
        if (ord.length !== nodes.length) ord = order();
      }
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const bg = ctx.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H * 0.42, Math.max(W, H) * 0.8);
      bg.addColorStop(0, "#080D1A");
      bg.addColorStop(1, "#03050A");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      if (S.stars > 0.02) {
        const sp = { x: 0, y: 0, z: 0, sx: 0, sy: 0, ss: 1, sd: 0, near: false, nf: 1 };
        for (const s of stars) {
          sp.x = s.x;
          sp.y = s.y;
          sp.z = s.z;
          projectNode(sp);
          if (sp.near) continue;
          if (sp.sx < -4 || sp.sx > W + 4 || sp.sy < -4 || sp.sy > H + 4) continue;
          const twk = reduceMotion ? 1 : 0.6 + 0.4 * Math.sin(t * 1.1 + s.x * 0.02);
          ctx.fillStyle = "rgba(190,205,235," + Math.min(0.9, 0.12 * s.b * twk * (s.l + 1) * S.stars) + ")";
          ctx.fillRect(sp.sx, sp.sy, s.l > 1 ? 1.6 : 1, s.l > 1 ? 1.6 : 1);
        }
      }
      const hn = hover >= 0 ? nodes[hover] : null;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const dt = hn && i !== hover && !hn.nbr.has(i) ? 1 : 0;
        n.dim = (n.dim || 0) + (dt - (n.dim || 0)) * 0.09;
        const lt = i === hover || i === focusIdx ? 1 : 0;
        n.litE = (n.litE || 0) + (lt - (n.litE || 0)) * 0.15;
      }
      for (const l of links) {
        const on = hn && (l.s === hover || l.t === hover) ? 1 : 0;
        l.hl = (l.hl || 0) + (on - (l.hl || 0)) * 0.12;
        l.dm = (l.dm || 0) + ((hn && !on ? 1 : 0) - (l.dm || 0)) * 0.09;
      }
      for (const k in famF) famF[k] += ((hn && hn.fam !== k ? 1 : 0) - famF[k]) * 0.09;
      if (S.nebula > 0.02) {
        fogCtx.setTransform(1, 0, 0, 1, 0, 0);
        fogCtx.clearRect(0, 0, fogCv.width, fogCv.height);
        fogCtx.setTransform(0.7, 0, 0, 0.7, 0, 0);
        fogCtx.globalCompositeOperation = "lighter";
        for (let ai = 0; ai < anchors.length; ai++) {
          const n = anchors[ai];
          if (hiddenN(n)) continue;
          const sprite = puffs[n.fam];
          const fd = famF[n.fam];
          const baseR = Math.min(420, (62 + n.w * 5.5) * n.ss);
          const ext = baseR * 2.4;
          if (n.sx < -ext || n.sx > W + ext || n.sy < -ext || n.sy > H + ext) continue;
          const puffN = n.ss > 1.8 ? 8 : n.w >= 10 ? 16 : 12;
          for (let p = 0; p < puffN; p++) {
            const h1 = hash(ai, p), h2 = hash(ai, p + 50), h3 = hash(ai, p + 100);
            const ang = h1 * 6.283 + (reduceMotion ? 0 : t * 0.03 * (h2 - 0.5));
            const dist = baseR * (0.15 + h2 * 0.75), R = baseR * (0.55 + h3 * 0.9);
            const a = (0.09 - 0.04 * fd) * S.nebula * (0.6 + 0.4 * Math.sin(t * 0.2 + h1 * 6.283)) * (n.nf === void 0 ? 1 : n.nf);
            if (a < 9e-3) continue;
            fogCtx.globalAlpha = Math.max(8e-3, a);
            fogCtx.drawImage(sprite, n.sx + Math.cos(ang) * dist - R, n.sy + Math.sin(ang) * dist - R, R * 2, R * 2);
          }
          if (fd < 0.9 && S.dust > 0.02) {
            fogCtx.fillStyle = "rgba(" + FC(n.fam).rgb + ",0.5)";
            for (let d = 0; d < 18; d++) {
              const h1 = hash(ai + 300, d), h2 = hash(ai + 400, d);
              const ang = h1 * 6.283, dist = baseR * (0.2 + h2 * 0.9);
              const twk = reduceMotion ? 0.5 : 0.25 + 0.45 * Math.sin(t * 1.6 + h1 * 40);
              fogCtx.globalAlpha = Math.min(0.9, 0.35 * twk * (1 - fd) * S.dust);
              fogCtx.fillRect(n.sx + Math.cos(ang) * dist, n.sy + Math.sin(ang) * dist, 2.6, 2.6);
            }
          }
        }
        fogCtx.globalAlpha = 1;
        ctx.globalCompositeOperation = "screen";
        ctx.drawImage(fogCv, 0, 0, W, H);
        ctx.globalCompositeOperation = "source-over";
      }
      const ringOps = [];
      {
        const famPts = {}, famNds = {};
        for (const n of nodes) {
          if (hiddenN(n)) continue;
          (famPts[n.fam] = famPts[n.fam] || []).push([n.sx, n.sy, n.w]);
          (famNds[n.fam] = famNds[n.fam] || []).push(n);
        }
        let gcx = 0, gcy = 0, gcz = 0, gn = 0;
        for (const n of nodes) {
          if (hiddenN(n)) continue;
          gcx += n.x;
          gcy += n.y;
          gcz += n.z;
          gn++;
        }
        if (gn) {
          gcx /= gn;
          gcy /= gn;
          gcz /= gn;
          view.gCtr = { x: gcx, y: gcy, z: gcz };
        }
        const gdist = [];
        for (const n of nodes) {
          if (hiddenN(n)) continue;
          gdist.push(Math.hypot(n.x - gcx, n.y - gcy, n.z - gcz));
        }
        gdist.sort((a, b) => a - b);
        const Rg = gdist[Math.floor(gdist.length * 0.85)] || 100;
        const gP = { x: gcx, y: gcy, z: gcz, sx: 0, sy: 0, ss: 1, sd: 0, near: false, nf: 1 };
        projectNode(gP);
        hole.tx = gcx + Math.cos(2.1) * Rg * 1.8;
        hole.ty = gcy + Rg * 0.34;
        hole.tz = gcz + Math.sin(2.1) * Rg * 1.8;
        hole.rg = Rg;
        if (!hole.init) {
          hole.x = hole.tx;
          hole.y = hole.ty;
          hole.z = hole.tz;
          hole.init = true;
        }
        for (const k in famPts) {
          const pts = famPts[k];
          if (pts.length < 4) continue;
          const fd2 = famF[k];
          const h = hull(pts.map((p) => [p[0], p[1]]));
          if (h && h.length >= 3) {
            let cx = 0, cy2 = 0;
            for (const p of h) {
              cx += p[0];
              cy2 += p[1];
            }
            cx /= h.length;
            cy2 /= h.length;
            ctx.setLineDash([2, 6]);
            ctx.strokeStyle = "rgba(" + FC(k).rgb + "," + (0.13 - 0.08 * fd2) + ")";
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            h.forEach((p, i) => {
              const ix = p[0] + (p[0] - cx) * 0.14, iy = p[1] + (p[1] - cy2) * 0.14;
              i ? ctx.lineTo(ix, iy) : ctx.moveTo(ix, iy);
            });
            ctx.closePath();
            ctx.stroke();
            ctx.setLineDash([]);
            if (S.names < 0.02) continue;
            const mem = famNds[k] || [];
            if (mem.length >= 4) {
              let c3x = 0, c3y = 0, c3z = 0, twt = 0;
              for (const n of mem) {
                const wgt = 1 + n.w;
                c3x += n.x * wgt;
                c3y += n.y * wgt;
                c3z += n.z * wgt;
                twt += wgt;
              }
              c3x /= twt;
              c3y /= twt;
              c3z /= twt;
              const FOA = view.famOrder || FAMORDER;
              const idxF = Math.max(0, FOA.indexOf(k));
              const inc = (idxF % 7 - 3) * 0.2;
              const nodA = idxF * 2.399;
              const ux = Math.cos(nodA), uz = Math.sin(nodA);
              const vx = -Math.sin(nodA) * Math.cos(inc), vy = Math.sin(inc), vz = Math.cos(nodA) * Math.cos(inc);
              const R3 = Rg * 1.24 + 20 + idxF * Math.min(9, 63 / Math.max(7, FOA.length - 1));
              const scRef = gP.ss;
              const fs = Math.max(9, Math.min(30, Rg * scRef * 0.115)) * S.nameSize;
              if (fs > 9.5) {
                const rname = view.genFam ? FNAME(k).toUpperCase() : RNAME[k] || FAMS[k].name.toUpperCase();
                if (!view.famLC) view.famLC = {};
                if (!view.famLC[rname]) {
                  ctx.font = "italic 100px Georgia, serif";
                  const adv = [];
                  let tot = 0;
                  for (const chr of rname) {
                    const w2 = ctx.measureText(chr).width;
                    adv.push(w2);
                    tot += w2;
                  }
                  view.famLC[rname] = { adv, tot };
                }
                const lc = view.famLC[rname], sc2 = fs / 100;
                let angW = 0, bD = Infinity;
                for (let s2 = 0; s2 < 64; s2++) {
                  const a2 = s2 / 64 * 6.28319;
                  const px2 = gcx + (ux * Math.cos(a2) + vx * Math.sin(a2)) * R3;
                  const py2 = gcy + vy * Math.sin(a2) * R3;
                  const pz2 = gcz + (uz * Math.cos(a2) + vz * Math.sin(a2)) * R3;
                  const d2 = (px2 - c3x) * (px2 - c3x) + (py2 - c3y) * (py2 - c3y) + (pz2 - c3z) * (pz2 - c3z);
                  if (d2 < bD) {
                    bD = d2;
                    angW = a2;
                  }
                }
                ctx.textAlign = "center";
                const spacing = fs * 0.14;
                const totalAng = (lc.tot * sc2 + spacing * (rname.length - 1)) / (R3 * scRef);
                const rp = (aa) => {
                  const o = { x: gcx + (ux * Math.cos(aa) + vx * Math.sin(aa)) * R3, y: gcy + vy * Math.sin(aa) * R3, z: gcz + (uz * Math.cos(aa) + vz * Math.sin(aa)) * R3, sx: 0, sy: 0, ss: 1, sd: 0, near: false, nf: 1 };
                  projectNode(o);
                  return o;
                };
                const cwS = rp(angW - totalAng / 2), cwM = rp(angW), cwE = rp(angW + totalAng / 2);
                const relM = Math.max(0.35, Math.min(1.6, cwM.ss / Math.max(1e-3, scRef)));
                const halfW = Math.max(1, (lc.tot * sc2 + spacing * (rname.length - 1)) * 0.5 * relM);
                const c1 = Math.hypot(cwM.sx - cwS.sx, cwM.sy - cwS.sy) / halfW;
                const c2 = Math.hypot(cwE.sx - cwM.sx, cwE.sy - cwM.sy) / halfW;
                const crowd = Math.min(c1, c2);
                const crowdFade = Math.min(1, Math.max(0, (crowd - 0.4) / 0.25));
                const depthFrac = (cwM.sd - gP.sd) / R3;
                const depthFade = Math.min(1, Math.max(0, (0.1 - depthFrac) / 0.55));
                if (!view.famFade) view.famFade = {};
                if (!view.famFlip) view.famFlip = {};
                const eDx = cwE.sx - cwS.sx;
                if (view.famFlip[k] === void 0) view.famFlip[k] = eDx < 0;
                const wantFlip = Math.abs(eDx) < 4 ? view.famFlip[k] : eDx < 0;
                const fPrev0 = view.famFade[k];
                if (view.famFlip[k] !== wantFlip && (fPrev0 === void 0 || fPrev0 < 0.03)) view.famFlip[k] = wantFlip;
                const flip = view.famFlip[k];
                const eDy = cwE.sy - cwS.sy;
                let tilt = Math.abs(Math.atan2(eDy, eDx)) * 57.2958;
                if (tilt > 90) tilt = 180 - tilt;
                const tiltFade = Math.min(1, Math.max(0, (65 - tilt) / 25));
                if (!view.famOn) view.famOn = {};
                if (!view.famOffAge) view.famOffAge = {};
                let vTgt = crowdFade * depthFade * tiltFade;
                let onSt = view.famOn[k] === true;
                let offAge = (view.famOffAge[k] === void 0 ? 999 : view.famOffAge[k]) + 1;
                if (!onSt && vTgt > 0.55 && offAge > 90) onSt = true;
                else if (onSt && vTgt < 0.08) {
                  onSt = false;
                  offAge = 0;
                }
                view.famOn[k] = onSt;
                view.famOffAge[k] = offAge;
                if (onSt) vTgt = Math.max(vTgt, 0.25);
                else vTgt = 0;
                const fTgt = flip === wantFlip ? vTgt : 0;
                const fPrev = fPrev0 === void 0 ? fTgt : fPrev0;
                const fEase = view.famFade[k] = fPrev + (fTgt - fPrev) * 0.08;
                const gnf = gP.nf === void 0 ? 1 : gP.nf;
                const baseA = (0.34 - 0.24 * fd2) * fEase * gnf;
                if (baseA > 0.01) {
                  const tmp = { x: 0, y: 0, z: 0, sx: 0, sy: 0, ss: 1, sd: 0, near: false, nf: 1 };
                  let a = angW - totalAng / 2;
                  for (let ci = 0; ci < rname.length; ci++) {
                    const li = flip ? rname.length - 1 - ci : ci;
                    const da = lc.adv[li] * sc2 / 2 / (R3 * scRef);
                    a += da;
                    tmp.x = gcx + (ux * Math.cos(a) + vx * Math.sin(a)) * R3;
                    tmp.y = gcy + vy * Math.sin(a) * R3;
                    tmp.z = gcz + (uz * Math.cos(a) + vz * Math.sin(a)) * R3;
                    tmp.near = false;
                    projectNode(tmp);
                    if (!tmp.near) {
                      const a3 = a + 0.02;
                      const tt = { x: gcx + (ux * Math.cos(a3) + vx * Math.sin(a3)) * R3, y: gcy + vy * Math.sin(a3) * R3, z: gcz + (uz * Math.cos(a3) + vz * Math.sin(a3)) * R3, sx: 0, sy: 0, ss: 1, sd: 0, near: false, nf: 1 };
                      projectNode(tt);
                      const dx2 = tt.sx - tmp.sx, dy2 = tt.sy - tmp.sy;
                      const rot = Math.atan2(dy2, dx2);
                      const rel2 = Math.max(0.35, Math.min(1.6, tmp.ss / Math.max(1e-3, scRef)));
                      const aL = baseA * (tmp.nf === void 0 ? 1 : tmp.nf);
                      if (aL > 0.02) {
                        ctx.save();
                        ctx.translate(tmp.sx, tmp.sy);
                        ctx.rotate(flip ? rot + Math.PI : rot);
                        ctx.font = "italic " + (fs * rel2).toFixed(1) + "px Georgia, serif";
                        ctx.fillStyle = "rgba(" + FC(k).rgb + "," + aL.toFixed(3) + ")";
                        ctx.fillText(rname[li], 0, 0);
                        ctx.restore();
                      }
                    }
                    a += da + spacing / (R3 * scRef);
                  }
                }
              }
            }
          }
        }
      }
      if (!reduceMotion) {
        if (shoot) {
          shoot.t += 0.03;
          if (shoot.t > 1) shoot = null;
          else {
            const sx = shoot.x + shoot.dx * shoot.t, sy = shoot.y + shoot.dy * shoot.t;
            const g = ctx.createLinearGradient(sx, sy, sx - shoot.dx * 0.12, sy - shoot.dy * 0.12);
            g.addColorStop(0, "rgba(220,240,255,0.9)");
            g.addColorStop(1, "rgba(220,240,255,0)");
            ctx.strokeStyle = g;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx - shoot.dx * 0.12, sy - shoot.dy * 0.12);
            ctx.stroke();
          }
        } else if (S.meteors > 0.01 && --shootTimer <= 0) {
          shootTimer = Math.max(20, (1600 + (now | 0) % 1400) / S.meteors);
          const fromLeft = (now | 0) % 2 === 0;
          shoot = { x: fromLeft ? -50 : W + 50, y: H * 0.12 + (now | 0) % Math.max(1, H * 0.45 | 0), dx: (fromLeft ? 1 : -1) * (W * 0.5), dy: H * 0.22, t: 0 };
        }
      }
      hole.scr = 0;
      hole.lens = 0;
      if (S.hole > 0.02 && nodes.length && hole.init) {
        hole.x += (hole.tx - hole.x) * 0.04;
        hole.y += (hole.ty - hole.y) * 0.04;
        hole.z += (hole.tz - hole.z) * 0.04;
        projectNode(hole);
        const rg = hole.rg || 100;
        const far = Math.min(1, Math.max(0, (hole.sd - rg * 0.5) / rg));
        const hnf = (hole.nf === void 0 ? 1 : hole.nf) * (1 - far);
        if (!hole.near && hnf > 0.02) {
          const depth = Math.max(0.25, Math.min(1.15, 1 - hole.sd / 500));
          const R0 = Math.min(96, (17 + Math.min(30, Math.sqrt(hole.n || 0) * 3.4)) * S.hole * hole.ss);
          if (hole.sx > -R0 * 4 && hole.sx < W + R0 * 4 && hole.sy > -R0 * 4 && hole.sy < H + R0 * 4) {
            hole.scr = R0;
            hole.lens = R0 * 1.35 * hnf;
            if (hole.lens > 8) {
              const thE = hole.lens;
              const LR = Math.ceil(Math.min(1e3, Math.max(W, H), R0 * 7) / 16) * 16;
              if (!view.warpCv) {
                view.warpCv = document.createElement("canvas");
                view.warpCtx = view.warpCv.getContext("2d");
                view.warp2 = document.createElement("canvas");
                view.warp2Ctx = view.warp2.getContext("2d");
              }
              const wcv = view.warpCv, wc = view.warpCtx, w2 = view.warp2, w2c = view.warp2Ctx;
              const side = Math.min(2048, Math.ceil(LR * 2 * DPR / 64) * 64);
              if (wcv.width !== side) {
                wcv.width = side;
                wcv.height = side;
              }
              if (w2.width !== LR * 2) {
                w2.width = LR * 2;
                w2.height = LR * 2;
              }
              const cx0 = hole.sx - LR, cy0 = hole.sy - LR;
              const qx0 = Math.max(0, cx0), qy0 = Math.max(0, cy0);
              const qx1 = Math.min(W, hole.sx + LR), qy1 = Math.min(H, hole.sy + LR);
              if (qx1 > qx0 && qy1 > qy0) {
                wc.clearRect(0, 0, side, side);
                wc.drawImage(
                  canvas,
                  qx0 * DPR,
                  qy0 * DPR,
                  (qx1 - qx0) * DPR,
                  (qy1 - qy0) * DPR,
                  (qx0 - cx0) * DPR,
                  (qy0 - cy0) * DPR,
                  (qx1 - qx0) * DPR,
                  (qy1 - qy0) * DPR
                );
                const NR = R0 > 40 ? 96 : R0 > 20 ? 64 : 32, inR = thE * 1.02, sw = LR * 2 * DPR;
                const rg2 = (x) => inR + (LR - inR) * Math.pow(x, 1.7);
                w2c.clearRect(0, 0, LR * 2, LR * 2);
                for (let ri = 0; ri < NR; ri++) {
                  const r0 = rg2(ri / NR);
                  const r1 = rg2((ri + 1) / NR) + 0.7;
                  const m = (r0 + r1) / 2;
                  let defl = thE * thE / m;
                  defl *= Math.max(0, 1 - Math.pow((m - inR) / (LR - inR), 2));
                  const inv = Math.min(2.2, m / Math.max(1, m - defl));
                  w2c.save();
                  w2c.beginPath();
                  w2c.arc(LR, LR, r1, 0, 7);
                  w2c.arc(LR, LR, r0, 0, 7, true);
                  w2c.clip();
                  w2c.translate(LR, LR);
                  w2c.scale(inv, inv);
                  w2c.drawImage(wcv, 0, 0, sw, sw, -LR, -LR, LR * 2, LR * 2);
                  w2c.restore();
                }
                w2c.save();
                w2c.beginPath();
                w2c.arc(LR, LR, inR + 0.6, 0, 7);
                w2c.clip();
                w2c.translate(LR, LR);
                w2c.rotate(3.14159);
                w2c.scale(0.45, 0.45);
                w2c.globalAlpha = 0.85;
                w2c.drawImage(wcv, 0, 0, sw, sw, -LR, -LR, LR * 2, LR * 2);
                w2c.restore();
                ctx.save();
                ctx.globalAlpha = 1;
                ctx.globalCompositeOperation = "source-over";
                ctx.beginPath();
                ctx.arc(hole.sx, hole.sy, LR - 2, 0, 7);
                ctx.clip();
                try {
                  ctx.filter = "blur(1px)";
                } catch (_) {
                }
                ctx.drawImage(w2, 0, 0, LR * 2, LR * 2, hole.sx - LR, hole.sy - LR, LR * 2, LR * 2);
                try {
                  ctx.filter = "none";
                } catch (_) {
                }
                ctx.restore();
              }
            }
            const AC = S.hue ? rotHue("#F0B34E", S.hue).rgb : "240,179,78";
            const HOT = S.hue ? rotHue("#FFE9C4", S.hue).rgb : "255,233,196";
            const ph = reduceMotion ? 0 : t * 0.35;
            const TILT = 0.42;
            const A = hnf * depth;
            ctx.save();
            ctx.translate(hole.sx, hole.sy);
            ctx.globalCompositeOperation = "screen";
            const g = ctx.createRadialGradient(0, 0, R0 * 0.8, 0, 0, R0 * 2.6);
            g.addColorStop(0, "rgba(" + AC + ",0)");
            g.addColorStop(0.25, "rgba(" + AC + "," + (0.16 * A).toFixed(3) + ")");
            g.addColorStop(1, "rgba(" + AC + ",0)");
            ctx.fillStyle = g;
            ctx.fillRect(-R0 * 2.7, -R0 * 2.7, R0 * 5.4, R0 * 5.4);
            ctx.rotate(TILT);
            const SEG = R0 > 30 ? 60 : R0 > 15 ? 36 : 20, TAU = 6.28319;
            for (let si = 0; si < SEG; si++) {
              const a0 = si / SEG * TAU, a1 = (si + 1) / SEG * TAU;
              const am = (a0 + a1) / 2;
              const dopp = Math.max(0.1, 0.4 + 0.6 * Math.cos(am));
              const topBias = 0.7 + 0.3 * Math.max(0, -Math.sin(am));
              const shim = 1 + 0.1 * Math.sin(am * 3 - ph * 4);
              const rr = R0 * 1.1;
              ctx.strokeStyle = "rgba(" + HOT + "," + Math.min(1, 1.1 * A * dopp * topBias * shim).toFixed(3) + ")";
              ctx.lineWidth = Math.max(1.1, R0 * 0.045);
              ctx.beginPath();
              ctx.arc(0, 0, rr, a0, a1);
              ctx.stroke();
              ctx.strokeStyle = "rgba(" + AC + "," + (0.2 * A * dopp * topBias).toFixed(3) + ")";
              ctx.lineWidth = Math.max(1.8, R0 * 0.08);
              ctx.beginPath();
              ctx.arc(0, 0, rr * 1.035, a0, a1);
              ctx.stroke();
            }
            ctx.strokeStyle = "rgba(" + HOT + "," + (0.32 * A).toFixed(3) + ")";
            ctx.lineWidth = Math.max(0.8, R0 * 0.028);
            ctx.beginPath();
            ctx.arc(0, 0, R0 * 1.22, 0.55, 2.6);
            ctx.stroke();
            ctx.strokeStyle = "rgba(" + AC + "," + (0.12 * A).toFixed(3) + ")";
            ctx.lineWidth = Math.max(1.4, R0 * 0.05);
            ctx.beginPath();
            ctx.arc(0, 0, R0 * 1.26, 0.55, 2.6);
            ctx.stroke();
            const diskHalf = (a0, a1, mul) => {
              ctx.save();
              ctx.scale(1, 0.13);
              ctx.beginPath();
              ctx.arc(0, 0, R0 * 3.3, a0, a1);
              ctx.arc(0, 0, R0 * 1.05, a1, a0, true);
              ctx.closePath();
              ctx.clip();
              ctx.globalAlpha = mul;
              const bb = ctx.createRadialGradient(0, 0, R0 * 1.05, 0, 0, R0 * 3.3);
              bb.addColorStop(0, "rgba(" + HOT + "," + Math.min(1, 0.95 * A).toFixed(3) + ")");
              bb.addColorStop(0.09, "rgba(" + HOT + "," + (0.55 * A).toFixed(3) + ")");
              bb.addColorStop(0.13, "rgba(" + AC + "," + (0.18 * A).toFixed(3) + ")");
              bb.addColorStop(0.18, "rgba(" + AC + "," + (0.6 * A).toFixed(3) + ")");
              bb.addColorStop(0.3, "rgba(" + AC + "," + (0.48 * A).toFixed(3) + ")");
              bb.addColorStop(0.34, "rgba(" + AC + "," + (0.14 * A).toFixed(3) + ")");
              bb.addColorStop(0.4, "rgba(" + AC + "," + (0.46 * A).toFixed(3) + ")");
              bb.addColorStop(0.55, "rgba(" + AC + "," + (0.28 * A).toFixed(3) + ")");
              bb.addColorStop(0.6, "rgba(" + AC + "," + (0.09 * A).toFixed(3) + ")");
              bb.addColorStop(0.66, "rgba(" + AC + "," + (0.24 * A).toFixed(3) + ")");
              bb.addColorStop(0.82, "rgba(" + AC + "," + (0.1 * A).toFixed(3) + ")");
              bb.addColorStop(1, "rgba(" + AC + ",0)");
              ctx.fillStyle = bb;
              ctx.fillRect(-R0 * 3.4, -R0 * 3.4, R0 * 6.8, R0 * 6.8);
              if (mul >= 1) {
                const db = ctx.createRadialGradient(R0 * 1.6, R0 * 0.3, 0, R0 * 1.6, R0 * 0.3, R0 * 1.4);
                db.addColorStop(0, "rgba(" + HOT + "," + Math.min(1, 0.85 * A).toFixed(3) + ")");
                db.addColorStop(0.45, "rgba(" + HOT + "," + (0.28 * A).toFixed(3) + ")");
                db.addColorStop(1, "rgba(" + HOT + ",0)");
                ctx.fillStyle = db;
                ctx.fillRect(-R0 * 3.4, -R0 * 3.4, R0 * 6.8, R0 * 6.8);
              }
              ctx.globalAlpha = 1;
              ctx.restore();
            };
            diskHalf(3.14159, 6.28318, 0.5);
            ctx.globalCompositeOperation = "source-over";
            const hg = ctx.createRadialGradient(0, 0, 0, 0, 0, R0);
            hg.addColorStop(0, "rgba(0,0,0," + hnf.toFixed(3) + ")");
            hg.addColorStop(0.86, "rgba(0,0,0," + hnf.toFixed(3) + ")");
            hg.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = hg;
            ctx.beginPath();
            ctx.arc(0, 0, R0, 0, 7);
            ctx.fill();
            ctx.globalCompositeOperation = "screen";
            ctx.strokeStyle = "rgba(" + HOT + "," + (0.9 * A).toFixed(3) + ")";
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.arc(0, 0, R0 * 1.02, 0, 7);
            ctx.stroke();
            ctx.strokeStyle = "rgba(" + HOT + "," + (0.25 * A).toFixed(3) + ")";
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.arc(0, 0, R0 * 1.05, 0, 7);
            ctx.stroke();
            diskHalf(0, 3.14159, 1);
            ctx.globalCompositeOperation = "source-over";
            ctx.restore();
          }
        }
        for (let di = dying.length - 1; di >= 0; di--) {
          const dn = dying[di];
          dn.t += reduceMotion ? 0.05 : 8e-3;
          if (dn.t >= 1) {
            dying.splice(di, 1);
            continue;
          }
          const p = dn.t * dn.t * (3 - 2 * dn.t);
          const swirl = (1 - p) * 46, an = dn.ph + p * 9.5;
          const wp = {
            x: dn.x + (hole.x - dn.x) * p + Math.cos(an) * swirl,
            y: dn.y + (hole.y - dn.y) * p + Math.sin(an) * swirl * 0.4,
            z: dn.z + (hole.z - dn.z) * p + Math.sin(an) * swirl,
            sx: 0,
            sy: 0,
            ss: 1,
            sd: 0,
            near: false,
            nf: 1
          };
          projectNode(wp);
          if (wp.near) continue;
          const fa = (1 - p * 0.6) * (wp.nf === void 0 ? 1 : wp.nf);
          ctx.fillStyle = "rgba(" + FC(dn.fam).rgb + "," + (0.9 * fa).toFixed(3) + ")";
          ctx.beginPath();
          ctx.arc(wp.sx, wp.sy, Math.max(0.8, dn.r * wp.ss * (1 - p * 0.8)), 0, 7);
          ctx.fill();
        }
      }
      const shaped = (S.shape || "natural") !== "natural";
      const shpNow = S.shape || "natural";
      const mp = { x: 0, y: 0, z: 0, sx: 0, sy: 0, ss: 1, sd: 0, near: false, nf: 1 };
      for (const l of links) {
        const a = nodes[l.s], b = nodes[l.t];
        if (hiddenN(a) || hiddenN(b)) continue;
        const depth = Math.max(0.15, Math.min(1, 1 - (a.sd + b.sd) / 2 / 420));
        const la = Math.min(1, S.linkAlpha);
        const col = l.hl > 0.05 && hn ? FC(hn.fam).rgb : a.fam === b.fam ? FC(a.fam).rgb : "120,140,185";
        const baseA = a.fam === b.fam ? Math.min(0.9, 0.24 * depth * S.linkAlpha) : Math.min(0.9, 0.1 * depth * S.linkAlpha);
        const nf2 = Math.min(a.nf === void 0 ? 1 : a.nf, b.nf === void 0 ? 1 : b.nf);
        let alpha2 = (baseA * (1 - 0.82 * l.dm) + 0.3 * la * l.hl) * nf2;
        let shF = 1;
        if (shaped) {
          const dx3 = a.x - b.x, dy3 = a.y - b.y, dz3 = a.z - b.z;
          const L = Math.sqrt(dx3 * dx3 + dy3 * dy3 + dz3 * dz3);
          shF = Math.max(0, Math.min(1, 1 - (L - S.len * 1.8) / (S.len * 2.2)));
          shF = Math.max(shF, l.hl);
          alpha2 *= shF;
        }
        l.shF = shF;
        if (alpha2 < 0.01) continue;
        ctx.strokeStyle = "rgba(" + col + "," + Math.min(0.95, alpha2) + ")";
        ctx.lineWidth = (0.55 + 0.35 * l.hl) * S.linkW;
        if (shaped) {
          mp.x = (a.x + b.x) / 2;
          mp.y = (a.y + b.y) / 2;
          mp.z = (a.z + b.z) / 2;
          mp.near = false;
          if (shpNow === "shell") {
            const r = Math.sqrt(mp.x * mp.x + mp.y * mp.y + mp.z * mp.z) || 1;
            const tr = (Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z) + Math.sqrt(b.x * b.x + b.y * b.y + b.z * b.z)) / 2;
            const k2 = tr / r;
            mp.x *= k2;
            mp.y *= k2;
            mp.z *= k2;
          } else {
            mp.y *= 0.35;
            if (shpNow === "ring") {
              const r = Math.sqrt(mp.x * mp.x + mp.z * mp.z) || 1;
              const tr = (Math.sqrt(a.x * a.x + a.z * a.z) + Math.sqrt(b.x * b.x + b.z * b.z)) / 2;
              const k2 = tr / r;
              mp.x *= k2;
              mp.z *= k2;
            }
          }
          projectNode(mp);
          ctx.beginPath();
          ctx.moveTo(a.sx, a.sy);
          ctx.quadraticCurveTo(mp.sx, mp.sy, b.sx, b.sy);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(a.sx, a.sy);
          ctx.lineTo(b.sx, b.sy);
          ctx.stroke();
        }
      }
      if (links.length) for (const p of particles) {
        p.t += p.sp;
        if (p.t > 1) {
          p.t = 0;
          p.l = p.l + 37;
        }
        const l = links[p.l % links.length], a = nodes[l.s], b = nodes[l.t];
        if (hiddenN(a) || hiddenN(b)) continue;
        const pa = 0.8 * (1 - 0.9 * (l.dm || 0)) * (l.shF === void 0 ? 1 : l.shF);
        if (pa < 0.05) continue;
        const x = a.sx + (b.sx - a.sx) * p.t, y = a.sy + (b.sy - a.sy) * p.t, s = a.ss + (b.ss - a.ss) * p.t;
        ctx.fillStyle = "rgba(200,235,255," + pa + ")";
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.5, 0.9 * s), 0, 7);
        ctx.fill();
      }
      if (S.glow > 0.01) {
        ctx.globalCompositeOperation = "screen";
        for (const i of ord) {
          const n = nodes[i];
          if (hiddenN(n)) continue;
          const dim = n.dim || 0;
          if (dim > 0.97) continue;
          const depth = Math.max(0.25, Math.min(1.15, 1 - n.sd / 500));
          const twA = 0.18 * S.twinkle;
          const tw = reduceMotion ? 1 : 1 - twA + twA * Math.sin(t * 1.4 + n.tw * 6.283);
          const lit = 1 + 0.4 * (n.litE || 0);
          const rad = Math.min(70, n.r * n.ss * lit * S.nodeSize);
          const gr = Math.min(320, rad * (n.g === "log" ? 4 : 6) * Math.min(1.6, S.glow));
          if (n.sx < -gr - 20 || n.sx > W + gr + 20 || n.sy < -gr - 20 || n.sy > H + gr + 20) continue;
          ctx.globalAlpha = Math.min(0.75, 0.4 * tw * depth * lit * S.glow * (1 - 0.9 * dim) * (n.nf === void 0 ? 1 : n.nf));
          ctx.drawImage(glows[n.fam], n.sx - gr, n.sy - gr, gr * 2, gr * 2);
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      }
      for (const i of ord) {
        const n = nodes[i], c = FC(n.fam);
        if (hiddenN(n)) continue;
        const isFocus = i === focusIdx;
        const dim = n.dim || 0;
        const depth = Math.max(0.25, Math.min(1.15, 1 - n.sd / 500));
        const twA = 0.18 * S.twinkle;
        const tw = reduceMotion ? 1 : 1 - twA + twA * Math.sin(t * 1.4 + n.tw * 6.283);
        const lit = 1 + 0.4 * (n.litE || 0);
        const rad = Math.min(70, n.r * n.ss * lit * S.nodeSize);
        if (n.sx < -150 || n.sx > W + 150 || n.sy < -150 || n.sy > H + 150) continue;
        if ((n.w >= 14 || isFocus) && dim < 0.9) {
          ctx.strokeStyle = "rgba(" + c.rgb + "," + 0.55 * depth * (1 - dim) + ")";
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.arc(n.sx, n.sy, rad * 1.9, 0, 7);
          ctx.stroke();
        }
        if (n.nova && dim < 0.9 && S.novas > 0.02) {
          const ph = reduceMotion ? 0.5 : (t * 0.28 + n.tw) % 1;
          ctx.strokeStyle = "rgba(" + c.rgb + "," + 0.35 * (1 - ph) * depth * (1 - dim) * Math.min(1.5, S.novas) * (n.nf === void 0 ? 1 : n.nf) + ")";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(n.sx, n.sy, rad * (1.6 + ph * 2.2), 0, 7);
          ctx.stroke();
        }
        const nf3 = n.nf === void 0 ? 1 : n.nf;
        ctx.globalAlpha = Math.min(1, 0.35 + 0.65 * depth) * (1 - 0.55 * dim) * nf3;
        ctx.fillStyle = n.g === "log" ? "rgba(" + c.rgb + ",0.75)" : c.main;
        ctx.beginPath();
        ctx.arc(n.sx, n.sy, Math.max(0.8, rad), 0, 7);
        ctx.fill();
        if (n.g !== "log" && dim < 0.95) {
          ctx.fillStyle = "rgba(255,255,255," + 0.55 * tw * depth * (1 - dim) * nf3 + ")";
          ctx.beginPath();
          ctx.arc(n.sx, n.sy, rad * 0.38, 0, 7);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      ctx.textAlign = "center";
      for (const op of ringOps) {
        ctx.save();
        ctx.translate(op.x, op.y);
        ctx.rotate(op.rot);
        ctx.font = "italic " + op.fs + "px Georgia, serif";
        ctx.fillStyle = op.fill;
        ctx.fillText(op.ch, 0, 0);
        ctx.restore();
      }
      if (S.names > 0.02) {
        for (const i of ord) {
          const n = nodes[i];
          let tier;
          if (n.w >= 8) tier = 1;
          else if (n.w >= 2 && n.g !== "log") tier = 2;
          else tier = 3;
          n.lblTier = tier;
          let ok = false;
          if (!hiddenN(n) && (n.dim || 0) <= 0.85 && n.sx >= -80 && n.sx <= W + 80 && n.sy >= -60 && n.sy <= H + 60) {
            const th = [0, 0.8, 1.5, 2.3][tier];
            const sMul = n.ss * Math.sqrt(S.names);
            ok = n.lblOn ? sMul > th * 0.85 : sMul > th * 1.08;
          }
          n.lblWant = ok;
        }
        const cands = [];
        for (const i of ord) {
          const n = nodes[i];
          if (!n.lblWant) {
            n.lblOn = false;
            continue;
          }
          cands.push([(n.lblOn ? 1e5 : 0) + (3 - n.lblTier) * 1e3 + n.w, i]);
        }
        cands.sort((a, b) => b[0] - a[0] || a[1] - b[1]);
        const placedN = [];
        const tierCount = [0, 0, 0, 0];
        for (const [, i] of cands) {
          const n = nodes[i];
          if (tierCount[n.lblTier] >= TIERCAP[n.lblTier]) {
            n.lblOn = false;
            continue;
          }
          if (!n.lc) {
            const lbl = n.id.length > 26 ? n.id.slice(0, 24) + "\u2026" : n.id;
            ctx.font = "italic 100px Georgia, serif";
            const adv = [];
            let tot = 0;
            for (const chr of lbl) {
              const w2 = ctx.measureText(chr).width;
              adv.push(w2);
              tot += w2;
            }
            n.lc = { lbl, adv, tot };
          }
          const fs = (n.lblTier === 1 ? 13 : n.lblTier === 2 ? 10.5 : 9) * Math.min(1.7, Math.sqrt(n.ss));
          const wpx = n.lc.tot * (fs / 100) + fs * 0.06;
          const box = { x: n.sx - wpx / 2 - 10, y: n.sy - n.r * n.ss - fs * 2.4, w: wpx + 20, h: fs * 3 };
          let clash = false;
          for (const b of placedN) {
            if (box.x < b.x + b.w && box.x + box.w > b.x && box.y < b.y + b.h && box.y + box.h > b.y) {
              clash = true;
              break;
            }
          }
          if (clash) {
            n.lblOn = false;
            continue;
          }
          placedN.push(box);
          tierCount[n.lblTier]++;
          n.lblOn = true;
        }
        ctx.textAlign = "center";
        for (const i of ord) {
          const n = nodes[i];
          const tgt = n.lblOn ? 1 : 0;
          n.lblA = (n.lblA || 0) + (tgt - (n.lblA || 0)) * 0.1;
          if (n.lblA <= 0.03) continue;
          if (hiddenN(n) || !n.lc) continue;
          const ang = (reduceMotion ? 0 : t * 0.12) + i * 2.4;
          const rW = n.r * 2.6 + 13;
          const tmp = { x: n.x + Math.cos(ang) * rW, y: n.y - n.r * 0.8, z: n.z + Math.sin(ang) * rW, sx: 0, sy: 0, ss: 1, sd: 0, near: false, nf: 1 };
          projectNode(tmp);
          if (tmp.near) continue;
          const behind = tmp.sd > n.sd;
          const rel2 = Math.max(0.5, Math.min(1.4, tmp.ss / Math.max(1e-3, n.ss)));
          const fs = (n.lblTier === 1 ? 13 : n.lblTier === 2 ? 10.5 : 9) * Math.min(1.7, Math.sqrt(n.ss)) * rel2;
          const aa = Math.min(0.85, (n.lblTier === 1 ? 0.6 : n.lblTier === 2 ? 0.5 : 0.42) * (1 - (n.dim || 0)) * n.lblA * (behind ? 0.4 : 1) * (tmp.nf === void 0 ? 1 : tmp.nf));
          if (aa <= 0.02) continue;
          ctx.fillStyle = "rgba(" + FC(n.fam).rgb + "," + aa.toFixed(3) + ")";
          ctx.font = "italic " + fs + "px Georgia, serif";
          ctx.fillText(n.lc.lbl, tmp.sx, tmp.sy);
        }
      }
      ctx.textAlign = "center";
      ctx.lineJoin = "round";
      const candidates = [];
      for (const i of ord) {
        const n = nodes[i];
        if (hiddenN(n)) continue;
        if (n.sx < -60 || n.sx > W + 60 || n.sy < -40 || n.sy > H + 40) continue;
        let pri = -1;
        if (i === hover || i === focusIdx) pri = 1e6;
        else if (hn) {
          if (hn.nbr.has(i) && n.g !== "log") pri = 1e3 + n.w;
        } else if (famSolo && n.fam === famSolo && n.g !== "log") pri = 80 + n.w;
        if (pri >= 0) candidates.push([pri, i]);
      }
      candidates.sort((a, b) => b[0] - a[0]);
      const placed = [];
      let drawn = 0;
      for (const [, i] of candidates) {
        if (drawn >= 30) break;
        const n = nodes[i];
        const depth = Math.max(0.55, Math.min(1, 1 - n.sd / 600));
        const fs = Math.max(10, Math.min(15, (9 + n.w * 0.15) * Math.sqrt(n.ss)));
        ctx.font = fs + "px Menlo, Consolas, monospace";
        const label = n.id.length > 36 ? n.id.slice(0, 34) + "\u2026" : n.id;
        const tw2 = ctx.measureText(label).width;
        const lx = n.sx, ly = n.sy - n.r * n.ss - 9;
        const box = { x: lx - tw2 / 2 - 6, y: ly - fs - 3, w: tw2 + 12, h: fs + 8 };
        let clash = false;
        for (const b2 of placed) {
          if (box.x < b2.x + b2.w && box.x + box.w > b2.x && box.y < b2.y + b2.h && box.y + box.h > b2.y) {
            clash = true;
            break;
          }
        }
        if (clash) continue;
        placed.push(box);
        drawn++;
        ctx.strokeStyle = "rgba(3,5,10,0.85)";
        ctx.lineWidth = 3;
        ctx.strokeText(label, lx, ly);
        ctx.fillStyle = i === hover || i === focusIdx ? "#FFFFFF" : "rgba(226,234,248," + 0.92 * depth + ")";
        ctx.fillText(label, lx, ly);
      }
      if (view.wantShot) {
        view.wantShot = false;
        try {
          shot.querySelector("img").src = canvas.toDataURL("image/png");
          shot.classList.add("fsm-show");
        } catch (_) {
        }
      }
      view.rafId = requestAnimationFrame(frame);
    };
    view.rafId = requestAnimationFrame(frame);
  }
};
var FathomStarmapPlugin = class extends import_obsidian.Plugin {
  async onload() {
    this.registerView(VIEW_TYPE, (leaf) => new StarmapView(leaf, this));
    this.addRibbonIcon("star", "Fathom Starmap", () => this.activate());
    this.addCommand({ id: "open-fathom-starmap", name: "Open starmap", callback: () => this.activate() });
    this.addCommand({ id: "export-wallpaper", name: "Export starmap as desktop wallpaper", callback: () => this.exportWallpaper() });
  }
  async activate() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE)[0];
    if (!leaf) {
      leaf = workspace.getLeaf(true);
      await leaf.setViewState({ type: VIEW_TYPE, active: true });
    }
    workspace.revealLeaf(leaf);
  }
  async exportWallpaper() {
    const leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE)[0];
    if (!leaf) {
      new (require("obsidian")).Notice("Open the starmap first, then export.");
      return;
    }
    const view = leaf.view;
    const data = view.getGraphData?.();
    if (!data || !data.nodes?.length) {
      new (require("obsidian")).Notice("Starmap has no data yet \u2014 wait for it to load.");
      return;
    }
    const html = exportWallpaper(data.nodes, data.links, data.S);
    const path = "fathom-wallpaper.html";
    try {
      const exists = this.app.vault.getAbstractFileByPath(path);
      if (exists) await this.app.vault.modify(exists, html);
      else await this.app.vault.create(path, html);
      new (require("obsidian")).Notice(
        "Wallpaper saved to " + path + "\n\nPoint a wallpaper app (Plash, Wallpaper Engine, etc.) at this file.",
        8e3
      );
    } catch (e) {
      new (require("obsidian")).Notice("Failed to save wallpaper: " + e.message);
    }
  }
  onunload() {
  }
};
