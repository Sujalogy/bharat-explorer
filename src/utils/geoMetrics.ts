/**
 * src/utils/geoMetrics.ts
 * Geographic and School infrastructure metadata for India
 */
// src/utils/colorUtils.ts
import { interpolateRgb } from 'd3-interpolate';

/**
 * Generates a high-contrast RGY color string based on a value.
 * @param value The metric value (e.g., 75 for 75%)
 * @param min Minimum scale value (usually 0)
 * @param max Maximum scale value (usually 100)
 */

export interface GeoMetricData {
  area_sqkm: number;
  population_density: number; // persons per sq. km
  total_schools: number;
}

export const GEO_METRICS: Record<string, GeoMetricData> = {
  // National Level
  "India": {
    area_sqkm: 3287263,
    population_density: 414, // 2011 Census
    total_schools: 1551000 // Approximate UDISE+ 2021-22
  },

  // State Level
  "Haryana": {
    area_sqkm: 44212,
    population_density: 573,
    total_schools: 15300
  },
  "Rajasthan": {
    area_sqkm: 342239, //
    population_density: 200, //
    total_schools: 106000
  },
  "Uttar Pradesh": {
    area_sqkm: 240928,
    population_density: 829,
    total_schools: 258000
  },
  "Jharkhand": {
    area_sqkm: 79716, //
    population_density: 414, //
    total_schools: 45000
  },

  // District Level
  "Sirsa": {
    area_sqkm: 4277, //
    population_density: 303, //
    total_schools: 1100
  },
  "Jaipur": {
    area_sqkm: 11143, //
    population_density: 598, //
    total_schools: 4500 // Includes 4500+ Govt schools
  },
  "Fatehpur": {
    area_sqkm: 4152, //
    population_density: 634,
    total_schools: 2500
  },

  // Block/Tehsil Level
  "Ellenabad": {
    area_sqkm: 412, // Tehsil estimate (Town is 4.88km)
    population_density: 320, // Tehsil average
    total_schools: 45
  },
  "Amber": {
    area_sqkm: 680,
    population_density: 664, // Based on tehsil pop 452,005
    total_schools: 150
  },
  "Bindki": {
    area_sqkm: 520,
    population_density: 1441, // Tehsil total
    total_schools: 250
  },
};

/**
 * Helper to fetch data safely with a fallback
 */
export const getGeoMetrics = (name: string): GeoMetricData => {
  // Safety check for undefined names to prevent .charAt error
  if (!name || name === "Unknown") {
    return { area_sqkm: 0, population_density: 0, total_schools: 0 };
  }
  const lookupName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(); 
  return GEO_METRICS[lookupName] || { area_sqkm: 0, population_density: 0, total_schools: 0 };
};


export const getMetricColor = (value: number, min: number = 0, max: number = 100): string => {
  if (value === null || value === undefined) return 'rgb(240, 242, 245)'; // Neutral Light Gray

  // Normalize value to 0-100 scale
  const percentage = ((value - min) / (max - min)) * 100;

  // High-Contrast RGB definitions
  const R = "rgb(239, 68, 68)";  // Vibrant Coral/Red
  const Y = "rgb(234, 179, 8)";  // Deep Amber/Yellow
  const G = "rgb(21, 128, 61)";   // Forest Green

  if (percentage < 50) {
    // Interpolate Red to Yellow (0% to 50%)
    return interpolateRgb(R, Y)(percentage / 50);
  } else {
    // Interpolate Yellow to Green (50% to 100%)
    return interpolateRgb(Y, G)((percentage - 50) / 50);
  }
};

