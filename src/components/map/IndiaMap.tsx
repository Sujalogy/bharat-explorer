import { useState, useMemo, useRef, useEffect } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { ChevronLeft, RotateCcw, Loader2 } from 'lucide-react';
import MapRegion from './MapRegion';
import MapTooltip from './MapTooltip';
import { useDashboard } from '@/context/DashboardContext';
import { Button } from '@/components/ui/button';
import { getGeoMetrics } from '@/utils/geoMetrics';
import { api } from '@/utils/api';

/**
 * 1. Direct Import of the National GeoJSON
 * Ensure the file is named .json and located in src/assets/
 */
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
  const [tooltip, setTooltip] = useState<any | null>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * ADJUSTED DIMENSIONS: 
   * India is taller than it is wide. Using 800x1000 ensures the mainland 
   * fills the container without being squeezed by distant islands.
   */
  const width = 800;
  const height = 1000; 

  useEffect(() => {
    const loadGeoData = async () => {
      // Use imported JSON for National view immediately
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

  // 2. Prepare features for D3
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

  // 3. Setup Projection (Using fitExtent to maximize mainland size)
  const projection = useMemo(() => {
    if (levelFeatures.length === 0) return null;
    
    // fitExtent allows us to define the "Safe Area".
    // We use a small padding (10px) to ensure the map fills the space.
    const padding = 10;
    return geoMercator().fitExtent(
      [[padding, padding], [width - padding, height - padding]], 
      { type: "FeatureCollection", features: levelFeatures } as any
    );
  }, [levelFeatures, width, height]);

  const pathGenerator = useMemo(() => 
    projection ? geoPath().projection(projection) : null, 
  [projection]);

  // 4. Normalized Mapping of Region Names
  const regions = useMemo(() => {
    if (!pathGenerator || !levelFeatures) return [];
    return levelFeatures.map((feature: any) => {
      const p = feature.properties;
      
      let name = "Unknown";
      if (currentLevel === 'national' || currentLevel === 'country') {
        name = p.st_nm || p.ST_NM || p.STNAME || p.state_ut || p.state_name;
      } else if (currentLevel === 'state') {
        name = p.dt_name || p.district || p.DIST_NAME;
      } else {
        name = p.ac_name || p.sub_dist || p.AC_NAME;
      }

      return {
        id: feature.id || p.ogc_fid || p.id || Math.random(),
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
    <div ref={containerRef} className="relative h-full w-full flex items-center justify-center overflow-hidden">
      
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

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

      {/* SVG Optimization: 
          - Removed max-h-[600px] so it fills the parent container.
          - preserveAspectRatio="xMidYMid meet" ensures it centers correctly.
      */}
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full transition-all duration-500 ease-in-out" 
        preserveAspectRatio="xMidYMid meet"
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
                className="fill-emerald-500 stroke-white stroke-[2px] cursor-pointer drop-shadow-md transition-all duration-200 hover:r-7"
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
<div className="absolute bottom-6 left-6 z-10 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-lg select-none">
        <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">
          Performance Scale
        </p>
        <div className="flex flex-col gap-2">
          {/* The Gradient Bar */}
          <div className="h-2.5 w-48 rounded-full bg-gradient-to-right from-[#FDA4AF] via-[#FDE68A] to-[#A7F3D0] shadow-inner" 
               style={{ background: 'linear-gradient(to right, rgb(253, 164, 175), rgb(253, 230, 138), rgb(167, 243, 208))' }}
          />
          
          {/* Legend Labels */}
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-600">
            <div className="flex flex-col">
              <span>0%</span>
              <span className="text-[8px] text-rose-500 uppercase">Critical</span>
            </div>
            <div className="flex flex-col text-center">
              <span>50%</span>
              <span className="text-[8px] text-amber-500 uppercase">Average</span>
            </div>
            <div className="flex flex-col text-right">
              <span>100%</span>
              <span className="text-[8px] text-emerald-500 uppercase">Target</span>
            </div>
          </div>
        </div>
      </div>
      <MapTooltip data={tooltip} />
    </div>
  );
};

export default IndiaMap;