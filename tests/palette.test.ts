import { describe, it, expect } from 'vitest';
import { hslCol, hueOfHex, rgbDist, dynColFor } from '../src/logic/palette';

describe('hslCol', () => {
  it('returns an object with css and rgb strings', () => {
    const c = hslCol(0, 1, 0.5); // pure red
    expect(c.css).toMatch(/^#[0-9a-f]{6}$/);
    expect(c.rgb).toMatch(/^\d+,\d+,\d+$/);
  });

  it('produces red for hue=0, full saturation, 50% lightness', () => {
    const c = hslCol(0, 1, 0.5);
    expect(c.css).toBe('#ff0000');
  });
});

describe('hueOfHex', () => {
  it('extracts hue 0 from pure red', () => {
    expect(hueOfHex('#ff0000')).toBeCloseTo(0, 0);
  });

  it('extracts hue ~120 from pure green', () => {
    expect(hueOfHex('#00ff00')).toBeCloseTo(120, 0);
  });

  it('extracts hue ~240 from pure blue', () => {
    expect(hueOfHex('#0000ff')).toBeCloseTo(240, 0);
  });

  it('returns 0 for grey (no saturation)', () => {
    expect(hueOfHex('#808080')).toBe(0);
  });
});

describe('rgbDist', () => {
  it('returns 0 for identical colors', () => {
    expect(rgbDist('255,0,0', '255,0,0')).toBe(0);
  });

  it('returns correct Euclidean distance', () => {
    // distance between (255,0,0) and (0,255,0) = sqrt(255^2+255^2) ≈ 360.6
    const d = rgbDist('255,0,0', '0,255,0');
    expect(d).toBeCloseTo(Math.sqrt(255 * 255 + 255 * 255), 1);
  });
});

describe('dynColFor', () => {
  it('returns an object with css, rgb, and hue', () => {
    const basePal: Record<string, string> = {};
    const dynCols: any[] = [];
    const c = dynColFor(0, basePal, dynCols);
    expect(c).toHaveProperty('css');
    expect(c).toHaveProperty('rgb');
    expect(c).toHaveProperty('hue');
  });

  it('caches results — same index returns same color', () => {
    const basePal: Record<string, string> = {};
    const dynCols: any[] = [];
    const c1 = dynColFor(0, basePal, dynCols);
    const c2 = dynColFor(0, basePal, dynCols);
    expect(c1.css).toBe(c2.css);
  });

  it('successive colors have different hues', () => {
    const basePal: Record<string, string> = {};
    const dynCols: any[] = [];
    const c0 = dynColFor(0, basePal, dynCols);
    const c1 = dynColFor(1, basePal, dynCols);
    expect(c0.hue).not.toBe(c1.hue);
  });
});
