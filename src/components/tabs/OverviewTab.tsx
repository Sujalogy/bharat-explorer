import { useMemo } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import IndiaMap from '@/components/map/IndiaMap';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Globe, Landmark, Building2, MapPin, Box, Eye,
  School, Users, Maximize, Hash, Zap
} from 'lucide-react';
import ChartContainer from '@/components/shared/ChartContainer';
// Import the utility created in the previous step
import { getGeoMetrics } from '@/utils/geoMetrics';

export default function OverviewTab() {
  const { state, dispatch } = useDashboard();
  const { filteredData, mapState, rawData } = state;

  const hierarchy = useMemo(() => {
    const calc = (data: any[], name: string) => {
      // 1. Performance Metrics from db.json
      const target = data.reduce((s, r) => s + (r.target_visits || 0), 0);
      const actual = data.reduce((s, r) => s + (r.actual_visits || 0), 0);
      const obs = data.reduce((s, r) => s + (r.classroom_obs || 0), 0);

      // Calculate unique counts from actual visit records
      const uniqueSchools = new Set(data.map(r => r.school_id)).size;
      const uniqueBacs = new Set(data.map(r => r.bac_id)).size;

      // 2. Geographic & Master Metrics from geoMetrics.ts
      const metrics = getGeoMetrics(name);

      return {
        name,
        achievement: target > 0 ? (actual / target) * 100 : 0,
        visits: actual,
        obs: obs,
        schools_covered: uniqueSchools,
        bacs_active: uniqueBacs,
        area: metrics.area_sqkm,
        density: metrics.population_density,
        total_schools_master: metrics.total_schools
      };
    };

    return {
      national: calc(rawData, "India"),
      state: mapState.selectedState ? calc(rawData.filter(d => d.state === mapState.selectedState), mapState.selectedState) : null,
      district: mapState.selectedDistrict ? calc(rawData.filter(d => d.district === mapState.selectedDistrict), mapState.selectedDistrict) : null,
      block: mapState.selectedBlock ? calc(rawData.filter(d => d.block === mapState.selectedBlock), mapState.selectedBlock) : null,
    };
  }, [rawData, mapState]);

  const handleRegionClick = (region: any) => {
    if (mapState.currentLevel === 'national') {
      dispatch({ type: 'SET_MAP_STATE', payload: { currentLevel: 'state', selectedState: region.name } });
    } else if (mapState.currentLevel === 'state') {
      dispatch({ type: 'SET_MAP_STATE', payload: { currentLevel: 'district', selectedDistrict: region.name } });
    } else {
      dispatch({ type: 'SET_MAP_STATE', payload: { currentLevel: 'block', selectedBlock: region.name } });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
      {/* Map Section */}
      <div className="lg:col-span-8">
        <ChartContainer
          title={mapState.currentLevel === 'national' ? "India Map" : `${mapState.selectedState || 'State'} Overview`}
          className="h-[800px]"
        >
          <div className="h-[700px]">
            <IndiaMap
              data={filteredData.map((d: any) => ({
                ...d,
                achievement: d.target_visits > 0 ? (d.actual_visits / d.target_visits) * 100 : 0
              }))}
              onRegionClick={handleRegionClick}
              currentLevel={mapState.currentLevel}
              selectedState={mapState.selectedState}
              selectedDistrict={mapState.selectedDistrict}
              selectedBlock={mapState.selectedBlock}
              colorMetric="achievement"
            />
          </div>
        </ChartContainer>
      </div>

      {/* Hierarchy & Metrics Sidebar */}
      <div className="lg:col-span-4">
        <Card className="h-[800px] bg-card/50 backdrop-blur-sm relative border-muted/40 p-6 overflow-hidden overflow-y-auto scrollbar-hide">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Regional Profile & Coverage
            </CardTitle>
          </CardHeader>

          <div className="absolute left-[39px] top-24 bottom-20 w-0.5 bg-muted-foreground/20" />

          <div className="space-y-10 relative">
            <Node label="National" data={hierarchy.national} icon={<Globe className="w-3.5 h-3.5" />} color="bg-primary" />
            {hierarchy.state && <Node label="State" data={hierarchy.state} icon={<Landmark className="w-3.5 h-3.5" />} color="bg-blue-500" />}
            {hierarchy.district && <Node label="District" data={hierarchy.district} icon={<Building2 className="w-3.5 h-3.5" />} color="bg-indigo-500" />}
            {hierarchy.block && <Node label="Block" data={hierarchy.block} icon={<Box className="w-3.5 h-3.5" />} color="bg-emerald-500" />}
          </div>
        </Card>
      </div>
    </div>
  );
}

const Node = ({ label, data, icon, color }: any) => (
  <div className="relative pl-12 animate-fade-in">
    <div className={`absolute left-[-22px] top-1 w-6 h-6 rounded-full ${color} border-4 border-background flex items-center justify-center text-white p-1 shadow-sm`}>
      {icon}
    </div>
    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
    <div className="bg-background p-4 rounded-lg border shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b pb-2">
        <span className="text-sm font-bold truncate pr-2">{data.name}</span>
        <div className="text-right">
          <span className="text-lg font-black text-primary leading-none block">
            {data.achievement.toFixed(1)}%
          </span>
          <span className="text-[9px] text-muted-foreground uppercase font-medium">Achievement</span>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricItem icon={<School className="w-3 h-3" />} label="School Coverage" value={`${data.schools_covered}/${data.total_schools_master}`} color="text-orange-500" />
        <MetricItem icon={<Users className="w-3 h-3" />} label="Active BACs" value={data.bacs_active} color="text-blue-500" />
        <MetricItem icon={<Zap className="w-3 h-3" />} label="Actual Visits" value={data.visits} color="text-yellow-500" />
        <MetricItem icon={<Eye className="w-3 h-3" />} label="Observations" value={data.obs} color="text-purple-500" />
      </div>
    </div>
  </div>
);

const MetricItem = ({ icon, label, value, color }: any) => (
  <div className="flex flex-col p-2 rounded-lg bg-muted/30 border border-muted/20 hover:border-muted-foreground/20 transition-colors">
    <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">
      <span className={color}>{icon}</span>
      <span className="text-[9px] font-bold uppercase tracking-tight">{label}</span>
    </div>
    <p className="text-xs font-black tabular-nums">{value}</p>
  </div>
);