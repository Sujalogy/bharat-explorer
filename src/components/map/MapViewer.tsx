import { useState, useCallback } from 'react';
import { RotateCcw, Download, ZoomIn, ZoomOut } from 'lucide-react';
import IndiaMap from './IndiaMap';
import MapBreadcrumb from './MapBreadcrumb';
import MapSearch from './MapSearch';
import MapLegend from './MapLegend';
import MiniMap from './MiniMap';
import { SelectedRegion, RegionData } from '@/types/map';
import { sampleStateData, sampleDistrictData, sampleBlockData } from '@/data/sampleData';
import { Button } from '@/components/ui/button';

type ViewLevel = 'national' | 'state' | 'district';
type ColorMetric = 'achievement' | 'visits' | 'planning';

const MapViewer = () => {
  const [currentLevel, setCurrentLevel] = useState<ViewLevel>('national');
  const [selectedState, setSelectedState] = useState<string | undefined>();
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>();
  const [colorMetric, setColorMetric] = useState<ColorMetric>('achievement');

  const getCurrentData = (): RegionData[] => {
    switch (currentLevel) {
      case 'national':
        return sampleStateData;
      case 'state':
        return sampleDistrictData.filter(d => d.state === selectedState);
      case 'district':
        return sampleBlockData.filter(d => d.district === selectedDistrict);
      default:
        return [];
    }
  };

  const getColorScale = (): [number, number] => {
    if (colorMetric === 'visits') {
      const data = getCurrentData();
      const values = data.map(d => d.visits);
      return [Math.min(...values), Math.max(...values)];
    }
    return [0, 100];
  };

  const handleRegionClick = useCallback((region: SelectedRegion) => {
    if (currentLevel === 'national') {
      setSelectedState(region.name);
      setCurrentLevel('state');
    } else if (currentLevel === 'state') {
      setSelectedDistrict(region.name);
      setCurrentLevel('district');
    }
    // At district level, clicking doesn't navigate further
  }, [currentLevel]);

  const handleNavigate = useCallback((level: ViewLevel) => {
    setCurrentLevel(level);
    if (level === 'national') {
      setSelectedState(undefined);
      setSelectedDistrict(undefined);
    } else if (level === 'state') {
      setSelectedDistrict(undefined);
    }
  }, []);

  const handleSearchSelect = useCallback((
    type: 'state' | 'district' | 'block',
    name: string,
    state?: string,
    district?: string
  ) => {
    if (type === 'state') {
      setSelectedState(name);
      setSelectedDistrict(undefined);
      setCurrentLevel('state');
    } else if (type === 'district' && state) {
      setSelectedState(state);
      setSelectedDistrict(name);
      setCurrentLevel('district');
    } else if (type === 'block' && state && district) {
      setSelectedState(state);
      setSelectedDistrict(district);
      setCurrentLevel('district');
    }
  }, []);

  const handleReset = () => {
    setCurrentLevel('national');
    setSelectedState(undefined);
    setSelectedDistrict(undefined);
  };

  const handleExport = () => {
    // Export current view as SVG
    const svgElement = document.querySelector('.animate-map-zoom-in');
    if (svgElement) {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `india-map-${currentLevel}-${selectedState || 'national'}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center justify-between max-w-[1800px] mx-auto">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-lg font-semibold text-foreground">India Map Visualization</h1>
              <p className="text-xs text-muted-foreground">Interactive hierarchical data explorer</p>
            </div>
            <MapBreadcrumb
              currentLevel={currentLevel}
              selectedState={selectedState}
              selectedDistrict={selectedDistrict}
              onNavigate={handleNavigate}
            />
          </div>
          <div className="flex items-center gap-3">
            <MapSearch onSelect={handleSearchSelect} />
            <div className="h-6 w-px bg-border" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-1.5"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 relative overflow-hidden">
        {/* Map container */}
        <div className="absolute inset-0 p-4">
          <div className="w-full h-full rounded-xl border border-border overflow-hidden shadow-lg bg-map-bg">
            <IndiaMap
              data={getCurrentData()}
              onRegionClick={handleRegionClick}
              currentLevel={currentLevel}
              selectedState={selectedState}
              selectedDistrict={selectedDistrict}
              colorMetric={colorMetric}
              colorScale={getColorScale()}
            />
          </div>
        </div>

        {/* Floating controls */}
        <div className="absolute bottom-8 left-8 flex flex-col gap-3">
          {/* Metric selector */}
          <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 shadow-md">
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Color By</h4>
            <div className="flex gap-1">
              {(['achievement', 'visits', 'planning'] as ColorMetric[]).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setColorMetric(metric)}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    colorMetric === metric
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <MapLegend
            colorMetric={colorMetric}
            minValue={getColorScale()[0]}
            maxValue={getColorScale()[1]}
          />
        </div>

        {/* Mini map */}
        <div className="absolute bottom-8 right-8">
          <MiniMap
            selectedState={selectedState}
            currentLevel={currentLevel}
          />
        </div>

        {/* Stats summary */}
        <div className="absolute top-8 right-8 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4 shadow-md">
          <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
            Summary Statistics
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-foreground font-mono">
                {getCurrentData().length}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentLevel === 'national' ? 'States/UTs' : 
                 currentLevel === 'state' ? 'Districts' : 'Blocks'}
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground font-mono">
                {Math.round(
                  getCurrentData().reduce((sum, d) => sum + d.achievement, 0) / 
                  getCurrentData().length || 0
                )}%
              </p>
              <p className="text-xs text-muted-foreground">Avg. Achievement</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground font-mono">
                {getCurrentData().reduce((sum, d) => sum + d.visits, 0).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-muted-foreground">Total Visits</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-metric-high font-mono">
                {getCurrentData().filter(d => d.achievement >= 80).length}
              </p>
              <p className="text-xs text-muted-foreground">High Performers</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MapViewer;
