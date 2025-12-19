// src/components/tabs/SLOTab.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ChartContainer from '@/components/shared/ChartContainer';

export default function SLOTab() {
  const data = [
    { name: 'ORF', val: 45 },
    { name: 'Reading', val: 38 },
    { name: 'Writing', val: 32 },
    { name: 'Dictation', val: 28 },
    { name: 'Word Reading', val: 55 },
  ];

  return (
    <div className="space-y-6">
      <ChartContainer title="Learning Outcome Mastery (Averages)">
        <div className="h-[400px]">
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="val" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>
    </div>
  );
}