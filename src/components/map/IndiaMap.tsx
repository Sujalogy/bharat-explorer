import { useState, useMemo, useRef, useEffect } from 'react';
import { geoMercator, geoPath, GeoProjection } from 'd3-geo';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import { MapProps, TooltipData, Region } from '@/types/map';
import MapRegion from './MapRegion';
import MapTooltip from './MapTooltip';
import { useDashboard } from '@/context/DashboardContext';
import { Button } from '@/components/ui/button';

// Update these paths based on your actual public folder structure
const STATE_GEOJSON = "/states.geojson";
const AC_GEOJSON = "/ac.geojson";

interface GeoDataState {
  states: GeoJSON.FeatureCollection | null;
  acs: GeoJSON.FeatureCollection | null;
}

const IndiaMap = ({
  data,
  onRegionClick,
  currentLevel,
  selectedState,
  selectedDistrict,
  selectedBlock,
  colorMetric,
  colorScale = [0, 100]
}: any) => {
  const { dispatch } = useDashboard();
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [geoData, setGeoData] = useState<{ states: any; acs: any }>({ states: null, acs: null });

  // 1. Fetch GeoJSON files
  useEffect(() => {
    fetch(STATE_GEOJSON).then(res => res.json()).then(json => setGeoData(p => ({ ...p, states: json })));
    fetch(AC_GEOJSON).then(res => res.json()).then(json => setGeoData(p => ({ ...p, acs: json })));
  }, []);

  // 2. Filter features based on current deep-dive level
  const levelFeatures = useMemo(() => {
    if (!geoData.states || !geoData.acs) return [];
    if (currentLevel === 'national') return geoData.states.features;

    if (currentLevel === 'state' && selectedState) {
      return geoData.acs.features.filter((f: any) =>
        f.properties.ST_NAME?.toUpperCase() === selectedState?.toUpperCase()
      );
    }
    if (currentLevel === 'district' && selectedDistrict) {
      return geoData.acs.features.filter((f: any) =>
        f.properties.DIST_NAME?.toUpperCase() === selectedDistrict?.toUpperCase()
      );
    }
    if (currentLevel === 'block' && selectedBlock) {
      return geoData.acs.features.filter((f: any) =>
        f.properties.AC_NAME?.toUpperCase() === selectedBlock?.toUpperCase()
      );
    }
    return [];
  }, [currentLevel, selectedState, selectedDistrict, selectedBlock, geoData]);

  const width = 800;
  const height = 700;

  const projection = useMemo(() =>
    levelFeatures.length > 0 ? geoMercator().fitSize([width, height], { type: "FeatureCollection", features: levelFeatures }) : null
    , [levelFeatures]);

  const pathGenerator = useMemo(() => projection ? geoPath().projection(projection) : null, [projection]);

  const regions = useMemo(() => {
    if (!pathGenerator) return [];
    return levelFeatures.map((feature: any) => {
      const props = feature.properties;
      let name = currentLevel === 'national' ? (props.ST_NM || props.ST_NAME) :
        currentLevel === 'state' ? props.DIST_NAME : props.AC_NAME;

      // Extract area if your GeoJSON has a property like 'AREA_KM'
      const area = props.AREA_SQKM || props.Shape_Area || 0;

      return {
        id: feature.id || `${props.AC_NO}-${name}`,
        name,
        path: pathGenerator(feature) || '',
        area_sqkm: area // Pass area from geometry to the region object
      } as any;
    });
  }, [levelFeatures, pathGenerator, currentLevel]);

  // 3. Navigation Handlers
  const handleGoBack = () => {
    if (currentLevel === 'block') {
      dispatch({ type: 'SET_MAP_STATE', payload: { currentLevel: 'district', selectedBlock: null } });
    } else if (currentLevel === 'district') {
      dispatch({ type: 'SET_MAP_STATE', payload: { currentLevel: 'state', selectedDistrict: null } });
    } else if (currentLevel === 'state') {
      dispatch({ type: 'SET_MAP_STATE', payload: { currentLevel: 'national', selectedState: null } });
    }
  };

  return (
    <div ref={containerRef} className="relative h-full w-full flex items-center justify-center overflow-hidden bg-white">

      {/* Back and Reset Buttons */}
      {currentLevel !== 'national' && (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoBack}
            className="flex items-center gap-1.5 h-8 bg-white/90 shadow-sm border-border"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-xs font-medium">Back</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => dispatch({ type: 'RESET_FILTERS' })}
            className="h-8 w-8 bg-white/90 shadow-sm border-border"
            title="Reset to India"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full max-h-full transition-all duration-500" preserveAspectRatio="xMidYMid meet">
        <g>
          {regions.map((region: any) => (
            <MapRegion
              key={region.id} region={region}
              data={data.find((d: any) => {
                const rName = region.name?.toUpperCase();
                if (currentLevel === 'national') return d.state?.toUpperCase() === rName;
                if (currentLevel === 'state') return d.district?.toUpperCase() === rName;
                return d.block?.toUpperCase() === rName;
              })}
              colorMetric={colorMetric} colorScale={colorScale} isSelected={false}
              onClick={() => onRegionClick({ level: currentLevel, name: region.name })}
              onHover={(d: any) => {
                if (!d || !containerRef.current) return setTooltip(null);
                const rect = containerRef.current.getBoundingClientRect();
                setTooltip({ ...d, x: d.x - rect.left, y: d.y - rect.top });
              }}
            />
          ))}
        </g>
      </svg>
      <MapTooltip data={tooltip} />
    </div>
  );
};

export default IndiaMap;