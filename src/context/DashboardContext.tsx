import React, { createContext, useContext, useReducer, useMemo, useEffect, ReactNode } from 'react';

/**
 * HELPER FUNCTIONS
 */
const getUniqueValues = (data: any[] | undefined, field: string) => {
  if (!data || !Array.isArray(data)) return [];
  return [...new Set(data.map(d => d[field]))].filter(Boolean).sort();
};

// CRITICAL: This ensures "PINDRA" from map matches "pindra" in DB
const findActualName = (data: any[], field: string, clickedName: string | null) => {
  if (!clickedName || !data || data.length === 0) return clickedName;
  const match = data.find(d => String(d[field]).toLowerCase() === clickedName.toLowerCase());
  return match ? match[field] : clickedName.toLowerCase();
};

/**
 * TYPES
 */
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
  subject: string;
  grade: string;
  gender: string | null;
  students_enrolled: number;
  students_present: number;
  teacher_guide_available: boolean;
  teacher_guide_followed: GuideFollowedStatus;
  tracker_filled: boolean;
  is_multigrade: boolean;
  practices: any;
  school_id: string;
  arp_id: string;
}

export interface DashboardFilters {
  academicYear: string;
  state: string;
  subject: string;
  grade: string;
  district: string;
  block: string;
  bacId: string;
}

export interface MapState {
  currentLevel: 'national' | 'state' | 'district' | 'block';
  selectedState: string | null;
  selectedDistrict: string | null;
  selectedBlock: string | null;
}

export interface DashboardState {
  rawData: VisitRecord[];
  filteredData: VisitRecord[];
  filters: DashboardFilters;
  thresholds: { chronicPerformance: number; chronicPlanning: number };
  mapState: MapState;
  activeTab: string;
  loading: boolean;
  sidebarCollapsed: boolean;
}

type DashboardAction =
  | { type: 'SET_VIEW_DATA'; payload: VisitRecord[] }
  | { type: 'SET_FILTERS'; payload: Partial<DashboardFilters> }
  | { type: 'SET_MAP_STATE'; payload: Partial<MapState> }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_THRESHOLDS'; payload: any }
  | { type: 'LOADING_START' }
  | { type: 'RESET_FILTERS' }
  | { type: 'TOGGLE_SIDEBAR' };

const initialState: DashboardState = {
  rawData: [],
  filteredData: [],
  filters: {
    academicYear: 'All',
    subject: 'All',
    grade: 'All',
    state: 'All',
    district: 'All',
    block: 'All',
    bacId: 'All BACs'
  },
  thresholds: { chronicPerformance: 3, chronicPlanning: 3 },
  mapState: { currentLevel: 'national', selectedState: null, selectedDistrict: null, selectedBlock: null },
  activeTab: 'home',
  loading: false,
  sidebarCollapsed: false
};

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'LOADING_START':
      return { ...state, loading: true };
    case 'SET_VIEW_DATA':
      return { ...state, rawData: action.payload, filteredData: action.payload, loading: false };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'RESET_FILTERS':
      return {
        ...initialState,
        activeTab: state.activeTab, // CRITICAL: Keep the user on the current tab
        sidebarCollapsed: state.sidebarCollapsed, // Optional: keep sidebar state
        thresholds: state.thresholds // Optional: keep user thresholds
      };

    case 'SET_FILTERS': {
      const newFilters = { ...state.filters, ...action.payload };
      const newMap = { ...state.mapState };

      // Hierarchical Sync: Reset children when parent changes
      if (action.payload.state) {
        newFilters.district = 'All';
        newFilters.block = 'All';
        newMap.currentLevel = action.payload.state === 'All' ? 'national' : 'state';
        newMap.selectedState = action.payload.state === 'All' ? null : action.payload.state;
        newMap.selectedDistrict = null;
        newMap.selectedBlock = null;
      }
      if (action.payload.district) {
        newFilters.block = 'All';
        newMap.currentLevel = action.payload.district === 'All' ? 'state' : 'district';
        newMap.selectedDistrict = action.payload.district === 'All' ? null : action.payload.district;
        newMap.selectedBlock = null;
      }
      if (action.payload.block) {
        newMap.currentLevel = action.payload.block === 'All' ? 'district' : 'block';
        newMap.selectedBlock = action.payload.block === 'All' ? null : action.payload.block;
      }

      return { ...state, filters: newFilters, mapState: newMap };
    }

    case 'SET_MAP_STATE': {
      const nextMap = { ...state.mapState, ...action.payload };
      const nextFilters = { ...state.filters };

      // Normalize naming when clicking on map regions
      if (action.payload.selectedState !== undefined) {
        const realName = findActualName(state.rawData, 'state', action.payload.selectedState);
        nextFilters.state = realName || 'All';
        nextFilters.district = 'All';
        nextFilters.block = 'All';
        nextMap.selectedState = realName;
      }
      if (action.payload.selectedDistrict !== undefined) {
        const realName = findActualName(state.rawData, 'district', action.payload.selectedDistrict);
        nextFilters.district = realName || 'All';
        nextFilters.block = 'All';
        nextMap.selectedDistrict = realName;
      }
      if (action.payload.selectedBlock !== undefined) {
        const realName = findActualName(state.rawData, 'block', action.payload.selectedBlock);
        nextFilters.block = realName || 'All';
        nextMap.selectedBlock = realName;
      }

      return { ...state, mapState: nextMap, filters: nextFilters };
    }
    default:
      return state;
  }
}

const DashboardContext = createContext<any>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // Centralized Fetching logic
  useEffect(() => {
    const controller = new AbortController();
    const updateDashboard = async () => {
      dispatch({ type: 'LOADING_START' });
      try {
        const query = new URLSearchParams({
          year: state.filters.academicYear,
          state: state.filters.state,
          district: state.filters.district,
          block: state.filters.block,
          subject: state.filters.subject,
          grade: state.filters.grade
        });

        const response = await fetch(`http://localhost:3000/api/v1/dashboard/analytics?${query}`, {
          signal: controller.signal
        });
        const data = await response.json();
        dispatch({ type: 'SET_VIEW_DATA', payload: Array.isArray(data) ? data : [] });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Fetch Error:", err);
          dispatch({ type: 'SET_VIEW_DATA', payload: [] });
        }
      }
    };
    updateDashboard();
    return () => controller.abort();
  }, [
    state.filters.academicYear,
    state.filters.state,
    state.filters.district,
    state.filters.block,
    state.filters.subject,
    state.filters.grade
  ]);

  // Hierarchical Filter List Calculation
  const availableFilters = useMemo(() => {
    const stateFiltered = state.filters.state === 'All'
      ? state.rawData
      : state.rawData.filter(d => d.state === state.filters.state);

    const districtFiltered = state.filters.district === 'All'
      ? stateFiltered
      : stateFiltered.filter(d => d.district === state.filters.district);

    return {
      academicYears: getUniqueValues(state.rawData, 'academic_year').reverse(),
      states: getUniqueValues(state.rawData, 'state'),
      districts: getUniqueValues(stateFiltered, 'district'),
      blocks: getUniqueValues(districtFiltered, 'block'),
    };
  }, [state.rawData, state.filters.state, state.filters.district]);

  return (
    <DashboardContext.Provider value={{ state, dispatch, availableFilters }}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext);