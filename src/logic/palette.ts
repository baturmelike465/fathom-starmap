/* Dynamic constellation colour selection.
   When a vault has more top-level folders than the seven hand-tuned families,
   each new constellation gets a colour spaced optimally round the hue wheel —
   as far as possible from every colour already in the sky.
   The choices are cached by mint order so a family's colour never shifts. */

import { FAMORDER, FAMS, PENTA } from '../config/constants';
import { rotHue } from '../utils/color';

/** HSL → hex + rgb string. */
export function hslCol(h: number, s: number, l: number): { css: string; rgb: string } {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round((l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255);
  };
  const r = f(0), g = f(8), b = f(4);
  return {
    css: '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join(''),
    rgb: r + ',' + g + ',' + b,
  };
}

/** Extract hue (0–360) from a hex colour. */
export function hueOfHex(hx: string): number {
  const r = parseInt(hx.slice(1, 3), 16) / 255;
  const g = parseInt(hx.slice(3, 5), 16) / 255;
  const b = parseInt(hx.slice(5, 7), 16) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  if (mx === mn) return 0;
  const d = mx - mn;
  let h = mx === r
    ? (g - b) / d + (g < b ? 6 : 0)
    : mx === g
      ? (b - r) / d + 2
      : (r - g) / d + 4;
  return h * 60;
}

/** Euclidean distance between two "r,g,b" strings. */
export function rgbDist(a: string, b: string): number {
  const p = a.split(',').map(Number);
  const q = b.split(',').map(Number);
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
}

export interface DynCol {
  css: string;
  rgb: string;
  hue: number;
}

/** Pick the next dynamic colour, maximising distance from all existing palette entries.
    `basePal` maps family key → original hex. `dynCols` is the cache — the function
    appends entries to it and returns the one at index `di`. */
export function dynColFor(
  di: number,
  basePal: Record<string, string>,
  dynCols: DynCol[],
): DynCol {
  while (dynCols.length <= di) {
    const used = FAMORDER.map(x => hueOfHex(basePal[x] || FAMS[x].color))
      .concat(dynCols.map(c => c.hue));
    let bestH = 0, bestGap = -1;
    for (let h = 0; h < 360; h += 3) {
      let mg = 360;
      for (const u of used) {
        let g2 = Math.abs(h - u) % 360;
        if (g2 > 180) g2 = 360 - g2;
        if (g2 < mg) mg = g2;
      }
      if (mg > bestGap) { bestGap = mg; bestH = h; }
    }
    const others = FAMORDER.map(x => FAMS[x].rgb).concat(dynCols.map(c => c.rgb));
    let best: DynCol | null = null, bestD = -1;
    for (const [s2, l] of [[0.68, 0.63], [0.50, 0.72], [0.80, 0.53]]) {
      const cand = hslCol(bestH, s2, l);
      let mn = 1e9;
      for (const o of others) {
        const d2 = rgbDist(cand.rgb, o);
        if (d2 < mn) mn = d2;
      }
      if (mn > bestD) { bestD = mn; best = { ...cand, hue: bestH }; }
    }
    dynCols.push(best!);
  }
  return dynCols[di];
}

/** Create or return an existing dynamic family entry.
    Mutates FAMS and related structures. Returns the family key. */
export function ensureFam(
  k: string,
  famOrder: string[],
  basePal: Record<string, string>,
  dynCols: DynCol[],
  puffs: Record<string, any>,
  glows: Record<string, any>,
  makePuff: (color: string) => any,
  makeGlowSprite: (color: string) => any,
  S: Record<string, any>,
  famF?: Record<string, number>,
): string {
  if (FAMS[k]) return k;
  const di = famOrder.length - FAMORDER.length;
  const col = dynColFor(di, basePal, dynCols);
  FAMS[k] = {
    name: k, color: col.css, rgb: col.rgb, seeds: [],
    snd: PENTA[(FAMORDER.length + di) % PENTA.length] * (di >= PENTA.length ? 0.5 : 1),
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
