// src/data/indiaStates.ts
import { Region } from "@/types/map";

/**
 * All Indian States and Union Territories.
 * Replace the 'path' attribute with the detailed strings from your SVG file.
 * Ensure you update the 'centroid' coordinates to match the new coordinate system.
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

// Placeholder districts for Maharashtra (replace with your detailed district SVG paths)
export const uttarPradeshDistricts: Region[] = [
  {
    id: "fatehpur",
    name: "Fatehpur",
    path: "M 240,200 L 265,195 L 270,215 L 245,220 Z",
    centroid: [255, 210],
  },
  {
    id: "chandauli",
    name: "Chandauli",
    path: "M 300,230 L 325,225 L 328,245 L 305,250 Z",
    centroid: [315, 240],
  },
];

export const haryanaDistricts: Region[] = [
  {
    id: "sirsa",
    name: "Sirsa",
    path: "M 155,140 L 170,135 L 175,155 L 158,160 Z",
    centroid: [165, 148],
  },
  {
    id: "hisar",
    name: "Hisar",
    path: "M 172,150 L 188,145 L 192,165 L 175,170 Z",
    centroid: [182, 158],
  },
];

export const rajasthanDistricts: Region[] = [
  {
    id: "sirohi",
    name: "Sirohi",
    path: "M 90,240 L 115,235 L 120,255 L 95,260 Z",
    centroid: [105, 250],
  },
];

export const chhattisgarhDistricts: Region[] = [
  {
    id: "balod",
    name: "Balod",
    path: "M 290,360 L 310,355 L 315,375 L 295,380 Z",
    centroid: [302, 370],
  },
  {
    id: "bastar",
    name: "Bastar",
    path: "M 310,380 L 335,375 L 340,400 L 315,405 Z",
    centroid: [325, 390],
  },
];

export const jharkhandDistricts: Region[] = [
  {
    id: "khunti",
    name: "Khunti",
    path: "M 330,300 L 355,295 L 360,315 L 335,320 Z",
    centroid: [345, 310],
  },
];

// Odisha (Placeholder for deep dive support)
export const odishaDistricts: Region[] = [
  {
    id: "bhubaneswar", // Sample district to ensure the map loads
    name: "Bhubaneswar",
    path: "M 350,400 L 380,390 L 390,420 L 360,430 Z",
    centroid: [370, 410],
  },
];
// Placeholder blocks for Pune district
export const puneBlocks: Region[] = [
  {
    id: "haveli",
    name: "Haveli",
    path: "M 110,320 L 145,315 L 150,345 L 115,355 Z",
    centroid: [130, 335],
  },
  {
    id: "mulshi",
    name: "Mulshi",
    path: "M 80,340 L 110,335 L 115,365 L 85,375 Z",
    centroid: [95, 355],
  },
  {
    id: "maval",
    name: "Maval",
    path: "M 85,305 L 115,300 L 120,330 L 90,340 Z",
    centroid: [100, 320],
  },
  {
    id: "khed",
    name: "Khed",
    path: "M 130,290 L 165,285 L 170,315 L 135,325 Z",
    centroid: [150, 305],
  },
  {
    id: "junnar",
    name: "Junnar",
    path: "M 145,270 L 180,265 L 185,295 L 150,305 Z",
    centroid: [165, 285],
  },
  {
    id: "ambegaon",
    name: "Ambegaon",
    path: "M 115,280 L 145,275 L 150,305 L 120,315 Z",
    centroid: [132, 295],
  },
];

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
  
  if (level === "district" && districtName === "Pune") return puneBlocks;
  
  return [];
};