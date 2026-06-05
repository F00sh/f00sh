export type TopographyMode = 'layers' | 'flat' | 'sliced' | 'scanner';

export interface TopographySettings {
  seed: number;
  resolution: number;
  maxHeight: number;
  noiseScale: number;
  octaves: number;
  persistence: number;
  smoothing: number;
  contourStep: number;
  verticalExaggeration: number;
  terrainOpacity: number;
  showTerrain: boolean;
  showContours: boolean;
  showConnectors: boolean;
  autoRotate: boolean;
  scanLine: boolean;
  mode: TopographyMode;
}
