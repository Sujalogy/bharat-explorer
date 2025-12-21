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
      <div className="bg-card border border-border rounded-lg shadow-lg px-4 py-3 min-w-[220px]">
        <div className="flex justify-between items-start mb-2 border-b border-border pb-2">
          <h4 className="font-semibold text-foreground text-sm">
            {data.name}
          </h4>
          {data.area_sqkm !== undefined && (
            <span className="text-[10px] text-muted-foreground font-mono">
              {formatNumber(data.area_sqkm)} sq. km
            </span>
          )}
        </div>

        <div className="space-y-2.5 text-xs">
          {/* Performance Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px] uppercase">Visits</span>
              <span className="font-medium text-foreground">
                {formatNumber(data.visit_count || data.visits || 0)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px] uppercase">Observations</span>
              <span className="font-medium text-foreground">
                {formatNumber(data.obs_count || 0)}
              </span>
            </div>
          </div>

          {/* Coverage Metrics */}
          <div className="grid grid-cols-2 gap-2 border-t border-border/50 pt-2">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px] uppercase">Schools Covered</span>
              <span className="font-medium text-foreground">
                {data.schools_covered || 0} / {data.total_schools || '-'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px] uppercase">BACs Count</span>
              <span className="font-medium text-foreground">
                {data.bac_count || 0}
              </span>
            </div>
          </div>

          {/* Planning & Achievement */}
          <div className="space-y-1 pt-1 border-t border-border/50">
            {data.achievement !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Achievement</span>
                <span className="font-medium text-foreground font-mono">
                  {formatPercentage(data.achievement)}
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
        </div>

        <div className="mt-3 pt-2 border-t border-border">
          <span className="text-[10px] text-muted-foreground italic">Click to drill down into region</span>
        </div>
      </div>
    </div>
  );
};

export default MapTooltip;