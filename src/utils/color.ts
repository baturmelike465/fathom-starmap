/* rotHue — rotate a hex colour through HSL space by `deg` degrees.
   Returns both a CSS string and a bare r,g,b triplet. */

export function rotHue(hex: string, deg: number): { css: string; rgb: string } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (mx + mn) / 2;

  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r
      ? (g - b) / d + (g < b ? 6 : 0)
      : mx === g
        ? (b - r) / d + 2
        : (r - g) / d + 4;
    h /= 6;
  }

  h = (h + deg / 360) % 1;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (x: number) => {
    x = (x % 1 + 1) % 1;
    return x < 1 / 6 ? p + (q - p) * 6 * x
      : x < 0.5 ? q
      : x < 2 / 3 ? p + (q - p) * (2 / 3 - x) * 6
      : p;
  };

  const R = Math.round(f(h + 1 / 3) * 255);
  const G = Math.round(f(h) * 255);
  const B = Math.round(f(h - 1 / 3) * 255);

  return { css: 'rgb(' + R + ',' + G + ',' + B + ')', rgb: R + ',' + G + ',' + B };
}
