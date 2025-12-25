import { ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChartContainerProps {
  title: ReactNode;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export default function ChartContainer({
  title,
  description,
  children,
  className,
  action
}: ChartContainerProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            {description && (
              <CardDescription className="text-sm mt-0.5">{description}</CardDescription>
            )}
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {children}
      </CardContent>
    </Card>
  );
}
