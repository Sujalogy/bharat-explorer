import { useState, useMemo, useRef, useEffect } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import { TooltipData } from '@/types/map';
import MapRegion from './MapRegion';
import MapTooltip from './MapTooltip';
import { useDashboard } from '@/context/DashboardContext';
import { Button } from '@/components/ui/button';

const STATE_GEOJSON = "/states.geojson";
const AC_GEOJSON = "/ac.geojson";

const IndiaMap = ({
  data,
  schoolPins = [],
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

  const width = 800;
  const height = 700;

  // 1. Fetch GeoJSON files
  useEffect(() => {
    const loadGeoData = async () => {
      try {
        const [statesRes, acsRes] = await Promise.all([
          fetch(STATE_GEOJSON),
          fetch(AC_GEOJSON)
        ]);
        const states = await statesRes.json();
        const acs = await acsRes.json();
        setGeoData({ states, acs });
      } catch (err) {
        console.error("GeoJSON Load Error:", err);
      }
    };
    loadGeoData();
  }, []);

  // 2. Filter features based on current level (Standardized to Lowercase)
  const levelFeatures = useMemo(() => {
    if (!geoData.states || !geoData.acs) return [];
    if (currentLevel === 'national' || currentLevel === 'country') return geoData.states.features;

    const sState = selectedState?.toLowerCase();
    const sDist = selectedDistrict?.toLowerCase();
    const sBlock = selectedBlock?.toLowerCase();

    if (currentLevel === 'state' && sState) {
      return geoData.acs.features.filter((f: any) =>
        f.properties.ST_NAME?.toLowerCase() === sState
      );
    }
    if (currentLevel === 'district' && sDist) {
      return geoData.acs.features.filter((f: any) =>
        f.properties.DIST_NAME?.toLowerCase() === sDist
      );
    }
    if (currentLevel === 'block' && sBlock) {
      return geoData.acs.features.filter((f: any) =>
        f.properties.AC_NAME?.toLowerCase() === sBlock
      );
    }
    return geoData.states.features;
  }, [currentLevel, selectedState, selectedDistrict, selectedBlock, geoData]);

  // 3. Projection & Path Generator
  const projection = useMemo(() => {
    if (levelFeatures.length === 0) return null;
    return geoMercator().fitSize([width, height], { 
      type: "FeatureCollection", 
      features: levelFeatures 
    });
  }, [levelFeatures]);

  const pathGenerator = useMemo(() => projection ? geoPath().projection(projection) : null, [projection]);

  // 4. Region Mapping
  const regions = useMemo(() => {
    if (!pathGenerator) return [];
    return levelFeatures.map((feature: any) => {
      const props = feature.properties;
      const name = (currentLevel === 'national' || currentLevel === 'country') 
        ? (props.ST_NM || props.ST_NAME) 
        : currentLevel === 'state' ? props.DIST_NAME : props.AC_NAME;

      return {
        id: feature.id || `${props.AC_NO || props.OBJECTID || Math.random()}-${name}`,
        name,
        path: pathGenerator(feature) || '',
      };
    });
  }, [levelFeatures, pathGenerator, currentLevel]);

  // 5. Navigation Handlers
  const handleGoBack = (e: React.MouseEvent) => {
    e.preventDefault();
    const payloads: any = {
      block: { currentLevel: 'district', selectedBlock: null },
      district: { currentLevel: 'state', selectedDistrict: null },
      state: { currentLevel: 'national', selectedState: null }
    };
    if (payloads[currentLevel]) {
      dispatch({ type: 'SET_MAP_STATE', payload: payloads[currentLevel] });
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: 'RESET_FILTERS' });
  };

  return (
    <div ref={containerRef} className="relative h-full w-full flex items-center justify-center overflow-hidden bg-white rounded-xl">
      
      {/* Back and Reset Buttons */}
      {currentLevel !== 'national' && (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            onClick={handleGoBack} 
            className="h-8 bg-white/90 shadow-sm border-border flex items-center gap-1.5 hover:bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="text-xs font-medium">Back</span>
          </Button>
          
          <Button 
            type="button"
            variant="outline" 
            size="icon" 
            onClick={handleReset} 
            className="h-8 w-8 bg-white/90 shadow-sm border-border hover:bg-white"
            title="Reset to National Level"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full max-h-full transition-all duration-700 ease-in-out" 
        preserveAspectRatio="xMidYMid meet"
      >
        <g>
          {/* Layer 1: Boundary Shapes */}
          {regions.map((region: any) => (
            <MapRegion
              key={region.id} 
              region={region}
              data={data.find((d: any) => {
                const rName = region.name?.toLowerCase();
                if (currentLevel === 'national' || currentLevel === 'country') return d.state?.toLowerCase() === rName;
                if (currentLevel === 'state') return d.district?.toLowerCase() === rName;
                return d.block?.toLowerCase() === rName;
              })}
              colorMetric={colorMetric} 
              colorScale={colorScale} 
              isSelected={false}
              onClick={() => onRegionClick({ level: currentLevel, name: region.name })}
              onHover={(d: any) => {
                if (!d || !containerRef.current) return setTooltip(null);
                const rect = containerRef.current.getBoundingClientRect();
                setTooltip({ ...d, x: d.x - rect.left, y: d.y - rect.top });
              }}
            />
          ))}

          {/* Layer 2: Visited School Dots (Green) */}
          {projection && schoolPins.map((school: any) => {
            const coords = projection([school.lng, school.lat]);
            if (!coords) return null;

            return (
              <circle
                key={school.id}
                cx={coords[0]}
                cy={coords[1]}
                r={4.5}
                className="fill-green-500 stroke-white stroke-[1.5px] cursor-pointer drop-shadow-md transition-all duration-200 hover:r-6"
                onMouseEnter={(e) => {
                  const rect = containerRef.current?.getBoundingClientRect();
                  if (!rect) return;
                  setTooltip({
                    name: school.name,
                    value: "Visited",
                    label: `UDISE: ${school.id}`,
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                  } as any);
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}
        </g>
      </svg>
      <MapTooltip data={tooltip} />
    </div>
  );
};

export default IndiaMap;