// Convert achievement value (0-100) to color on red-yellow-green gradient
export const getMetricColor = (value: number, min: number = 0, max: number = 100): string => {
  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
  
  // Red (0) -> Yellow (0.5) -> Green (1)
  let r: number, g: number, b: number;
  
  if (normalized < 0.5) {
    // Red to Yellow
    const t = normalized * 2;
    r = 239; // Red stays high
    g = Math.round(68 + (190 - 68) * t); // 68 to 190
    b = Math.round(68 + (43 - 68) * t); // 68 to 43
  } else {
    // Yellow to Green
    const t = (normalized - 0.5) * 2;
    r = Math.round(234 + (34 - 234) * t); // 234 to 34
    g = Math.round(179 + (197 - 179) * t); // 179 to 197
    b = Math.round(8 + (94 - 8) * t); // 8 to 94
  }
  
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
