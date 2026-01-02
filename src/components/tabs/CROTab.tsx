import { useState, useEffect } from 'react';
import { useDashboard } from '@/context/DashboardContext';
import ChartContainer from '@/components/shared/ChartContainer';
import KPICard from '@/components/shared/KPICard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, LineChart, Line
} from 'recharts';
import { Loader2, TrendingUp, Users, BookOpen, Target, CheckCircle, AlertCircle } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function CROTab() {
  const { state } = useDashboard();
  const [croData, setCroData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('overview');

  // Fetch CRO data from backend
  useEffect(() => {
    const fetchCROData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        
        if (state.filters.state && state.filters.state !== 'All') 
          params.append('state', state.filters.state);
        if (state.filters.district && state.filters.district !== 'All') 
          params.append('district', state.filters.district);
        if (state.filters.block && state.filters.block !== 'All') 
          params.append('block', state.filters.block);
        if (state.filters.academicYear && state.filters.academicYear !== 'All') 
          params.append('year', state.filters.academicYear);
        if (state.filters.month && state.filters.month !== 'All') 
          params.append('month', state.filters.month);
        if (state.filters.subject && state.filters.subject !== 'All') 
          params.append('subject', state.filters.subject);
        if (state.filters.grade && state.filters.grade !== 'All') 
          params.append('grade', state.filters.grade);
        if (state.filters.visitType && state.filters.visitType !== 'All') 
          params.append('visit_type', state.filters.visitType);

        const response = await fetch(`http://localhost:3000/api/v1/dashboard/cro?${params.toString()}`);
        const result = await response.json();
        
        if (result.success) {
          setCroData(result.data);
        }
      } catch (error) {
        console.error('Error fetching CRO data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCROData();
  }, [state.filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3">Loading CRO Analytics...</span>
      </div>
    );
  }

  if (!croData) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertCircle className="w-8 h-8 text-destructive mr-3" />
        <span>No CRO data available</span>
      </div>
    );
  }

  // Transform data for charts
  const gradeData = Object.entries(croData.grade_distribution || {}).map(([name, value]) => ({
    name,
    value
  }));

  const subjectData = Object.entries(croData.subject_distribution || {}).map(([name, value]) => ({
    name,
    value
  }));

  const visitTypeData = Object.entries(croData.visit_type_distribution || {}).map(([name, value]) => ({
    name,
    value
  }));

  const ssiData = Object.entries(croData.ssi_effectiveness || {}).map(([name, value]:any) => ({
    name,
    value: parseFloat(value) || 0
  }));

  const practiceData = Object.entries(croData.practice_indicators || {}).map(([name, value]:any) => ({
    name,
    value: parseFloat(value) || 0
  }));

  const tgData = Object.entries(croData.teacher_guide_stats || {}).map(([name, value]) => ({
    name,
    value
  }));

  const classSituationData = Object.entries(croData.class_situation_distribution || {}).map(([name, value]) => ({
    name,
    value
  }));

  const teacherGenderData = Object.entries(croData.teacher_gender_distribution || {}).map(([name, value]) => ({
    name,
    value
  }));

  const studentStats = croData.student_stats || {};
  const wbStats = croData.workbook_tracker_stats || {};
  const interventionStats = croData.intervention_stats || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Classroom Observation Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Comprehensive CRO monitoring across {croData.unique_schools} schools
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard 
          label="Total Observations" 
          value={croData.total_observations} 
          icon="Eye" 
          color="info"
        />
        <KPICard 
          label="Schools Covered" 
          value={croData.unique_schools} 
          icon="School" 
          color="success"
        />
        <KPICard 
          label="Active ARPs" 
          value={croData.unique_arps} 
          icon="Users" 
          color="default"
        />
        <KPICard 
          label="Attendance Rate" 
          value={studentStats.attendance_rate || 0} 
          format="percent"
          icon="CheckCircle" 
          color={studentStats.attendance_rate >= 75 ? 'success' : 'warning'}
        />
      </div>

      {/* Sub-Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pedagogy">Pedagogy</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="interventions">Interventions</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Grade Distribution */}
            <ChartContainer title="Grade-wise Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={gradeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 11}} />
                  <YAxis tick={{fontSize: 11}} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Subject Distribution */}
            <ChartContainer title="Subject-wise Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={subjectData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60} 
                    outerRadius={100} 
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Visit Type */}
            <ChartContainer title="Visit Type Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={visitTypeData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60} 
                    outerRadius={100} 
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {visitTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Class Situation */}
            <ChartContainer title="Class Situation">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={classSituationData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 11}} />
                  <YAxis tick={{fontSize: 11}} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Teacher Gender */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer title="Teacher Gender Distribution">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie 
                    data={teacherGenderData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={50} 
                    outerRadius={90} 
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {teacherGenderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </TabsContent>

        {/* PEDAGOGY TAB */}
        <TabsContent value="pedagogy" className="space-y-6 mt-6">
          {/* SSI Effectiveness */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer title="SSI Effectiveness">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ssiData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{fontSize: 11}} />
                  <YAxis type="category" dataKey="name" width={120} tick={{fontSize: 11}} />
                  <Tooltip formatter={(val) => `${val}%`} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Teacher Guide Stats */}
            <ChartContainer title="Teacher Guide Usage">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tgData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 11}} />
                  <YAxis tick={{fontSize: 11}} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Practice Indicators Radar */}
          <ChartContainer title="Practice Indicators (PP & GP) - Radar View">
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={practiceData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" tick={{fontSize: 11}} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{fontSize: 11}} />
                <Radar 
                  name="Adoption Rate" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.6} 
                />
                <Tooltip formatter={(val) => `${val}%`} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Practice Indicators Bar */}
          <ChartContainer title="Practice Indicators - Detailed Breakdown">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={practiceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 10}} />
                <YAxis domain={[0, 100]} tick={{fontSize: 11}} />
                <Tooltip formatter={(val) => `${val}%`} />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </TabsContent>

        {/* STUDENTS TAB */}
        <TabsContent value="students" className="space-y-6 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard 
              label="Total Enrolled" 
              value={studentStats.total_enrolled || 0} 
              icon="Users" 
              color="info"
            />
            <KPICard 
              label="Total Present" 
              value={studentStats.total_present || 0} 
              icon="CheckCircle" 
              color="success"
            />
            <KPICard 
              label="Boys Enrolled" 
              value={studentStats.boys_enrolled || 0} 
              icon="Users" 
              color="default"
            />
            <KPICard 
              label="Girls Enrolled" 
              value={studentStats.girls_enrolled || 0} 
              icon="Users" 
              color="default"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enrollment by Gender */}
            <ChartContainer title="Enrollment by Gender">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={[
                      { name: 'Boys', value: studentStats.boys_enrolled || 0 },
                      { name: 'Girls', value: studentStats.girls_enrolled || 0 }
                    ]} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60} 
                    outerRadius={100} 
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    <Cell fill="#3b82f6" />
                    <Cell fill="#ec4899" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Attendance by Gender */}
            <ChartContainer title="Attendance by Gender">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={[
                    { 
                      gender: 'Boys', 
                      enrolled: studentStats.boys_enrolled || 0, 
                      present: studentStats.boys_present || 0 
                    },
                    { 
                      gender: 'Girls', 
                      enrolled: studentStats.girls_enrolled || 0, 
                      present: studentStats.girls_present || 0 
                    }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="gender" tick={{fontSize: 11}} />
                  <YAxis tick={{fontSize: 11}} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="enrolled" name="Enrolled" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="present" name="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </TabsContent>

        {/* RESOURCES TAB */}
        <TabsContent value="resources" className="space-y-6 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard 
              label="Workbook Available" 
              value={wbStats.wb_available || 0} 
              icon="BookOpen" 
              color="info"
            />
            <KPICard 
              label="Workbook Used" 
              value={wbStats.wb_used || 0} 
              icon="CheckCircle" 
              color="success"
            />
            <KPICard 
              label="Workbook Checked" 
              value={wbStats.wb_checked || 0} 
              icon="Target" 
              color="warning"
            />
            <KPICard 
              label="Tracker Filled" 
              value={wbStats.tracker_filled || 0} 
              icon="CheckCircle" 
              color="success"
            />
          </div>

          <ChartContainer title="Workbook & Tracker Status">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={[
                  { name: 'WB Available', value: wbStats.wb_available || 0 },
                  { name: 'WB Used', value: wbStats.wb_used || 0 },
                  { name: 'WB Checked', value: wbStats.wb_checked || 0 },
                  { name: 'Tracker Filled', value: wbStats.tracker_filled || 0 }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 11}} />
                <YAxis tick={{fontSize: 11}} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </TabsContent>

        {/* INTERVENTIONS TAB */}
        <TabsContent value="interventions" className="space-y-6 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <KPICard 
              label="Demo Conducted" 
              value={interventionStats.demo_conducted || 0} 
              icon="Target" 
              color="success"
            />
            <KPICard 
              label="Remedial Done" 
              value={interventionStats.remedial_done || 0} 
              icon="TrendingUp" 
              color="warning"
            />
          </div>

          <ChartContainer title="Intervention Activities">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={[
                  { name: 'Demo Conducted', value: interventionStats.demo_conducted || 0 },
                  { name: 'Remedial Done', value: interventionStats.remedial_done || 0 }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 11}} />
                <YAxis tick={{fontSize: 11}} />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </TabsContent>
      </Tabs>
    </div>
  );
}