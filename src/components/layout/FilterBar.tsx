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
import { academicYears } from '@/data/mockDashboardData';

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

  const handleClearFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
  };

  return (
    <div className="bg-card border-b border-border px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Dashboard Title */}
        <div className="flex items-center gap-2 mr-4">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </div>

        {/* Academic Year */}
        <Select 
          value={filters.academicYear} 
          onValueChange={(v) => handleFilterChange('academicYear', v)}
        >
          <SelectTrigger className="w-[130px] h-9 text-sm">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {academicYears.map(year => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* State */}
        <Select 
          value={filters.state} 
          onValueChange={(v) => handleFilterChange('state', v)}
        >
          <SelectTrigger className="w-[150px] h-9 text-sm">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All States">All States</SelectItem>
            {availableFilters.states.map(state => (
              <SelectItem key={state} value={state}>{state}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* District */}
        <Select 
          value={filters.district} 
          onValueChange={(v) => handleFilterChange('district', v)}
          disabled={filters.state === 'All States'}
        >
          <SelectTrigger className="w-[150px] h-9 text-sm">
            <SelectValue placeholder="District" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Districts">All Districts</SelectItem>
            {availableFilters.districts.map(district => (
              <SelectItem key={district} value={district}>{district}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Block */}
        <Select 
          value={filters.block} 
          onValueChange={(v) => handleFilterChange('block', v)}
          disabled={filters.district === 'All Districts'}
        >
          <SelectTrigger className="w-[140px] h-9 text-sm">
            <SelectValue placeholder="Block" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Blocks">All Blocks</SelectItem>
            {availableFilters.blocks.map(block => (
              <SelectItem key={block} value={block}>{block}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* BAC */}
        <Select 
          value={filters.bacId} 
          onValueChange={(v) => handleFilterChange('bacId', v)}
          disabled={filters.block === 'All Blocks'}
        >
          <SelectTrigger className="w-[160px] h-9 text-sm">
            <SelectValue placeholder="BAC" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All BACs">All BACs</SelectItem>
            {availableFilters.bacs.map(bac => (
              <SelectItem key={bac} value={bac}>{bac}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative flex-1 max-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search..." 
            className="pl-8 h-9 text-sm"
          />
        </div>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearFilters}
            className="h-9 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filter Badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {filters.state !== 'All States' && (
            <Badge variant="outline" className="text-xs">
              State: {filters.state}
              <button 
                onClick={() => handleFilterChange('state', 'All States')}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.district !== 'All Districts' && (
            <Badge variant="outline" className="text-xs">
              District: {filters.district}
              <button 
                onClick={() => handleFilterChange('district', 'All Districts')}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.block !== 'All Blocks' && (
            <Badge variant="outline" className="text-xs">
              Block: {filters.block}
              <button 
                onClick={() => handleFilterChange('block', 'All Blocks')}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.bacId !== 'All BACs' && (
            <Badge variant="outline" className="text-xs">
              BAC: {filters.bacId}
              <button 
                onClick={() => handleFilterChange('bacId', 'All BACs')}
                className="ml-1 hover:text-destructive"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
