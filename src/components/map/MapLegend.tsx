interface MapLegendProps {
  colorMetric: 'achievement' | 'visits' | 'planning';
  minValue: number;
  maxValue: number;
}

const MapLegend = ({ colorMetric, minValue, maxValue }: MapLegendProps) => {
  const getMetricLabel = () => {
    switch (colorMetric) {
      case 'achievement':
        return 'Achievement (%)';
      case 'visits':
        return 'Visit Count';
      case 'planning':
        return 'Planning (%)';
      default:
        return 'Value';
    }
  };

  const formatValue = (value: number) => {
    if (colorMetric === 'visits') {
      return value.toLocaleString('en-IN');
    }
    return `${value}%`;
  };

  return (
    <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 shadow-md">
      <h4 className="text-xs font-medium text-muted-foreground mb-2">
        {getMetricLabel()}
      </h4>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-foreground">{formatValue(minValue)}</span>
        <div className="flex-1 h-3 rounded-full gradient-legend" />
        <span className="text-xs font-mono text-foreground">{formatValue(maxValue)}</span>
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );
};

export default MapLegend;
