import { ReactNode } from 'react';
import DashboardSidebar from './DashboardSidebar';
import FilterBar from './FilterBar';
import { useDashboard } from '@/context/DashboardContext';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { state } = useDashboard();
  const { sidebarCollapsed } = state;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      
      {/* FIX: Added dynamic padding-left to push content 
        to the right of the FIXED sidebar 
      */}
      <div className={cn(
        "flex-1 flex flex-col overflow-hidden transition-all duration-300",
        sidebarCollapsed ? "pl-[60px]" : "pl-[260px]"
      )}>
        <FilterBar />
        
        <main className="flex-1 overflow-auto p-6 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}