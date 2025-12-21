// src/components/shared/KPICard.tsx
import { TrendingUp, TrendingDown, Minus, Activity, Users, Target, Eye, School, BarChart3, Calendar, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Activity, Users, Target, Eye, School, BarChart3, Calendar, CheckCircle, TrendingUp
};

interface KPICardProps {
  label: string;
  value: number | string | undefined; // Allow undefined for loading states
  change?: number;
  changeLabel?: string;
  icon: string;
  color?: 'default' | 'success' | 'warning' | 'destructive' | 'info';
  format?: 'number' | 'percent' | 'currency';
  className?: string;
}

export default function KPICard({
  label,
  value,
  change,
  changeLabel = 'vs last period',
  icon,
  color = 'default',
  format = 'number',
  className
}: KPICardProps) {
  const IconComponent = iconMap[icon] || Activity;
  
  // FIX: Added defensive check for undefined/null values
  const formatValue = (val: number | string | undefined) => {
    if (val === undefined || val === null) return "0"; // Default fallback
    if (typeof val === 'string') return val;
    
    // Check for NaN which can happen during math operations on empty data
    if (isNaN(val)) return "0";

    switch (format) {
      case 'percent':
        return `${val.toFixed(1)}%`;
      case 'currency':
        return `₹${val.toLocaleString()}`;
      default:
        return val.toLocaleString();
    }
  };

  const colorClasses = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    destructive: 'bg-destructive/10 text-destructive',
    info: 'bg-info/10 text-info'
  };

  const TrendIcon = change !== undefined 
    ? change > 0 ? TrendingUp 
    : change < 0 ? TrendingDown 
    : Minus
    : null;

  const trendColor = change !== undefined
    ? change > 0 ? 'text-success'
    : change < 0 ? 'text-destructive'
    : 'text-muted-foreground'
    : '';

  return (
    <Card className={cn("kpi-card overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              {label}
            </p>
            <p className="text-2xl font-bold text-foreground animate-count-up">
              {formatValue(value)}
            </p>
            {change !== undefined && (
              <div className={cn("flex items-center gap-1 mt-1.5", trendColor)}>
                {TrendIcon && <TrendIcon className="w-3.5 h-3.5" />}
                <span className="text-xs font-medium">
                  {change > 0 ? '+' : ''}{change.toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">{changeLabel}</span>
              </div>
            )}
          </div>
          <div className={cn("p-2.5 rounded-lg", colorClasses[color])}>
            <IconComponent className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}