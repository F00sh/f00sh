import type { HeightData } from './terrain';

export type Segment = [[number, number], [number, number]];

const interpolate = (a: number, b: number, level: number) => {
  const difference = b - a;
  return Math.abs(difference) < 0.0001 ? 0.5 : (level - a) / difference;
};

export const marchingSquares = (heights: HeightData, level: number): Segment[] => {
  const segments: Segment[] = [];
  const rows = heights.length;
  const columns = heights[0]?.length ?? 0;

  for (let y = 0; y < rows - 1; y += 1) {
    for (let x = 0; x < columns - 1; x += 1) {
      const tl = heights[y][x];
      const tr = heights[y][x + 1];
      const br = heights[y + 1][x + 1];
      const bl = heights[y + 1][x];
      const points: [number, number][] = [];

      if ((tl >= level) !== (tr >= level)) points.push([x + interpolate(tl, tr, level), y]);
      if ((tr >= level) !== (br >= level)) points.push([x + 1, y + interpolate(tr, br, level)]);
      if ((br >= level) !== (bl >= level)) points.push([x + interpolate(bl, br, level), y + 1]);
      if ((bl >= level) !== (tl >= level)) points.push([x, y + interpolate(tl, bl, level)]);

      if (points.length === 2) segments.push([points[0], points[1]]);
      if (points.length === 4) {
        const center = (tl + tr + br + bl) / 4;
        if (center >= level) {
          segments.push([points[0], points[3]], [points[1], points[2]]);
        } else {
          segments.push([points[0], points[1]], [points[2], points[3]]);
        }
      }
    }
  }

  return segments;
};
