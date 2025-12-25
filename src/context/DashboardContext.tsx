import React, { createContext, useContext, useReducer, useMemo, useEffect, ReactNode } from 'react';
import { DashboardState, DashboardFilters, MapState, VisitRecord } from '@/types/dashboard';

const getUniqueValues = (data: any[], field: string) =>
  [...new Set(data.map(d => d[field]))].filter(Boolean).sort();

export const ACADEMIC_YEARS = ['2023-2024', '2022-2023', '2021-2022'];

// Helper to find the "Correct Case" name from data (e.g., "SIRSA" -> "Sirsa")
const findActualName = (data: any[], field: string, clickedName: string | null) => {
  if (!clickedName) return null;
  const match = data.find(d => String(d[field]).toUpperCase() === clickedName.toUpperCase());
  return match ? match[field] : clickedName;
};

type DashboardAction =
  | { type: 'INITIALIZE_DATA'; payload: VisitRecord[] }
  | { type: 'SET_FILTERS'; payload: Partial<DashboardFilters> }
  | { type: 'SET_MAP_STATE'; payload: Partial<MapState> }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_CONTEXT'; payload: 'Visit' | 'SLO' | 'CRO' | 'TLM' }
  | { type: 'RESET_FILTERS' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_DARK_MODE' };

const initialState: DashboardState = {
  filters: { academicYear: '2023-2024', state: 'All States', district: 'All Districts', block: 'All Blocks', bacId: 'All BACs' },
  mapState: { currentLevel: 'national', selectedState: null, selectedDistrict: null, selectedBlock: null },
  rawData: [],
  filteredData: [],
  activeTab: 'home',
  thresholds: { chronicPerformance: 3, chronicPlanning: 3 },
  sidebarCollapsed: false,
  darkMode: false,
  user: undefined,
  activeContext: 'Visit',
};

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'INITIALIZE_DATA':
      return { ...state, rawData: action.payload, filteredData: action.payload };

    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };

    case 'SET_CONTEXT':
      return { ...state, activeContext: action.payload };

    case 'SET_FILTERS': {
      const newFilters = { ...state.filters, ...action.payload };
      const newMapState = { ...state.mapState };

      // Manual selection via dropdown: update map logic
      if (action.payload.state) {
        newFilters.district = 'All Districts';
        newFilters.block = 'All Blocks';
        newMapState.currentLevel = action.payload.state === 'All States' ? 'national' : 'state';
        newMapState.selectedState = action.payload.state === 'All States' ? null : action.payload.state;
        newMapState.selectedDistrict = null;
        newMapState.selectedBlock = null;
      }
      if (action.payload.district) {
        newFilters.block = 'All Blocks';
        newMapState.currentLevel = action.payload.district === 'All Districts' ? 'state' : 'district';
        newMapState.selectedDistrict = action.payload.district === 'All Districts' ? null : action.payload.district;
        newMapState.selectedBlock = null;
      }

      const filtered = state.rawData.filter(d =>
        (newFilters.state === 'All States' || d.state === newFilters.state) &&
        (newFilters.district === 'All Districts' || d.district === newFilters.district) &&
        (newFilters.block === 'All Blocks' || d.block === newFilters.block)
      );

      return { ...state, filters: newFilters, mapState: newMapState, filteredData: filtered };
    }

    case 'SET_MAP_STATE': {
      const nextMap = { ...state.mapState, ...action.payload };
      const nextFilters = { ...state.filters };

      // SYNC MAP CLICKS TO FILTERS WITH CASE NORMALIZATION
      if (action.payload.selectedState !== undefined) {
        const realName = findActualName(state.rawData, 'state', action.payload.selectedState);
        nextFilters.state = realName || 'All States';
        nextMap.selectedState = realName;
        nextFilters.district = 'All Districts';
        nextFilters.block = 'All Blocks';
      }
      if (action.payload.selectedDistrict !== undefined) {
        const realName = findActualName(state.rawData, 'district', action.payload.selectedDistrict);
        nextFilters.district = realName || 'All Districts';
        nextMap.selectedDistrict = realName;
        nextFilters.block = 'All Blocks';
      }
      if (action.payload.selectedBlock !== undefined) {
        const realName = findActualName(state.rawData, 'block', action.payload.selectedBlock);
        nextFilters.block = realName || 'All Blocks';
        nextMap.selectedBlock = realName;
      }

      const filtered = state.rawData.filter(d =>
        (nextFilters.state === 'All States' || d.state === nextFilters.state) &&
        (nextFilters.district === 'All Districts' || d.district === nextFilters.district) &&
        (nextFilters.block === 'All Blocks' || d.block === nextFilters.block)
      );

      return { ...state, mapState: nextMap, filters: nextFilters, filteredData: filtered };
    }

    case 'TOGGLE_SIDEBAR': return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'TOGGLE_DARK_MODE': return { ...state, darkMode: !state.darkMode };
    case 'RESET_FILTERS': return { ...state, filters: initialState.filters, mapState: initialState.mapState, filteredData: state.rawData };
    default: return state;
  }
}

const DashboardContext = createContext<any>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  useEffect(() => {
    fetch('http://localhost:3001/visits').then(res => res.json()).then(data => dispatch({ type: 'INITIALIZE_DATA', payload: data }));
  }, []);

  const availableFilters = useMemo(() => {
    const sData = state.filters.state === 'All States' ? state.rawData : state.rawData.filter(d => d.state === state.filters.state);
    const dData = state.filters.district === 'All Districts' ? sData : sData.filter(d => d.district === state.filters.district);
    return {
      states: getUniqueValues(state.rawData, 'state'),
      districts: getUniqueValues(sData, 'district'),
      blocks: getUniqueValues(dData, 'block'),
      bacs: getUniqueValues(dData, 'bac_id')
    };
  }, [state.rawData, state.filters.state, state.filters.district]);

  return <DashboardContext.Provider value={{ state, dispatch, availableFilters }}>{children}</DashboardContext.Provider>;
}

export const useDashboard = () => useContext(DashboardContext);