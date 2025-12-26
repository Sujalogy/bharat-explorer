import { useState, useMemo, useRef, useEffect } from 'react';
import { geoMercator, geoPath, geoIdentity } from 'd3-geo';
import { ChevronLeft, RotateCcw } from 'lucide-react';
import MapRegion from './MapRegion';
import MapTooltip from './MapTooltip';
import { useDashboard } from '@/context/DashboardContext';
import { Button } from '@/components/ui/button';
import { getGeoMetrics } from '@/utils/geoMetrics'; // Ensure this is imported

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
  const [tooltip, setTooltip] = useState<any | null>(null);
  const [geoData, setGeoData] = useState<{ states: any; acs: any }>({ states: null, acs: null });

  const width = 800;
  const height = 700;

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

  const normalizeFeature = (f: any) => {
    const props = f.properties || f.attributes || {};
    let geometry = f.geometry;
    if (geometry && geometry.rings) {
      geometry = { type: "Polygon", coordinates: geometry.rings };
    }
    return { type: "Feature", properties: props, geometry: geometry };
  };

  const levelFeatures = useMemo(() => {
    if (!geoData.states || !geoData.acs) return [];
    if (currentLevel === 'national' || currentLevel === 'country') {
      return geoData.states.features.map(normalizeFeature);
    }
    const sState = selectedState?.toLowerCase();
    const sDist = selectedDistrict?.toLowerCase();
    const sBlock = selectedBlock?.toLowerCase();

    const filtered = geoData.acs.features.filter((f: any) => {
      const p = f.properties || f.attributes || {};
      const stateName = (p.ST_NAME || p.STNAME || "").toLowerCase();
      const distName = (p.DIST_NAME || "").toLowerCase();
      const blockName = (p.AC_NAME || "").toLowerCase();

      if (currentLevel === 'state') return stateName === sState;
      if (currentLevel === 'district') return distName === sDist;
      if (currentLevel === 'block') return blockName === sBlock;
      return false;
    });
    return filtered.map(normalizeFeature);
  }, [currentLevel, selectedState, selectedDistrict, selectedBlock, geoData]);

  const projection = useMemo(() => {
    if (levelFeatures.length === 0) return null;
    const sampleCoord = levelFeatures[0]?.geometry?.coordinates?.[0]?.[0]?.[0];
    const isMeters = sampleCoord > 180 || sampleCoord < -180;
    const proj = isMeters ? geoIdentity().reflectY(true) : geoMercator();
    return proj.fitSize([width, height], { type: "FeatureCollection", features: levelFeatures } as any);
  }, [levelFeatures]);

  const pathGenerator = useMemo(() => projection ? geoPath().projection(projection) : null, [projection]);

  const regions = useMemo(() => {
    if (!pathGenerator) return [];
    return levelFeatures.map((feature: any) => {
      const p = feature.properties;
      const name = (currentLevel === 'national' || currentLevel === 'country')
        ? (p.STNAME || p.ST_NM || p.ST_NAME)
        : currentLevel === 'state' ? p.DIST_NAME : p.AC_NAME;

      return {
        id: feature.id || p.STCODE11 || p.AC_NO || p.OBJECTID || Math.random(),
        name,
        path: pathGenerator(feature) || '',
      };
    });
  }, [levelFeatures, pathGenerator, currentLevel]);

  const handleGoBack = (e: React.MouseEvent) => {
    e.preventDefault();
    const payloads: any = {
      block: { currentLevel: 'district', selectedBlock: null },
      district: { currentLevel: 'state', selectedDistrict: null },
      state: { currentLevel: 'national', selectedState: null }
    };
    if (payloads[currentLevel]) dispatch({ type: 'SET_MAP_STATE', payload: payloads[currentLevel] });
  };

  return (
    <div ref={containerRef} className="relative h-full w-full flex items-center justify-center overflow-hidden ">
      {currentLevel !== 'national' && (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleGoBack} className="h-8 bg-white/90 shadow-sm border-border flex items-center gap-1.5 hover:bg-white">
            <ChevronLeft className="h-4 w-4" />
            <span className="text-xs font-medium">Back</span>
          </Button>
          <Button type="button" variant="outline" size="icon" onClick={(e) => { e.stopPropagation(); dispatch({ type: 'RESET_FILTERS' }); }} className="h-8 w-8 bg-white/90 shadow-sm border-border">
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full max-h-full transition-all duration-700 ease-in-out" preserveAspectRatio="xMidYMid meet">
        <g>
          {regions.map((region: any) => {
            // TOOLTIP LOGIC: Calculate metrics for this specific region
            const regionRecords = data.filter((d: any) => {
                const rName = region.name?.toLowerCase();
                if (currentLevel === 'national') return d.state?.toLowerCase() === rName;
                if (currentLevel === 'state') return d.district?.toLowerCase() === rName;
                return d.block?.toLowerCase() === rName;
            });

            const uniqueBACs = new Set(regionRecords.map((r: any) => r.bac_name)).size;
            const geoMetrics = getGeoMetrics(region.name);

            return (
              <MapRegion
                key={region.id}
                region={region}
                data={regionRecords[0]} // Pass one record for basic coloring
                colorMetric={colorMetric}
                colorScale={colorScale}
                isSelected={false}
                onClick={() => onRegionClick({ level: currentLevel, name: region.name })}
                onHover={(hoverData: any) => {
                  if (!hoverData || !containerRef.current) return setTooltip(null);
                  const rect = containerRef.current.getBoundingClientRect();
                  
                  // Enrich tooltip with missing data
                  setTooltip({ 
                    ...hoverData, 
                    x: hoverData.x - rect.left, 
                    y: hoverData.y - rect.top,
                    area_sqkm: geoMetrics.area_sqkm,
                    bac_count: uniqueBACs,
                    name: region.name
                  });
                }}
              />
            );
          })}

          {projection && schoolPins.map((school: any) => {
            const coords = projection([school.lng, school.lat]);
            if (!coords || isNaN(coords[0])) return null;
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
                    isSchool: true,
                    name: school.name,
                    schoolDetails: {
                        id: school.id,
                        students_enrolled: school.students_enrolled || 'N/A',
                        infrastructure_index: school.infra_index || '0',
                        visit_count: school.visit_count || '1'
                    },
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                  });
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