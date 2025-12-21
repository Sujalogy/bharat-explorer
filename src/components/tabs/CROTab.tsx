// src/components/tabs/CROTab.tsx
import { useState, useMemo, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChartContainer from '@/components/shared/ChartContainer';
import KPICard from '@/components/shared/KPICard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AIReport from '@/components/shared/AIReport';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function CROTab() {
  const { state } = useDashboard();
  const [croData, setCroData] = useState<any>(null);
  const [subTab, setSubTab] = useState('compliance');

  useEffect(() => {
    fetch('http://localhost:3001/cro')
      .then(res => res.json())
      .then(data => setCroData(data));
  }, []);

  // SSI Logic: Dynamically set targets based on the selected state
  const ssiTargets = useMemo(() => {
    const currentState = state.filters.state;
    if (currentState === 'Uttar Pradesh') return { ssi2: 60, ssi3: 50 };
    if (currentState === 'Haryana') return { ssi2: 40, ssi3: 30 };
    return { ssi2: 50, ssi3: 40 }; // Default
  }, [state.filters.state]);

  return (
    <div className="space-y-6">
      <Tabs value={subTab} onValueChange={setSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="compliance">Basic Compliance</TabsTrigger>
          <TabsTrigger value="kpi2">Teacher Guide (KPI2)</TabsTrigger>
          <TabsTrigger value="ssi">SSI Indicators</TabsTrigger>
        </TabsList>

        {/* --- Sub-Tab 1: Basic Compliance --- */}
        <TabsContent value="compliance" className="space-y-6 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard label="Enrolled Students" value={croData?.kpis.enrolled_students} icon="Users" />
            <KPICard label="Attendance %" value={82} format="percent" color="info" icon={''} />
            <KPICard label="Schools Covered" value="450 / 500" icon="School" />
            <KPICard label="Multigrade Schools" value={124} color="warning" icon={''} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer title="Visit Distribution by Grade">
              <div className="h-[300px]">
                <ResponsiveContainer>
                  <BarChart data={[{ name: 'G1', val: 40 }, { name: 'G2', val: 35 }, { name: 'G3', val: 25 }]}>
                    <XAxis dataKey="name" /> <YAxis /> <Tooltip />
                    <Bar dataKey="val" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>
            <ChartContainer title="Visit Type: Individual vs Joint">
              <div className="h-[300px]">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={[{ name: 'Individual', value: 70 }, { name: 'Joint', value: 30 }]} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {COLORS.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>
          </div>
        </TabsContent>

        {/* --- Sub-Tab 2: KPI2 (Teacher Guides) --- */}
        <TabsContent value="kpi2" className="mt-6">
          <ChartContainer title="Teacher Guide Adherence">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <span>Guides Available in Class</span>
                <span className="font-bold text-success">92%</span>
              </div>
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <span>Followed All Steps</span>
                <span className="font-bold text-primary">64%</span>
              </div>
              <div className="flex justify-between items-center p-4 border rounded-lg bg-destructive/5 text-destructive border-destructive/20">
                <span>Followed Partial Steps</span>
                <span className="font-bold">28%</span>
              </div>
            </div>
          </ChartContainer>
        </TabsContent>

        {/* --- Sub-Tab 3: SSI Indicators --- */}
        <TabsContent value="ssi" className="space-y-6 mt-6">
          <div className="bg-primary/10 p-4 rounded-lg flex items-center justify-between border border-primary/20">
            <span className="text-sm font-medium">Current State Targets:</span>
            <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
              <span>SSI-2: {ssiTargets.ssi2}%</span>
              <span>SSI-3: {ssiTargets.ssi3}%</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <KPICard label="Effective SSI-2" value={58} format="percent" color={58 >= ssiTargets.ssi2 ? 'success' : 'destructive'} icon={''} />
            <KPICard label="Effective SSI-3" value={42} format="percent" color={42 >= ssiTargets.ssi3 ? 'success' : 'destructive'} icon={''} />
          </div>
          <AIReport data={state.filteredData} title="CRO SSI Compliance" />
        </TabsContent>
      </Tabs>
    </div>
  );
}