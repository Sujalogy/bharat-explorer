import { useState, useMemo } from 'react';
import India from "@svg-maps/india";
import { MapProps, TooltipData, SelectedRegion, Region } from '@/types/map';
import { getRegionsByLevel } from '@/data/indiaStates';
import MapRegion from './MapRegion';
import MapTooltip from './MapTooltip';

const IndiaMap = ({
  data,
  onRegionClick,
  currentLevel,
  selectedState,
  selectedDistrict,
  colorMetric,
  colorScale = [0, 100],
}: MapProps) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const regions = useMemo(() => {
    if (currentLevel === 'national') {
      return India.locations.map(loc => ({
        id: loc.id,
        name: loc.name,
        path: loc.path,
        // Centroids are not provided by the library; 
        // labels are hidden at national level in this UI anyway.
      })) as Region[];
    }
    
    // Fallback to custom simplified paths for state/district levels
    return getRegionsByLevel(currentLevel, selectedState, selectedDistrict);
  }, [currentLevel, selectedState, selectedDistrict]);

  /**
   * Adjust the SVG viewport.
   * Uses the library's native viewBox for national view.
   */
  const getViewBox = () => {
    if (currentLevel === 'national') {
      return India.viewBox;
    }
    
    switch (currentLevel) {
      case 'state':
        // Values adjusted for the simplified coordinate system in indiaStates.ts
        return "40 250 350 280"; 
      case 'district':
        return "70 260 130 130"; 
      default:
        return India.viewBox;
    }
  };

  const handleRegionClick = (regionName: string) => {
    const region: SelectedRegion = {
      level: currentLevel,
      name: regionName,
      state: (currentLevel === 'state' || currentLevel === 'district') ? selectedState : regionName,
      district: currentLevel === 'district' ? selectedDistrict : regionName,
    };
    onRegionClick(region);
  };

  const getDataForRegion = (regionName: string) => {
    switch (currentLevel) {
      case 'national':
        return data.find(d => d.state === regionName);
      case 'state':
        return data.find(d => d.district === regionName);
      case 'district':
        return data.find(d => d.block === regionName);
      default:
        return undefined;
    }
  };

  const getLevelTitle = () => {
    switch (currentLevel) {
      case 'national': return 'India';
      case 'state': return selectedState || 'State';
      case 'district': return selectedDistrict || 'District';
      default: return '';
    }
  };

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox={getViewBox()}
        className="w-full h-full animate-map-zoom-in"
        preserveAspectRatio="xMidYMid meet"
        style={{ backgroundColor: 'hsl(var(--map-bg))' }}
      >
        {/* Decorative Water background - only shows if svg is smaller than rect */}
        <rect 
          x="-500" 
          y="-500" 
          width="2000" 
          height="2000" 
          fill="hsl(var(--map-water))" 
        />

        {/* Map regions */}
        <g>
          {regions.map((region) => (
            <MapRegion
              key={region.id}
              region={region}
              data={getDataForRegion(region.name)}
              colorMetric={colorMetric}
              colorScale={colorScale}
              isSelected={false}
              onClick={() => handleRegionClick(region.name)}
              onHover={setTooltip}
            />
          ))}
        </g>

        {/* Region labels (Only for State/District levels) */}
        {currentLevel !== 'national' && regions.map((region) => (
          region.centroid && (
            <text
              key={`label-${region.id}`}
              x={region.centroid[0]}
              y={region.centroid[1]}
              textAnchor="middle"
              dominantBaseline="middle"
              className="pointer-events-none select-none"
              fill="hsl(var(--foreground))"
              fontSize={currentLevel === 'district' ? 3 : 6}
              fontWeight="500"
              opacity={0.8}
            >
              {region.name}
            </text>
          )
        ))}
      </svg>

      {/* Level indicator Floating UI */}
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5 shadow-sm pointer-events-none">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
          {currentLevel === 'national' ? 'National View' : 
           currentLevel === 'state' ? 'State View' : 'District View'}
        </span>
        <h3 className="text-sm font-bold text-foreground">{getLevelTitle()}</h3>
      </div>

      {/* Empty State / Error UI */}
      {regions.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[1px]">
          <div className="bg-card border border-border rounded-xl p-8 text-center shadow-2xl max-w-xs">
            <div className="mb-4 text-muted-foreground">
              <svg className="w-12 h-12 mx-auto opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <p className="font-semibold text-foreground">Map data missing</p>
            <p className="text-xs text-muted-foreground mt-2">
              Boundary data for "{selectedState}" is currently unavailable in the explorer.
            </p>
          </div>
        </div>
      )}

      <MapTooltip data={tooltip} />
    </div>
  );
};

export default IndiaMap;