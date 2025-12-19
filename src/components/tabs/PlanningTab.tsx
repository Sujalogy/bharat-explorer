// src/components/tabs/PlanningTab.tsx
import { useDashboard } from '@/context/DashboardContext';
import { usePlanningMetrics } from '@/hooks/usePlanningMetrics';
import KPICard from '@/components/shared/KPICard';
import ChartContainer from '@/components/shared/ChartContainer';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine 
} from 'recharts';
import ThresholdControl from '../shared/ThresholdControl';
import { Sparkles, AlertCircle } from 'lucide-react';

export default function PlanningTab() {
  const { state, dispatch } = useDashboard();
  const { filteredData, thresholds } = state;
  const metrics = usePlanningMetrics(filteredData, thresholds.chronicPlanning);

  const pieColors = ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

  return (
    <div className="space-y-6 animate-fade-in">
      <ThresholdControl
        label="Chronic Planning Threshold"
        value={thresholds.chronicPlanning}
        onChange={(v) => dispatch({ type: 'SET_THRESHOLDS', payload: { chronicPlanning: v } })}
      />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Chronic Under-planners" value={metrics.chronicPlanners.length} icon="Activity" color="destructive" />
        <KPICard label="Avg Planning %" value={metrics.avgPlanning} format="percent" icon="Target" color={metrics.avgPlanning >= 80 ? 'success' : 'warning'} />
        <KPICard label="Total Gap" value={metrics.totalGap} icon="TrendingUp" color="warning" />
        <KPICard label="Records" value={metrics.totalRecords} icon="BarChart3" color="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Monthly Under-planned" description="BACs below recommended targets">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={metrics.monthlyUnderplanned}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Planning Status" description="Distribution by compliance level">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={metrics.planningDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" nameKey="name" label>
                {metrics.planningDistribution.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <ChartContainer title="Planning Compliance Trend" description="Target vs Recommended %">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={metrics.monthlyPlanningCompliance}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 120]} tick={{ fontSize: 11 }} />
            <ReferenceLine y={100} stroke="hsl(var(--success))" strokeDasharray="5 5" />
            <ReferenceLine y={80} stroke="hsl(var(--warning))" strokeDasharray="5 5" />
            <Tooltip />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Report Planning Section */}
      <div className="p-6 bg-card border rounded-2xl space-y-4 border-l-4 border-l-warning">
        <h3 className="font-bold flex items-center gap-2 italic">
          <AlertCircle className="w-5 h-5 text-warning" /> Planning Accuracy Report
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Planning compliance remains a critical area with a total gap of <strong>{metrics.totalGap}</strong> visits. 
          While <strong>{metrics.avgPlanning.toFixed(1)}%</strong> of recommended visits are being planned on average, the systemic under-planning in specific months warrants further investigation into field-level constraints.
        </p>
      </div>
    </div>
  );
}