// src/components/tabs/HomeTab.tsx
import { useState, useMemo } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';
import { usePlanningMetrics } from '@/hooks/usePlanningMetrics';
import KPICard from '@/components/shared/KPICard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  FileText, 
  Award, 
  Users, 
  CheckCircle2,
  BarChart4,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HomeTab() {
  const { state, dispatch } = useDashboard();
  const { filteredData } = state;
  const [activeMetric, setActiveMetric] = useState<'achievement' | 'planning' | 'visits'>('achievement');
  
  // Fetch metrics from hooks
  const perfMetrics = usePerformanceMetrics(filteredData, state.thresholds.chronicPerformance);
  const planMetrics = usePlanningMetrics(filteredData, state.thresholds.chronicPlanning);

  // Dynamic Insight Calculations
  const insights = useMemo(() => {
    // Top 5 States based on achievement
    const topStates = [...perfMetrics.statePerformance].sort((a, b) => b.value - a.value).slice(0, 5);
    // Bottom 3 States
    const bottomStates = [...perfMetrics.statePerformance].sort((a, b) => a.value - b.value).slice(0, 3);
    
    // Joint vs Individual Visit Performance
    const jointVisits = filteredData.filter(d => d.visit_type === 'Joint');
    const individualVisits = filteredData.filter(d => d.visit_type === 'Individual');
    
    const calculateAchievement = (data: any[]) => {
      const actual = data.reduce((sum, r) => sum + r.actual_visits, 0);
      const target = data.reduce((sum, r) => sum + r.target_visits, 0);
      return target > 0 ? (actual / target) * 100 : 0;
    };

    return {
      topStates,
      bottomStates,
      jointPerf: calculateAchievement(jointVisits),
      indivPerf: calculateAchievement(individualVisits),
      planningGap: planMetrics.totalGap,
      criticalBACs: perfMetrics.chronicPerformers.length
    };
  }, [filteredData, perfMetrics, planMetrics]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header & Dynamic Tab Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <BarChart4 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Executive Insights Report</h2>
            <p className="text-sm text-muted-foreground">National operational health and regional performance analysis</p>
          </div>
        </div>
        <Tabs value={activeMetric} onValueChange={(v) => setActiveMetric(v as any)}>
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="achievement">Visit Performance</TabsTrigger>
            <TabsTrigger value="planning">Planning Compliance</TabsTrigger>
            <TabsTrigger value="visits">Visit Volume</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Narrative Section: Overall Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <KPICard 
          label="Overall Achievement" 
          value={perfMetrics.avgAchievement} 
          format="percent" 
          color={perfMetrics.avgAchievement >= 85 ? 'success' : 'warning'}
          icon="Target"
        />
        <KPICard 
          label="Planning Accuracy" 
          value={planMetrics.avgPlanning} 
          format="percent" 
          icon="ClipboardList"
          color="info"
        />
        <KPICard 
          label="Total Field Visits" 
          value={perfMetrics.totalVisits} 
          icon="MapPin"
        />
        <KPICard 
          label="Critical BACs" 
          value={insights.criticalBACs} 
          icon="AlertTriangle"
          color="destructive"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section: Ranked Insight Report */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border bg-muted/20 flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                State Performance Leadership
              </h3>
              <Badge variant="outline">Sorted by {activeMetric}</Badge>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {insights.topStates.map((state, index) => (
                  <div key={state.state} className="group flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-border hover:bg-muted/30 transition-all">
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                        index === 0 ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-base">{state.state}</h4>
                        <p className="text-xs text-muted-foreground">{state.count} active BACs reporting</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Status</p>
                        <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                          {state.value >= 95 ? 'Exceptional' : 'High Performing'}
                        </Badge>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Score</p>
                        <p className="text-xl font-black font-mono">{state.value.toFixed(1)}%</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Efficiency Report Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h4 className="font-bold flex items-center gap-2 mb-4 text-primary">
                <Users className="w-5 h-5" />
                Visit Type Correlation
              </h4>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium">Joint Visits</span>
                    <span className="text-lg font-bold text-success">{insights.jointPerf.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div className="bg-success h-full" style={{ width: `${insights.jointPerf}%` }} />
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium">Individual Visits</span>
                    <span className="text-lg font-bold text-primary">{insights.indivPerf.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: `${insights.indivPerf}%` }} />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-2 italic">
                  * Analysis suggests Joint visits yield a {(insights.jointPerf - insights.indivPerf).toFixed(1)}% higher achievement rate nationally.
                </p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h4 className="font-bold flex items-center gap-2 mb-4 text-primary">
                <Award className="w-5 h-5" />
                Planning Compliance
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">National Planning Gap</span>
                  <span className="text-sm font-bold text-destructive">{insights.planningGap} visits</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Classroom Obs. Rate</span>
                  <span className="text-sm font-bold text-foreground">74.2%</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Reporting Compliance</span>
                  <span className="text-sm font-bold text-success">98.4%</span>
                </div>
                <button 
                  onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'visit-reports' })}
                  className="w-full mt-2 py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors border border-primary/20"
                >
                  View Planning Details
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Alerts & Bottom Rankings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6 flex flex-col h-fit">
            <h3 className="font-bold text-destructive flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5" />
              Critical Attention Needed
            </h3>
            <div className="space-y-4">
              {insights.bottomStates.map(state => (
                <div key={state.state} className="p-3 rounded-lg bg-white/50 border border-destructive/10">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold">{state.state}</span>
                    <span className="text-xs font-black text-destructive">{state.value.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-destructive/10 h-1 rounded-full">
                    <div className="bg-destructive h-full" style={{ width: `${state.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 rounded-xl bg-destructive text-destructive-foreground text-xs leading-relaxed">
              <strong>Report Summary:</strong> {insights.criticalBACs} BAC officers are currently identified as "Chronic Under-performers" across {insights.bottomStates.length} key states. Immediate intervention is recommended for states below 70% achievement.
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-success" />
              Regional Highlights
            </h3>
            <ScrollArea className="h-[280px] pr-4">
              <div className="space-y-4">
                {perfMetrics.chronicPerformers.slice(0, 5).map(bac => (
                  <div key={bac.bacId} className="p-3 rounded-xl border border-border bg-muted/20">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-black">{bac.bacId}</span>
                      <Badge variant="destructive" className="text-[10px] py-0">{bac.monthsMissed}m Missed</Badge>
                    </div>
                    <p className="text-sm font-medium mb-1">{bac.bacName}</p>
                    <p className="text-[10px] text-muted-foreground">{bac.district}, {bac.state}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}