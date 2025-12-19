// src/pages/Index.tsx
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useDashboard } from "@/context/DashboardContext";
import HomeTab from "@/components/tabs/HomeTab";
import OverviewTab from "@/components/tabs/OverviewTab";
import VisitReportTab from "@/components/tabs/VisitReportTab"; // Matches sidebar 'visit-reports'
import CROTab from "@/components/tabs/CROTab";
import TLMTab from "@/components/tabs/TLMTab";
import SLOTab from "@/components/tabs/SLOTab";
import SchoolProfilingTab from "@/components/tabs/SchoolProfilingTab";
import TeacherProfilingTab from "@/components/tabs/TeacherProfilingTab";

export default function Index() {
  const { state } = useDashboard();

  const renderActiveTab = () => {
    // These cases must match the 'id' fields in navItems in DashboardSidebar.tsx
    switch (state.activeTab) {
      case 'home': 
        return <HomeTab />;
      case 'overview': 
        return <OverviewTab />;
      case 'visit-reports': 
        return <VisitReportTab />;
      case 'cro': 
        return <CROTab />;
      case 'tlm': 
        return <TLMTab />;
      case 'slo': 
        return <SLOTab />;
      case 'school-profile': 
        return <SchoolProfilingTab />;
      case 'teacher-profile': 
        return <TeacherProfilingTab />;
      default: 
        return <HomeTab />;
    }
  };

  return (
    <DashboardLayout>
      {renderActiveTab()}
    </DashboardLayout>
  );
}