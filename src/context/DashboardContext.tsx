import React, { createContext, useContext, useReducer, useMemo, useEffect, ReactNode } from 'react';
import { DashboardState, DashboardFilters, Thresholds, MapState, VisitRecord } from '@/types/dashboard';
import { mockData, getUniqueValues } from '@/data/mockDashboardData';

type DashboardAction =
  | { type: 'SET_FILTERS'; payload: Partial<DashboardFilters> }
  | { type: 'SET_THRESHOLDS'; payload: Partial<Thresholds> }
  | { type: 'SET_MAP_STATE'; payload: Partial<MapState> }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'RESET_FILTERS' };

const initialState: DashboardState = {
  filters: {
    academicYear: '2023-2024',
    state: 'All States',
    district: 'All Districts',
    block: 'All Blocks',
    bacId: 'All BACs'
  },
  thresholds: {
    chronicPerformance: 3,
    chronicPlanning: 3
  },
  activeTab: 'home',
  mapState: {
    currentLevel: 'national',
    selectedState: null,
    selectedDistrict: null
  },
  rawData: mockData,
  filteredData: mockData,
  sidebarCollapsed: false,
  darkMode: false
};

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SET_FILTERS': {
      const newFilters = { ...state.filters, ...action.payload };
      
      // Cascade filter resets
      if (action.payload.state && action.payload.state !== state.filters.state) {
        newFilters.district = 'All Districts';
        newFilters.block = 'All Blocks';
        newFilters.bacId = 'All BACs';
      }
      if (action.payload.district && action.payload.district !== state.filters.district) {
        newFilters.block = 'All Blocks';
        newFilters.bacId = 'All BACs';
      }
      if (action.payload.block && action.payload.block !== state.filters.block) {
        newFilters.bacId = 'All BACs';
      }

      // Apply filters to data
      let filteredData = state.rawData;
      
      if (newFilters.academicYear !== 'All Years') {
        filteredData = filteredData.filter(d => d.academic_year === newFilters.academicYear);
      }
      if (newFilters.state !== 'All States') {
        filteredData = filteredData.filter(d => d.state === newFilters.state);
      }
      if (newFilters.district !== 'All Districts') {
        filteredData = filteredData.filter(d => d.district === newFilters.district);
      }
      if (newFilters.block !== 'All Blocks') {
        filteredData = filteredData.filter(d => d.block === newFilters.block);
      }
      if (newFilters.bacId !== 'All BACs') {
        filteredData = filteredData.filter(d => d.bac_id === newFilters.bacId);
      }

      return { ...state, filters: newFilters, filteredData };
    }
    case 'SET_THRESHOLDS':
      return { ...state, thresholds: { ...state.thresholds, ...action.payload } };
    case 'SET_MAP_STATE':
      return { ...state, mapState: { ...state.mapState, ...action.payload } };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: initialState.filters,
        filteredData: state.rawData,
        mapState: initialState.mapState
      };
    default:
      return state;
  }
}

interface DashboardContextValue {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
  availableFilters: {
    states: string[];
    districts: string[];
    blocks: string[];
    bacs: string[];
  };
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // Handle dark mode class on document
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  // Calculate available filter options based on current selections
  const availableFilters = useMemo(() => {
    let filteredForState = state.rawData;
    let filteredForDistrict = state.rawData;
    let filteredForBlock = state.rawData;
    let filteredForBac = state.rawData;

    if (state.filters.academicYear !== 'All Years') {
      filteredForState = filteredForState.filter(d => d.academic_year === state.filters.academicYear);
      filteredForDistrict = filteredForDistrict.filter(d => d.academic_year === state.filters.academicYear);
      filteredForBlock = filteredForBlock.filter(d => d.academic_year === state.filters.academicYear);
      filteredForBac = filteredForBac.filter(d => d.academic_year === state.filters.academicYear);
    }

    if (state.filters.state !== 'All States') {
      filteredForDistrict = filteredForDistrict.filter(d => d.state === state.filters.state);
      filteredForBlock = filteredForBlock.filter(d => d.state === state.filters.state);
      filteredForBac = filteredForBac.filter(d => d.state === state.filters.state);
    }

    if (state.filters.district !== 'All Districts') {
      filteredForBlock = filteredForBlock.filter(d => d.district === state.filters.district);
      filteredForBac = filteredForBac.filter(d => d.district === state.filters.district);
    }

    if (state.filters.block !== 'All Blocks') {
      filteredForBac = filteredForBac.filter(d => d.block === state.filters.block);
    }

    return {
      states: getUniqueValues(filteredForState, 'state'),
      districts: getUniqueValues(filteredForDistrict, 'district'),
      blocks: getUniqueValues(filteredForBlock, 'block'),
      bacs: getUniqueValues(filteredForBac, 'bac_id')
    };
  }, [state.rawData, state.filters]);

  return (
    <DashboardContext.Provider value={{ state, dispatch, availableFilters }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
