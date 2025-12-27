import { Search, X, Filter } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
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
    filters.academicYear !== 'All',
    filters.state !== 'All',
    filters.district !== 'All',
    filters.block !== 'All',
    filters.subject !== 'All',
    filters.grade !== 'All',
    filters.visitType !== 'All'
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
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Years</SelectItem>
            {availableFilters.academicYears.map((year: string) => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* State */}
        <Select value={filters.state} onValueChange={(v) => handleFilterChange('state', v)}>
          <SelectTrigger className="w-[150px] h-9 text-xs">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All States</SelectItem>
            {availableFilters.states.map((s: string) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* District */}
        <Select 
          value={filters.district} 
          onValueChange={(v) => handleFilterChange('district', v)}
          disabled={filters.state === 'All'}
        >
          <SelectTrigger className="w-[150px] h-9 text-xs">
            <SelectValue placeholder="District" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Districts</SelectItem>
            {availableFilters.districts.map((d: string) => (
              <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Block */}
        <Select 
          value={filters.block} 
          onValueChange={(v) => handleFilterChange('block', v)}
          disabled={filters.district === 'All'}
        >
          <SelectTrigger className="w-[150px] h-9 text-xs">
            <SelectValue placeholder="Block" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Blocks</SelectItem>
            {availableFilters.blocks.map((b: string) => (
              <SelectItem key={b} value={b} className="capitalize">{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Subject */}
        <Select value={filters.subject} onValueChange={(v) => handleFilterChange('subject', v)}>
          <SelectTrigger className="w-[130px] h-9 text-xs">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Subjects</SelectItem>
            <SelectItem value="Literacy">Literacy</SelectItem>
            <SelectItem value="Numeracy">Numeracy</SelectItem>
          </SelectContent>
        </Select>

        {/* Grade */}
        <Select value={filters.grade} onValueChange={(v) => handleFilterChange('grade', v)}>
          <SelectTrigger className="w-[120px] h-9 text-xs">
            <SelectValue placeholder="Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Grades</SelectItem>
            <SelectItem value="Grade 1">Grade 1</SelectItem>
            <SelectItem value="Grade 2">Grade 2</SelectItem>
            <SelectItem value="Grade 3">Grade 3</SelectItem>
          </SelectContent>
        </Select>

        {/* Visit Type */}
        <Select value={filters.visitType} onValueChange={(v) => handleFilterChange('visitType', v)}>
          <SelectTrigger className="w-[130px] h-9 text-xs">
            <SelectValue placeholder="Visit Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            <SelectItem value="Individual">Individual</SelectItem>
            <SelectItem value="Joint">Joint</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1 max-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search schools..." className="pl-8 h-9 text-xs" />
        </div>

        {activeFilterCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => dispatch({ type: 'RESET_FILTERS' })} 
            className="h-9 text-xs text-muted-foreground"
          >
            <X className="w-3.5 h-3.5 mr-1" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}