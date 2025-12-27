import { useState, useMemo, useRef, useEffect } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { ChevronLeft, RotateCcw, Loader2, Navigation } from 'lucide-react';
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

  // NEW: State for mouse geographic coordinates
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const width = 800;
  const height = 1000;

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

      // FIX: Create a unique ID by combining level and name or using index as fallback
      // This prevents "6020510501" from colliding with itself
      const uniqueId = `${currentLevel}-${name}-${feature.id || p.ogc_fid || index}`;

      return {
        id: uniqueId,
        name,
        path: pathGenerator(feature) || '',
      };
    });
  }, [levelFeatures, pathGenerator, currentLevel]);

  // NEW: Handler to calculate lat/lng on mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!projection || !svgRef.current) return;

    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;

    // Convert screen coordinates to SVG coordinates
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    // Use projection.invert to get [longitude, latitude]
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

      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

      {/* NEW: Latitude & Longitude Display (Bottom Right) */}
      {coords && (
        <div className="absolute bottom-0 right-0 z-10  px-3 py-1.5 border-slate-700 shadow-xl pointer-events-none transition-opacity duration-300">
          <div className="flex items-center gap-3 text-[10px] font-mono text-black tracking-wider">
            <div className="flex items-center gap-1.5">
              <Navigation className="w-3 h-3 text-emerald-800-400 rotate-45" />
              <span className="text-gray-700">LAT:</span>
              <span className="font-bold">{coords.lat.toFixed(4)}°N</span>
            </div>
            <div className="h-3 w-[1px] bg-slate-700" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">LNG:</span>
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
        onMouseMove={handleMouseMove} // NEW: Listen for mouse movement
        onMouseLeave={() => setCoords(null)} // Hide coords when mouse leaves map
      >
        <g>
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

          {/* School Pins */}
          {projection && schoolPins.map((school: any) => {
            const coords = projection([school.lng, school.lat]);
            if (!coords || isNaN(coords[0])) return null;
            return (
              <circle
                key={school.id}
                cx={coords[0]}
                cy={coords[1]}
                r={5}
                className="fill-blue-700 stroke-white stroke-[2px] cursor-pointer drop-shadow-md transition-all duration-200 hover:r-7"
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