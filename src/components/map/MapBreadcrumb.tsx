import { ChevronRight, Home } from 'lucide-react';

interface MapBreadcrumbProps {
  currentLevel: 'national' | 'state' | 'district';
  selectedState?: string;
  selectedDistrict?: string;
  onNavigate: (level: 'national' | 'state' | 'district') => void;
}

const MapBreadcrumb = ({ 
  currentLevel, 
  selectedState, 
  selectedDistrict, 
  onNavigate 
}: MapBreadcrumbProps) => {
  return (
    <nav className="flex items-center gap-1 text-sm">
      <button
        onClick={() => onNavigate('national')}
        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
          currentLevel === 'national'
            ? 'text-foreground font-medium'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
      >
        <Home className="w-4 h-4" />
        <span>India</span>
      </button>

      {selectedState && (
        <>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <button
            onClick={() => onNavigate('state')}
            className={`px-2 py-1 rounded transition-colors ${
              currentLevel === 'state'
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {selectedState}
          </button>
        </>
      )}

      {selectedDistrict && (
        <>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="px-2 py-1 text-foreground font-medium">
            {selectedDistrict}
          </span>
        </>
      )}
    </nav>
  );
};

export default MapBreadcrumb;
