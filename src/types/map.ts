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
}
export interface Region {
  id: string;
  name: string;
  path: string;
}

export interface SelectedRegion {
  level: "national" | "state" | "district";
  name: string;
  state?: string;
  district?: string;
}

export interface MapProps {
  data: RegionData[];
  onRegionClick: (region: SelectedRegion) => void;
  currentLevel: "national" | "state" | "district";
  selectedState?: string;
  selectedDistrict?: string;
  colorMetric: "achievement" | "visits" | "planning";
  colorScale?: [number, number];
}

export interface SchoolPin {
  id: string;
  school_name: string;
  latitude: number;
  longitude: number;
  students_enrolled: number;
  infrastructure_index: number;
  visit_count: number;
  classroom_obs: number;
}

export interface TooltipData {
  name: string;
  x: number;
  y: number;
  label?: string;
  value?: number | string;
  achievement?: number;
  visits?: number;
  area_sqkm?: number;
  isSchool?: boolean;
  schoolDetails?: SchoolPin;
}
export interface School {
  id: string;
  school_name: string;
  latitude: number;
  longitude: number;
  students_enrolled: number;
  infrastructure_index: number;
  visit_count: number;
  last_visit_date?: string;
}
