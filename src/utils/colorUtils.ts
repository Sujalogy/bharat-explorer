// Convert achievement value (0-100) to color on red-yellow-green gradient
export const getMetricColor = (value: number, min: number = 0, max: number = 100): string => {
  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
  
  // Interpolation between #fdd6db (Light Pink) and #b31820 (Deep Red)
  // Low: RGB(253, 214, 219)
  // High: RGB(179, 24, 32)
  const r = Math.round(253 + (179 - 253) * normalized);
  const g = Math.round(214 + (24 - 214) * normalized);
  const b = Math.round(219 + (32 - 219) * normalized);
  
  return `rgb(${r}, ${g}, ${b})`;
};
// Get a lighter version for hover state
export const getLighterColor = (color: string, factor: number = 0.15): string => {
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return color;
  
  const r = Math.min(255, Math.round(parseInt(match[1]) + (255 - parseInt(match[1])) * factor));
  const g = Math.min(255, Math.round(parseInt(match[2]) + (255 - parseInt(match[2])) * factor));
  const b = Math.min(255, Math.round(parseInt(match[3]) + (255 - parseInt(match[3])) * factor));
  
  return `rgb(${r}, ${g}, ${b})`;
};

// Format number with commas
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-IN');
};

// Format percentage
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};
