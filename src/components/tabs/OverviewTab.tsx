import { useMemo, useState, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import IndiaMap from '@/components/map/IndiaMap';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Globe, Landmark, Building2, MapPin, Box, Eye, School as SchoolIcon, Users, Maximize, Zap, Hash } from 'lucide-react';
import ChartContainer from '@/components/shared/ChartContainer';
import { getGeoMetrics } from '@/utils/geoMetrics';
import MapBreadcrumb from '@/components/map/MapBreadcrumb';

export default function OverviewTab() {
  const { state, dispatch } = useDashboard();
  const { filteredData, mapState, rawData } = state;
  const [blockSchools, setBlockSchools] = useState<any[]>([]);

  const handleBreadcrumbNavigate = (level: any) => {
    const payload: any = { currentLevel: level };

    if (level === 'national') {
      payload.selectedState = null;
      payload.selectedDistrict = null;
      payload.selectedBlock = null;
    } else if (level === 'state') {
      payload.selectedDistrict = null;
      payload.selectedBlock = null;
    } else if (level === 'district') {
      payload.selectedBlock = null;
    }

    dispatch({ type: 'SET_MAP_STATE', payload });
  };

  // Fetch Logic
  useEffect(() => {
    if (mapState.currentLevel === 'block' && mapState.selectedBlock) {
      fetch(`http://localhost:3001/schools?block=${mapState.selectedBlock}`)
        .then(res => res.json())
        .then(data => setBlockSchools(data))
        .catch(() => setBlockSchools([]));
    } else {
      setBlockSchools([]);
    }
  }, [mapState.currentLevel, mapState.selectedBlock]);

  // Metric Calculations
  const hierarchy = useMemo(() => {
    const calc = (data: any[], name: string) => {
      const target = data.reduce((s, r) => s + (r.target_visits || 0), 0);
      const actual = data.reduce((s, r) => s + (r.actual_visits || 0), 0);
      const obs = data.reduce((s, r) => s + (r.classroom_obs || 0), 0);
      const uniqueSchools = new Set(data.map(r => r.school_id)).size;
      const uniqueBacs = new Set(data.map(r => r.bac_id)).size;
      const metrics = getGeoMetrics(name);

      return {
        name,
        achievement: target > 0 ? (actual / target) * 100 : 0,
        visits: actual,
        obs,
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
    const levels = { national: 'state', state: 'district', district: 'block' };
    const nextLevel = levels[mapState.currentLevel as keyof typeof levels];
    if (nextLevel) {
      dispatch({
        type: 'SET_MAP_STATE', payload: {
          currentLevel: nextLevel,
          [`selected${nextLevel.charAt(0).toUpperCase() + nextLevel.slice(1)}`]: region.name
        }
      });
    }
  };

  return (
    /**
     * 1. FIXED VIEWPORT CONTAINER
     * We use calc(100vh - 120px) to account for the top navigation and filter bars.
     */
    <div className="flex flex-col lg:flex-row gap-4 p-4 h-[calc(100vh-120px)] overflow-hidden">

      {/* 2. FLEXIBLE MAP SECTION (75% width on large screens) */}  
      <div className="flex-1 lg:flex-[3] min-h-0 flex flex-col">
        <ChartContainer
          title={mapState.currentLevel === 'national' ? "All India" : `${mapState.selectedState || 'State'}`}
          className="flex-1"
        >
          <div className="h-full w-full flex flex-col p-4">
            <MapBreadcrumb
              currentLevel={mapState.currentLevel}
              selectedState={mapState.selectedState}
              selectedDistrict={mapState.selectedDistrict}
              selectedBlock={mapState.selectedBlock}
              onNavigate={handleBreadcrumbNavigate}
            />
            {/* We use h-full to ensure the map fills the remaining space of ChartContainer */}
            <div className="h-[600px]">
              <IndiaMap
                data={filteredData.map((d: any) => ({
                  ...d,
                  achievement: d.target_visits > 0 ? (d.actual_visits / d.target_visits) * 100 : 0
                }))}
                schoolPins={blockSchools}
                onRegionClick={handleRegionClick}
                currentLevel={mapState.currentLevel}
                selectedState={mapState.selectedState}
                selectedDistrict={mapState.selectedDistrict}
                selectedBlock={mapState.selectedBlock}
                colorMetric="achievement"
              />
            </div>
          </div>
        </ChartContainer>
      </div>

      {/* 3. FIXED SIDEBAR SECTION (25% / 384px width) */}
      <div className="lg:w-96 flex flex-col min-h-0">
        <Card className="flex-1 flex flex-col border-muted/40 bg-card/50 backdrop-blur-sm overflow-hidden shadow-lg">
          <CardHeader className="py-4 border-b shrink-0">
            <CardTitle className="text-xs font-bold flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
              <MapPin className="w-3.5 h-3.5 text-primary" /> Hierarchy Tree
            </CardTitle>
          </CardHeader>

          {/* Scrollable content area only for the hierarchy nodes */}
          <CardContent className="flex-1 overflow-y-auto scrollbar-hide p-4 relative">
            <div className="absolute left-[31px] top-6 bottom-6 w-[1px] bg-muted-foreground/20" />
            <div className="space-y-8 relative">
              <Node label="National" data={hierarchy.national} icon={<Globe className="w-4 h-4" />} color="bg-primary" />
              {hierarchy.state && <Node label="State" data={hierarchy.state} icon={<Landmark className="w-4 h-4" />} color="bg-blue-500" />}
              {hierarchy.district && <Node label="District" data={hierarchy.district} icon={<Building2 className="w-4 h-4" />} color="bg-indigo-500" />}
              {hierarchy.block && <Node label="Block" data={hierarchy.block} icon={<Box className="w-4 h-4" />} color="bg-emerald-500" />}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const Node = ({ label, data, icon, color }: any) => (
  <div className="relative pl-10">
    <div className={`absolute left-[-14px] top-0 w-8 h-8 rounded-full ${color} border-4 border-background flex items-center justify-center text-white shadow-sm z-10`}>
      {icon}
    </div>
    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
    <div className="bg-background/80 p-3 rounded-lg border shadow-sm space-y-2">
      <div className="flex justify-between items-center border-b pb-1.5">
        <span className="text-xs font-bold truncate pr-2">{data.name}</span>
        <span className="text-sm font-black text-primary">{data.achievement.toFixed(1)}%</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <MetricItem label="Schools" value={`${data.schools_covered}/${data.total_schools_master}`} color="text-orange-500" />
        <MetricItem label="BACs" value={data.bacs_active} color="text-blue-500" />
        <MetricItem label="Area" value={`${Math.round(data.area).toLocaleString()}`} color="text-gray-500" />
        <MetricItem label="Visits" value={data.visits} color="text-yellow-500" />
      </div>
    </div>
  </div>
);

const MetricItem = ({ label, value, color }: any) => (
  <div className="flex flex-col p-1 bg-muted/20 rounded border border-muted/10">
    <span className="text-[7px] font-bold uppercase text-muted-foreground leading-none mb-0.5">{label}</span>
    <p className={`text-[10px] font-bold ${color} leading-none`}>{value}</p>
  </div>
);