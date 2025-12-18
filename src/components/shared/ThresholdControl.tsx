import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ThresholdControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  unit?: string;
  className?: string;
}

export default function ThresholdControl({
  label,
  value,
  onChange,
  min = 1,
  max = 12,
  unit = 'months',
  className
}: ThresholdControlProps) {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1);
  };

  const handleIncrement = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className={cn("flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-2", className)}>
      <span className="text-sm text-muted-foreground">{label}:</span>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-7 w-7"
          onClick={handleDecrement}
          disabled={value <= min}
        >
          <Minus className="w-3.5 h-3.5" />
        </Button>
        <span className="text-sm font-semibold text-foreground min-w-[60px] text-center">
          {value} {unit}
        </span>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-7 w-7"
          onClick={handleIncrement}
          disabled={value >= max}
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
