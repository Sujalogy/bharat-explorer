import { TooltipData } from '@/types/map';
import { formatNumber, formatPercentage } from '@/utils/colorUtils';

interface MapTooltipProps {
  data: TooltipData | null;
}

const MapTooltip = ({ data }: MapTooltipProps) => {
  if (!data) return null;

  return (
    <div
      className="absolute z-50 pointer-events-none animate-tooltip-enter"
      style={{
        left: data.x + 15,
        top: data.y - 10,
      }}
    >
      <div className="bg-card border border-border rounded-lg shadow-lg px-4 py-3 min-w-[180px]">
        <h4 className="font-semibold text-foreground text-sm mb-2 border-b border-border pb-2">
          {data.name}
        </h4>
        <div className="space-y-1.5 text-xs">
          {data.achievement !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Achievement</span>
              <span className="font-medium text-foreground font-mono">
                {formatPercentage(data.achievement)}
              </span>
            </div>
          )}
          {data.visits !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Visits</span>
              <span className="font-medium text-foreground font-mono">
                {formatNumber(data.visits)}
              </span>
            </div>
          )}
          {data.planning !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Planning</span>
              <span className="font-medium text-foreground font-mono">
                {formatPercentage(data.planning)}
              </span>
            </div>
          )}
        </div>
        <div className="mt-2 pt-2 border-t border-border">
          <span className="text-[10px] text-muted-foreground">Click to drill down</span>
        </div>
      </div>
    </div>
  );
};

export default MapTooltip;
