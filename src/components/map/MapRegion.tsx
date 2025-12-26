import { useState } from 'react';
import { getMetricColor, getLighterColor } from '@/utils/colorUtils';

interface MapRegionProps {
  region: {
    id: string | number;
    name: string;
    path: string;
  };
  data?: {
    achievement?: number;
    visits?: number;
    planning?: number;
  };
  colorMetric: 'achievement' | 'visits' | 'planning';
  colorScale: [number, number];
  isSelected: boolean;
  onClick: () => void;
  onHover: (data: any | null) => void;
}

const MapRegion = ({ 
  region, 
  data, 
  colorMetric, 
  colorScale, 
  isSelected, 
  onClick, 
  onHover 
}: MapRegionProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getValue = () => {
    if (!data) return null;
    switch (colorMetric) {
      case 'achievement': return data.achievement ?? 0;
      case 'visits': return data.visits ?? 0;
      case 'planning': return data.planning ?? 0;
      default: return 0;
    }
  };
  
  const val = getValue();
  const [min, max] = colorScale;
  
  // Get the RGY Interpolated Color
  const baseColor = val !== null 
    ? getMetricColor(val, min, max) 
     : 'rgba(240, 240, 240, 0.5)';// Tailwind gray-100 for no data
  
 const hoverColor = val !== null ? getLighterColor(baseColor, 0.15) : 'rgb(229, 231, 235)';
  const fillColor = isHovered ? hoverColor : baseColor;
  
  return (
    <path
      d={region.path}
      fill={fillColor}
      stroke="black"
      strokeWidth={isSelected ? 1.8 : isHovered ? 1 : 0.4}
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      strokeOpacity={1}
      className={`transition-colors duration-300 ease-in-out ${val !== null ? 'cursor-pointer' : 'cursor-default'}`}
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