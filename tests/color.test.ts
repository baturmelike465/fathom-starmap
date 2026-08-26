import { describe, it, expect } from 'vitest';
import { rotHue } from '../src/utils/color';

describe('rotHue', () => {
  it('returns css and rgb properties', () => {
    const result = rotHue('#ff0000', 120);
    expect(result).toHaveProperty('css');
    expect(result).toHaveProperty('rgb');
  });

  it('rotating red by 120° gives green-ish', () => {
    const result = rotHue('#ff0000', 120);
    // pure red rotated 120° should be near green
    const rgb = result.rgb.split(',').map(Number);
    expect(rgb[1]).toBeGreaterThan(rgb[0]); // green > red
  });

  it('rotating by 0° returns equivalent color', () => {
    const result = rotHue('#ff0000', 0);
    // css format is rgb(r,g,b)
    expect(result.rgb).toBe('255,0,0');
  });

  it('rotating by 360° returns equivalent color', () => {
    const result = rotHue('#3388cc', 360);
    expect(result.rgb).toBe('51,136,204');
  });
});
