import { describe, it, expect } from 'vitest';
import { physicsStep } from '../src/logic/forces';

function makeNode(x: number, y: number, z: number, fam = 'core') {
  return {
    x, y, z, vx: 0, vy: 0, vz: 0,
    id: 'n', fam, deg: 2, w: 1, r: 3,
    vis: true, tier: 0, seeds: [],
    sx: 0, sy: 0, ss: 1, sd: 0, near: false, nf: 1,
    dim: 0, litE: 0, lblA: 0, lblOn: false,
  } as any;
}

describe('physicsStep', () => {
  it('repels overlapping nodes apart', () => {
    const a = makeNode(0, 0, 0);
    const b = makeNode(2, 0, 0);
    const S = { repel: 100, spring: 0.02, len: 30, center: 0.001, heat: 0, shape: 'natural' };
    physicsStep([a, b], [], S, 1, {});
    // a should have moved in the -x direction (away from b)
    expect(a.x).toBeLessThan(0);
    // b should have moved in the +x direction
    expect(b.x).toBeGreaterThan(2);
  });

  it('springs pull linked nodes together', () => {
    const a = makeNode(-50, 0, 0);
    const b = makeNode(50, 0, 0);
    const link = { s: 0, t: 1 };
    const S = { repel: 0, spring: 0.1, len: 30, center: 0, heat: 0, shape: 'natural' };
    physicsStep([a, b], [link], S, 1, {});
    // a should move toward b (positive x)
    expect(a.x).toBeGreaterThan(-50);
    // b should move toward a (negative x)
    expect(b.x).toBeLessThan(50);
  });

  it('center gravity pulls nodes toward origin', () => {
    const a = makeNode(100, 100, 100);
    const S = { repel: 0, spring: 0, len: 30, center: 0.01, heat: 0, shape: 'natural' };
    physicsStep([a], [], S, 1, {});
    expect(a.x).toBeLessThan(100);
    expect(a.y).toBeLessThan(100);
    expect(a.z).toBeLessThan(100);
  });
});
