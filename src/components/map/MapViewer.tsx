import { useCallback, useState } from 'react';
import IndiaMap from './IndiaMap';
import MapLegend from './MapLegend';
import MiniMap from './MiniMap';
import { SelectedRegion, RegionData } from '@/types/map';
import { sampleStateData, sampleDistrictData, sampleBlockData } from '@/data/sampleData';
import { useDashboard } from '@/context/DashboardContext';

type ColorMetric = 'achievement' | 'visits' | 'planning';

const MapViewer = () => {
  const { state, dispatch } = useDashboard();
  const { currentLevel, selectedState, selectedDistrict } = state.mapState;
  const [colorMetric, setColorMetric] = useState<ColorMetric>('achievement');
  const getCurrentData = (): RegionData[] => {
    switch (currentLevel) {
      case 'national': return sampleStateData;
      case 'state': return sampleDistrictData.filter(d => d.state === selectedState);
      case 'district': return sampleBlockData.filter(d => d.district === selectedDistrict);
      default: return [];
    }
  };

  const getColorScale = (): [number, number] => [0, 100];

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
      {/* Main content */}
     <main className="flex-1 relative overflow-hidden flex flex-col items-center">
        {/* Map container */}
        <div className="w-full max-w-4xl h-[600px] p-4 mx-auto">
          <div className="w-full h-full rounded-xl border border-border overflow-hidden shadow-lg bg-map-bg">
            <IndiaMap
              data={getCurrentData()}
              onRegionClick={handleRegionClick}
              currentLevel={currentLevel}
              selectedState={selectedState}
              selectedDistrict={selectedDistrict}
              colorMetric={colorMetric}
              colorScale={getColorScale()}
            />
          </div>
        </div>

        {/* Floating controls */}
        <div className="absolute bottom-8 left-8 flex flex-col gap-3">
          {/* Metric selector */}
          <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 shadow-md">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Color By</h4>
            <div className="flex gap-1">
              {(['achievement', 'visits', 'planning'] as ColorMetric[]).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setColorMetric(metric)}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${colorMetric === metric
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <MapLegend
            colorMetric={colorMetric}
            minValue={getColorScale()[0]}
            maxValue={getColorScale()[1]}
          />
        </div>

        {/* Mini map */}
        <div className="absolute bottom-8 right-8">
          <MiniMap
            selectedState={selectedState}
            currentLevel={currentLevel}
          />
        </div>

        {/* Stats summary */}
        <div className="absolute top-8 right-8 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4 shadow-md">
          <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
            Summary Statistics
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-foreground font-mono">
                {getCurrentData().length}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentLevel === 'national' ? 'States/UTs' :
                  currentLevel === 'state' ? 'Districts' : 'Blocks'}
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground font-mono">
                {Math.round(
                  getCurrentData().reduce((sum, d) => sum + d.achievement, 0) /
                  getCurrentData().length || 0
                )}%
              </p>
              <p className="text-xs text-muted-foreground">Avg. Achievement</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground font-mono">
                {getCurrentData().reduce((sum, d) => sum + d.visits, 0).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-muted-foreground">Total Visits</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-metric-high font-mono">
                {getCurrentData().filter(d => d.achievement >= 80).length}
              </p>
              <p className="text-xs text-muted-foreground">High Performers</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MapViewer;
