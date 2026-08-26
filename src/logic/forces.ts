/* Physics simulation — one step of the force-directed layout.
   O(n²) repulsion, spring links, center gravity, galaxy shape magnets,
   velocity damping. Called once per warp tick.

   Pure function of (nodes, links, S, alpha, view state). Mutates node velocities
   and positions in place. */

import { DAMP } from '../config/constants';
import type { StarNode, StarLink } from '../types';
import { applyShape } from './shapes';

export function physicsStep(
  nodes: StarNode[],
  links: StarLink[],
  S: Record<string, any>,
  alpha: number,
  view: Record<string, any>,
): void {
  const shpS = S.shape || 'natural';
  // while a shape is on, links loosen their grip — otherwise they fight the
  // shape magnets and the whole structure oscillates ("flinging lines")
  const spr = S.spring * (shpS === 'natural' ? 1 : 0.3);

  // O(n²) repulsion
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    for (let j = i + 1; j < nodes.length; j++) {
      const b = nodes[j];
      let dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
      let d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < 1) d2 = 1;
      if (d2 > 160000) continue;
      const f = S.repel / d2, d = Math.sqrt(d2);
      dx /= d; dy /= d; dz /= d;
      a.vx += dx * f; a.vy += dy * f; a.vz += dz * f;
      b.vx -= dx * f; b.vy -= dy * f; b.vz -= dz * f;
    }
  }

  // spring attraction along links
  for (const l of links) {
    const a = nodes[l.s], b = nodes[l.t];
    const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
    const f = spr * (d - S.len) / d;
    const wa = 1 / Math.sqrt(a.deg), wb = 1 / Math.sqrt(b.deg);
    a.vx += dx * f * wa; a.vy += dy * f * wa; a.vz += dz * f * wa;
    b.vx -= dx * f * wb; b.vy -= dy * f * wb; b.vz -= dz * f * wb;
  }

  const jitter = S.heat * 0.6;

  // galaxy shape forces + center gravity + damping
  applyShape(nodes, S, view);

  for (const n of nodes) {
    if (jitter) {
      n.vx += (Math.random() - 0.5) * jitter;
      n.vy += (Math.random() - 0.5) * jitter;
      n.vz += (Math.random() - 0.5) * jitter;
    }
    n.vx *= DAMP; n.vy *= DAMP; n.vz *= DAMP;
    const m = Math.max(alpha, jitter ? 0.5 : 0);
    n.x += n.vx * m; n.y += n.vy * m; n.z += n.vz * m;
  }
}
