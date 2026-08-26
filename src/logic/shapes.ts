/* Galaxy shape magnets — gentle forces that herd stars into a preset
   silhouette: spiral, disc, ring, shell, helix, torus, clusters, cube.
   'natural' = no extra force, the classic ball.

   Called once per physics step. Mutates node velocities in place. */

import { FAMORDER } from '../config/constants';
import type { StarNode } from '../types';

export function applyShape(
  nodes: StarNode[],
  S: Record<string, any>,
  view: Record<string, any>,
): void {
  const shp = S.shape || 'natural';

  // target = the CURRENT mean radius for shapes that need it
  let shpR = 0;
  if (shp !== 'natural' && shp !== 'disc' && shp !== 'spiral') {
    let sm = 0;
    for (const n of nodes) sm += Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z);
    shpR = sm / nodes.length;
  }

  // per-step scaffolding for clusters
  let clC: Record<string, number[]> | null = null;
  if (shp === 'clusters') {
    if (!view.clR) view.clR = shpR || 1;
    const CR = view.clR * 1.6;
    clC = {};
    let ci = 0;
    for (const k of (view.famOrder || FAMORDER)) {
      const ca = ci * 2.399;
      clC[k] = [Math.cos(ca) * CR, ((ci % 3) - 1) * CR * 0.45, Math.sin(ca) * CR];
      ci++;
    }
  }

  for (const n of nodes) {
    // center gravity
    n.vx -= n.x * S.center * n.deg;
    n.vy -= n.y * S.center * n.deg;
    n.vz -= n.z * S.center * n.deg;

    if (shp === 'disc' || shp === 'spiral' || shp === 'ring') {
      n.vy -= n.y * 0.05;
    }

    if (shp === 'spiral') {
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
    } else if (shp === 'ring') {
      const r = Math.sqrt(n.x * n.x + n.z * n.z) || 1;
      const f = (shpR - r) * 0.03;
      n.vx += n.x / r * f;
      n.vz += n.z / r * f;
    } else if (shp === 'shell') {
      const r = Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z) || 1;
      const f = (shpR - r) * 0.035;
      n.vx += n.x / r * f;
      n.vy += n.y / r * f;
      n.vz += n.z / r * f;
    } else if (shp === 'helix') {
      const r = Math.sqrt(n.x * n.x + n.z * n.z) || 1;
      const f = (shpR * 0.75 - r) * 0.014;
      n.vx += n.x / r * f;
      n.vz += n.z / r * f;
      if (n.hxA === undefined) n.hxA = n.y * 0.012;
      const ang = Math.atan2(n.z, n.x);
      let e = (ang - n.hxA) % Math.PI;
      if (e < -Math.PI / 2) e += Math.PI;
      if (e >= Math.PI / 2) e -= Math.PI;
      const dth = -e * 0.03;
      n.vx += -Math.sin(ang) * r * dth;
      n.vz += Math.cos(ang) * r * dth;
    } else if (shp === 'torus') {
      const r = Math.sqrt(n.x * n.x + n.z * n.z) || 1;
      const dr = r - shpR;
      const d = Math.sqrt(dr * dr + n.y * n.y) || 1;
      const f = (shpR * 0.16 - d) * 0.03;
      n.vx += (n.x / r) * (dr / d) * f;
      n.vy += (n.y / d) * f;
      n.vz += (n.z / r) * (dr / d) * f;
    } else if (shp === 'clusters' && clC) {
      const cc = clC[n.fam] || clC.core;
      if (cc) {
        n.vx += (cc[0] - n.x) * 0.006;
        n.vy += (cc[1] - n.y) * 0.006;
        n.vz += (cc[2] - n.z) * 0.006;
      }
    } else if (shp === 'cube') {
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
