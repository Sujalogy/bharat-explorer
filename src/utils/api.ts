/**
 * Centralized API handler for Bharat Explorer
 * FIXED: Corrected all API endpoints to match backend routes
 */

const API_BASE_URL = 'http://localhost:3000/api/v1/dashboard';

// Simple in-memory cache to prevent redundant fetches for heavy GeoJSON data
const geoCache = new Map<string, any>();

async function fetchWithCache(url: string, skipCache = false) {
  if (!skipCache && geoCache.has(url)) {
    console.log('Cache hit for:', url);
    return geoCache.get(url);
  }

  console.log('Fetching:', url);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText} at ${url}`);
    }

    const data = await response.json();
    
    if (!skipCache) {
      geoCache.set(url, data);
    }
    
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export const api = {
  /**
   * GEOJSON DATA FETCHERS (PostGIS Backend)
   */
  geo: {
    getNational: () => fetchWithCache(`${API_BASE_URL}/geo/national`),
    getState: (state: string) => fetchWithCache(`${API_BASE_URL}/geo/state/${encodeURIComponent(state)}`),
    getDistrict: (dist: string) => fetchWithCache(`${API_BASE_URL}/geo/district/${encodeURIComponent(dist)}`),
    getBlock: (block: string) => fetchWithCache(`${API_BASE_URL}/geo/block/${encodeURIComponent(block)}`),
  },

  /**
   * DASHBOARD & METRICS FETCHERS
   */
  analytics: {
    // Get filtered visit data
    getVisits: async (filters: Record<string, string>) => {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'All') {
          params.append(key, value);
        }
      });
      
      const url = `${API_BASE_URL}/analytics?${params.toString()}`;
      return fetchWithCache(url, true); // Skip cache for analytics (real-time data)
    },
    
    // Get hierarchy metrics
    getHierarchy: async (filters: Record<string, string>) => {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'All') {
          params.append(key, value);
        }
      });
      
      const url = `${API_BASE_URL}/hierarchy?${params.toString()}`;
      return fetchWithCache(url, true);
    }
  },

  /**
   * SCHOOL DATA FETCHERS
   */
  schools: {
    // Get schools by block for map pins
    getByBlock: async (block: string) => {
      if (!block || block === 'All') {
        console.log('No block specified, returning empty array');
        return [];
      }
      
      const url = `${API_BASE_URL}/schools?block=${encodeURIComponent(block)}`;
      console.log('Fetching schools from:', url);
      
      try {
        const data = await fetchWithCache(url, true);
        console.log('Schools received:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('Error fetching schools:', error);
        return [];
      }
    }
  },

  /**
   * UTILITIES
   */
  clearCache: () => {
    console.log('Clearing API cache');
    geoCache.clear();
  },
};