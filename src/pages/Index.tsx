import MapViewer from '@/components/map/MapViewer';
import DashboardLayout from '@/components/layout/DashboardLayout';
import OverviewTab from '@/components/tabs/OverviewTab';
import PerformanceTab from '@/components/tabs/PerformanceTab';
import PlanningTab from '@/components/tabs/PlanningTab';
import { useDashboard } from '@/context/DashboardContext';

const Index = () => {
  const { state } = useDashboard();

  // Logic to switch content based on sidebar selection
  const renderContent = () => {
    switch (state.activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'performance':
        return <PerformanceTab />;
      case 'planning':
        return <PlanningTab />;
      // Maps are often integrated into Overview or a specific Map tab
      case 'map':
      default:
        return <MapViewer />;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto bg-background">
        {renderContent()}
      </div>
    </DashboardLayout>
  );
};

export default Index;