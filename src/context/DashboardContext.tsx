// src/context/DashboardContext.tsx
import React, { createContext, useContext, useReducer, useMemo, useEffect, ReactNode } from 'react';
import { DashboardState, DashboardFilters, Thresholds, MapState, VisitRecord } from '@/types/dashboard';
import { getUniqueValues } from '@/data/mockDashboardData';

type DashboardAction =
  | { type: 'INITIALIZE_DATA'; payload: VisitRecord[] }
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
  mapState: {
    currentLevel: 'national',
    selectedState: null,
    selectedDistrict: null
  },
  rawData: [], // Initialize empty
  filteredData: [],
  activeTab: 'overview',
  sidebarCollapsed: false,
  darkMode: false,
  user: undefined
};

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'INITIALIZE_DATA':
      return { 
        ...state, 
        rawData: action.payload, 
        filteredData: action.payload 
      };
    case 'SET_FILTERS': {
      const newFilters = { ...state.filters, ...action.payload };
      
      // Cascade resets
      if (action.payload.state && action.payload.state !== state.filters.state) {
        newFilters.district = 'All Districts';
        newFilters.block = 'All Blocks';
        newFilters.bacId = 'All BACs';
      }

      let filteredData = state.rawData;
      if (newFilters.state !== 'All States') filteredData = filteredData.filter(d => d.state === newFilters.state);
      if (newFilters.district !== 'All Districts') filteredData = filteredData.filter(d => d.district === newFilters.district);
      if (newFilters.block !== 'All Blocks') filteredData = filteredData.filter(d => d.block === newFilters.block);

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

const DashboardContext = createContext<any>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  // FETCH DATA FROM JSON-SERVER
  useEffect(() => {
    const fetchApiData = async () => {
      try {
        const response = await fetch('http://localhost:3001/visits');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        dispatch({ type: 'INITIALIZE_DATA', payload: data });
      } catch (error) {
        console.error("Failed to load data from json-server:", error);
      }
    };
    fetchApiData();
  }, []);

  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  const availableFilters = useMemo(() => {
    return {
      states: getUniqueValues(state.rawData, 'state'),
      districts: getUniqueValues(state.rawData, 'district'),
      blocks: getUniqueValues(state.rawData, 'block'),
      bacs: getUniqueValues(state.rawData, 'bac_id')
    };
  }, [state.rawData]);

  return (
    <DashboardContext.Provider value={{ state, dispatch, availableFilters }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within a DashboardProvider');
  return context;
}