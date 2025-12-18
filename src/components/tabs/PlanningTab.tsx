import { useDashboard } from '@/context/DashboardContext';
import { usePlanningMetrics } from '@/hooks/usePlanningMetrics';
import KPICard from '@/components/shared/KPICard';
import ChartContainer from '@/components/shared/ChartContainer';
import DataTable, { StatusBadge, Column } from '@/components/shared/DataTable';
import { ChronicPlanner } from '@/types/dashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine } from 'recharts';
import ThresholdControl from '../shared/ThresholdControl';

export default function PlanningTab() {
  const { state, dispatch } = useDashboard();
  const { filteredData, thresholds } = state;
  const metrics = usePlanningMetrics(filteredData, thresholds.chronicPlanning);

  const columns: Column<ChronicPlanner>[] = [
    { key: 'bacId', label: 'BAC ID', sortable: true },
    { key: 'bacName', label: 'Name', sortable: true },
    { key: 'state', label: 'State', sortable: true },
    { key: 'monthsUnderplanned', label: 'Months Under', sortable: true },
    { key: 'avgPlanning', label: 'Avg Planning %', sortable: true, render: (v) => `${(v as number).toFixed(1)}%` },
    { key: 'planningGap', label: 'Gap', sortable: true },
    { key: 'status', label: 'Status', render: (_, row) => <StatusBadge status={row.status} /> }
  ];

  const pieColors = ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

  const plannerData = metrics.chronicPlanners as unknown as Record<string, unknown>[];
  const plannerColumns = columns as unknown as Column<Record<string, unknown>>[];

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
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
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
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 120]} tick={{ fontSize: 11 }} />
            <ReferenceLine y={100} stroke="hsl(var(--success))" strokeDasharray="5 5" />
            <ReferenceLine y={80} stroke="hsl(var(--warning))" strokeDasharray="5 5" />
            <Tooltip />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer title="Chronic Under-planners" description={`BACs under-planning for ${thresholds.chronicPlanning}+ months`}>
        <DataTable data={plannerData} columns={plannerColumns} searchKey="bacName" onExport={() => { }} />
      </ChartContainer>
    </div>
  );
}
