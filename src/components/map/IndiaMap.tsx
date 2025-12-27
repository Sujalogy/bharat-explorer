import { useState, useMemo, useRef, useEffect } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { ChevronLeft, RotateCcw, Loader2, Navigation, MapPin } from 'lucide-react';
import MapRegion from './MapRegion';
import MapTooltip from './MapTooltip';
import { useDashboard } from '@/context/DashboardContext';
import { Button } from '@/components/ui/button';
import { getGeoMetrics } from '@/utils/geoMetrics';
import { api } from '@/utils/api';

import nationalGeoData from '@/assets/new_states.json';

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
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<any | null>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [actualSchoolPins, setActualSchoolPins] = useState<any[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const width = 800;
  const height = 1000;

  // Load GeoJSON data based on current level
  useEffect(() => {
    const loadGeoData = async () => {
      if (currentLevel === 'national' || currentLevel === 'country') {
        setGeoData(nationalGeoData);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        let json;
        if (currentLevel === 'state' && selectedState) {
          json = await api.geo.getState(selectedState);
        } else if (currentLevel === 'district' && selectedDistrict) {
          json = await api.geo.getDistrict(selectedDistrict);
        } else if (currentLevel === 'block' && selectedBlock) {
          json = await api.geo.getBlock(selectedBlock);
        }

        if (json) setGeoData(json);
      } catch (err) {
        console.error("Geo Load Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadGeoData();
  }, [currentLevel, selectedState, selectedDistrict, selectedBlock]);

  // Load school pins when at block level
  useEffect(() => {
    const loadSchools = async () => {
      // Only show school pins at block level
      if (currentLevel !== 'block' || !selectedBlock) {
        setActualSchoolPins([]);
        return;
      }

      setLoadingSchools(true);
      try {
        console.log('Loading schools for block:', selectedBlock);
        const schools = await api.schools.getByBlock(selectedBlock);
        console.log('Loaded schools:', schools.length);
        setActualSchoolPins(schools || []);
      } catch (err) {
        console.error('Error loading schools:', err);
        setActualSchoolPins([]);
      } finally {
        setLoadingSchools(false);
      }
    };

    loadSchools();
  }, [currentLevel, selectedBlock]);

  const levelFeatures = useMemo(() => {
    if (!geoData || !geoData.features) return [];
    return geoData.features
      .filter((f: any) => f.geometry)
      .map((f: any) => ({
        type: "Feature",
        properties: f.properties || {},
        geometry: f.geometry
      }));
  }, [geoData]);

  const projection = useMemo(() => {
    if (levelFeatures.length === 0) return null;
    const padding = 15;
    return geoMercator().fitExtent(
      [[padding, padding], [width - padding, height - padding]],
      { type: "FeatureCollection", features: levelFeatures } as any
    );
  }, [levelFeatures, width, height]);

  const pathGenerator = useMemo(() =>
    projection ? geoPath().projection(projection) : null,
    [projection]);

  const regions = useMemo(() => {
    if (!pathGenerator || !levelFeatures) return [];
    return levelFeatures.map((feature: any, index: number) => {
      const p = feature.properties;

      let name = "Unknown";
      if (currentLevel === 'national' || currentLevel === 'country') {
        name = p.st_nm || p.ST_NM || p.STNAME || p.state_ut || p.state_name;
      } else if (currentLevel === 'state') {
        name = p.dt_name || p.district || p.DIST_NAME;
      } else {
        name = p.ac_name || p.sub_dist || p.AC_NAME;
      }

      const uniqueId = `${currentLevel}-${name}-${feature.id || p.ogc_fid || index}`;

      return {
        id: uniqueId,
        name,
        path: pathGenerator(feature) || '',
      };
    });
  }, [levelFeatures, pathGenerator, currentLevel]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!projection || !svgRef.current) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    const [lng, lat] = projection.invert([svgP.x, svgP.y]) || [0, 0];

    setCoords({ lat, lng });
  };

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
    <div ref={containerRef} className="relative h-full w-full flex items-center justify-center overflow-hidden bg-white">

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading map data...</p>
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      {currentLevel !== 'national' && (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button variant="outline" size="sm" onClick={handleGoBack} className="h-9 bg-white shadow-sm border-slate-200">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <Button variant="outline" size="icon" onClick={() => dispatch({ type: 'RESET_FILTERS' })} className="h-9 w-9 bg-white shadow-sm border-slate-200">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* School Count Indicator (Block Level Only) */}
      {currentLevel === 'block' && (
        <div className="absolute top-4 left-4 z-10 bg-white px-4 py-2 border rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold">
              {loadingSchools ? (
                <span className="text-muted-foreground">Loading schools...</span>
              ) : (
                <>
                  <span className="text-blue-600">{actualSchoolPins.length}</span>
                  <span className="text-muted-foreground"> schools</span>
                </>
              )}
            </span>
          </div>
        </div>
      )}

      {/* RGY Performance Legend (Bottom Left) */}
      <div className="absolute bottom-0 left-0 z-10 bg-white p-3 border rounded-md select-none">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">Performance Scale</p>
        <div className="flex flex-col gap-2">
          <div className="h-2.5 w-48 rounded-full"
            style={{ background: 'linear-gradient(to right, rgb(253, 164, 175), rgb(253, 230, 138), rgb(167, 243, 208))' }}
          />
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-600">
            <div className="flex flex-col"><span>0%</span><span className="text-[8px] text-rose-400 uppercase">Low</span></div>
            <div className="flex flex-col text-center"><span>50%</span><span className="text-[8px] text-amber-400 uppercase">Mid</span></div>
            <div className="flex flex-col text-right"><span>100%</span><span className="text-[8px] text-emerald-400 uppercase">High</span></div>
          </div>
        </div>
      </div>

      {/* Latitude & Longitude Display (Bottom Right) */}
      {coords && (
        <div className="absolute bottom-0 right-0 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 border border-slate-200 rounded-tl-md shadow-sm pointer-events-none transition-opacity duration-300">
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-700 tracking-wider">
            <div className="flex items-center gap-1.5">
              <Navigation className="w-3 h-3 text-emerald-600 rotate-45" />
              <span className="text-slate-500">LAT:</span>
              <span className="font-bold">{coords.lat.toFixed(4)}°N</span>
            </div>
            <div className="h-3 w-[1px] bg-slate-300" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">LNG:</span>
              <span className="font-bold">{coords.lng.toFixed(4)}°E</span>
            </div>
          </div>
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full transition-all duration-500 ease-in-out"
        preserveAspectRatio="xMidYMid meet"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setCoords(null)}
      >
        <g>
          {/* Render Map Regions */}
          {regions.map((region: any) => {
            const regionRecords = (data || []).filter((d: any) => {
              const rName = region.name?.toLowerCase();
              if (!rName) return false;
              if (currentLevel === 'national') return d.state?.toLowerCase() === rName;
              if (currentLevel === 'state') return d.district?.toLowerCase() === rName;
              return d.block?.toLowerCase() === rName;
            });

            const geoMetrics = getGeoMetrics(region.name);

            return (
              <MapRegion
                key={region.id}
                region={region}
                data={regionRecords[0]}
                colorMetric={colorMetric}
                colorScale={colorScale}
                isSelected={currentLevel === 'block'}
                onClick={() => onRegionClick({ level: currentLevel, name: region.name })}
                onHover={(hoverData: any) => {
                  if (!hoverData || !containerRef.current) return setTooltip(null);
                  const rect = containerRef.current.getBoundingClientRect();
                  setTooltip({
                    ...hoverData,
                    x: hoverData.x - rect.left,
                    y: hoverData.y - rect.top,
                    area_sqkm: geoMetrics.area_sqkm,
                    name: region.name
                  });
                }}
              />
            );
          })}

          {/* Render School Pins (Blue Dots) - Only at Block Level */}
          {projection && currentLevel === 'block' && actualSchoolPins.map((school: any) => {
            // Validate coordinates
            if (!school.lat || !school.lng || isNaN(school.lat) || isNaN(school.lng)) {
              return null;
            }

            const coords = projection([school.lng, school.lat]);
            if (!coords || isNaN(coords[0]) || isNaN(coords[1])) {
              return null;
            }

            return (
              <g key={school.id || `school-${coords[0]}-${coords[1]}`}>
                {/* Outer glow effect */}
                <circle
                  cx={coords[0]}
                  cy={coords[1]}
                  r={8}
                  className="fill-blue-400/20 animate-pulse"
                />
                {/* Main school pin */}
                <circle
                  cx={coords[0]}
                  cy={coords[1]}
                  r={5}
                  className="fill-blue-600 stroke-white stroke-[2px] cursor-pointer transition-all duration-200 hover:r-7 hover:fill-blue-700 drop-shadow-lg"
                  onMouseEnter={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (!rect) return;
                    setTooltip({
                      isSchool: true,
                      name: school.name || 'Unknown School',
                      schoolDetails: {
                        id: school.id || 'N/A',
                        udise: school.udise_code || school.id,
                        students_enrolled: school.students_enrolled || 'N/A',
                        category: school.category || 'Primary',
                        visit_status: school.visit_status || 'visited',
                      },
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}
                />
              </g>
            );
          })}
        </g>
      </svg>
      
      <MapTooltip data={tooltip} />
    </div>
  );
};

export default IndiaMap;