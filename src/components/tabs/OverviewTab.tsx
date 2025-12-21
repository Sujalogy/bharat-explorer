import { useMemo } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import IndiaMap from '@/components/map/IndiaMap';
import KPICard from '@/components/shared/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Landmark, Building2, MapPin, Box } from 'lucide-react';
import ChartContainer from '@/components/shared/ChartContainer';

export default function OverviewTab() {
  const { state, dispatch } = useDashboard();
  const { filteredData, mapState, rawData } = state;

  // Calculate hierarchy metrics for the tree card
  const hierarchy = useMemo(() => {
    const calc = (data: any[]) => {
      const target = data.reduce((s, r) => s + (r.target_visits || 0), 0);
      const actual = data.reduce((s, r) => s + (r.actual_visits || 0), 0);
      return { achievement: target > 0 ? (actual / target) * 100 : 0, visits: actual };
    };
    return {
      national: { name: "India", ...calc(rawData) },
      state: mapState.selectedState ? { 
        name: mapState.selectedState, 
        ...calc(rawData.filter(d => d.state === mapState.selectedState)) 
      } : null,
      district: mapState.selectedDistrict ? { 
        name: mapState.selectedDistrict, 
        ...calc(rawData.filter(d => d.district === mapState.selectedDistrict)) 
      } : null,
      block: mapState.selectedBlock ? { 
        name: mapState.selectedBlock, 
        ...calc(rawData.filter(d => d.block === mapState.selectedBlock)) 
      } : null,
    };
  }, [rawData, mapState]);

  const handleRegionClick = (region: any) => {
    if (mapState.currentLevel === 'national') {
      dispatch({ type: 'SET_MAP_STATE', payload: { currentLevel: 'state', selectedState: region.name } });
    } else if (mapState.currentLevel === 'state') {
      dispatch({ type: 'SET_MAP_STATE', payload: { currentLevel: 'district', selectedDistrict: region.name } });
    } else {
      // Deep dive from District to Block level
      dispatch({ type: 'SET_MAP_STATE', payload: { currentLevel: 'block', selectedBlock: region.name } });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
      {/* Map Section with restored size */}
      <div className="lg:col-span-8">
        <ChartContainer 
          title={mapState.currentLevel === 'national' ? "India Map" : `${mapState.selectedState || 'State'} Overview`} 
          className="h-[600px]"
        >
          <div className="h-[520px]">
            <IndiaMap
              data={filteredData.map((d: any) => ({ ...d, achievement: (d.actual_visits/d.target_visits)*100 }))}
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

      {/* Professional Tree Section */}
      <div className="lg:col-span-4">
        <Card className="h-[600px] bg-card/50 backdrop-blur-sm relative border-muted/40 p-6 overflow-hidden">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> 
              Hierarchy Tree
            </CardTitle>
          </CardHeader>
          
          <div className="absolute left-[39px] top-24 bottom-20 w-0.5 bg-muted-foreground/20" />
          
          <div className="space-y-12 relative">
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
    <div className="flex justify-between items-center bg-background p-3 rounded-lg border shadow-sm">
      <span className="text-sm font-bold truncate pr-2">{data.name}</span>
      <span className="text-lg font-black text-primary">{data.achievement.toFixed(1)}%</span>
    </div>
  </div>
);