// src/components/tabs/OverviewTab.tsx
import { useMemo } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';
import KPICard from '@/components/shared/KPICard';
import ChartContainer from '@/components/shared/ChartContainer';
import IndiaMap from '@/components/map/IndiaMap';
import DataTable, { Column } from '@/components/shared/DataTable';
import { SelectedRegion, RegionData } from '@/types/map';
import { VisitRecord } from '@/types/dashboard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle } from 'lucide-react';

export default function OverviewTab() {
  const { state, dispatch } = useDashboard();
  const { filteredData, mapState } = state;
  const metrics = usePerformanceMetrics(filteredData, state.thresholds.chronicPerformance);

  // Aggregate geographic data for the map
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

  const columns: Column<VisitRecord>[] = [
    { key: 'bac_id', label: 'BAC ID', sortable: true },
    { key: 'bac_name', label: 'Officer Name', sortable: true },
    { key: 'state', label: 'State', sortable: true },
    { key: 'district', label: 'District', sortable: true },
    { key: 'target_visits', label: 'Target', sortable: true },
    { key: 'actual_visits', label: 'Actual', sortable: true },
    { 
      key: 'id', 
      label: 'Achievement', 
      render: (_, row) => {
        const percent = row.target_visits > 0 ? (row.actual_visits / row.target_visits) * 100 : 0;
        return <span className="font-mono font-medium">{percent.toFixed(1)}%</span>;
      }
    },
  ];

  const topPerformers = metrics.statePerformance.slice(0, 5);
  const bottomPerformers = [...metrics.statePerformance].reverse().slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard label="Avg Achievement" value={metrics.avgAchievement} format="percent" icon="Target" color="success" />
        <KPICard label="Total Visits" value={metrics.totalVisits} icon="Eye" color="info" />
        <KPICard label="Active BACs" value={metrics.totalBACs} icon="Users" color="default" />
        <KPICard label="Chronic Issues" value={metrics.chronicPerformers.length} icon="Activity" color="destructive" />
        <KPICard label="Total Records" value={filteredData.length} icon="BarChart3" color="info" />
      </div>

      {/* Map and Side Cards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Column: lg:col-span-8 (2/3 width) */}
        <div className="lg:col-span-8">
          <ChartContainer title="National Performance Map" description="Drill down to see specific regional data" className="h-[550px]">
            <div className="h-[470px]">
              <IndiaMap
                data={mapData}
                onRegionClick={handleRegionClick}
                currentLevel={mapState.currentLevel}
                selectedState={mapState.selectedState || undefined}
                colorMetric="achievement"
              />
            </div>
          </ChartContainer>
        </div>

        {/* Card View Column: lg:col-span-4 (1/3 width) */}
        <div className="lg:col-span-4 space-y-4">
          <ChartContainer title="Top Performing States" className="h-[265px]">
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-2">
                {topPerformers.map((item, i) => (
                  <div key={item.state} className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/10">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-success/20 text-success">{i + 1}</Badge>
                      <span className="text-sm font-medium">{item.state}</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-success text-sm">
                      <TrendingUp className="w-4 h-4" />
                      {item.value.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </ChartContainer>

          <ChartContainer title="Needs Attention" className="h-[265px]">
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-2">
                {bottomPerformers.map((item, i) => (
                  <div key={item.state} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      <span className="text-sm font-medium">{item.state}</span>
                    </div>
                    <span className="text-sm font-bold text-destructive">{item.value.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </ChartContainer>
        </div>
      </div>

      {/* Full Detailed Data Table */}
      <ChartContainer title="Complete Regional Breakdown" description="Full searchable list of all individual BAC visit records">
        <DataTable data={filteredData} columns={columns} searchKey="bac_name" onExport={() => {}} />
      </ChartContainer>
    </div>
  );
}