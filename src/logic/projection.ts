/* 3D → 2D camera projection and gravitational lensing.
   Both functions mutate the point's screen coordinates in place. */

import { FOCAL, F2 } from '../config/constants';
import type { Projectable, BlackHole, CameraState } from '../types';

/** Project a world-space point onto the screen. */
export function project(
  n: Projectable,
  cam: CameraState,
  W: number,
  H: number,
): void {
  const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
  const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);

  if (cam.flightMode) {
    const nx = n.x - cam.cam.x, ny = n.y - cam.cam.y, nz = n.z - cam.cam.z;
    let x = nx * cy + nz * sy, z = -nx * sy + nz * cy;
    const y = ny * cp - z * sp;
    z = ny * sp + z * cp;
    n.near = z < 70;
    n.nf = Math.min(1, Math.max(0, (z - 70) / 140));
    const s = Math.min(8, F2 / Math.max(70, z));
    n.sx = W / 2 + x * s;
    n.sy = H / 2 + y * s;
    n.ss = s;
    n.sd = z - FOCAL / (0.9 * cam.zoom);
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

/** Gravitational lensing: bend the apparent position of a point that sits
    behind the black hole using the point-mass lens equation. */
export function lensPoint(p: Projectable, hole: BlackHole): void {
  const thE = hole.lens || 0;
  if (thE <= 0 || hole.near || p.sd <= hole.sd + 10) return;
  const dx = p.sx - hole.sx, dy = p.sy - hole.sy;
  const b = Math.sqrt(dx * dx + dy * dy) || 0.001;
  if (b > thE * 7) return;
  const k = ((b + Math.sqrt(b * b + 4 * thE * thE)) / 2) / b;
  p.sx = hole.sx + dx * k;
  p.sy = hole.sy + dy * k;
}
