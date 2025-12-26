import { useMemo, useState, useEffect } from 'react';
import { useDashboard, VisitRecord } from '@/context/DashboardContext';
import IndiaMap from '@/components/map/IndiaMap';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Globe, Landmark, Building2, MapPin, Box,
  CheckCircle2, GraduationCap, Microscope, ClipboardList,
  Target, Activity, Eye, School, BookOpen, Calculator
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

  const currentFocus = useMemo(() => {
    const level = mapState.currentLevel;
    let name = "India";
    let data = rawData;

    if (level === 'state' && mapState.selectedState) {
      name = mapState.selectedState;
      data = rawData.filter(d => d.state?.toLowerCase() === name.toLowerCase());
    } else if (level === 'district' && mapState.selectedDistrict) {
      name = mapState.selectedDistrict;
      data = rawData.filter(d => d.district?.toLowerCase() === name.toLowerCase());
    } else if (level === 'block' && mapState.selectedBlock) {
      name = mapState.selectedBlock;
      data = rawData.filter(d => d.block?.toLowerCase() === name.toLowerCase());
    }

    const totalRecords = data.length;
    const schoolsCovered = new Set(data.map(r => r.school_id)).size;
    const geo = getGeoMetrics(name);

    // 1. Aggregating Main Metrics
    const actual = data.reduce((s, r) => s + (r.actual_visits || 0), 0);
    const target = data.reduce((s, r) => s + (r.target_visits || 0), 0);
    const obs = data.reduce((s, r) => s + (r.classroom_obs || 0), 0);

    // 2. Aggregating SSI/Practice Details
    const practiceCounts = {
      ss2: 0, ss3: 0,
      pp1: 0, pp2: 0, pp3: 0, pp4: 0,
      gp1: 0, gp2: 0, gp3: 0
    };

    data.forEach(r => {
      // @ts-ignore (Assuming backend sends these based on previous code)
      if (r.ssi2_effective) practiceCounts.ss2++;
      // @ts-ignore
      if (r.ssi3_effective) practiceCounts.ss3++;
      
      if (r.practices) {
        if (r.practices.pp1) practiceCounts.pp1++;
        if (r.practices.pp2) practiceCounts.pp2++;
        if (r.practices.pp3) practiceCounts.pp3++;
        if (r.practices.pp4) practiceCounts.pp4++;
        if (r.practices.gp1) practiceCounts.gp1++;
        if (r.practices.gp2) practiceCounts.gp2++;
        if (r.practices.gp3) practiceCounts.gp3++;
      }
    });

    const getPerc = (count: number) => totalRecords > 0 ? (count / totalRecords) * 100 : 0;

    return {
      level, name, actual, target, obs,
      schools: schoolsCovered,
      totalSchools: geo.total_schools,
      achievement: target > 0 ? (actual / target) * 100 : 0,
      practices: {
        ss2: getPerc(practiceCounts.ss2),
        ss3: getPerc(practiceCounts.ss3),
        pp1: getPerc(practiceCounts.pp1),
        pp2: getPerc(practiceCounts.pp2),
        pp3: getPerc(practiceCounts.pp3),
        pp4: getPerc(practiceCounts.pp4),
        gp1: getPerc(practiceCounts.gp1),
        gp2: getPerc(practiceCounts.gp2),
        gp3: getPerc(practiceCounts.gp3),
      }
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
    <div className="flex flex-col lg:flex-row gap-4 p-4 h-[calc(100vh-109px)] overflow-hidden">
      <div className="flex-1 min-h-0 flex flex-col">
        <ChartContainer
          title={
            <div className='w-[1200px] flex text-center align-middle justify-between items-center'>
              <div className="flex items-center w-full pr-4 gap-4">
                <Tabs value={activeContext} onValueChange={(val) => setActiveContext(val as MetricContext)} className="w-auto">
                  <TabsList className="bg-white gap-1">
                    {[
                      { id: 'SLO', icon: GraduationCap, label: 'SLO' },
                      { id: 'TLM', icon: Microscope, label: 'TLM' },
                      { id: 'CRO', icon: ClipboardList, label: 'CRO' },
                      { id: 'Visit', icon: CheckCircle2, label: 'Visit' }
                    ].map((tab) => (
                      <TabsTrigger key={tab.id} value={tab.id} className="relative px-4 py-1.5 text-[11px] font-semibold tracking-wide uppercase transition-all duration-300 border rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary">
                        <tab.icon className={`w-3.5 h-3.5 mr-2 ${activeContext === tab.id ? 'scale-110' : 'opacity-70'}`} />
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
            </div>
          }
          className="flex-1"
        >
          <div className="h-[calc(90vh-160px)] relative">
            <IndiaMap
              data={filteredData.map((d: any) => ({
                ...d,
                achievement: totalAchievement(d, activeContext)
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
        </ChartContainer>
      </div>

      <div className="lg:w-80 flex flex-col min-h-0">
        <Card className="flex-1 border-muted/40 bg-card/50 backdrop-blur-sm shadow-lg overflow-hidden flex flex-col">
          <CardHeader className="py-4 border-b bg-primary/5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Current Level: {currentFocus.level}</span>
            </div>
            <CardTitle className="text-xl font-bold capitalize flex items-center gap-2">
              {currentFocus.level === 'national' ? <Globe className="w-5 h-5" /> : 
               currentFocus.level === 'state' ? <Landmark className="w-5 h-5" /> :
               currentFocus.level === 'district' ? <Building2 className="w-5 h-5" /> : <Box className="w-5 h-5" />}
              {currentFocus.name}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-hide">
            {/* 1. Visit Adherence */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                <Activity className="w-3 h-3" /> Visit Adherence
              </h4>
              <div className="bg-background border rounded-xl p-3 flex justify-between items-center shadow-sm">
                 <div>
                   <p className="text-2xl font-black text-primary">{currentFocus.achievement.toFixed(1)}%</p>
                   <p className="text-[10px] text-muted-foreground">Compliance Rate</p>
                 </div>
                 <div className="text-right">
                   <p className="text-sm font-bold">{currentFocus.actual} / {currentFocus.target}</p>
                   <p className="text-[10px] text-muted-foreground uppercase">Actual vs Target</p>
                 </div>
              </div>
            </div>

            {/* 2. SSI Breakdown Section */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                <Target className="w-3 h-3" /> Practice Quality Breakdown (SSI)
              </h4>
              
              {/* Process Effectiveness Cards */}
              <div className="grid grid-cols-2 gap-2">
                <MiniScoreCard label="SS2 Effective" value={currentFocus.practices.ss2} color="bg-indigo-500" />
                <MiniScoreCard label="SS3 Effective" value={currentFocus.practices.ss3} color="bg-blue-500" />
              </div>

              {/* Pedagogy Practices (PP) */}
              <div className="space-y-1.5">
                <p className="text-[9px] font-bold text-muted-foreground flex items-center gap-1">
                  <BookOpen className="w-2.5 h-2.5" /> Priortize Practices
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {['pp1', 'pp2', 'pp3', 'pp4'].map(p => (
                    <PracticeBox key={p} label={p.toUpperCase()} value={currentFocus.practices[p as keyof typeof currentFocus.practices]} />
                  ))}
                </div>
              </div>

              {/* Guided Practices (GP) */}
              <div className="space-y-1.5">
                <p className="text-[9px] font-bold text-muted-foreground flex items-center gap-1">
                  <Calculator className="w-2.5 h-2.5" /> General Practices
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {['gp1', 'gp2', 'gp3'].map(p => (
                    <PracticeBox key={p} label={p.toUpperCase()} value={currentFocus.practices[p as keyof typeof currentFocus.practices]} />
                  ))}
                </div>
              </div>
            </div>

            {/* 3. CRO Info */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                <Eye className="w-3 h-3" /> Observations
              </h4>
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex items-center justify-between shadow-sm">
                 <div className="flex items-center gap-3">
                    <ClipboardList className="w-5 h-5 text-blue-600" />
                    <span className="text-[10px] text-muted-foreground uppercase font-bold leading-tight">Total<br/>Classroom Obs</span>
                 </div>
                 <p className="text-xl font-black text-blue-700">{currentFocus.obs}</p>
              </div>
            </div>

            {/* 4. School Coverage */}
            <div className="pt-2 border-t mt-4">
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2">
                   <School className="w-4 h-4 text-orange-500" />
                   <span className="text-xs font-bold uppercase text-[10px]">Schools Covered</span>
                </div>
                <span className="text-[11px] font-black bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full">
                  {currentFocus.schools} / {currentFocus.totalSchools}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Sub-components for SSI display
const MiniScoreCard = ({ label, value, color }: any) => (
  <div className="bg-background border rounded-lg p-2 shadow-sm border-l-4" style={{ borderLeftColor: `var(--${color})` }}>
    <p className="text-[8px] font-bold text-muted-foreground uppercase mb-1">{label}</p>
    <div className="flex items-baseline gap-1">
      <span className="text-sm font-black">{value.toFixed(0)}%</span>
      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  </div>
);

const PracticeBox = ({ label, value }: any) => (
  <div className="bg-background border rounded-md p-1.5 text-center shadow-sm">
    <p className="text-[8px] font-bold text-muted-foreground mb-1">{label}</p>
    <p className={`text-[10px] font-black ${value > 70 ? 'text-emerald-600' : value > 40 ? 'text-orange-500' : 'text-red-500'}`}>
      {Math.round(value)}%
    </p>
  </div>
);

function totalAchievement(d: any, context: string) {
  if (context === 'Visit') return (d.actual_visits / d.target_visits) * 100 || 0;
  if (context === 'CRO') return (d.classroom_obs / 2) * 100 || 0;
  if (context === 'SLO') return d.slo_score || 0;
  return 0;
}