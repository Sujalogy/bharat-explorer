// src/data/indiaStates.ts
import { Region } from "@/types/map";

/**
 * STATE MAPS WITH PROPER BOUNDARIES
 * These represent detailed state shapes when drilling down
 */

// Uttar Pradesh State Map (detailed shape)
export const uttarPradeshStateMap: Region = {
  id: "uttar-pradesh-state",
  name: "Uttar Pradesh",
  path: "M 50,80 L 200,70 L 350,100 L 380,180 L 350,280 L 250,320 L 150,300 L 80,250 L 50,180 Z",
  centroid: [215, 200],
};

// Haryana State Map
export const haryanaStateMap: Region = {
  id: "haryana-state",
  name: "Haryana",
  path: "M 80,100 L 220,90 L 250,140 L 240,220 L 180,240 L 100,230 L 70,180 Z",
  centroid: [160, 165],
};

// Rajasthan State Map
export const rajasthanStateMap: Region = {
  id: "rajasthan-state",
  name: "Rajasthan",
  path: "M 50,120 L 180,100 L 280,140 L 320,220 L 300,320 L 220,380 L 120,360 L 60,280 L 40,200 Z",
  centroid: [180, 240],
};

// Chhattisgarh State Map
export const chhattisgarhStateMap: Region = {
  id: "chhattisgarh-state",
  name: "Chhattisgarh",
  path: "M 80,100 L 220,90 L 280,140 L 290,240 L 260,320 L 180,340 L 100,300 L 70,200 Z",
  centroid: [185, 220],
};

// Jharkhand State Map
export const jharkhandStateMap: Region = {
  id: "jharkhand-state",
  name: "Jharkhand",
  path: "M 90,120 L 240,110 L 290,180 L 280,260 L 220,300 L 140,290 L 80,220 Z",
  centroid: [185, 210],
};

// Odisha State Map
export const odishaStateMap: Region = {
  id: "odisha-state",
  name: "Odisha",
  path: "M 100,80 L 260,70 L 320,140 L 330,240 L 280,320 L 180,340 L 90,300 L 70,200 Z",
  centroid: [200, 210],
};

/**
 * National level - Indian States
 */
export const indiaStates: Region[] = [
  {
    id: "haryana",
    name: "Haryana",
    path: "M 155,130 L 190,125 L 200,145 L 195,175 L 165,180 L 150,155 Z",
    centroid: [173, 155],
  },
  {
    id: "uttar-pradesh",
    name: "Uttar Pradesh",
    path: "M 200,140 L 270,130 L 320,160 L 330,220 L 280,260 L 210,240 L 195,190 Z",
    centroid: [260, 195],
  },
  {
    id: "rajasthan",
    name: "Rajasthan",
    path: "M 80,150 L 150,140 L 185,175 L 190,230 L 155,280 L 85,270 L 55,210 Z",
    centroid: [125, 215],
  },
  {
    id: "jharkhand",
    name: "Jharkhand",
    path: "M 310,265 L 360,260 L 385,290 L 375,330 L 335,340 L 300,310 Z",
    centroid: [340, 300],
  },
  {
    id: "chhattisgarh",
    name: "Chhattisgarh",
    path: "M 270,310 L 330,300 L 360,340 L 345,400 L 290,410 L 255,365 Z",
    centroid: [305, 355],
  },
  {
    id: "odisha",
    name: "Odisha",
    path: "M 330,340 L 390,330 L 420,380 L 400,440 L 340,450 L 310,400 Z",
    centroid: [365, 390],
  },
];

/**
 * DISTRICT MAPS (positioned within state boundaries)
 */
export const uttarPradeshDistricts: Region[] = [
  { id: "lucknow", name: "Lucknow", path: "M 150,160 L 200,155 L 210,195 L 165,200 Z", centroid: [180, 177] },
  { id: "kanpur", name: "Kanpur", path: "M 120,200 L 170,195 L 175,235 L 130,240 Z", centroid: [145, 217] },
  { id: "allahabad", name: "Allahabad", path: "M 170,235 L 220,230 L 225,270 L 180,275 Z", centroid: [195, 252] },
  { id: "varanasi", name: "Varanasi", path: "M 280,180 L 330,175 L 335,215 L 290,220 Z", centroid: [305, 197] },
  { id: "agra", name: "Agra", path: "M 80,100 L 130,95 L 135,135 L 90,140 Z", centroid: [105, 117] },
  { id: "meerut", name: "Meerut", path: "M 60,80 L 110,75 L 115,115 L 70,120 Z", centroid: [85, 97] },
  { id: "ghaziabad", name: "Ghaziabad", path: "M 50,100 L 100,95 L 105,135 L 60,140 Z", centroid: [75, 117] },
  { id: "gorakhpur", name: "Gorakhpur", path: "M 320,140 L 370,135 L 375,175 L 330,180 Z", centroid: [345, 157] },
];

export const haryanaDistricts: Region[] = [
  { id: "gurugram", name: "Gurugram", path: "M 140,160 L 190,155 L 195,195 L 150,200 Z", centroid: [165, 177] },
  { id: "faridabad", name: "Faridabad", path: "M 160,200 L 210,195 L 215,235 L 170,240 Z", centroid: [185, 217] },
  { id: "ambala", name: "Ambala", path: "M 90,100 L 140,95 L 145,135 L 100,140 Z", centroid: [115, 117] },
  { id: "karnal", name: "Karnal", path: "M 110,140 L 160,135 L 165,175 L 120,180 Z", centroid: [135, 157] },
  { id: "hisar", name: "Hisar", path: "M 80,140 L 130,135 L 135,175 L 90,180 Z", centroid: [105, 157] },
  { id: "rohtak", name: "Rohtak", path: "M 120,180 L 170,175 L 175,215 L 130,220 Z", centroid: [145, 197] },
];

export const rajasthanDistricts: Region[] = [
  { id: "jaipur", name: "Jaipur", path: "M 140,180 L 200,175 L 210,225 L 155,230 Z", centroid: [177, 202] },
  { id: "jodhpur", name: "Jodhpur", path: "M 100,240 L 160,235 L 170,285 L 115,290 Z", centroid: [137, 262] },
  { id: "udaipur", name: "Udaipur", path: "M 150,280 L 210,275 L 220,325 L 165,330 Z", centroid: [187, 302] },
  { id: "kota", name: "Kota", path: "M 220,220 L 280,215 L 290,265 L 235,270 Z", centroid: [257, 242] },
  { id: "ajmer", name: "Ajmer", path: "M 130,200 L 190,195 L 200,245 L 145,250 Z", centroid: [167, 222] },
  { id: "bikaner", name: "Bikaner", path: "M 70,140 L 130,135 L 140,185 L 85,190 Z", centroid: [107, 162] },
];

export const chhattisgarhDistricts: Region[] = [
  { id: "raipur", name: "Raipur", path: "M 140,180 L 200,175 L 210,225 L 155,230 Z", centroid: [177, 202] },
  { id: "bilaspur", name: "Bilaspur", path: "M 160,120 L 220,115 L 230,165 L 175,170 Z", centroid: [197, 142] },
  { id: "durg", name: "Durg", path: "M 120,220 L 180,215 L 190,265 L 135,270 Z", centroid: [157, 242] },
  { id: "rajnandgaon", name: "Rajnandgaon", path: "M 100,260 L 160,255 L 170,305 L 115,310 Z", centroid: [137, 282] },
  { id: "bastar", name: "Bastar", path: "M 180,260 L 240,255 L 250,305 L 195,310 Z", centroid: [217, 282] },
];

export const jharkhandDistricts: Region[] = [
  { id: "ranchi", name: "Ranchi", path: "M 140,180 L 200,175 L 210,225 L 155,230 Z", centroid: [177, 202] },
  { id: "dhanbad", name: "Dhanbad", path: "M 200,140 L 260,135 L 270,185 L 215,190 Z", centroid: [237, 162] },
  { id: "jamshedpur", name: "Jamshedpur", path: "M 220,200 L 280,195 L 290,245 L 235,250 Z", centroid: [257, 222] },
  { id: "bokaro", name: "Bokaro", path: "M 180,160 L 240,155 L 250,205 L 195,210 Z", centroid: [217, 182] },
  { id: "hazaribagh", name: "Hazaribagh", path: "M 120,140 L 180,135 L 190,185 L 135,190 Z", centroid: [157, 162] },
];

export const odishaDistricts: Region[] = [
  { id: "bhubaneswar", name: "Bhubaneswar", path: "M 180,180 L 240,175 L 250,225 L 195,230 Z", centroid: [217, 202] },
  { id: "cuttack", name: "Cuttack", path: "M 160,160 L 220,155 L 230,205 L 175,210 Z", centroid: [197, 182] },
  { id: "puri", name: "Puri", path: "M 200,220 L 260,215 L 270,265 L 215,270 Z", centroid: [237, 242] },
  { id: "berhampur", name: "Berhampur", path: "M 180,260 L 240,255 L 250,305 L 195,310 Z", centroid: [217, 282] },
  { id: "sambalpur", name: "Sambalpur", path: "M 120,140 L 180,135 L 190,185 L 135,190 Z", centroid: [157, 162] },
];

/**
 * Get state background shape
 */
export const getStateShape = (stateName: string): Region | null => {
  switch (stateName) {
    case "Uttar Pradesh": return uttarPradeshStateMap;
    case "Haryana": return haryanaStateMap;
    case "Rajasthan": return rajasthanStateMap;
    case "Chhattisgarh": return chhattisgarhStateMap;
    case "Jharkhand": return jharkhandStateMap;
    case "Odisha": return odishaStateMap;
    default: return null;
  }
};

/**
 * Helper function to retrieve regions based on level and parent selection.
 */
export const getRegionsByLevel = (
  level: "national" | "state" | "district",
  stateName?: string,
  districtName?: string
): Region[] => {
  if (level === "national") return indiaStates;
  
  if (level === "state") {
    switch (stateName) {
      case "Uttar Pradesh": return uttarPradeshDistricts;
      case "Haryana": return haryanaDistricts;
      case "Rajasthan": return rajasthanDistricts;
      case "Chhattisgarh": return chhattisgarhDistricts;
      case "Jharkhand": return jharkhandDistricts;
      case "Odisha": return odishaDistricts;
      default: return [];
    }
  }
  
  return [];
};