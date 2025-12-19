// src/components/map/MapRegion.tsx
import { Region, RegionData } from '@/types/map';
import { getMetricColor, getLighterColor } from '@/utils/colorUtils';
import { useState } from 'react';

interface MapRegionProps {
  region: Region;
  data?: RegionData;
  colorMetric: 'achievement' | 'visits' | 'planning';
  colorScale: [number, number];
  isSelected: boolean;
  onClick: () => void;
  onHover: (data: { name: string; achievement?: number; visits?: number; planning?: number; x: number; y: number } | null) => void;
}

const MapRegion = ({ region, data, colorMetric, colorScale, isSelected, onClick, onHover }: MapRegionProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getValue = () => {
    if (!data) return null; // Return null if no data exists
    switch (colorMetric) {
      case 'achievement': return data.achievement;
      case 'visits': return data.visits;
      case 'planning': return data.planning ?? 0;
      default: return 0;
    }
  };

  const val = getValue();
  // Highlighted color if data exists, otherwise a muted neutral color
  const baseColor = val !== null 
    ? getMetricColor(val, colorScale[0], colorScale[1]) 
    : 'hsl(var(--muted) / 0.2)'; // Muted color for no-data regions
  
  const hoverColor = val !== null ? getLighterColor(baseColor, 0.2) : 'hsl(var(--muted) / 0.4)';
  const fillColor = isHovered ? hoverColor : baseColor;

  const handleMouseMove = (e: React.MouseEvent) => {
    onHover({
      name: region.name,
      achievement: data?.achievement,
      visits: data?.visits,
      planning: data?.planning,
      x: e.clientX,
      y: e.clientY,
    });
  };

  return (
    <path
      d={region.path}
      fill={fillColor}
      // DARKENED BORDERS: Stronger border for regions with data
      stroke={val !== null ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'}
      strokeWidth={isSelected ? 2 : isHovered ? 1.2 : 0.6}
      className={`transition-all duration-200 ${val !== null ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={() => val !== null && onClick()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setIsHovered(false);
        onHover(null);
      }}
    />
  );
};

export default MapRegion;