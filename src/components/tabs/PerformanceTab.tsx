// src/components/tabs/PerformanceTab.tsx
import { useDashboard } from '@/context/DashboardContext';
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';
import KPICard from '@/components/shared/KPICard';
import ChartContainer from '@/components/shared/ChartContainer';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, 
  Line, ReferenceLine 
} from 'recharts';
import ThresholdControl from '../shared/ThresholdControl';
import { TrendingUp, Sparkles } from 'lucide-react';

export default function PerformanceTab() {
  const { state, dispatch } = useDashboard();
  const { filteredData, thresholds } = state;
  const metrics = usePerformanceMetrics(filteredData, thresholds.chronicPerformance);

  const pieColors = ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

  return (
    <div className="space-y-6 animate-fade-in">
      <ThresholdControl
        label="Chronic Performance Threshold"
        value={thresholds.chronicPerformance}
        onChange={(v) => dispatch({ type: 'SET_THRESHOLDS', payload: { chronicPerformance: v } })}
      />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="Chronic Under-performers" value={metrics.chronicPerformers.length} icon="Activity" color="destructive" />
        <KPICard label="Avg Achievement" value={metrics.avgAchievement} format="percent" icon="Target" color={metrics.avgAchievement >= 80 ? 'success' : 'warning'} />
        <KPICard label="Total BACs" value={metrics.totalBACs} icon="Users" color="info" />
        <KPICard label="Total Visits" value={metrics.totalVisits} icon="Eye" color="default" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Monthly Missed Targets" description="BACs missing targets by month">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={metrics.monthlyMissedTargets}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Achievement Distribution" description="BACs by performance level">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={metrics.achievementDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" nameKey="name" label>
                {metrics.achievementDistribution.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <ChartContainer title="Monthly Achievement Trend" description="Average achievement % over time">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={metrics.monthlyAchievement}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 120]} tick={{ fontSize: 11 }} />
            <ReferenceLine y={100} stroke="hsl(var(--success))" strokeDasharray="5 5" />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Report Summary Section */}
      <div className="p-6 bg-card border rounded-2xl space-y-4">
        <h3 className="font-bold flex items-center gap-2 italic">
          <Sparkles className="w-5 h-5 text-primary" /> Performance Analysis Report
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The statistical analysis identifies <strong>{metrics.chronicPerformers.length}</strong> officers consistently falling below the required target threshold. 
          The average achievement velocity stands at <strong>{metrics.avgAchievement.toFixed(1)}%</strong>, with significant performance clusters in the 80-99% range.
        </p>
      </div>
    </div>
  );
}