// ============================================
// FILE 2: src/components/map/MapRegion.tsx
// ============================================

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
  onHover: (data: any | null) => void;
}

const MapRegion = ({ region, data, colorMetric, colorScale, isSelected, onClick, onHover }: MapRegionProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getValue = () => {
    if (!data) return null;
    switch (colorMetric) {
      case 'achievement': return data.achievement;
      case 'visits': return data.visits;
      case 'planning': return data.planning ?? 0;
      default: return 0;
    }
  };
  
  const val = getValue();
  const min = colorScale?.[0] ?? 0;
  const max = colorScale?.[1] ?? 100;
  
  const baseColor = val !== null 
    ? getMetricColor(val, min, max) 
    : 'rgba(240, 240, 240, 0.5)'; // Light gray for no data
  
  const hoverColor = val !== null ? getLighterColor(baseColor, 0.2) : 'rgba(220, 220, 220, 0.7)';
  const fillColor = isHovered ? hoverColor : baseColor;
  
  return (
    <path
      d={region.path}
      fill={fillColor}
      stroke="black"
      strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 0.8}
      strokeOpacity={1}
      className={`transition-all duration-200 ${val !== null ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={() => val !== null && onClick()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={(e) => onHover({
        name: region.name,
        achievement: data?.achievement,
        visits: data?.visits,
        planning: data?.planning,
        x: e.clientX,
        y: e.clientY,
      })}
      onMouseLeave={() => {
        setIsHovered(false);
        onHover(null);
      }}
    />
  );
};

export default MapRegion;