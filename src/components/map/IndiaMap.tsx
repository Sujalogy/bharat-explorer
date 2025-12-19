// ============================================
// FILE 1: src/components/map/IndiaMap.tsx
// ============================================

import { useState, useMemo, useRef } from 'react';
import India from "@svg-maps/india";
import { MapProps, TooltipData, Region } from '@/types/map';
import { getRegionsByLevel, getStateShape } from '@/data/indiaStates';
import MapRegion from './MapRegion';
import MapTooltip from './MapTooltip';

/**
 * IndiaMap Component
 * Provides a centered, interactive SVG map with WHITE background and BLACK borders
 */
const IndiaMap = ({ 
  data, 
  onRegionClick, 
  currentLevel, 
  selectedState, 
  selectedDistrict, 
  colorMetric, 
  colorScale = [0, 100]
}: MapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  /**
   * Memoized regions based on the current drill-down level.
   */
  const regions = useMemo(() => {
    if (currentLevel === 'national') {
      return India.locations.map(loc => ({ id: loc.id, name: loc.name, path: loc.path })) as Region[];
    }
    return getRegionsByLevel(currentLevel, selectedState, selectedDistrict);
  }, [currentLevel, selectedState, selectedDistrict]);

  /**
   * Get state background shape for state-level view
   */
  const stateShape = useMemo(() => {
    if (currentLevel === 'state' && selectedState) {
      return getStateShape(selectedState);
    }
    return null;
  }, [currentLevel, selectedState]);

  /**
   * Converts screen coordinates to relative container coordinates
   */
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

  /**
   * Adjusts the SVG viewBox for each level
   */
  const getViewBox = () => {
    if (currentLevel === 'national') return India.viewBox;
    if (currentLevel === 'state') return "30 60 380 300";
    return India.viewBox;
  };

  return (
    <div ref={containerRef} className="relative h-full w-full flex items-center justify-center p-8 overflow-hidden bg-white rounded-lg">
      <svg
        viewBox={getViewBox()}
        className="w-full h-full max-h-full animate-map-zoom-in"
        preserveAspectRatio="xMidYMid meet"
        style={{ backgroundColor: 'white' }}
      >
        <g>
          {/* State background outline when drilling into districts */}
          {currentLevel === 'state' && stateShape && (
            <path
              d={stateShape.path}
              fill="white"
              stroke="black"
              strokeWidth={2.5}
              strokeOpacity={1}
              className="pointer-events-none"
            />
          )}
          
          {/* Render clickable regions */}
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
              onClick={() => onRegionClick({ 
                level: currentLevel, 
                name: region.name, 
                state: selectedState || region.name, 
                district: selectedDistrict || region.name 
              })}
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