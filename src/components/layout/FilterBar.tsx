import { Search, X, Filter } from 'lucide-react';
import { useDashboard, ACADEMIC_YEARS } from '@/context/DashboardContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function FilterBar() {
  const { state, dispatch, availableFilters } = useDashboard();
  const { filters } = state;

  const activeFilterCount = [
    filters.state !== 'All States',
    filters.district !== 'All Districts',
    filters.block !== 'All Blocks',
    filters.bacId !== 'All BACs'
  ].filter(Boolean).length;

  const handleFilterChange = (key: string, value: string) => {
    dispatch({ type: 'SET_FILTERS', payload: { [key]: value } });
  };

  return (
    <div className="bg-card border-b border-border px-4 py-3 sticky top-0 z-30">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 mr-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{activeFilterCount}</Badge>
          )}
        </div>

        {/* Academic Year */}
        <Select value={filters.academicYear} onValueChange={(v) => handleFilterChange('academicYear', v)}>
          <SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ACADEMIC_YEARS.map(year => <SelectItem key={year} value={year}>{year}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* State */}
        <Select value={filters.state} onValueChange={(v) => handleFilterChange('state', v)}>
          <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue placeholder="State" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All States">All States</SelectItem>
            {availableFilters.states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* District - Hierarchical */}
        <Select 
          value={filters.district} 
          onValueChange={(v) => handleFilterChange('district', v)}
          disabled={filters.state === 'All States'}
        >
          <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue placeholder="District" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All Districts">All Districts</SelectItem>
            {availableFilters.districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* Block - Hierarchical */}
        <Select 
          value={filters.block} 
          onValueChange={(v) => handleFilterChange('block', v)}
          disabled={filters.district === 'All Districts'}
        >
          <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder="Block" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All Blocks">All Blocks</SelectItem>
            {availableFilters.blocks.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="relative flex-1 max-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search records..." className="pl-8 h-9 text-xs" />
        </div>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'RESET_FILTERS' })} className="h-9 text-xs text-muted-foreground">
            <X className="w-3.5 h-3.5 mr-1" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}