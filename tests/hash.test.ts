import { describe, it, expect } from 'vitest';
import { hash } from '../src/utils/hash';

describe('hash', () => {
  it('returns a number between 0 and 1', () => {
    for (let i = 0; i < 100; i++) {
      const v = hash(i, 7);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('is deterministic — same inputs give same output', () => {
    expect(hash(42, 13)).toBe(hash(42, 13));
    expect(hash(0, 0)).toBe(hash(0, 0));
  });

  it('different inputs give different outputs', () => {
    const vals = new Set<number>();
    for (let i = 0; i < 50; i++) vals.add(hash(i, 7));
    // with 50 different inputs, we should get at least 40 distinct values
    expect(vals.size).toBeGreaterThan(40);
  });
});
