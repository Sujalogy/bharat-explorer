import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { indiaStates } from '@/data/indiaStates';

interface MapSearchProps {
  onSelect: (type: 'state' | 'district' | 'block', name: string, state?: string, district?: string) => void;
}

interface SearchResult {
  type: 'state' | 'district' | 'block';
  name: string;
  state?: string;
  district?: string;
}

const MapSearch = ({ onSelect }: MapSearchProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const allResults: SearchResult[] = [];

    // Search states
    indiaStates.forEach(state => {
      if (state.name.toLowerCase().includes(lowerQuery)) {
        allResults.push({ type: 'state', name: state.name });
      }
    });

    setResults(allResults.slice(0, 8));
  }, [query]);

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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'state': return 'State';
      case 'district': return 'District';
      case 'block': return 'Block';
      default: return '';
    }
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
          placeholder="Search state, district, or block..."
          className="w-64 pl-9 pr-9 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
        />
        {query && (
          <button
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
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50 animate-scale-in">
          {results.map((result, index) => (
            <button
              key={`${result.type}-${result.name}-${index}`}
              onClick={() => handleSelect(result)}
              className="w-full px-4 py-2.5 text-left hover:bg-muted transition-colors flex items-center justify-between group"
            >
              <div>
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                  {result.name}
                </span>
                {result.state && (
                  <span className="text-xs text-muted-foreground ml-2">
                    {result.district ? `${result.district}, ${result.state}` : result.state}
                  </span>
                )}
              </div>
              <span className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded">
                {getTypeLabel(result.type)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapSearch;
