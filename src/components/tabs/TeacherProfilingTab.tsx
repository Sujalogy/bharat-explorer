// src/components/tabs/TeacherProfilingTab.tsx
import ChartContainer from '@/components/shared/ChartContainer';
import KPICard from '@/components/shared/KPICard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TeacherProfilingTab() {
  const trainingData = [
    { name: 'L1 Training', completed: 85, pending: 15 },
    { name: 'L2 Training', completed: 62, pending: 38 },
    { name: 'SLO Workshop', completed: 45, pending: 55 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard label="Total Teachers" value={3420} icon="Users" />
        <KPICard label="Training Completion" value={72} format="percent" color="success" icon={''} />
        <KPICard label="Average Experience" value="8.4 Yrs" icon="Clock" />
        <KPICard label="LLF Certified" value={1240} color="info" icon={''} />
      </div>

      <ChartContainer title="Training Progress by Module">
        <div className="h-[350px]">
          <ResponsiveContainer>
            <BarChart data={trainingData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" name="Completed (%)" fill="hsl(var(--primary))" stackId="a" />
              <Bar dataKey="pending" name="Pending (%)" fill="hsl(var(--muted))" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>
    </div>
  );
}