import { useState, useMemo, useRef, useEffect } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import { MapProps, TooltipData, Region } from '@/types/map';
import MapRegion from './MapRegion';
import MapTooltip from './MapTooltip';
import { useDashboard } from '@/context/DashboardContext';
import { Button } from '@/components/ui/button';

// Paths to local GeoJSON files in public/
const STATE_GEOJSON = "/states.geojson"; 
const AC_GEOJSON = "/ac.geojson"; 

const IndiaMap = ({ 
  data, 
  onRegionClick, 
  currentLevel, 
  selectedState, 
  selectedDistrict, 
  colorMetric, 
  colorScale = [0, 100]
}: MapProps) => {
  const { dispatch } = useDashboard();
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [geoData, setGeoData] = useState<{ states: any; acs: any }>({ states: null, acs: null });

  useEffect(() => {
    fetch(STATE_GEOJSON)
      .then(res => res.json())
      .then(json => setGeoData(prev => ({ ...prev, states: json })))
      .catch(err => console.error("Error loading states:", err));

    fetch(AC_GEOJSON)
      .then(res => res.json())
      .then(json => setGeoData(prev => ({ ...prev, acs: json })))
      .catch(err => console.error("Error loading ACs:", err));
  }, []);

  // Filter features based on current level and selection
  const levelFeatures = useMemo(() => {
    if (!geoData.states || !geoData.acs) return [];

    if (currentLevel === 'national') return geoData.states.features;

    if (currentLevel === 'state' && selectedState) {
      return geoData.acs.features.filter(
        (f: any) => f.properties.ST_NAME?.toUpperCase() === selectedState.toUpperCase()
      );
    }

    if (currentLevel === 'district' && selectedDistrict) {
      return geoData.acs.features.filter(
        (f: any) => f.properties.DIST_NAME?.toUpperCase() === selectedDistrict.toUpperCase() &&
                    f.properties.ST_NAME?.toUpperCase() === selectedState?.toUpperCase()
      );
    }

    return [];
  }, [currentLevel, selectedState, selectedDistrict, geoData]);

  const width = 800;
  const height = 700;

  const projection = useMemo(() => {
    if (levelFeatures.length === 0) return null;
    return geoMercator().fitSize([width, height], { type: "FeatureCollection", features: levelFeatures });
  }, [levelFeatures]);

  const pathGenerator = useMemo(() => {
    if (!projection) return null;
    return geoPath().projection(projection);
  }, [projection]);

  const regions = useMemo(() => {
    if (!pathGenerator) return [];

    return levelFeatures.map((feature: any) => {
      const props = feature.properties;
      let name = "";
      let id = "";

      if (currentLevel === 'national') {
        name = props.ST_NM || props.ST_NAME || props.NAME_1;
        id = props.ST_CODE || name;
      } else if (currentLevel === 'state') {
        name = props.DIST_NAME;
        id = feature.id || `${props.DT_CODE}-${props.AC_NO}`;
      } else {
        name = props.AC_NAME;
        id = `${props.AC_NO}-${props.AC_NAME}`;
      }

      return { id, name, path: pathGenerator(feature) || '' } as Region;
    });
  }, [levelFeatures, pathGenerator, currentLevel]);

  // Handle drilling up (Back button)
  const handleBack = () => {
    if (currentLevel === 'district') {
      dispatch({ type: 'SET_MAP_STATE', payload: { currentLevel: 'state', selectedDistrict: null } });
      dispatch({ type: 'SET_FILTERS', payload: { district: 'All Districts' } });
    } else if (currentLevel === 'state') {
      dispatch({ type: 'SET_MAP_STATE', payload: { currentLevel: 'national', selectedState: null, selectedDistrict: null } });
      dispatch({ type: 'SET_FILTERS', payload: { state: 'All States', district: 'All Districts' } });
    }
  };

  if ((!geoData.states && currentLevel === 'national') || (!geoData.acs && currentLevel !== 'national')) {
    return <div className="flex items-center justify-center h-full">Loading Maps...</div>;
  }

  return (
    <div ref={containerRef} className="relative h-full w-full flex items-center justify-center p-8 overflow-hidden bg-white rounded-lg">
      
      {/* Back & Reset Buttons */}
      {currentLevel !== 'national' && (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button 
            variant="outline" size="sm" onClick={handleBack}
            className="flex items-center gap-1.5 h-8 bg-white/90 shadow-sm border-border hover:bg-secondary"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-xs font-medium">Back</span>
          </Button>
          <Button 
            variant="outline" size="icon" 
            onClick={() => dispatch({ type: 'RESET_FILTERS' })}
            className="h-8 w-8 bg-white/90 shadow-sm border-border"
            title="Reset to India"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full max-h-full animate-map-zoom-in"
        preserveAspectRatio="xMidYMid meet"
      >
        <g>
          {regions.map((region) => (
            <MapRegion
              key={region.id}
              region={region}
              data={data.find(d => {
                const rName = region.name?.toUpperCase();
                if (currentLevel === 'national') return d.state?.toUpperCase() === rName;
                if (currentLevel === 'state') return d.district?.toUpperCase() === rName;
                return d.block?.toUpperCase() === rName;
              })}
              colorMetric={colorMetric}
              colorScale={colorScale}
              isSelected={false}
              onClick={() => onRegionClick({ 
                level: currentLevel, 
                name: region.name, 
                state: currentLevel === 'national' ? region.name : (selectedState || ''), 
                district: currentLevel === 'state' ? region.name : (selectedDistrict || '')
              })}
              onHover={(d) => {
                if (!d || !containerRef.current) return setTooltip(null);
                const rect = containerRef.current.getBoundingClientRect();
                setTooltip({ ...d, x: d.x - rect.left, y: d.y - rect.top });
              }}
            />
          ))}
        </g>
      </svg>

      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm border rounded-lg px-3 py-1.5 shadow-sm pointer-events-none">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{currentLevel} VIEW</span>
        <h3 className="text-sm font-bold">
          {currentLevel === 'national' ? 'India' : currentLevel === 'state' ? selectedState : selectedDistrict}
        </h3>
      </div>
      <MapTooltip data={tooltip} />
    </div>
  );
};

export default IndiaMap;