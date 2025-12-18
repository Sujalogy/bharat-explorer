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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      
      <div className={cn(
        "flex-1 flex flex-col overflow-hidden transition-all duration-300"
      )}>
        <FilterBar />
        
        <main className="flex-1 overflow-auto p-6 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
