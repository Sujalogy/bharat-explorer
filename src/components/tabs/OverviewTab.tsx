import { useMemo } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';
import KPICard from '@/components/shared/KPICard';
import ChartContainer from '@/components/shared/ChartContainer';
import IndiaMap from '@/components/map/IndiaMap';
import { SelectedRegion, RegionData } from '@/types/map';
import { TrendingUp, TrendingDown, AlertTriangle, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function OverviewTab() {
  const { state, dispatch } = useDashboard();
  const { filteredData, mapState } = state;
  const metrics = usePerformanceMetrics(filteredData, state.thresholds.chronicPerformance);

  // Prepare map data
  const mapData: RegionData[] = useMemo(() => {
    const grouped: Record<string, { total: number; target: number; visits: number }> = {};
    
    filteredData.forEach(record => {
      const key = record.state;
      if (!grouped[key]) grouped[key] = { total: 0, target: 0, visits: 0 };
      grouped[key].total += record.actual_visits;
      grouped[key].target += record.target_visits;
      grouped[key].visits += record.actual_visits;
    });

    return Object.entries(grouped).map(([state, data]) => ({
      state,
      achievement: data.target > 0 ? (data.total / data.target) * 100 : 0,
      visits: data.visits
    }));
  }, [filteredData]);

  const handleRegionClick = (region: SelectedRegion) => {
    if (region.level === 'national') {
      dispatch({ type: 'SET_FILTERS', payload: { state: region.name } });
    }
    dispatch({ type: 'SET_MAP_STATE', payload: { 
      currentLevel: region.level === 'national' ? 'state' : region.level,
      selectedState: region.state || region.name
    }});
  };

  const topPerformers = metrics.statePerformance.slice(0, 5);
  const bottomPerformers = [...metrics.statePerformance].reverse().slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard label="Total BACs" value={metrics.totalBACs} icon="Users" color="info" change={5.2} />
        <KPICard label="Avg Achievement" value={metrics.avgAchievement} format="percent" icon="Target" color={metrics.avgAchievement >= 80 ? 'success' : 'warning'} />
        <KPICard label="Total Visits" value={metrics.totalVisits} icon="Eye" color="default" change={12.3} />
        <KPICard label="Chronic Under-performers" value={metrics.chronicPerformers.length} icon="Activity" color="destructive" />
        <KPICard label="Records" value={filteredData.length} icon="BarChart3" color="info" />
      </div>

      {/* Map and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <ChartContainer title="Geographic Performance" description="Click regions to drill down" className="lg:col-span-3 h-[500px]">
          <div className="h-[420px]">
            <IndiaMap
              data={mapData}
              onRegionClick={handleRegionClick}
              currentLevel={mapState.currentLevel}
              selectedState={mapState.selectedState || undefined}
              colorMetric="achievement"
            />
          </div>
        </ChartContainer>

        <div className="lg:col-span-2 space-y-4">
          <ChartContainer title="Top Performers" className="h-[240px]">
            <ScrollArea className="h-[180px]">
              <div className="space-y-2">
                {topPerformers.map((item, i) => (
                  <div key={item.state} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 p-0 justify-center">{i + 1}</Badge>
                      <span className="text-sm font-medium">{item.state}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-success">{item.value.toFixed(1)}%</span>
                      <TrendingUp className="w-4 h-4 text-success" />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </ChartContainer>

          <ChartContainer title="Needs Attention" className="h-[240px]">
            <ScrollArea className="h-[180px]">
              <div className="space-y-2">
                {bottomPerformers.map((item, i) => (
                  <div key={item.state} className="flex items-center justify-between p-2 rounded-lg bg-destructive/5">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      <span className="text-sm font-medium">{item.state}</span>
                    </div>
                    <span className="text-sm font-semibold text-destructive">{item.value.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
