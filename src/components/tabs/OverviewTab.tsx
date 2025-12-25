import { useMemo, useState, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import IndiaMap from '@/components/map/IndiaMap';
import MapLegend from '@/components/map/MapLegend'; // Ensure this is imported
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Globe, Landmark, Building2, MapPin, Box,
  CheckCircle2, GraduationCap, Microscope, ClipboardList
} from 'lucide-react';
import ChartContainer from '@/components/shared/ChartContainer';
import { getGeoMetrics } from '@/utils/geoMetrics';
import MapBreadcrumb from '@/components/map/MapBreadcrumb';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type MetricContext = 'SLO' | 'TLM' | 'CRO' | 'Visit';

export default function OverviewTab() {
  const { state, dispatch } = useDashboard();
  const { filteredData, mapState, rawData } = state;
  const [blockSchools, setBlockSchools] = useState<any[]>([]);
  const [activeContext, setActiveContext] = useState<MetricContext>('Visit');

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

  useEffect(() => {
    if (mapState.currentLevel === 'block' && mapState.selectedBlock) {
      fetch(`http://localhost:3000/api/schools?block=${mapState.selectedBlock}`)
        .then(res => res.json())
        .then(data => setBlockSchools(data))
        .catch(() => setBlockSchools([]));
    } else {
      setBlockSchools([]);
    }
  }, [mapState.currentLevel, mapState.selectedBlock]);

  const calculateMetric = (data: any[], context: MetricContext) => {
    if (!data || data.length === 0) return 0;
    switch (context) {
      case 'Visit':
        const target = data.reduce((s, r) => s + (r.target_visits || 0), 0);
        const actual = data.reduce((s, r) => s + (r.actual_visits || 0), 0);
        return target > 0 ? (actual / target) * 100 : 0;
      case 'CRO':
        const obs = data.reduce((s, r) => s + (r.classroom_obs || 0), 0);
        return Math.min(100, (obs / (data.length * 2)) * 100);
      case 'SLO':
        const slo = data.reduce((s, r) => s + (r.slo_score || 0), 0);
        return (slo / (data.length * 100)) * 100;
      case 'TLM':
        const tlm = data.reduce((s, r) => s + (r.tlm_usage || 0), 0);
        return (tlm / data.length) * 100;
      default: return 0;
    }
  };

  const hierarchy = useMemo(() => {
    const calc = (data: any[], name: string) => {
      const achievement = calculateMetric(data, activeContext);
      const visits = data.reduce((s, r) => s + (r.actual_visits || 0), 0);
      const obs = data.reduce((s, r) => s + (r.classroom_obs || 0), 0);
      const uniqueSchools = new Set(data.map(r => r.school_id)).size;
      const metrics = getGeoMetrics(name);

      return {
        name, achievement, visits, obs,
        schools_covered: uniqueSchools,
        total_schools_master: metrics.total_schools,
        area: metrics.area_sqkm,
        contextValue: activeContext === 'Visit' ? visits : activeContext === 'CRO' ? obs : Math.round(achievement)
      };
    };

    return {
      national: calc(rawData, "India"),
      state: mapState.selectedState ? calc(rawData.filter(d => d.state === mapState.selectedState), mapState.selectedState) : null,
      district: mapState.selectedDistrict ? calc(rawData.filter(d => d.district === mapState.selectedDistrict), mapState.selectedDistrict) : null,
      block: mapState.selectedBlock ? calc(rawData.filter(d => d.block === mapState.selectedBlock), mapState.selectedBlock) : null,
    };
  }, [rawData, mapState, activeContext]);

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
    <div className="flex flex-col lg:flex-row gap-4 p-4 h-[calc(100vh-109px)] overflow-hidden">
      <div className="flex-1 min-h-0 flex flex-col">
        <ChartContainer
          title={
            <div className='w-[1200px] flex text-center align-middle justify-between items-center'>
              <div className="flex items-center w-full pr-4 gap-4">
                <Tabs
                  value={activeContext}
                  onValueChange={(val) => setActiveContext(val as MetricContext)}
                  className="w-auto"
                >
                  <TabsList className="bg-white gap-1">
                    {[
                      { id: 'SLO', icon: GraduationCap, label: 'SLO' },
                      { id: 'TLM', icon: Microscope, label: 'TLM' },
                      { id: 'CRO', icon: ClipboardList, label: 'CRO' },
                      { id: 'Visit', icon: CheckCircle2, label: 'Visit' }
                    ].map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="
          relative px-4 py-1.5 text-[11px] font-semibold tracking-wide uppercase transition-all duration-300 ease-out
          data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm
          data-[state=active]:ring-1 data-[state=active]:ring-primary/10 rounded-lg
          hover:bg-background/50 hover:text-foreground
          flex items-center gap-2 border
        "
                      >
                        <tab.icon className={`w-3.5 h-3.5 transition-transform duration-300 ${activeContext === tab.id ? 'scale-110' : 'opacity-70'}`} />
                        <span>{tab.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <MapBreadcrumb
                  currentLevel={mapState.currentLevel}
                  selectedState={mapState.selectedState}
                  selectedDistrict={mapState.selectedDistrict}
                  selectedBlock={mapState.selectedBlock}
                  onNavigate={handleBreadcrumbNavigate}
                />
              </div>
              <div className="">
                <span className="text-sm font-bold truncate">
                  {activeContext} : {mapState.currentLevel === 'national' ? "All India" : (mapState.selectedState || 'State')}
                </span>
              </div>
            </div>
          }
          className="flex-1"
        >
          <div className="h-full w-full flex flex-col p-4 relative"> {/* Added relative here */}

            <div className="h-[calc(90vh-160px)] relative"> {/* Added relative here */}
              <IndiaMap
                data={filteredData.map((d: any) => ({
                  ...d,
                  achievement: calculateMetric([d], activeContext)
                }))}
                schoolPins={blockSchools}
                onRegionClick={handleRegionClick}
                currentLevel={mapState.currentLevel}
                selectedState={mapState.selectedState}
                selectedDistrict={mapState.selectedDistrict}
                selectedBlock={mapState.selectedBlock}
                colorMetric="achievement"
              />

              {/* Using the shared Legend Component */}
              <div className="absolute bottom-6 left-6 z-20">
                <MapLegend
                  colorMetric={activeContext === 'Visit' ? 'visits' : 'achievement'}
                  minValue={0}
                  maxValue={activeContext === 'Visit' ? 5000 : 100}
                />
              </div>
            </div>
          </div>
        </ChartContainer>
      </div>

      {/* Hierarchy Overview sidebar remains same */}
      <div className="lg:w-80 flex flex-col min-h-0">
        <Card className="flex-1 flex flex-col border-muted/40 bg-card/50 backdrop-blur-sm shadow-lg overflow-hidden">
          <CardHeader className="py-3 border-b shrink-0">
            <CardTitle className="text-xs font-bold flex items-center gap-2 text-muted-foreground uppercase tracking-widest">
              <MapPin className="w-3.5 h-3.5 text-primary" /> Hierarchy Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 scrollbar-hide">
            <div className="space-y-6">
              <Node label="National" data={hierarchy.national} icon={<Globe className="w-4 h-4" />} color="bg-primary" context={activeContext} />
              {hierarchy.state && <Node label="State" data={hierarchy.state} icon={<Landmark className="w-4 h-4" />} color="bg-blue-500" context={activeContext} />}
              {hierarchy.district && <Node label="District" data={hierarchy.district} icon={<Building2 className="w-4 h-4" />} color="bg-indigo-500" context={activeContext} />}
              {hierarchy.block && <Node label="Block" data={hierarchy.block} icon={<Box className="w-4 h-4" />} color="bg-emerald-500" context={activeContext} />}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const Node = ({ label, data, icon, color, context }: any) => (
  <div className="relative pl-8 border-l-2 border-muted/30 ml-2">
    <div className={`absolute left-[-13px] top-0 w-6 h-6 rounded-full ${color} flex items-center justify-center text-white shadow-sm z-10`}>
      {icon}
    </div>
    <div className="bg-background border rounded-lg p-3 space-y-2 shadow-sm">
      <div className="flex justify-between items-center border-b pb-1">
        <span className="text-[11px] font-bold truncate pr-1">{data.name}</span>
        <span className="text-xs font-black text-primary">{data.achievement.toFixed(1)}%</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <MetricItem label="Schools" value={`${data.schools_covered}/${data.total_schools_master}`} color="text-orange-500" />
        <MetricItem label={context} value={data.contextValue} color="text-blue-500" />
      </div>
    </div>
  </div>
);

const MetricItem = ({ label, value, color }: any) => (
  <div className="flex flex-col p-1 bg-muted/30 rounded">
    <span className="text-[7px] font-bold uppercase text-muted-foreground mb-0.5">{label}</span>
    <p className={`text-[10px] font-bold ${color}`}>{value}</p>
  </div>
);