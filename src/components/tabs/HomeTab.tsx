// src/components/tabs/HomeTab.tsx
import { useMemo } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import ChartContainer from '@/components/shared/ChartContainer';
import KPICard from '@/components/shared/KPICard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Sparkles, ArrowRight, Users, Globe, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomeTab() {
  const { state, dispatch } = useDashboard();
  const { filteredData, rawData } = state;

  // --- LOGIC: Dynamic KPI Calculations ---
  
  // 1. Unique BAC Count (Active BACs)
  const uniqueBacCount = useMemo(() => {
    return new Set(rawData.map(r => r.bac_name).filter(Boolean)).size;
  }, [rawData]);

  // 2. Data Coverage (Unique States)
  const uniqueStateCount = useMemo(() => {
    return new Set(rawData.map(r => r.state).filter(Boolean)).size;
  }, [rawData]);

  // 3. Overall Pulse (Average Achievement across filtered data)
  const overallPulse = useMemo(() => {
    const totalActual = filteredData.reduce((s, r) => s + (r.actual_visits || 0), 0);
    const totalTarget = filteredData.reduce((s, r) => s + (r.target_visits || 0), 0);
    return totalTarget > 0 ? ((totalActual / totalTarget) * 100).toFixed(1) : "0.0";
  }, [filteredData]);

  // 4. Aggregate cross-vertical performance for the "Pulse" graph
  const pulseData = useMemo(() => {
    const monthOrder = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];
    return monthOrder.map(month => {
      const records = filteredData.filter(r => r.month === month);
      const totalActual = records.reduce((s, r) => s + (r.actual_visits || 0), 0);
      const totalTarget = records.reduce((s, r) => s + (r.target_visits || 0), 0);
      
      const visitPerf = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;
      return { month, performance: Math.round(Math.min(visitPerf, 100)) };
    });
  }, [filteredData]);

  return (
    <div className="space-y-8 animate-fade-in p-2">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
        <p className="text-muted-foreground italic">Comprehensive monitoring summary across all Indian states.</p>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">Overall Pulse</p>
            <h2 className="text-4xl font-extrabold mt-2">{overallPulse}%</h2>
          </div>
          <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> System-wide efficiency rating
          </p>
        </div>
        
        <KPICard 
          label="Active BACs" 
          value={uniqueBacCount} 
          icon="Users" 
          color="info" 
        />
        
        <KPICard 
          label="Data Coverage" 
          value={`${uniqueStateCount} States`} 
          icon="Globe" 
          color="success" 
        />
      </div>

      {/* Aggregate Performance Curve */}
      <ChartContainer 
        title="Institutional Performance Pulse" 
        description="Statistical curve showing aggregate achievement across all verticals."
      >
        <div className="h-[350px] w-full mt-6">
          <ResponsiveContainer>
            <AreaChart data={pulseData}>
              <defs>
                <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 11, fontWeight: 500}} 
              />
              <YAxis 
                hide 
                domain={[0, 100]}
              />
              <Tooltip 
                formatter={(val) => [`${val}%`, 'Performance']}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="performance" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#performanceGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>

      {/* Quick Navigation / AI Summary Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-2xl p-6 space-y-4 shadow-sm">
          <h3 className="font-bold flex items-center gap-2 italic">
            <Sparkles className="w-5 h-5 text-primary" /> AI Operational Summary
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Data analysis indicates that field execution efficiency is currently at <strong>{overallPulse}%</strong>. 
            There are <strong>{uniqueBacCount}</strong> active personnel monitoring <strong>{uniqueStateCount}</strong> states. 
            Recommended action: Review BAC target-setting in underperforming blocks to bridge the current gap.
          </p>
          <Button variant="outline" size="sm" className="w-fit" onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'visit-report' })}>
            View Visit Compliance <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}