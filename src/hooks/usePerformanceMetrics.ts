import { useMemo } from 'react';
import { VisitRecord, ChronicPerformer, MonthlyMetric, StateMetric, DistributionSegment } from '@/types/dashboard';

interface PerformanceMetrics {
  chronicPerformers: ChronicPerformer[];
  avgAchievement: number;
  totalBACs: number;
  totalVisits: number;
  monthlyMissedTargets: MonthlyMetric[];
  monthlyAchievement: MonthlyMetric[];
  statePerformance: StateMetric[];
  achievementDistribution: DistributionSegment[];
}

export function usePerformanceMetrics(data: VisitRecord[], threshold: number): PerformanceMetrics {
  return useMemo(() => {
    if (data.length === 0) {
      return {
        chronicPerformers: [],
        avgAchievement: 0,
        totalBACs: 0,
        totalVisits: 0,
        monthlyMissedTargets: [],
        monthlyAchievement: [],
        statePerformance: [],
        achievementDistribution: []
      };
    }

    // Group by BAC
    const bacGroups: Record<string, VisitRecord[]> = {};
    data.forEach(record => {
      if (!bacGroups[record.bac_id]) {
        bacGroups[record.bac_id] = [];
      }
      bacGroups[record.bac_id].push(record);
    });

    // Calculate chronic performers
    const chronicPerformers: ChronicPerformer[] = [];
    Object.entries(bacGroups).forEach(([bacId, records]) => {
      const missedMonths = records.filter(r => r.actual_visits < r.target_visits).length;
      if (missedMonths >= threshold) {
        const totalActual = records.reduce((sum, r) => sum + r.actual_visits, 0);
        const totalTarget = records.reduce((sum, r) => sum + r.target_visits, 0);
        const avgAchievement = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;
        
        const sample = records[0];
        chronicPerformers.push({
          bacId,
          bacName: sample.bac_name,
          state: sample.state,
          district: sample.district,
          block: sample.block,
          monthsMissed: missedMonths,
          avgAchievement,
          totalActual,
          totalTarget,
          status: avgAchievement < 70 ? 'critical' : 'warning'
        });
      }
    });

    // Sort by months missed (descending)
    chronicPerformers.sort((a, b) => b.monthsMissed - a.monthsMissed);

    // Calculate overall average achievement
    const totalActual = data.reduce((sum, r) => sum + r.actual_visits, 0);
    const totalTarget = data.reduce((sum, r) => sum + r.target_visits, 0);
    const avgAchievement = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;

    // Total unique BACs
    const totalBACs = Object.keys(bacGroups).length;

    // Total visits
    const totalVisits = totalActual;

    // Monthly missed targets
    const monthlyGroups: Record<string, VisitRecord[]> = {};
    data.forEach(record => {
      if (!monthlyGroups[record.month]) {
        monthlyGroups[record.month] = [];
      }
      monthlyGroups[record.month].push(record);
    });

    const monthOrder = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];
    
    const monthlyMissedTargets: MonthlyMetric[] = monthOrder
      .filter(month => monthlyGroups[month])
      .map((month, index) => {
        const records = monthlyGroups[month];
        const missedCount = new Set(
          records.filter(r => r.actual_visits < r.target_visits).map(r => r.bac_id)
        ).size;
        return { month, monthIndex: index, value: missedCount };
      });

    // Monthly achievement percentage
    const monthlyAchievement: MonthlyMetric[] = monthOrder
      .filter(month => monthlyGroups[month])
      .map((month, index) => {
        const records = monthlyGroups[month];
        const monthActual = records.reduce((sum, r) => sum + r.actual_visits, 0);
        const monthTarget = records.reduce((sum, r) => sum + r.target_visits, 0);
        const achievement = monthTarget > 0 ? (monthActual / monthTarget) * 100 : 0;
        return { month, monthIndex: index, value: achievement };
      });

    // State-wise performance
    const stateGroups: Record<string, VisitRecord[]> = {};
    data.forEach(record => {
      if (!stateGroups[record.state]) {
        stateGroups[record.state] = [];
      }
      stateGroups[record.state].push(record);
    });

    const statePerformance: StateMetric[] = Object.entries(stateGroups)
      .map(([state, records]) => {
        const stateActual = records.reduce((sum, r) => sum + r.actual_visits, 0);
        const stateTarget = records.reduce((sum, r) => sum + r.target_visits, 0);
        return {
          state,
          value: stateTarget > 0 ? (stateActual / stateTarget) * 100 : 0,
          count: new Set(records.map(r => r.bac_id)).size
        };
      })
      .sort((a, b) => b.value - a.value);

    // Achievement distribution
    let highCount = 0, mediumCount = 0, lowCount = 0;
    Object.values(bacGroups).forEach(records => {
      const bacActual = records.reduce((sum, r) => sum + r.actual_visits, 0);
      const bacTarget = records.reduce((sum, r) => sum + r.target_visits, 0);
      const achievement = bacTarget > 0 ? (bacActual / bacTarget) * 100 : 0;
      
      if (achievement >= 100) highCount++;
      else if (achievement >= 80) mediumCount++;
      else lowCount++;
    });

    const achievementDistribution: DistributionSegment[] = [
      { name: 'High (≥100%)', value: highCount, color: 'hsl(var(--success))' },
      { name: 'Medium (80-99%)', value: mediumCount, color: 'hsl(var(--warning))' },
      { name: 'Low (<80%)', value: lowCount, color: 'hsl(var(--destructive))' }
    ];

    return {
      chronicPerformers,
      avgAchievement,
      totalBACs,
      totalVisits,
      monthlyMissedTargets,
      monthlyAchievement,
      statePerformance,
      achievementDistribution
    };
  }, [data, threshold]);
}
