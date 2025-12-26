/**
 * Centralized API handler for Bharat Explorer
 * Manages database-driven GeoJSON and Dashboard metrics
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Simple in-memory cache to prevent redundant fetches for heavy GeoJSON data
const geoCache = new Map<string, any>();

async function fetchWithCache(url: string) {
  if (geoCache.has(url)) {
    return geoCache.get(url);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText} at ${url}`);
  }

  const data = await response.json();
  geoCache.set(url, data);
  return data;
}

export const api = {
  /**
   * GEOJSON DATA FETCHERS (PostGIS Backend)
   */
  geo: {
    getNational: () => fetchWithCache(`${API_BASE_URL}/geo/national`),
    getState: (state: string) => fetchWithCache(`${API_BASE_URL}/geo/state/${state}`),
    getDistrict: (dist: string) => fetchWithCache(`${API_BASE_URL}/geo/district/${dist}`),
    getBlock: (block: string) => fetchWithCache(`${API_BASE_URL}/geo/block/${block}`),
  },

  /**
   * DASHBOARD & METRICS FETCHERS
   */
  metrics: {
    // Get summary statistics for the current filters
    getSummary: async (filters: any) => {
      const params = new URLSearchParams(filters).toString();
      const res = await fetch(`${API_BASE_URL}/metrics/summary?${params}`);
      return res.json();
    },

    // Get school pins for the map based on viewport/filters
    getSchoolPins: async (filters: any) => {
      const params = new URLSearchParams(filters).toString();
      const res = await fetch(`${API_BASE_URL}/schools/locations?${params}`);
      return res.json();
    }
  },

  /**
   * UTILITIES
   */
  clearCache: () => geoCache.clear(),
};