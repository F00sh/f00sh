export type HeightData = number[][];

export interface TerrainOptions {
  seed: number;
  resolution: number;
  maxHeight: number;
  noiseScale: number;
  octaves: number;
  persistence: number;
}

const fract = (value: number) => value - Math.floor(value);

const hash = (x: number, y: number, seed: number) =>
  fract(Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453);

const smooth = (value: number) => value * value * (3 - 2 * value);

const valueNoise = (x: number, y: number, seed: number) => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = smooth(x - ix);
  const fy = smooth(y - iy);
  const a = hash(ix, iy, seed);
  const b = hash(ix + 1, iy, seed);
  const c = hash(ix, iy + 1, seed);
  const d = hash(ix + 1, iy + 1, seed);
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
};

export const generateTerrain = (options: TerrainOptions): HeightData => {
  const { seed, resolution, maxHeight, noiseScale, octaves, persistence } = options;
  const heights: HeightData = [];

  for (let y = 0; y < resolution; y += 1) {
    const row: number[] = [];
    for (let x = 0; x < resolution; x += 1) {
      const nx = x / (resolution - 1) - 0.5;
      const ny = y / (resolution - 1) - 0.5;
      let amplitude = 1;
      let frequency = noiseScale;
      let value = 0;
      let weight = 0;

      for (let octave = 0; octave < octaves; octave += 1) {
        const noise = valueNoise(nx * frequency + 20, ny * frequency + 20, seed + octave * 17);
        value += noise * amplitude;
        weight += amplitude;
        amplitude *= persistence;
        frequency *= 2;
      }

      const island = Math.max(0, 1 - Math.pow(Math.hypot(nx, ny) * 1.45, 2.2));
      const ridges = 1 - Math.abs(valueNoise(nx * noiseScale * 1.4, ny * noiseScale * 1.4, seed + 99) * 2 - 1);
      const terrain = Math.max(0, (value / weight) * 0.72 + ridges * 0.28) * island;
      row.push(Math.pow(terrain, 1.18) * maxHeight);
    }
    heights.push(row);
  }

  return heights;
};

export const smoothTerrain = (source: HeightData, passes = 1): HeightData => {
  let heights = source.map((row) => [...row]);

  for (let pass = 0; pass < passes; pass += 1) {
    heights = heights.map((row, y) =>
      row.map((_, x) => {
        let sum = 0;
        let count = 0;
        for (let oy = -1; oy <= 1; oy += 1) {
          for (let ox = -1; ox <= 1; ox += 1) {
            const sample = heights[y + oy]?.[x + ox];
            if (sample !== undefined) {
              sum += sample;
              count += 1;
            }
          }
        }
        return sum / count;
      }),
    );
  }

  return heights;
};
