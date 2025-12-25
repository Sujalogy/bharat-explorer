// src/components/map/MapViewer.tsx
import { useCallback, useState, useMemo } from 'react';
import IndiaMap from './IndiaMap';
import MapLegend from './MapLegend';
import MiniMap from './MiniMap';
import { SelectedRegion, RegionData } from '@/types/map';
import { useDashboard } from '@/context/DashboardContext';

type ColorMetric = 'achievement' | 'visits' | 'planning';

const MapViewer = () => {
  const { state, dispatch } = useDashboard();
  const { currentLevel, selectedState, selectedDistrict } = state.mapState;
  const [colorMetric, setColorMetric] = useState<ColorMetric>('achievement');

  // Aggregation logic to convert raw visit records into map data
  const mapData = useMemo(() => {
    const rawRecords = state.filteredData;
    const groups: Record<string, any> = {};

    rawRecords.forEach((record: any) => {
      let key = "";
      if (currentLevel === 'national') key = record.state;
      else if (currentLevel === 'state') key = record.district;
      else if (currentLevel === 'district') key = record.block;

      if (!key) return;

      if (!groups[key]) {
        groups[key] = {
          name: key,
          actual: 0,
          target: 0,
          rec: 0,
          obs: 0,
          schools: new Set(),
          bacs: new Set()
        };
      }
      groups[key].actual += record.actual_visits || 0;
      groups[key].target += record.target_visits || 0;
      groups[key].rec += record.recommended_visits || 0;
      groups[key].obs += record.classroom_obs || 0;
      groups[key].schools.add(record.school_id);
      groups[key].bacs.add(record.bac_name);
    });

    return Object.values(groups).map(g => ({
      state: currentLevel === 'national' ? g.name : selectedState,
      district: currentLevel === 'state' ? g.name : selectedDistrict,
      block: currentLevel === 'district' ? g.name : undefined,
      achievement: g.target > 0 ? Math.round((g.actual / g.target) * 100) : 0,
      visits: g.actual,
      planning: g.rec > 0 ? Math.round((g.target / g.rec) * 100) : 0,
      // New Metrics
      visit_count: g.actual,
      obs_count: g.obs,
      schools_covered: g.schools.size,
      bac_count: g.bacs.size,
      // Note: These usually come from GeoJSON or a Master DB
      // Mocking values for demonstration
      total_schools: Math.round(g.schools.size * 1.2) + 2,
      area_sqkm: Math.floor(Math.random() * 5000) + 1000
    })) as RegionData[];
  }, [state.filteredData, currentLevel, selectedState, selectedDistrict]);

  const handleRegionClick = useCallback((region: SelectedRegion) => {
    if (currentLevel === 'national') {
      dispatch({ type: 'SET_MAP_STATE', payload: { currentLevel: 'state', selectedState: region.name } });
      dispatch({ type: 'SET_FILTERS', payload: { state: region.name } });
    } else if (currentLevel === 'state') {
      dispatch({ type: 'SET_MAP_STATE', payload: { currentLevel: 'district', selectedDistrict: region.name } });
      dispatch({ type: 'SET_FILTERS', payload: { district: region.name } });
    }
  }, [currentLevel, dispatch]);

  return (
    <div className="flex flex-col w-full bg-background" style={{ height: 'calc(100vh - 120px)' }}>
      <main className="flex-1 relative overflow-hidden flex flex-col items-center">
        <div className="w-full max-w-4xl h-[600px] p-4 mx-auto">
          <div className="w-full h-full rounded-xl border border-border overflow-hidden shadow-lg bg-white">
            <IndiaMap
              data={mapData}
              onRegionClick={handleRegionClick}
              currentLevel={currentLevel}
              selectedState={selectedState}
              selectedDistrict={selectedDistrict}
              colorMetric={colorMetric}
              colorScale={[0, 100]}
            />
          </div>
        </div>

        {/* Legend and MiniMap omitted for brevity but should remain as they were */}
        <div className="absolute bottom-8 left-8 flex flex-col gap-3">
          <MapLegend colorMetric={colorMetric} minValue={0} maxValue={100} />
        </div>
        <div className="absolute bottom-8 right-8">
          <MiniMap selectedState={selectedState} currentLevel={currentLevel} />
        </div>
      </main>
    </div>
  );
};

export default MapViewer;