// src/pages/Index.tsx
import { useDashboard } from '@/context/DashboardContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import HomeTab from '@/components/tabs/HomeTab';
import OverviewTab from '@/components/tabs/OverviewTab';
import PerformanceTab from '@/components/tabs/PerformanceTab';
import PlanningTab from '@/components/tabs/PlanningTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const { state } = useDashboard();
  const { activeTab } = state;

const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />;
      case 'overview':
        return <OverviewTab />;
      case 'visit-reports':
        return (
          <div className="space-y-6 animate-fade-in">
            <Tabs defaultValue="performance" className="w-full">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="planning">Planning</TabsTrigger>
              </TabsList>
              <TabsContent value="performance" className="mt-4">
                <PerformanceTab />
              </TabsContent>
              <TabsContent value="planning" className="mt-4">
                <PlanningTab />
              </TabsContent>
            </Tabs>
          </div>
        );
        
      default:
        return <HomeTab />;
    }
  };

  return (
    <DashboardLayout>
      {renderContent()}
    </DashboardLayout>
  );
};

export default Index;