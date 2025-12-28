import { useState, useEffect, useMemo } from 'react';
import { useDashboard } from '@/context/DashboardContext';
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
import { Download, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VisitReportTab() {
  const { state, dispatch } = useDashboard();
  const { filters, thresholds } = state;

  // State for backend data
  const [summaryData, setSummaryData] = useState(null);
  const [chronicPerformers, setChronicPerformers] = useState([]);
  const [chronicPlanners, setChronicPlanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [summaryXAxis, setSummaryXAxis] = useState('month');
  const [activeTab, setActiveTab] = useState('summary');

  // Fetch summary metrics from backend
  useEffect(() => {
    const fetchSummaryData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams();
        
        if (filters.state && filters.state !== 'All') params.append('state', filters.state);
        if (filters.district && filters.district !== 'All') params.append('district', filters.district);
        if (filters.block && filters.block !== 'All') params.append('block', filters.block);
        if (filters.academicYear && filters.academicYear !== 'All') params.append('year', filters.academicYear);
        if (filters.subject && filters.subject !== 'All') params.append('subject', filters.subject);
        if (filters.grade && filters.grade !== 'All') params.append('grade', filters.grade);
        if (filters.visitType && filters.visitType !== 'All') params.append('visit_type', filters.visitType);

        const response = await fetch(`http://localhost:3000/api/v1/dashboard/summary?${params.toString()}`);
        
        if (!response.ok) throw new Error('Failed to fetch summary data');
        
        const result = await response.json();
        setSummaryData(result.data);
      } catch (err) {
        console.error('Summary fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, [filters]);

  // Fetch chronic performers when performance tab is active
  useEffect(() => {
    if (activeTab !== 'performance') return;

    const fetchChronicPerformers = async () => {
      try {
        const params = new URLSearchParams();
        
        if (filters.state && filters.state !== 'All') params.append('state', filters.state);
        if (filters.district && filters.district !== 'All') params.append('district', filters.district);
        if (filters.block && filters.block !== 'All') params.append('block', filters.block);
        params.append('threshold', thresholds.chronicPerformance);

        const response = await fetch(`http://localhost:3000/api/v1/dashboard/chronic-performers?${params.toString()}`);
        
        if (!response.ok) throw new Error('Failed to fetch chronic performers');
        
        const result = await response.json();
        setChronicPerformers(result.data);
      } catch (err) {
        console.error('Chronic performers fetch error:', err);
      }
    };

    fetchChronicPerformers();
  }, [activeTab, filters, thresholds.chronicPerformance]);

  // Fetch chronic planners when planning tab is active
  useEffect(() => {
    if (activeTab !== 'planning') return;

    const fetchChronicPlanners = async () => {
      try {
        const params = new URLSearchParams();
        
        if (filters.state && filters.state !== 'All') params.append('state', filters.state);
        if (filters.district && filters.district !== 'All') params.append('district', filters.district);
        if (filters.block && filters.block !== 'All') params.append('block', filters.block);
        params.append('threshold', thresholds.chronicPlanning);

        const response = await fetch(`http://localhost:3000/api/v1/dashboard/chronic-planners?${params.toString()}`);
        
        if (!response.ok) throw new Error('Failed to fetch chronic planners');
        
        const result = await response.json();
        setChronicPlanners(result.data);
      } catch (err) {
        console.error('Chronic planners fetch error:', err);
      }
    };

    fetchChronicPlanners();
  }, [activeTab, filters, thresholds.chronicPlanning]);

  // Process chart data based on toggle (monthly/yearly)
  const chartData = useMemo(() => {
    if (!summaryData) return [];
    return summaryXAxis === 'month' 
      ? summaryData.charts.monthly 
      : summaryData.charts.yearly;
  }, [summaryData, summaryXAxis]);

  // Calculate monthly achievement for velocity curve
  const velocityData = useMemo(() => {
    if (!summaryData?.charts.monthly) return [];
    return summaryData.charts.monthly.map(item => ({
      month: item.month,
      value: item.target > 0 ? (item.actual / item.target) * 100 : 0
    }));
  }, [summaryData]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading metrics...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertCircle className="w-8 h-8 text-destructive mr-3" />
        <span className="text-destructive">Error: {error}</span>
      </div>
    );
  }

  // No data state
  if (!summaryData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  const pieColors = ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 animate-fade-in">
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

        {/* KPI Cards - Data from Backend */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard 
            label="BACs Missed Target" 
            value={summaryData.kpis.missedTargetBacs} 
            icon="UserX" 
            color="destructive" 
          />
          <KPICard 
            label="Actual Achievement %" 
            value={summaryData.kpis.actualAchievement} 
            format="percent" 
            icon="Target" 
            color="success" 
          />
          <KPICard 
            label="Fluctuating Targets" 
            value={summaryData.kpis.fluctuatedTargetBacs} 
            icon="Shuffle" 
            color="warning" 
          />
          <KPICard 
            label="Planning Achievement %" 
            value={summaryData.kpis.targetVsPolicy} 
            format="percent" 
            icon="FileText" 
            color="info" 
          />
        </div>

        {/* Velocity Curve */}
        <ChartContainer 
          title="Adherence Velocity Curve" 
          description="Long-term achievement trend based on statistical execution."
        >
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer>
              <AreaChart data={velocityData}>
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

        {/* Toggle View */}
        <div className="flex justify-end items-center gap-3">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Toggle View:</span>
          <ToggleGroup type="single" value={summaryXAxis} onValueChange={(v) => v && setSummaryXAxis(v)}>
            <ToggleGroupItem value="academic_year" className="text-xs h-8 px-3">Yearly</ToggleGroupItem>
            <ToggleGroupItem value="month" className="text-xs h-8 px-3">Monthly</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer title="Execution Analysis" description="Actual Visits vs. Targets.">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey={summaryXAxis === 'month' ? 'month' : 'year'} tick={{fontSize: 11}} />
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
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey={summaryXAxis === 'month' ? 'month' : 'year'} tick={{fontSize: 11}} />
                <YAxis tick={{fontSize: 11}} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '10px'}} />
                <Bar dataKey="target" name="Target" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recommended" name="Policy" fill="hsl(var(--info))" opacity={0.5} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* AI Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t">
          <div className="space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" /> Achievement Highlights
            </h3>
            <div className="p-4 bg-success/5 border border-success/10 rounded-xl">
              <p className="text-sm leading-relaxed text-muted-foreground italic">
                Field execution efficiency has reached an aggregate of <strong>{summaryData.kpis.actualAchievement}%</strong>. 
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
                A cumulative gap of <strong>{summaryData.kpis.totalGap}</strong> visits detected. 
                <strong> {summaryData.kpis.chronicUnderplanners}</strong> BACs identified as chronic under-planners requiring immediate review.
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
          <KPICard label="Chronic Under-performers" value={summaryData.kpis.chronicUnderperformers} icon="Activity" color="destructive" />
          <KPICard label="Avg Achievement" value={summaryData.kpis.avgAchievement} format="percent" icon="Target" color="success" />
          <KPICard label="Total BACs" value={summaryData.kpis.totalBacs} icon="Users" color="info" />
          <KPICard label="Total Visits" value={summaryData.kpis.totalVisits} icon="Eye" color="default" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer title="Achievement Distribution">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie 
                  data={summaryData.charts.performanceDistribution} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={90} 
                  dataKey="value" 
                  nameKey="name" 
                  label
                >
                  {summaryData.charts.performanceDistribution.map((_, i) => (
                    <Cell key={i} fill={pieColors[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Chronic Under-performers List" description={`${chronicPerformers.length} BACs identified`}>
            <div className="max-h-[250px] overflow-y-auto space-y-2">
              {chronicPerformers.slice(0, 10).map((bac, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 border rounded text-sm">
                  <div>
                    <span className="font-semibold">{bac.bac_name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{bac.district}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{bac.avg_achievement}%</div>
                    <div className="text-xs text-muted-foreground">{bac.months_missed} months</div>
                  </div>
                </div>
              ))}
            </div>
          </ChartContainer>
        </div>
      </TabsContent>

      {/* ================= PLANNING SUB-TAB ================= */}
      <TabsContent value="planning" className="space-y-6">
        <ThresholdControl
          label="Chronic Planning Threshold"
          value={thresholds.chronicPlanning}
          onChange={(v) => dispatch({ type: 'SET_THRESHOLDS', payload: { chronicPlanning: v } })}
        />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard label="Chronic Under-planners" value={summaryData.kpis.chronicUnderplanners} icon="Activity" color="destructive" />
          <KPICard label="Avg Planning %" value={summaryData.kpis.avgPlanning} format="percent" icon="Target" color="warning" />
          <KPICard label="Total Gap" value={summaryData.kpis.totalGap} icon="TrendingUp" color="warning" />
          <KPICard label="Total BACs" value={summaryData.kpis.totalBacs} icon="BarChart3" color="info" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartContainer title="Planning Distribution">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie 
                  data={summaryData.charts.planningDistribution} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={90} 
                  dataKey="value" 
                  nameKey="name" 
                  label
                >
                  {summaryData.charts.planningDistribution.map((_, i) => (
                    <Cell key={i} fill={pieColors[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer title="Chronic Under-planners List" description={`${chronicPlanners.length} BACs identified`}>
            <div className="max-h-[250px] overflow-y-auto space-y-2">
              {chronicPlanners.slice(0, 10).map((bac, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 border rounded text-sm">
                  <div>
                    <span className="font-semibold">{bac.bac_name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{bac.district}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{bac.avg_planning}%</div>
                    <div className="text-xs text-muted-foreground">Gap: {bac.planning_gap}</div>
                  </div>
                </div>
              ))}
            </div>
          </ChartContainer>
        </div>
      </TabsContent>
    </Tabs>
  );
}