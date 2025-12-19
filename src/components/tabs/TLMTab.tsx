// src/components/tabs/TLMTab.tsx
import ChartContainer from '@/components/shared/ChartContainer';
import KPICard from '@/components/shared/KPICard';

export default function TLMTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KPICard label="TLM Availability" value={88} format="percent" icon="Package" color="info" />
        <KPICard label="Effective TLM Usage" value={74} format="percent" icon="MousePointer2" color="success" />
      </div>
      <ChartContainer title="Usage Trend by Month">
        <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
          Monthly Bar Chart: Availability vs Usage
        </div>
      </ChartContainer>
    </div>
  );
}