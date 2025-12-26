import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import { useDashboard, VisitRecord } from '@/context/DashboardContext';

interface MapSearchProps {
  onSelect: (type: 'state' | 'district' | 'block', name: string, state?: string, district?: string) => void;
}

interface SearchResult {
  type: 'state' | 'district' | 'block';
  name: string; // Made required to match onSelect
  state?: string;
  district?: string;
}

// Internal interfaces for the search source data
interface SearchSourceItem {
  name: string;
  state: string;
  district?: string;
}

const MapSearch = ({ onSelect }: MapSearchProps) => {
  const { state: dashboardState } = useDashboard();
  const rawData: VisitRecord[] = dashboardState.rawData || [];

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Pre-calculate unique search metadata from the API data
  const searchSources = useMemo(() => {
    if (!rawData || rawData.length === 0) return { states: [], districts: [], blocks: [] };

    // Explicitly cast to string[] to avoid 'unknown' type issues
    const states = Array.from(new Set(rawData.map(d => d.state as string))).filter(Boolean);
    
    const districtsMap = new Map<string, SearchSourceItem>();
    const blocksMap = new Map<string, SearchSourceItem>();

    rawData.forEach(d => {
      if (d.district) {
        districtsMap.set(d.district.toLowerCase(), { 
          name: d.district as string, 
          state: d.state as string 
        });
      }
      if (d.block) {
        blocksMap.set(`${d.district}-${d.block}`.toLowerCase(), { 
          name: d.block as string, 
          district: d.district as string, 
          state: d.state as string 
        });
      }
    });

    return {
      states,
      districts: Array.from(districtsMap.values()),
      blocks: Array.from(blocksMap.values())
    };
  }, [rawData]);

  // 2. Perform search logic
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const allResults: SearchResult[] = [];

    // Search States
    searchSources.states.forEach((sName: string) => {
      if (sName.toLowerCase().includes(lowerQuery)) {
        allResults.push({ type: 'state', name: sName });
      }
    });

    // Search Districts
    searchSources.districts.forEach((d: SearchSourceItem) => {
      if (d.name.toLowerCase().includes(lowerQuery)) {
        allResults.push({ type: 'district', name: d.name, state: d.state });
      }
    });

    // Search Blocks
    searchSources.blocks.forEach((b: SearchSourceItem) => {
      if (b.name.toLowerCase().includes(lowerQuery)) {
        allResults.push({ type: 'block', name: b.name, state: b.state, district: b.district });
      }
    });

    setResults(allResults.slice(0, 8));
  }, [query, searchSources]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    onSelect(result.type, result.name, result.state, result.district);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search locations..."
          className="w-72 pl-9 pr-9 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-[300px] overflow-y-auto">
            {results.map((result, index) => (
              <button
                key={`${result.type}-${result.name}-${index}`}
                onClick={() => handleSelect(result)}
                className="w-full px-4 py-2.5 text-left hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between group border-b border-border/50 last:border-0"
              >
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium capitalize">
                      {result.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 text-left">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-tight">
                      {result.type === 'block' && result.district ? `${result.district}, ` : ''}
                      {result.state || 'India'}
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-muted text-muted-foreground rounded border border-border">
                  {result.type}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapSearch;