import { useMemo } from 'react';
import { VisitRecord, ChronicPlanner, MonthlyMetric, StateMetric, DistributionSegment } from '@/types/dashboard';

interface PlanningMetrics {
  chronicPlanners: ChronicPlanner[];
  avgPlanning: number;
  totalGap: number;
  totalRecords: number;
  monthlyUnderplanned: MonthlyMetric[];
  monthlyPlanningCompliance: MonthlyMetric[];
  statePlanning: StateMetric[];
  stateGap: StateMetric[];
  planningDistribution: DistributionSegment[];
  scatterData: Array<{ bacId: string; planning: number; achievement: number; gap: number; state: string }>;
}

export function usePlanningMetrics(data: VisitRecord[], threshold: number): PlanningMetrics {
  return useMemo(() => {
    if (data.length === 0) {
      return {
        chronicPlanners: [],
        avgPlanning: 0,
        totalGap: 0,
        totalRecords: 0,
        monthlyUnderplanned: [],
        monthlyPlanningCompliance: [],
        statePlanning: [],
        stateGap: [],
        planningDistribution: [],
        scatterData: []
      };
    }

    // Group by BAC
    const bacGroups: Record<string, VisitRecord[]> = {};
    data.forEach(record => {
      if (!bacGroups[record.bac_name]) {
        bacGroups[record.bac_name] = [];
      }
      bacGroups[record.bac_name].push(record);
    });

    // Calculate chronic planners
    const chronicPlanners: ChronicPlanner[] = [];
    Object.entries(bacGroups).forEach(([bacId, records]) => {
      const underplannedMonths = records.filter(r => r.target_visits < r.recommended_visits).length;
      if (underplannedMonths >= threshold) {
        const totalTarget = records.reduce((sum, r) => sum + r.target_visits, 0);
        const totalRecommended = records.reduce((sum, r) => sum + r.recommended_visits, 0);
        const avgPlanning = totalRecommended > 0 ? (totalTarget / totalRecommended) * 100 : 0;
        const gap = totalRecommended - totalTarget;
        
        const sample = records[0];
        chronicPlanners.push({
          bacId,
          bacName: sample.bac_name,
          state: sample.state,
          district: sample.district,
          block: sample.block,
          monthsUnderplanned: underplannedMonths,
          avgPlanning,
          totalTarget,
          totalRecommended,
          planningGap: gap,
          status: avgPlanning < 70 ? 'critical' : 'warning'
        });
      }
    });

    // Sort by months underplanned (descending)
    chronicPlanners.sort((a, b) => b.monthsUnderplanned - a.monthsUnderplanned);

    // Calculate overall planning percentage
    const totalTarget = data.reduce((sum, r) => sum + r.target_visits, 0);
    const totalRecommended = data.reduce((sum, r) => sum + r.recommended_visits, 0);
    const avgPlanning = totalRecommended > 0 ? (totalTarget / totalRecommended) * 100 : 0;

    // Total gap
    const totalGap = totalRecommended - totalTarget;

    // Monthly underplanned BACs
    const monthlyGroups: Record<string, VisitRecord[]> = {};
    data.forEach(record => {
      if (!monthlyGroups[record.month]) {
        monthlyGroups[record.month] = [];
      }
      monthlyGroups[record.month].push(record);
    });

    const monthOrder = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];
    
    const monthlyUnderplanned: MonthlyMetric[] = monthOrder
      .filter(month => monthlyGroups[month])
      .map((month, index) => {
        const records = monthlyGroups[month];
        const underplannedCount = new Set(
          records.filter(r => r.target_visits < r.recommended_visits).map(r => r.bac_name)
        ).size;
        return { month, monthIndex: index, value: underplannedCount };
      });

    // Monthly planning compliance
    const monthlyPlanningCompliance: MonthlyMetric[] = monthOrder
      .filter(month => monthlyGroups[month])
      .map((month, index) => {
        const records = monthlyGroups[month];
        const monthTarget = records.reduce((sum, r) => sum + r.target_visits, 0);
        const monthRecommended = records.reduce((sum, r) => sum + r.recommended_visits, 0);
        const compliance = monthRecommended > 0 ? (monthTarget / monthRecommended) * 100 : 0;
        return { month, monthIndex: index, value: compliance };
      });

    // State-wise planning
    const stateGroups: Record<string, VisitRecord[]> = {};
    data.forEach(record => {
      if (!stateGroups[record.state]) {
        stateGroups[record.state] = [];
      }
      stateGroups[record.state].push(record);
    });

    const statePlanning: StateMetric[] = Object.entries(stateGroups)
      .map(([state, records]) => {
        const stateTarget = records.reduce((sum, r) => sum + r.target_visits, 0);
        const stateRecommended = records.reduce((sum, r) => sum + r.recommended_visits, 0);
        return {
          state,
          value: stateRecommended > 0 ? (stateTarget / stateRecommended) * 100 : 0,
          count: new Set(records.map(r => r.bac_name)).size
        };
      })
      .sort((a, b) => b.value - a.value);

    const stateGap: StateMetric[] = Object.entries(stateGroups)
      .map(([state, records]) => {
        const gap = records.reduce((sum, r) => sum + (r.recommended_visits - r.target_visits), 0);
        return { state, value: gap };
      })
      .sort((a, b) => b.value - a.value);

    // Planning distribution
    let fullCount = 0, partialCount = 0, underCount = 0;
    Object.values(bacGroups).forEach(records => {
      const bacTarget = records.reduce((sum, r) => sum + r.target_visits, 0);
      const bacRecommended = records.reduce((sum, r) => sum + r.recommended_visits, 0);
      const planning = bacRecommended > 0 ? (bacTarget / bacRecommended) * 100 : 0;
      
      if (planning >= 100) fullCount++;
      else if (planning >= 80) partialCount++;
      else underCount++;
    });

    const planningDistribution: DistributionSegment[] = [
      { name: 'Full (≥100%)', value: fullCount, color: 'hsl(var(--success))' },
      { name: 'Partial (80-99%)', value: partialCount, color: 'hsl(var(--warning))' },
      { name: 'Under (<80%)', value: underCount, color: 'hsl(var(--destructive))' }
    ];

    // Scatter plot data (planning vs achievement)
    const scatterData = Object.entries(bacGroups).map(([bacId, records]) => {
      const bacTarget = records.reduce((sum, r) => sum + r.target_visits, 0);
      const bacRecommended = records.reduce((sum, r) => sum + r.recommended_visits, 0);
      const bacActual = records.reduce((sum, r) => sum + r.actual_visits, 0);
      
      return {
        bacId,
        planning: bacRecommended > 0 ? (bacTarget / bacRecommended) * 100 : 0,
        achievement: bacTarget > 0 ? (bacActual / bacTarget) * 100 : 0,
        gap: bacRecommended - bacTarget,
        state: records[0].state
      };
    });

    return {
      chronicPlanners,
      avgPlanning,
      totalGap,
      totalRecords: data.length,
      monthlyUnderplanned,
      monthlyPlanningCompliance,
      statePlanning,
      stateGap,
      planningDistribution,
      scatterData
    };
  }, [data, threshold]);
}
