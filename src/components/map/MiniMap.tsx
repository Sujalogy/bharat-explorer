import { indiaStates } from '@/data/indiaStates';

interface MiniMapProps {
  selectedState?: string;
  currentLevel: 'national' | 'state' | 'district';
}

const MiniMap = ({ selectedState, currentLevel }: MiniMapProps) => {
  if (currentLevel === 'national') return null;

  const selectedRegion = indiaStates.find(s => s.name === selectedState);

  return (
    <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg p-2 shadow-md">
      <h4 className="text-[10px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
        India Overview
      </h4>
      <svg
        viewBox="0 0 600 750"
        className="w-24 h-28"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background */}
        <rect 
          x="0" 
          y="0" 
          width="600" 
          height="750" 
          fill="hsl(var(--map-bg))" 
        />
        
        {/* All states */}
        {indiaStates.map((state) => (
          <path
            key={state.id}
            d={state.path}
            fill={state.name === selectedState ? 'hsl(var(--primary))' : 'hsl(var(--map-region-default))'}
            stroke="hsl(var(--map-border))"
            strokeWidth={state.name === selectedState ? 1 : 0.3}
            opacity={state.name === selectedState ? 1 : 0.5}
          />
        ))}

        {/* Highlight box for selected state */}
        {selectedRegion && selectedRegion.centroid && (
          <circle
            cx={selectedRegion.centroid[0]}
            cy={selectedRegion.centroid[1]}
            r="8"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            className="animate-pulse"
          />
        )}
      </svg>
    </div>
  );
};

export default MiniMap;
