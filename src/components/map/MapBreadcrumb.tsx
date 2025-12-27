// src/components/map/MapBreadcrumb.tsx
import { ChevronRight, Home } from 'lucide-react';

interface MapBreadcrumbProps {
  currentLevel: string;
  selectedState?: string;
  selectedDistrict?: string;
  selectedBlock?: string;
  onNavigate: (level: 'national' | 'state' | 'district' | 'block') => void;
}

const MapBreadcrumb = ({ 
  currentLevel, 
  selectedState, 
  selectedDistrict, 
  selectedBlock,
  onNavigate 
}: MapBreadcrumbProps) => {
  return (
    <nav className="flex items-center gap-1 text-xs rounded-lg">
      <button
        onClick={() => onNavigate('national')}
        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
          currentLevel === 'national'
            ? 'text-primary font-bold'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
      >
        <Home className="w-3.5 h-3.5" />
        <span>India</span>
      </button>

      {selectedState && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
          <button
            onClick={() => onNavigate('state')}
            className={`px-2 py-1 rounded transition-colors ${
              currentLevel === 'state'
                ? 'text-primary font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {selectedState}
          </button>
        </>
      )}

      {selectedDistrict && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
          <button
            onClick={() => onNavigate('district')}
            className={`px-2 py-1 rounded transition-colors ${
              currentLevel === 'district'
                ? 'text-primary font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {selectedDistrict}
          </button>
        </>
      )}

      {selectedBlock && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
          <span className="px-2 py-1 text-primary font-bold">
            {selectedBlock}
          </span>
        </>
      )}
    </nav>
  );
};

export default MapBreadcrumb;