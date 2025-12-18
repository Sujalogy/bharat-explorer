import { useState, useMemo } from 'react';
import { MapProps, TooltipData, SelectedRegion } from '@/types/map';
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
    return getRegionsByLevel(currentLevel, selectedState, selectedDistrict);
  }, [currentLevel, selectedState, selectedDistrict]);

  const getViewBox = () => {
    switch (currentLevel) {
      case 'national':
        return "0 0 600 750";
      case 'state':
        return "40 250 350 280"; // Focused on Maharashtra area
      case 'district':
        return "70 260 130 130"; // Focused on Pune area
      default:
        return "0 0 600 750";
    }
  };

  const handleRegionClick = (regionName: string) => {
    const region: SelectedRegion = {
      level: currentLevel,
      name: regionName,
      state: currentLevel === 'state' || currentLevel === 'district' ? selectedState : regionName,
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
      case 'national':
        return 'India';
      case 'state':
        return selectedState || 'State';
      case 'district':
        return selectedDistrict || 'District';
      default:
        return '';
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
        {/* Water/Ocean background */}
        <rect 
          x="-100" 
          y="-100" 
          width="800" 
          height="950" 
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

        {/* Region labels for larger views */}
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
              opacity={0.9}
            >
              {region.name}
            </text>
          )
        ))}
      </svg>

      {/* Level indicator */}
      <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5 shadow-sm">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {currentLevel === 'national' ? 'National View' : 
           currentLevel === 'state' ? 'State View' : 'District View'}
        </span>
        <h3 className="text-sm font-semibold text-foreground">{getLevelTitle()}</h3>
      </div>

      {/* No data message */}
      {regions.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg p-6 text-center shadow-lg">
            <p className="text-muted-foreground">
              Detailed map data not available for this region.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Placeholder view - actual boundaries would be loaded here.
            </p>
          </div>
        </div>
      )}

      <MapTooltip data={tooltip} />
    </div>
  );
};

export default IndiaMap;
