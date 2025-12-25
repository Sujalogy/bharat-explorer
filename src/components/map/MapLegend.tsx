import React from 'react';

interface MapLegendProps {
  colorMetric: 'achievement' | 'visits' | 'planning' | string;
  minValue: number;
  maxValue: number;
}

const MapLegend = ({ colorMetric, minValue, maxValue }: MapLegendProps) => {
  const getMetricLabel = () => {
    switch (colorMetric) {
      case 'achievement':
        return 'Achievement (%)';
      case 'visits':
      case 'Visit':
        return 'Visit Count';
      case 'planning':
        return 'Planning (%)';
      default:
        return `${colorMetric} Performance`;
    }
  };

  const formatValue = (value: number) => {
    if (colorMetric === 'visits' || colorMetric === 'Visit') {
      return value.toLocaleString('en-IN');
    }
    return `${value}%`;
  };

  return (
    <div className="w-64 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
      <h4 className="text-xs font-bold text-muted-foreground mb-2 uppercase">
        {getMetricLabel()}
      </h4>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono font-bold text-foreground">
          {formatValue(minValue)}
        </span>
        
        {/* This bar now uses the updated Pink-to-Deep-Red gradient from index.css */}
        <div className="flex-1 h-3 rounded-full gradient-legend shadow-inner" />
        
        <span className="text-[10px] font-mono font-bold text-foreground">
          {formatValue(maxValue)}
        </span>
      </div>
      <div className="flex justify-between mt-1 text-[9px] font-medium text-muted-foreground uppercase">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );
};

export default MapLegend;