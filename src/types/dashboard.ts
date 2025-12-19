export type VisitType = 'Individual' | 'Joint';
export type GuideFollowedStatus = 'All Steps' | 'Partial Steps' | 'None';

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
  
  // CRO & KPI2 Data
  subject: 'Literacy' | 'Numeracy';
  grade: 'Grade 1' | 'Grade 2' | 'Grade 3';
  gender: 'Male' | 'Female';
  students_enrolled: number;
  students_present: number;
  teacher_guide_available: boolean;
  teacher_guide_followed: GuideFollowedStatus;
  tracker_filled: boolean;
  is_multigrade: boolean;
  
  // SSI Indicators
  ssi2_effective: boolean;
  ssi3_effective: boolean;
  actionable_feedback_given: boolean;
  structured_feedback_reviewed: boolean;
  
  // Literacy/Numeracy Practices (PP1-4, GP1-3)
  practices: {
    pp1: boolean; pp2: boolean; pp3: boolean; pp4: boolean;
    gp1: boolean; gp2: boolean; gp3: boolean;
  };

  // Profile data
  school_id: string;
  arp_id: string;
}

export interface User {
  email: string;
  isAuthenticated: boolean;
}

export interface DashboardState {
  user: User | null;
  filters: DashboardFilters;
  thresholds: Thresholds;
  mapState: MapState;
  rawData: VisitRecord[];
  filteredData: VisitRecord[];
  activeTab: string; // home, overview, visit-report, cro, tlm, slo, school-profile, teacher-profile
  sidebarCollapsed: boolean;
  darkMode: boolean;
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
