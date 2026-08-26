import { describe, it, expect } from 'vitest';
import { project, lensPoint } from '../src/logic/projection';
import type { CameraState } from '../src/types';

function makeCam(overrides: Partial<CameraState> = {}): CameraState {
  return {
    yaw: 0, pitch: 0, zoom: 1,
    flightMode: false,
    ctr: { x: 0, y: 0, z: 0 },
    cam: { x: 0, y: 0, z: 0 },
    vel: { x: 0, y: 0, z: 0 },
    targetYaw: 0, targetPitch: 0, targetZoom: 1,
    focusIdx: -1,
    ...overrides,
  };
}

function makePoint(x = 0, y = 0, z = 100) {
  return { x, y, z, sx: 0, sy: 0, ss: 0, sd: 0, near: false, nf: 0 };
}

describe('project', () => {
  it('places a point at the center of the screen when at origin facing z', () => {
    const p = makePoint(0, 0, 100);
    project(p, makeCam(), 800, 600);
    // should be near center
    expect(p.sx).toBeCloseTo(400, 0);
    expect(p.sy).toBeCloseTo(300, 0);
  });

  it('sets near=true for points very close to camera in orbital mode', () => {
    // in orbital mode, near = (FOCAL + z*zoom*0.9) < 140
    // FOCAL=900, so z needs to push den below 140: 900 + z*0.9 < 140 → z < -844
    const p = makePoint(0, 0, -950);
    project(p, makeCam(), 800, 600);
    expect(p.near).toBe(true);
  });

  it('works in flight mode', () => {
    const cam = makeCam({
      flightMode: true,
      cam: { x: 0, y: 0, z: 0 },
    });
    const p = makePoint(0, 0, 200);
    project(p, cam, 800, 600);
    expect(p.sx).toBeCloseTo(400, 0);
    expect(p.sy).toBeCloseTo(300, 0);
    expect(p.near).toBe(false);
  });
});

describe('lensPoint', () => {
  it('does nothing when lens strength is 0', () => {
    const p = { sx: 100, sy: 100, sd: 200, near: false } as any;
    const hole = { sx: 400, sy: 300, sd: 50, lens: 0, near: false } as any;
    lensPoint(p, hole);
    expect(p.sx).toBe(100);
    expect(p.sy).toBe(100);
  });

  it('bends a point that is behind the hole', () => {
    const p = { sx: 410, sy: 300, sd: 200, near: false } as any;
    const hole = { sx: 400, sy: 300, sd: 50, lens: 30, near: false } as any;
    const origSx = p.sx;
    lensPoint(p, hole);
    // point should have moved away from hole center
    expect(p.sx).not.toBe(origSx);
    expect(p.sx).toBeGreaterThan(hole.sx); // pushed further out
  });

  it('does not bend a point in front of the hole', () => {
    const p = { sx: 410, sy: 300, sd: 10, near: false } as any;
    const hole = { sx: 400, sy: 300, sd: 50, lens: 30, near: false } as any;
    lensPoint(p, hole);
    expect(p.sx).toBe(410);
  });
});
