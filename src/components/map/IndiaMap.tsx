// src/components/map/IndiaMap.tsx
import { useState, useMemo, useRef } from 'react';
import India from "@svg-maps/india";
import { MapProps, TooltipData, SelectedRegion, Region } from '@/types/map';
import { getRegionsByLevel } from '@/data/indiaStates';
import MapRegion from './MapRegion';
import MapTooltip from './MapTooltip';

const IndiaMap = ({ data, onRegionClick, currentLevel, selectedState, selectedDistrict, colorMetric, colorScale = [0, 100] }: MapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const regions = useMemo(() => {
    if (currentLevel === 'national') {
      return India.locations.map(loc => ({ id: loc.id, name: loc.name, path: loc.path })) as Region[];
    }
    return getRegionsByLevel(currentLevel, selectedState, selectedDistrict);
  }, [currentLevel, selectedState, selectedDistrict]);

  // FIX: Converts screen coordinates to relative container coordinates for the tooltip
  const handleHover = (hoverData: any) => {
    if (!hoverData || !containerRef.current) {
      setTooltip(null);
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    setTooltip({
      ...hoverData,
      x: hoverData.x - rect.left,
      y: hoverData.y - rect.top,
    });
  };

  const getViewBox = () => {
    if (currentLevel === 'national') return India.viewBox;
    // These coordinates must match the path coordinates in your indiaStates.ts
    switch (currentLevel) {
      case 'state': return "40 250 350 280"; 
      case 'district': return "70 260 130 130"; 
      default: return India.viewBox;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden flex items-center justify-center">
      <svg
        viewBox={getViewBox()}
        className="w-full h-full max-h-full animate-map-zoom-in"
        preserveAspectRatio="xMidYMid meet"
        style={{ backgroundColor: 'hsl(var(--map-bg))' }}
      >
        <g>
          {regions.map((region) => (
            <MapRegion
              key={region.id}
              region={region}
              data={data.find(d => 
                currentLevel === 'national' ? d.state === region.name : 
                currentLevel === 'state' ? d.district === region.name : d.block === region.name
              )}
              colorMetric={colorMetric}
              colorScale={colorScale}
              isSelected={false}
              onClick={() => onRegionClick({ level: currentLevel, name: region.name, state: selectedState || region.name, district: selectedDistrict || region.name })}
              onHover={handleHover}
            />
          ))}
        </g>
      </svg>

      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm border rounded-lg px-3 py-1.5 shadow-sm pointer-events-none">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{currentLevel} VIEW</span>
        <h3 className="text-sm font-bold">{currentLevel === 'national' ? 'India' : selectedState}</h3>
      </div>

      <MapTooltip data={tooltip} />
    </div>
  );
};

export default IndiaMap;