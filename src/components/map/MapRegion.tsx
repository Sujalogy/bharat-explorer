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
    if (!data) return 50; // Default middle value
    switch (colorMetric) {
      case 'achievement':
        return data.achievement;
      case 'visits':
        return data.visits;
      case 'planning':
        return data.planning ?? 50;
      default:
        return 50;
    }
  };

  const baseColor = getMetricColor(getValue(), colorScale[0], colorScale[1]);
  const hoverColor = getLighterColor(baseColor, 0.2);
  const fillColor = isHovered ? hoverColor : baseColor;

  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsHovered(true);
    onHover({
      name: region.name,
      achievement: data?.achievement,
      visits: data?.visits,
      planning: data?.planning,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isHovered) {
      onHover({
        name: region.name,
        achievement: data?.achievement,
        visits: data?.visits,
        planning: data?.planning,
        x: e.clientX,
        y: e.clientY,
      });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover(null);
  };

  return (
    <path
      d={region.path}
      fill={fillColor}
      stroke={isSelected ? 'hsl(var(--map-region-selected))' : isHovered ? 'hsl(var(--map-border-hover))' : 'hsl(var(--map-border))'}
      strokeWidth={isSelected ? 2.5 : isHovered ? 1.5 : 0.5}
      className={`cursor-pointer transition-all duration-200 ${isSelected ? 'animate-pulse-glow' : ''}`}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        filter: isHovered ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' : 'none',
      }}
    />
  );
};

export default MapRegion;
