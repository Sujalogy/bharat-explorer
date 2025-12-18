export interface VisitRecord {
  id: string;
  academic_year: string;
  month: string;
  month_index: number;
  state: string;
  district: string;
  block: string;
  bac_id: string;
  bac_name: string;
  recommended_visits: number;
  target_visits: number;
  actual_visits: number;
  classroom_obs: number;
  school_id: string;
  arp_id: string;
  visit_type: 'Individual' | 'Joint';
}

export interface DashboardFilters {
  academicYear: string;
  state: string;
  district: string;
  block: string;
  bacId: string;
}

export interface Thresholds {
  chronicPerformance: number;
  chronicPlanning: number;
}

export interface MapState {
  currentLevel: 'national' | 'state' | 'district';
  selectedState: string | null;
  selectedDistrict: string | null;
}

export interface DashboardState {
  filters: DashboardFilters;
  thresholds: Thresholds;
  mapState: MapState;
  rawData: VisitRecord[];
  filteredData: VisitRecord[];
  activeTab: string;
  sidebarCollapsed: boolean;
  darkMode: boolean;
}

export interface KPIData {
  label: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  icon: string;
  color?: 'default' | 'success' | 'warning' | 'destructive';
}

export interface ChronicPerformer {
  bacId: string;
  bacName: string;
  state: string;
  district: string;
  block: string;
  monthsMissed: number;
  avgAchievement: number;
  totalActual: number;
  totalTarget: number;
  status: 'critical' | 'warning';
}

export interface ChronicPlanner {
  bacId: string;
  bacName: string;
  state: string;
  district: string;
  block: string;
  monthsUnderplanned: number;
  avgPlanning: number;
  totalTarget: number;
  totalRecommended: number;
  planningGap: number;
  status: 'critical' | 'warning';
}

export interface MonthlyMetric {
  month: string;
  monthIndex: number;
  value: number;
  count?: number;
}

export interface StateMetric {
  state: string;
  value: number;
  count?: number;
}

export interface DistributionSegment {
  name: string;
  value: number;
  color: string;
}
