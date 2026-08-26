/* Deterministic hash — maps two integers to a stable float in [0, 1).
   Used for backdrop stars, nebula puff placement, and anywhere the engine
   needs reproducible randomness from an index. */

export function hash(a: number, b: number): number {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
}
