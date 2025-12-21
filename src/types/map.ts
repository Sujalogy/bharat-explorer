
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
  // New Fields
  area_sqkm?: number;
  bac_count?: number;
  schools_covered?: number;
  total_schools?: number;
  visit_count?: number;
  obs_count?: number;
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

export interface TooltipData extends RegionData {
  name: string;
  x: number;
  y: number;
}