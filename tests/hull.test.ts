import { describe, it, expect } from 'vitest';
import { hull } from '../src/logic/hull';

describe('hull', () => {
  it('returns null for fewer than 3 points', () => {
    expect(hull([[0, 0], [1, 1]])).toBeNull();
    expect(hull([[5, 5]])).toBeNull();
    expect(hull([])).toBeNull();
  });

  it('returns a triangle for 3 non-collinear points', () => {
    const result = hull([[0, 0], [4, 0], [2, 3]]);
    expect(result).not.toBeNull();
    expect(result!.length).toBe(3);
  });

  it('computes the convex hull of a square with interior point', () => {
    const pts = [[0, 0], [4, 0], [4, 4], [0, 4], [2, 2]];
    const result = hull(pts);
    expect(result).not.toBeNull();
    // the interior point (2,2) should NOT be on the hull
    expect(result!.length).toBe(4);
  });

  it('does not modify the original array', () => {
    const pts = [[3, 1], [1, 3], [2, 2], [0, 0], [4, 4]];
    const copy = pts.map(p => [...p]);
    hull(pts);
    expect(pts).toEqual(copy);
  });
});
