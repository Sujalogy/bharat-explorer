import { interpolateRgb } from 'd3-interpolate';
// Convert achievement value (0-100) to color on red-yellow-green gradient
export const getMetricColor = (value: number | null, min: number = 0, max: number = 100): string => {
  if (value === null || value === undefined) return 'rgb(249, 250, 251)'; // gray-50

  // Normalize value to 0-100 scale
  const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);

  // Light/Pastel RGB Definitions
  const LIGHT_RED = "rgb(251, 113, 133)";    // Rose 400 (Soft Red)
  const LIGHT_YELLOW = "rgb(252, 211, 77)"; // Amber 300 (Light Yellow)
  const LIGHT_GREEN = "rgb(110, 231, 183)";  // Emerald 300 (Pale Green)

  if (percentage < 50) {
    // 0 to 50: Interpolate between Light Red and Light Yellow
    const t = percentage / 50;
    return interpolateRgb(LIGHT_RED, LIGHT_YELLOW)(t);
  } else {
    // 50 to 100: Interpolate between Light Yellow and Light Green
    const t = (percentage - 50) / 50;
    return interpolateRgb(LIGHT_YELLOW, LIGHT_GREEN)(t);
  }
};
// Get a lighter version for hover state
export const getLighterColor = (color: string, amount: number = 0.2): string => {
  // Simple approach: return the color with adjusted opacity for the hover "glow"
  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${1 - amount})`);
  }
  return color;
};

// Format number with commas
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-IN');
};

// Format percentage
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const getHoverColor = (color: string): string => {
  if (color.startsWith('rgb')) {
    // Reduce opacity slightly to create a "tint" effect
    return color.replace('rgb', 'rgba').replace(')', ', 0.85)');
  }
  return color;
};