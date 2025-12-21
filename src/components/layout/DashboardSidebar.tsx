import { cn } from '@/lib/utils';
import { useDashboard } from '@/context/DashboardContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, BarChart3, Users, FileText, ChevronRight, 
  ChevronLeft, Sun, Moon, Home, Package, GraduationCap, School 
} from 'lucide-react';

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'visit-reports', label: 'Visit Reports', icon: FileText },
  { id: 'cro', label: 'CRO Monitoring', icon: BarChart3 },
  { id: 'tlm', label: 'TLM Delivery', icon: Package },
  { id: 'slo', label: 'Learning Outcomes', icon: GraduationCap },
  { id: 'school-profile', label: 'School Profile', icon: School },
  { id: 'teacher-profile', label: 'Teacher Profile', icon: Users },
];

export default function DashboardSidebar() {
  const { state, dispatch } = useDashboard();
  const { activeTab, sidebarCollapsed, darkMode } = state;

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 border-r border-sidebar-border fixed left-0 top-0 z-40",
        sidebarCollapsed ? "w-[60px]" : "w-[260px]"
      )}
    >
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className={cn("flex items-center gap-3 overflow-hidden", sidebarCollapsed && "justify-center")}>
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <LayoutDashboard className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {!sidebarCollapsed && (
            <div className="animate-slide-in-left">
              <h1 className="text-sm font-semibold text-sidebar-foreground">LLF SMT Dashboard</h1>
              <p className="text-[10px] text-sidebar-muted">Visit Management</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4 px-2 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: item.id })}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                  "hover:bg-sidebar-accent",
                  isActive ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-muted hover:text-sidebar-foreground",
                  sidebarCollapsed && "justify-center px-2"
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-sidebar-primary")} />
                {!sidebarCollapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          className="w-full mb-2 text-sidebar-muted"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4 mr-2" /> <span className="text-xs">Collapse</span></>}
        </Button>
        <Separator className="mb-2 bg-sidebar-border" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
          className="w-full text-sidebar-muted"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {!sidebarCollapsed && <span className="ml-2 text-xs">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </Button>
      </div>
    </aside>
  );
}