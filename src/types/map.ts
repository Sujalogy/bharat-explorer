
// ============================================
// FILE 4: src/types/map.ts
// ============================================

export interface RegionData {
  state: string;
  district?: string;
  block?: string;
  achievement: number;
  visits: number;
  planning?: number;
  metric_color?: string;
}

export interface Region {
  id: string;
  name: string;
  path: string;
  centroid?: [number, number];
}

export interface SelectedRegion {
  level: 'national' | 'state' | 'district';
  name: string;
  state?: string;
  district?: string;
}

export interface MapProps {
  data: RegionData[];
  onRegionClick: (region: SelectedRegion) => void;
  currentLevel: 'national' | 'state' | 'district';
  selectedState?: string;
  selectedDistrict?: string;
  colorMetric: 'achievement' | 'visits' | 'planning';
  colorScale?: [number, number];
}

export interface TooltipData {
  name: string;
  achievement?: number;
  visits?: number;
  planning?: number;
  x: number;
  y: number;
}