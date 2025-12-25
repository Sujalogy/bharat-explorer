// src/context/DashboardContext.tsx
import React, { createContext, useContext, useReducer, useMemo, useEffect, ReactNode } from 'react';

/**
 * HELPER FUNCTIONS
 */
const getUniqueValues = (data: any[] | undefined, field: string) => {
  if (!data || !Array.isArray(data)) return []; 
  return [...new Set(data.map(d => d[field]))].filter(Boolean).sort();
};

export const ACADEMIC_YEARS = ['2023-2024', '2022-2023', '2021-2022'];

const findActualName = (data: any[], field: string, clickedName: string | null) => {
  if (!clickedName || !data) return null;
  const match = data.find(d => String(d[field]).toUpperCase() === clickedName.toUpperCase());
  return match ? match[field] : clickedName;
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
  subject: 'Literacy' | 'Numeracy';
  grade: string;
  gender: 'Male' | 'Female' | null;
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

export interface Thresholds {
  chronicPerformance: number;
  chronicPlanning: number;
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
  thresholds: Thresholds; // Added back
  mapState: MapState;
  activeTab: string;
  loading: boolean;
  sidebarCollapsed: boolean;
}

/**
 * REDUCER
 */
type DashboardAction =
  | { type: 'SET_VIEW_DATA'; payload: VisitRecord[] }
  | { type: 'SET_FILTERS'; payload: Partial<DashboardFilters> }
  | { type: 'SET_MAP_STATE'; payload: Partial<MapState> }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_THRESHOLDS'; payload: Partial<Thresholds> } // Added back
  | { type: 'LOADING_START' }
  | { type: 'TOGGLE_SIDEBAR' };

const initialState: DashboardState = {
  rawData: [],
  filteredData: [],
  filters: { 
    academicYear: '2025-2026', 
    subject: 'All', 
    grade: 'All', 
    state: 'All States', 
    district: 'All Districts', 
    block: 'All Blocks', 
    bacId: 'All BACs' 
  },
  thresholds: { chronicPerformance: 3, chronicPlanning: 3 }, // Added back
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
      return { 
        ...state, 
        rawData: action.payload, 
        filteredData: action.payload, 
        loading: false 
      };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_THRESHOLDS': // Added back
      return { ...state, thresholds: { ...state.thresholds, ...action.payload } };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'SET_FILTERS': {
      const newFilters = { ...state.filters, ...action.payload };
      const newMapState = { ...state.mapState };
      if (action.payload.state) {
        newFilters.district = 'All Districts';
        newFilters.block = 'All Blocks';
        newMapState.currentLevel = action.payload.state === 'All States' ? 'national' : 'state';
        newMapState.selectedState = action.payload.state === 'All States' ? null : action.payload.state;
      }
      return { ...state, filters: newFilters, mapState: newMapState };
    }
    case 'SET_MAP_STATE': {
        const nextMap = { ...state.mapState, ...action.payload };
        const nextFilters = { ...state.filters };
        if (action.payload.selectedState !== undefined) {
          const realName = findActualName(state.rawData, 'state', action.payload.selectedState);
          nextFilters.state = realName || 'All States';
          nextMap.selectedState = realName;
          nextFilters.district = 'All Districts';
        }
        return { ...state, mapState: nextMap, filters: nextFilters };
    }
    default:
      return state;
  }
}

/**
 * PROVIDER
 */
const DashboardContext = createContext<any>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  useEffect(() => {
    const controller = new AbortController();
    
    const updateDashboard = async () => {
      dispatch({ type: 'LOADING_START' });
      try {
        const query = new URLSearchParams({
          year: state.filters.academicYear,
          state: state.mapState.selectedState || 'All',
          district: state.mapState.selectedDistrict || 'All',
          block: state.mapState.selectedBlock || 'All',
          tab: state.activeTab
        });

        const response = await fetch(`http://localhost:3000/api/v1/dashboard/analytics?${query}`, {
          signal: controller.signal
        });
        
        if (!response.ok) throw new Error('Fetch failed');
        const data = await response.json();
        dispatch({ type: 'SET_VIEW_DATA', payload: Array.isArray(data) ? data : [] });
        
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Dashboard Fetch Error:', err);
          dispatch({ type: 'SET_VIEW_DATA', payload: [] });
        }
      }
    };

    updateDashboard();
    return () => controller.abort();
  }, [state.filters.academicYear, state.mapState.selectedState, state.mapState.selectedDistrict, state.mapState.selectedBlock, state.activeTab]);

  const availableFilters = useMemo(() => {
    const sData = state.filters.state === 'All States' 
      ? state.rawData 
      : state.rawData.filter(d => d.state === state.filters.state);

    return {
      states: getUniqueValues(state.rawData, 'state'),
      districts: getUniqueValues(sData, 'district'),
      blocks: getUniqueValues(sData, 'block'),
    };
  }, [state.rawData, state.filters.state]);

  return (
    <DashboardContext.Provider value={{ state, dispatch, availableFilters }}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext);