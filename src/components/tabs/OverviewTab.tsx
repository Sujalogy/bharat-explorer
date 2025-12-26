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

    const actual = data.reduce((s, r) => s + (r.actual_visits || 0), 0);
    const target = data.reduce((s, r) => s + (r.target_visits || 0), 0);
    const obs = data.reduce((s, r) => s + (r.classroom_obs || 0), 0);

    const practiceCounts = {
      ss2: 0, ss3: 0,
      pp1: 0, pp2: 0, pp3: 0, pp4: 0,
      gp1: 0, gp2: 0, gp3: 0
    };

    data.forEach(r => {
      if (r.ssi2_effective) practiceCounts.ss2++;
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
      
      {/* 70% MAP SECTION */}
      <div className="lg:w-[70%] min-h-0 flex flex-col">
        <ChartContainer
          title={
            <div className='flex items-center justify-between w-full'>
              <div className="flex items-center gap-4">
                <Tabs value={activeContext} onValueChange={(val) => setActiveContext(val as MetricContext)} className="w-auto">
                  <TabsList className="bg-white gap-1">
                    {[
                      { id: 'SLO', icon: GraduationCap, label: 'SLO' },
                      { id: 'TLM', icon: Microscope, label: 'TLM' },
                      { id: 'CRO', icon: ClipboardList, label: 'CRO' },
                      { id: 'Visit', icon: CheckCircle2, label: 'Visit' }
                    ].map((tab) => (
                      <TabsTrigger key={tab.id} value={tab.id} className="relative px-3 py-1 text-[11px] font-semibold tracking-wide uppercase transition-all border rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary">
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
          <div className="h-[calc(90vh-160px)]">
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
              colorScale={[0, 100]}
            />
          </div>
        </ChartContainer>
      </div>

      {/* 30% SIDE CARD */}
      <div className="lg:w-[30%] flex flex-col min-h-0">
        <Card className="flex-1 overflow-hidden flex flex-col shadow-lg border-muted/40">
          <CardHeader className="py-4 border-b bg-slate-50">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                Level: {currentFocus.level}
              </span>
            </div>
            <CardTitle className="text-xl font-bold capitalize flex items-center gap-2">
              {currentFocus.level === 'national' ? <Globe className="w-5 h-5 text-blue-500" /> : 
               currentFocus.level === 'state' ? <Landmark className="w-5 h-5 text-indigo-500" /> :
               currentFocus.level === 'district' ? <Building2 className="w-5 h-5 text-teal-500" /> : <Box className="w-5 h-5" />}
              {currentFocus.name}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-hide">
            {/* 1. Visit Adherence */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                <Activity className="w-3 h-3" /> Overall Adherence
              </h4>
              <div className="bg-white border rounded-xl p-3 flex justify-between items-center shadow-sm">
                 <div>
                   <p className={`text-2xl font-black ${getColorClass(currentFocus.achievement)}`}>
                     {currentFocus.achievement.toFixed(1)}%
                   </p>
                   <p className="text-[10px] text-muted-foreground">Compliance</p>
                 </div>
                 <div className="text-right">
                   <p className="text-sm font-bold text-slate-700">{currentFocus.actual} / {currentFocus.target}</p>
                   <p className="text-[10px] text-muted-foreground uppercase font-medium">Completed</p>
                 </div>
              </div>
            </div>

            {/* 2. SSI Breakdown */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                <Target className="w-3 h-3" /> Practice Quality (SSI)
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <MiniScoreCard label="SS2 Effective" value={currentFocus.practices.ss2} />
                <MiniScoreCard label="SS3 Effective" value={currentFocus.practices.ss3} />
              </div>

              <div className="space-y-1.5 pt-1">
                <p className="text-[9px] font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-tight">
                  <BookOpen className="w-2.5 h-2.5" /> Pedagogy Practices
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {['pp1', 'pp2', 'pp3', 'pp4'].map(p => (
                    <PracticeBox key={p} label={p.toUpperCase()} value={currentFocus.practices[p as keyof typeof currentFocus.practices]} />
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[9px] font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-tight">
                  <Calculator className="w-2.5 h-2.5" /> General Practices
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {['gp1', 'gp2', 'gp3'].map(p => (
                    <PracticeBox key={p} label={p.toUpperCase()} value={currentFocus.practices[p as keyof typeof currentFocus.practices]} />
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Observations */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                <Eye className="w-3 h-3" /> Classroom Insights
              </h4>
              <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <ClipboardList className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-[10px] text-blue-900 uppercase font-bold leading-tight">Total<br/>Classroom Obs</span>
                 </div>
                 <p className="text-xl font-black text-blue-700">{currentFocus.obs}</p>
              </div>
            </div>

            <div className="pt-2 border-t mt-4 flex justify-between items-center px-1">
              <div className="flex items-center gap-2">
                 <School className="w-4 h-4 text-orange-500" />
                 <span className="text-xs font-bold uppercase text-[10px] text-slate-600">Schools Coverage</span>
              </div>
              <span className="text-[11px] font-black bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full">
                {currentFocus.schools} / {currentFocus.totalSchools}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Unified Color Logic: Red -> Yellow -> Green
function getColorClass(val: number) {
  if (val < 45) return 'text-rose-600';     // Red (Low)
  if (val < 75) return 'text-amber-500';    // Yellow (Mid)
  return 'text-emerald-600';               // Green (High)
}

function getBgColorClass(val: number) {
  if (val < 45) return 'bg-rose-500';
  if (val < 75) return 'bg-amber-500';
  return 'bg-emerald-500';
}

const MiniScoreCard = ({ label, value }: any) => (
  <div className={`bg-white border rounded-lg p-2 shadow-sm border-l-4 ${value < 45 ? 'border-l-rose-500' : value < 75 ? 'border-l-amber-500' : 'border-l-emerald-500'}`}>
    <p className="text-[8px] font-bold text-muted-foreground uppercase mb-1">{label}</p>
    <div className="flex items-baseline gap-1">
      <span className={`text-sm font-black ${getColorClass(value)}`}>{value.toFixed(0)}%</span>
      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${getBgColorClass(value)}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  </div>
);

const PracticeBox = ({ label, value }: any) => (
  <div className="bg-white border rounded-md p-1.5 text-center shadow-sm">
    <p className="text-[8px] font-bold text-muted-foreground mb-1">{label}</p>
    <p className={`text-[10px] font-black ${getColorClass(value)}`}>
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