// src/components/tabs/SchoolProfilingTab.tsx
import ChartContainer from '@/components/shared/ChartContainer';
import KPICard from '@/components/shared/KPICard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

export default function SchoolProfilingTab() {
  const infrastructureData = [
    { name: 'Functional Library', value: 340 },
    { name: 'TLM Room', value: 280 },
    { name: 'Digital Lab', value: 120 },
    { name: 'No Specific Facility', value: 60 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard label="Total Schools (UDISE)" value={1240} icon="Building2" />
        <KPICard label="Schools Verified" value={1185} icon="CheckCircle" color="success" />
        <KPICard label="Infrastructure Index" value="7.2/10" icon="Zap" color="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="School Infrastructure Distribution">
          <div className="h-[300px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie 
                  data={infrastructureData} 
                  cx="50%" cy="50%" 
                  innerRadius={60} outerRadius={100} 
                  paddingAngle={5} dataKey="value"
                >
                  {infrastructureData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        <ChartContainer title="UDISE Verification Status">
          <div className="space-y-4">
            {['Jharkhand', 'Haryana', 'Uttar Pradesh'].map((state) => (
              <div key={state} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{state}</span>
                  <span className="text-muted-foreground">92%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '92%' }} />
                </div>
              </div>
            ))}
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}