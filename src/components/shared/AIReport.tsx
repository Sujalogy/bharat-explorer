// src/components/shared/AIReport.tsx
import { Sparkles, Download, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function AIReport({ data, title }: { data: any[], title: string }) {
  const generateInsights = () => {
    // Basic AI-style logic for demo
    const avg = data.reduce((a, b) => a + (b.actual_visits || 0), 0) / data.length;
    return `Analysis reveals a mean visit frequency of ${avg.toFixed(1)} per officer. 
            There is a significant ${avg > 15 ? 'upward' : 'downward'} trend in engagement. 
            Recommendation: Focus on districts with <70% achievement in the upcoming cycle.`;
  };

  return (
    <Card className="mt-8 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            AI Insight Report: {title}
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" /> Download Report
          </Button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-3 bg-background rounded-lg border">
            <p className="text-xs text-muted-foreground mb-1">Statistical Confidence</p>
            <p className="text-xl font-bold">94.2%</p>
          </div>
          <div className="p-3 bg-background rounded-lg border">
            <p className="text-xs text-muted-foreground mb-1">Primary Trend</p>
            <div className="flex items-center gap-1 text-success font-bold">
              <TrendingUp className="w-4 h-4" /> Improving
            </div>
          </div>
          <div className="p-3 bg-background rounded-lg border">
            <p className="text-xs text-muted-foreground mb-1">Risk Factors</p>
            <div className="flex items-center gap-1 text-destructive font-bold">
              <AlertCircle className="w-4 h-4" /> 2 Areas
            </div>
          </div>
        </div>

        <p className="text-sm leading-relaxed italic text-muted-foreground border-l-4 border-primary pl-4">
          "{generateInsights()}"
        </p>
      </CardContent>
    </Card>
  );
}