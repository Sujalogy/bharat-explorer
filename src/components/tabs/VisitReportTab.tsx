import { useState, useMemo } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';
import { usePlanningMetrics } from '@/hooks/usePlanningMetrics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import KPICard from '@/components/shared/KPICard';
import ChartContainer from '@/components/shared/ChartContainer';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, 
  Line, ReferenceLine, Legend, AreaChart, Area 
} from 'recharts';
import ThresholdControl from '../shared/ThresholdControl';
import { Download, TrendingUp, AlertCircle, Sparkles, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VisitReportTab() {
  const { state, dispatch } = useDashboard();
  const { filteredData, thresholds } = state;

  // --- Metrics Hooks ---
  const perfMetrics = usePerformanceMetrics(filteredData, thresholds.chronicPerformance);
  const planMetrics = usePlanningMetrics(filteredData, thresholds.chronicPlanning);

  // --- Summary Tab State & Logic ---
  const [summaryXAxis, setSummaryXAxis] = useState<'month' | 'academic_year'>('month');

  const summaryData = useMemo(() => {
    // 1. Calculate Aggregated KPI Values
    const totalActual = filteredData.reduce((acc, curr) => acc + curr.actual_visits, 0);
    const totalTarget = filteredData.reduce((acc, curr) => acc + curr.target_visits, 0);
    const totalRecommended = filteredData.reduce((acc, curr) => acc + curr.recommended_visits, 0);

    // BACs who missed their target (Actual < Target)
    const missedTargetBacs = new Set(
      filteredData.filter(d => d.actual_visits < d.target_visits).map(d => d.bac_name)
    ).size;

    // BACs who fluctuate their targets (Target != Recommended Policy)
    const fluctuatedTargetBacs = new Set(
      filteredData.filter(d => d.target_visits !== d.recommended_visits).map(d => d.bac_name)
    ).size;

    // 2. Aggregate Chart Data based on Toggle
    const grouped = filteredData.reduce((acc: any, curr) => {
      const key = curr[summaryXAxis];
      if (!acc[key]) {
        acc[key] = { name: key, actual: 0, target: 0, recommended: 0 };
      }
      acc[key].actual += curr.actual_visits;
      acc[key].target += curr.target_visits;
      acc[key].recommended += curr.recommended_visits;
      return acc;
    }, {});

    const chartArray = Object.values(grouped);

    // Sort months chronologically for the academic cycle
    if (summaryXAxis === 'month') {
      const monthOrder = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];
      chartArray.sort((a: any, b: any) => monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name));
    }

    return {
      missedTargetBacs,
      fluctuatedTargetBacs,
      actualAchievement: totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0,
      targetVsPolicy: totalRecommended > 0 ? (totalTarget / totalRecommended) * 100 : 0,
      chartArray
    };
  }, [filteredData, summaryXAxis]);

  const pieColors = ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

  return (
    <Tabs defaultValue="summary" className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b pb-2">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="summary">Summary Report</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
        </TabsList>
      </div>

      {/* ================= SUMMARY REPORT SUB-TAB ================= */}
      <TabsContent value="summary" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight italic">Institutional Monitoring Report</h2>
            <p className="text-sm text-muted-foreground">Statistical summary of visit adherence and planning accuracy.</p>
          </div>
          <Button variant="default" size="sm" className="gap-2 shadow-lg hover:shadow-primary/20">
            <Download className="w-4 h-4" /> Download Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard label="BACs Missed Target" value={summaryData.missedTargetBacs} icon="UserX" color="destructive" />
          <KPICard label="Actual Achievement %" value={summaryData.actualAchievement} format="percent" icon="Target" color="success" />
          <KPICard label="Fluctuating Targets" value={summaryData.fluctuatedTargetBacs} icon="Shuffle" color="warning" />
          <KPICard label="Planning Achievement %" value={summaryData.targetVsPolicy} format="percent" icon="FileText" color="info" />
        </div>

        <ChartContainer title="Adherence Velocity Curve" description="Long-term achievement trend based on statistical execution.">
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer>
              <AreaChart data={perfMetrics.monthlyAchievement}>
                <defs>
                  <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                <XAxis dataKey="month" hide />
                <YAxis hide />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  fill="url(#velocityGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        <div className="flex justify-end items-center gap-3">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Toggle View:</span>
          <ToggleGroup type="single" value={summaryXAxis} onValueChange={(v) => v && setSummaryXAxis(v as any)}>
            <ToggleGroupItem value="academic_year" className="text-xs h-8 px-3">Yearly</ToggleGroupItem>
            <ToggleGroupItem value="month" className="text-xs h-8 px-3">Monthly</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer title="Execution Analysis" description="Actual Visits vs. Targets.">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summaryData.chartArray}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="name" tick={{fontSize: 11}} />
                <YAxis tick={{fontSize: 11}} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                <Bar dataKey="actual" name="Actual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Target" fill="hsl(var(--muted-foreground))" opacity={0.5} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Planning Compliance" description="Target vs Recommended visits.">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summaryData.chartArray}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="name" tick={{fontSize: 11}} />
                <YAxis tick={{fontSize: 11}} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                <Bar dataKey="target" name="Target" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recommended" name="Policy" fill="hsl(var(--info))" opacity={0.5} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* AI Insight Structure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t">
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" /> Achievement Highlights
            </h3>
            <div className="p-4 bg-success/5 border border-success/10 rounded-xl">
              <p className="text-sm leading-relaxed text-muted-foreground italic">
                Field execution efficiency has reached an aggregate of <strong>{summaryData.actualAchievement.toFixed(1)}%</strong>. 
                Engagement trends indicate high stability in the primary state hubs.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 italic">
              <AlertCircle className="w-5 h-5 text-destructive" /> Operational Risks
            </h3>
            <div className="p-4 bg-destructive/5 border border-destructive/10 rounded-xl">
              <p className="text-sm leading-relaxed text-muted-foreground italic">
                A cumulative gap of <strong>{planMetrics.totalGap}</strong> visits detected. 
                <strong> {planMetrics.chronicPlanners.length}</strong> BACs identified as chronic under-planners requiring immediate review.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-widest border-t">
          <span>Bharat Explorer v2.0</span>
          <span>Internal LLF Monitoring Document</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </TabsContent>

      {/* ================= PERFORMANCE SUB-TAB ================= */}
      <TabsContent value="performance" className="space-y-6">
        <ThresholdControl
          label="Chronic Performance Threshold"
          value={thresholds.chronicPerformance}
          onChange={(v) => dispatch({ type: 'SET_THRESHOLDS', payload: { chronicPerformance: v } })}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="Chronic Under-performers" value={perfMetrics.chronicPerformers.length} icon="Activity" color="destructive" />
          <KPICard label="Avg Achievement" value={perfMetrics.avgAchievement} format="percent" icon="Target" color="success" />
          <KPICard label="Total BACs" value={perfMetrics.totalBACs} icon="Users" color="info" />
          <KPICard label="Total Visits" value={perfMetrics.totalVisits} icon="Eye" color="default" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer title="Monthly Missed Targets">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={perfMetrics.monthlyMissedTargets}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <ChartContainer title="Achievement Distribution">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={perfMetrics.achievementDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" nameKey="name" label>
                  {perfMetrics.achievementDistribution.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <ChartContainer title="Monthly Achievement Trend">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={perfMetrics.monthlyAchievement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 120]} />
              <ReferenceLine y={100} stroke="hsl(var(--success))" strokeDasharray="5 5" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </TabsContent>

      {/* ================= PLANNING SUB-TAB ================= */}
      <TabsContent value="planning" className="space-y-6">
        <ThresholdControl
          label="Chronic Planning Threshold"
          value={thresholds.chronicPlanning}
          onChange={(v) => dispatch({ type: 'SET_THRESHOLDS', payload: { chronicPlanning: v } })}
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="Chronic Under-planners" value={planMetrics.chronicPlanners.length} icon="Activity" color="destructive" />
          <KPICard label="Avg Planning %" value={planMetrics.avgPlanning} format="percent" icon="Target" color="warning" />
          <KPICard label="Total Gap" value={planMetrics.totalGap} icon="TrendingUp" color="warning" />
          <KPICard label="Records" value={planMetrics.totalRecords} icon="BarChart3" color="info" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer title="Monthly Under-planned">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={planMetrics.monthlyUnderplanned}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <ChartContainer title="Planning Status Distribution">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={planMetrics.planningDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" nameKey="name" label>
                  {planMetrics.planningDistribution.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <ChartContainer title="Planning Compliance Trend">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={planMetrics.monthlyPlanningCompliance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 120]} tick={{ fontSize: 11 }} />
              <ReferenceLine y={100} stroke="hsl(var(--success))" strokeDasharray="5 5" />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </TabsContent>
    </Tabs>
  );
}