// src/components/tabs/OverviewTab.tsx - FIXED TARGET CALCULATION

import { useMemo, useState, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import IndiaMap from '@/components/map/IndiaMap';
import { Card } from '@/components/ui/card';
import {
  Globe, Landmark, Building2, Box,
  CheckCircle2, GraduationCap, Microscope, ClipboardList,
  MapPin
} from 'lucide-react';
import ChartContainer from '@/components/shared/ChartContainer';
import { getGeoMetrics } from '@/utils/geoMetrics';
import MapBreadcrumb from '@/components/map/MapBreadcrumb';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewSidebar from './overview/OverviewSidebar';

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
      fetch(`http://localhost:3000/api/v1/dashboard/schools?block=${mapState.selectedBlock}`)
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

    // ✅ FIXED: Count unique visit days instead of summing rows
    const uniqueVisitDays = new Set(data.map(r => r.visit_date)).size;
    const actual = uniqueVisitDays;
    
    // ✅ FIXED: Calculate target by summing unique BAC-Month combinations
    // Group by BAC and Month, then sum the target for each unique combination
    const bacMonthTargets = new Map<string, number>();
    
    data.forEach(r => {
      const key = `${r.bac_name}-${r.month}`;
      if (!bacMonthTargets.has(key)) {
        // Only count this BAC-month's target once
        bacMonthTargets.set(key, r.target_visits || 0);
      }
    });
    // Sum all unique BAC-month targets
    const target = Array.from(bacMonthTargets.values()).reduce((sum, val) => sum + val, 0);
    
    // Classroom observations count
    const obs = data.reduce((s, r) => s + (r.classroom_obs || 0), 0);
    
    const avgSlo = data.length > 0 ? data.reduce((s, r) => s + (r.slo_score || 0), 0) / data.length : 0;
    const tlmUsage = data.length > 0 ? data.reduce((s, r) => s + (r.tlm_score || 0), 0) / data.length : 0;

    const practiceCounts = {
      ss2: 0, ss3: 0,
      pp_lit_1: 0, pp_lit_2: 0, pp_lit_3: 0, pp_lit_4: 0,
      pp_num_1: 0, pp_num_2: 0, pp_num_3: 0, pp_num_4: 0,
      gp_num_1: 0, gp_num_2: 0, gp_num_3: 0,
      gp_lit_1: 0, gp_lit_2: 0, gp_lit_3: 0
    };

    data.forEach(r => {
      if (r.ssi2_effective) practiceCounts.ss2++;
      if (r.ssi3_effective) practiceCounts.ss3++;
      if (r.practices) {
        if (r.practices.pp_lit_1) practiceCounts.pp_lit_1++;
        if (r.practices.pp_lit_2) practiceCounts.pp_lit_2++;
        if (r.practices.pp_lit_3) practiceCounts.pp_lit_3++;
        if (r.practices.pp_lit_4) practiceCounts.pp_lit_4++;
        if (r.practices.pp_num_1) practiceCounts.pp_num_1++;
        if (r.practices.pp_num_2) practiceCounts.pp_num_2++;
        if (r.practices.pp_num_3) practiceCounts.pp_num_3++;
        if (r.practices.pp_num_4) practiceCounts.pp_num_4++;
        if (r.practices.gp_num_1) practiceCounts.gp_num_1++;
        if (r.practices.gp_num_2) practiceCounts.gp_num_2++;
        if (r.practices.gp_num_3) practiceCounts.gp_num_3++;
        if (r.practices.gp_lit_1) practiceCounts.gp_lit_1++;
        if (r.practices.gp_lit_2) practiceCounts.gp_lit_2++;
        if (r.practices.gp_lit_3) practiceCounts.gp_lit_3++;
      }
    });

    const getPerc = (count: number) => totalRecords > 0 ? (count / totalRecords) * 100 : 0;

    return {
      level, name, actual, target, obs, avgSlo, tlmUsage,
      schools: schoolsCovered,
      totalSchools: geo.total_schools,
      achievement: target > 0 ? (actual / target) * 100 : 0,
      area: geo.area_sqkm,
      practices: {
        ss2: getPerc(practiceCounts.ss2),
        ss3: getPerc(practiceCounts.ss3),
        pp_lit_1: getPerc(practiceCounts.pp_lit_1),
        pp_lit_2: getPerc(practiceCounts.pp_lit_2),
        pp_lit_3: getPerc(practiceCounts.pp_lit_3),
        pp_lit_4: getPerc(practiceCounts.pp_lit_4),
        pp_num_1: getPerc(practiceCounts.pp_num_1),
        pp_num_2: getPerc(practiceCounts.pp_num_2),
        pp_num_3: getPerc(practiceCounts.pp_num_3),
        pp_num_4: getPerc(practiceCounts.pp_num_4),
        gp_lit_1: getPerc(practiceCounts.gp_lit_1),
        gp_lit_2: getPerc(practiceCounts.gp_lit_2),
        gp_lit_3: getPerc(practiceCounts.gp_lit_3),
        gp_num_1: getPerc(practiceCounts.gp_num_1),
        gp_num_2: getPerc(practiceCounts.gp_num_2),
        gp_num_3: getPerc(practiceCounts.gp_num_3),
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
            <div className='grid grid-flow-col items-center'>
              <div className="grid grid-flow-col justify-between items-center gap-4">
                <Tabs value={activeContext} onValueChange={(val) => setActiveContext(val as MetricContext)} className="w-auto">
                  <TabsList className="bg-white gap-1">
                    {[
                      { id: 'Visit', icon: CheckCircle2, label: 'Visit' },
                      { id: 'CRO', icon: ClipboardList, label: 'CRO' },
                      { id: 'TLM', icon: Microscope, label: 'TLM' },
                      { id: 'SLO', icon: GraduationCap, label: 'SLO' },
                    ].map((tab) => (
                      <TabsTrigger key={tab.id} value={tab.id} className="relative px-3 py-1 text-[11px] font-semibold tracking-wide uppercase transition-all border rounded-lg data-[state=active]:bg-background data-[state=active]:text-primary">
                        <tab.icon className={`w-3.5 h-3.5 mr-2 ${activeContext === tab.id ? 'scale-110' : 'opacity-70'}`} />
                        <span>{tab.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <div className="w-[700px] flex items-center justify-between gap-3">
                  <MapBreadcrumb
                    currentLevel={mapState.currentLevel}
                    selectedState={mapState.selectedState}
                    selectedDistrict={mapState.selectedDistrict}
                    selectedBlock={mapState.selectedBlock}
                    onNavigate={handleBreadcrumbNavigate}
                  />

                  {currentFocus.area > 0 && (
                    <div className="flex items-center gap-1.5 px-3 border border-slate-200 rounded-full shadow-sm">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">
                        {currentFocus.area.toLocaleString()} km²
                      </span>
                    </div>
                  )}
                </div>
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

      {/* 30% DYNAMIC SIDE CARD */}
      <div className="lg:w-[30%] flex flex-col min-h-0">
        <OverviewSidebar activeContext={activeContext} currentFocus={currentFocus} />
      </div>
    </div>
  );
}

function totalAchievement(d: any, context: string) {
  if (context === 'Visit') return (d.actual_visits / d.target_visits) * 100 || 0;
  if (context === 'CRO') return (d.classroom_obs / 2) * 100 || 0;
  if (context === 'SLO') return d.slo_score || 0;
  if (context === 'TLM') return d.tlm_score || 0;
  return 0;
}