import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  CheckCircle2, ClipboardList, GraduationCap, Microscope,
  Activity, Eye, Target, School, TrendingUp, BarChart3, Layers
} from 'lucide-react';

interface OverviewSidebarProps {
  activeContext: 'Visit' | 'CRO' | 'SLO' | 'TLM';
  currentFocus: {
    level: string;
    name: string;
    actual: number;
    target: number;
    obs: number;
    avgSlo: number;
    tlmUsage: number;
    schools: number;
    totalSchools: number;
    achievement: number;
    area: number;
    practices: {
      ss2: number;
      ss3: number;
      pp1: number;
      pp2: number;
      pp3: number;
      pp4: number;
      gp1: number;
      gp2: number;
      gp3: number;
    };
  };
}

function getColorClass(val: number) {
  if (val < 45) return 'text-rose-600';
  if (val < 75) return 'text-amber-500';
  return 'text-emerald-600';
}

function getBgColorClass(val: number) {
  if (val < 45) return 'bg-rose-500';
  if (val < 75) return 'bg-amber-500';
  return 'bg-emerald-500';
}

const MiniScoreCard = ({ label, value }: { label: string; value: number }) => (
  <div className={`bg-white border rounded-lg p-2 shadow-sm border-l-4 ${
    value < 45 ? 'border-l-rose-500' : value < 75 ? 'border-l-amber-500' : 'border-l-emerald-500'
  }`}>
    <p className="text-[8px] font-bold text-muted-foreground uppercase mb-1">{label}</p>
    <div className="flex items-baseline gap-1">
      <span className={`text-sm font-black ${getColorClass(value)}`}>{value.toFixed(0)}%</span>
      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${getBgColorClass(value)}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  </div>
);

const PracticeBox = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-white border rounded-md p-1.5 text-center shadow-sm">
    <p className="text-[8px] font-bold text-muted-foreground mb-1">{label}</p>
    <p className={`text-[10px] font-black ${getColorClass(value)}`}>{Math.round(value)}%</p>
  </div>
);

export default function OverviewSidebar({ activeContext, currentFocus }: OverviewSidebarProps) {
  return (
    <Card className="flex-1 overflow-hidden flex flex-col shadow-lg border-muted/40">
      <CardHeader className="py-4 border-b bg-slate-50">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">
            Context: {activeContext} | Level: {currentFocus.level}
          </span>
        </div>
        <CardTitle className="text-xl font-bold capitalize flex items-center gap-2">
          {activeContext === 'Visit' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          {activeContext === 'CRO' && <ClipboardList className="w-5 h-5 text-blue-500" />}
          {activeContext === 'SLO' && <GraduationCap className="w-5 h-5 text-indigo-500" />}
          {activeContext === 'TLM' && <Microscope className="w-5 h-5 text-amber-500" />}
          {currentFocus.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-hide">
        {/* VISIT CONTEXT */}
        {activeContext === 'Visit' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                <Activity className="w-3 h-3" /> Visit Adherence
              </h4>
              <div className="bg-white border rounded-xl p-3 flex justify-between items-center shadow-sm border-l-4 border-l-emerald-500">
                <div>
                  <p className={`text-2xl font-black ${getColorClass(currentFocus.achievement)}`}>
                    {currentFocus.achievement.toFixed(1)}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">Adherence Rate</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{currentFocus.actual} / {currentFocus.target}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Visit Days</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 border rounded-lg p-3 space-y-3">
              <p className="text-[9px] font-bold uppercase text-slate-500">Visit Coverage Trend</p>
              <div className="flex items-center gap-4">
                <TrendingUp className="w-8 h-8 text-emerald-500 p-1.5 bg-emerald-50 rounded-md" />
                <div>
                  <p className="text-xs font-bold text-slate-700">Strong Coverage</p>
                  <p className="text-[10px] text-slate-500">
                    Visit frequency is consistent across {currentFocus.schools} schools.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CRO CONTEXT */}
        {activeContext === 'CRO' && (
          <div className="space-y-5">
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                <Eye className="w-3 h-3" /> Classroom Insights
              </h4>
              <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ClipboardList className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-[10px] text-blue-900 uppercase font-bold leading-tight">
                    Total<br />Classroom Obs
                  </span>
                </div>
                <p className="text-xl font-black text-blue-700">{currentFocus.obs}</p>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                <Target className="w-3 h-3" /> Practice Quality (SSI)
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <MiniScoreCard label="SS2 Effective" value={currentFocus.practices.ss2} />
                <MiniScoreCard label="SS3 Effective" value={currentFocus.practices.ss3} />
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {['pp1', 'pp2', 'pp3', 'pp4'].map(p => (
                  <PracticeBox 
                    key={p} 
                    label={p.toUpperCase()} 
                    value={currentFocus.practices[p as keyof typeof currentFocus.practices]} 
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SLO CONTEXT */}
        {activeContext === 'SLO' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3" /> Learning Outcomes (SLO)
              </h4>
              <div className="bg-indigo-50/30 border border-indigo-100 rounded-xl p-4 text-center">
                <p className="text-3xl font-black text-indigo-700">{currentFocus.avgSlo.toFixed(1)}%</p>
                <p className="text-[10px] text-indigo-900 uppercase font-bold tracking-wider">
                  Average Learning Score
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-white border rounded-lg p-3 shadow-sm border-l-4 border-l-indigo-500">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Fluency Achievement</p>
                <p className="text-lg font-black text-slate-800">74.2%</p>
              </div>
              <div className="bg-white border rounded-lg p-3 shadow-sm border-l-4 border-l-indigo-500">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Comprehension Level</p>
                <p className="text-lg font-black text-slate-800">62.8%</p>
              </div>
            </div>
          </div>
        )}

        {/* TLM CONTEXT */}
        {activeContext === 'TLM' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                <Layers className="w-3 h-3" /> TLM Usage & Kits
              </h4>
              <div className="bg-amber-50/30 border border-amber-100 rounded-xl p-4 text-center">
                <p className="text-3xl font-black text-amber-600">{currentFocus.tlmUsage.toFixed(1)}%</p>
                <p className="text-[10px] text-amber-900 uppercase font-bold tracking-wider">
                  Average Kit Utilization
                </p>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-4 space-y-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Inventory Status</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Math Kits Available</span>
                  <span>88%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full">
                  <div className="w-[88%] h-full bg-amber-500 rounded-full" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Literacy Kits Available</span>
                  <span>92%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full">
                  <div className="w-[92%] h-full bg-amber-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer School Info (Common) */}
        <div className="pt-2 border-t mt-auto flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold uppercase text-[10px] text-slate-600">Schools Coverage</span>
          </div>
          <span className="text-[11px] font-black bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full">
            {currentFocus.schools} / {currentFocus.totalSchools}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}