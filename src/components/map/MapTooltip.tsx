import { TooltipData } from '@/types/map';
import { formatNumber, formatPercentage } from '@/utils/colorUtils';
import { Badge } from '@/components/ui/badge';

const MapTooltip = ({ data }: { data: any | null }) => {
  if (!data) return null;

  return (
    <div className="absolute z-50 pointer-events-none" style={{ left: data.x + 15, top: data.y - 10 }}>
      <div className="bg-card border border-border rounded-xl shadow-2xl px-4 py-3 min-w-[240px] backdrop-blur-md">
        
        {data.isSchool ? (
          /* SCHOOL PIN VIEW */
          <div className="space-y-3">
            <div className="border-b pb-2">
              <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-tighter mb-1">Individual School</Badge>
              <h4 className="font-bold text-sm text-primary leading-tight">{data.name}</h4>
              <p className="text-[10px] text-muted-foreground font-mono mt-1">ID: {data.schoolDetails.id}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block text-[9px] uppercase">Students</span>
                <span className="font-bold">{data.schoolDetails.students_enrolled}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[9px] uppercase">Infra Index</span>
                <span className="font-bold text-emerald-600">{data.schoolDetails.infrastructure_index}/10</span>
              </div>
              <div className="col-span-2 border-t pt-2 mt-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Visits this year</span>
                  <span className="font-bold">{data.schoolDetails.visit_count}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* REGION SUMMARY VIEW */
          <div className="space-y-2">
            <div className="flex justify-between items-start border-b pb-2">
              <h4 className="font-bold text-sm">{data.name}</h4>
              <span className="text-[10px] text-muted-foreground font-mono">{formatNumber(data.area_sqkm || 0)} km²</span>
            </div>
            {data.achievement !== undefined ? (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Achievement</span>
                  <span className="font-bold text-primary">{formatPercentage(data.achievement)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">BACs Coverage</span>
                  <span className="font-bold">{data.bac_count || 0} active</span>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-orange-500 italic">No visit data for this region</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapTooltip;