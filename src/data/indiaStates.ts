import { Region } from '@/types/map';

// Simplified SVG paths for Indian states - based on approximate geographic shapes
// These are simplified representations suitable for interactive visualization
export const indiaStates: Region[] = [
  {
    id: "jammu-kashmir",
    name: "Jammu & Kashmir",
    path: "M 170,30 L 200,20 L 230,25 L 250,40 L 245,70 L 220,85 L 190,80 L 165,60 Z",
    centroid: [205, 50]
  },
  {
    id: "ladakh",
    name: "Ladakh",
    path: "M 250,15 L 290,10 L 320,25 L 315,55 L 280,65 L 250,50 L 245,30 Z",
    centroid: [280, 38]
  },
  {
    id: "himachal-pradesh",
    name: "Himachal Pradesh",
    path: "M 190,80 L 220,75 L 240,90 L 235,115 L 205,120 L 185,105 Z",
    centroid: [212, 97]
  },
  {
    id: "punjab",
    name: "Punjab",
    path: "M 155,90 L 185,85 L 195,105 L 190,130 L 160,135 L 145,115 Z",
    centroid: [170, 110]
  },
  {
    id: "chandigarh",
    name: "Chandigarh",
    path: "M 188,115 L 195,113 L 198,120 L 192,123 Z",
    centroid: [193, 118]
  },
  {
    id: "uttarakhand",
    name: "Uttarakhand",
    path: "M 225,100 L 265,95 L 280,110 L 275,140 L 240,145 L 220,130 Z",
    centroid: [250, 120]
  },
  {
    id: "haryana",
    name: "Haryana",
    path: "M 155,130 L 190,125 L 200,145 L 195,175 L 165,180 L 150,155 Z",
    centroid: [173, 155]
  },
  {
    id: "delhi",
    name: "Delhi",
    path: "M 185,160 L 200,157 L 205,172 L 192,177 Z",
    centroid: [193, 167]
  },
  {
    id: "uttar-pradesh",
    name: "Uttar Pradesh",
    path: "M 200,140 L 270,130 L 320,160 L 330,220 L 280,260 L 210,240 L 195,190 Z",
    centroid: [260, 195]
  },
  {
    id: "rajasthan",
    name: "Rajasthan",
    path: "M 80,150 L 150,140 L 185,175 L 190,230 L 155,280 L 85,270 L 55,210 Z",
    centroid: [125, 215]
  },
  {
    id: "gujarat",
    name: "Gujarat",
    path: "M 30,230 L 85,220 L 115,260 L 110,320 L 70,350 L 25,340 L 15,280 Z",
    centroid: [65, 290]
  },
  {
    id: "madhya-pradesh",
    name: "Madhya Pradesh",
    path: "M 130,260 L 200,245 L 270,255 L 290,300 L 250,350 L 160,340 L 125,300 Z",
    centroid: [205, 300]
  },
  {
    id: "bihar",
    name: "Bihar",
    path: "M 320,210 L 365,200 L 385,230 L 375,265 L 335,275 L 310,250 Z",
    centroid: [350, 240]
  },
  {
    id: "jharkhand",
    name: "Jharkhand",
    path: "M 310,265 L 360,260 L 385,290 L 375,330 L 335,340 L 300,310 Z",
    centroid: [340, 300]
  },
  {
    id: "west-bengal",
    name: "West Bengal",
    path: "M 365,230 L 410,200 L 425,250 L 420,340 L 385,380 L 360,350 L 370,280 Z",
    centroid: [390, 295]
  },
  {
    id: "sikkim",
    name: "Sikkim",
    path: "M 395,190 L 415,185 L 420,205 L 405,215 L 392,205 Z",
    centroid: [405, 198]
  },
  {
    id: "assam",
    name: "Assam",
    path: "M 430,195 L 510,180 L 530,200 L 520,230 L 460,245 L 430,230 Z",
    centroid: [475, 210]
  },
  {
    id: "arunachal-pradesh",
    name: "Arunachal Pradesh",
    path: "M 480,150 L 560,140 L 580,170 L 560,200 L 510,195 L 475,175 Z",
    centroid: [525, 170]
  },
  {
    id: "nagaland",
    name: "Nagaland",
    path: "M 530,210 L 555,205 L 565,230 L 550,250 L 525,245 Z",
    centroid: [545, 228]
  },
  {
    id: "manipur",
    name: "Manipur",
    path: "M 525,250 L 555,245 L 565,275 L 545,300 L 520,285 Z",
    centroid: [540, 272]
  },
  {
    id: "mizoram",
    name: "Mizoram",
    path: "M 500,295 L 530,285 L 545,320 L 530,355 L 495,345 Z",
    centroid: [520, 320]
  },
  {
    id: "tripura",
    name: "Tripura",
    path: "M 465,300 L 495,295 L 505,330 L 485,355 L 460,340 Z",
    centroid: [480, 325]
  },
  {
    id: "meghalaya",
    name: "Meghalaya",
    path: "M 435,240 L 485,235 L 500,255 L 485,275 L 440,270 Z",
    centroid: [465, 255]
  },
  {
    id: "chhattisgarh",
    name: "Chhattisgarh",
    path: "M 270,310 L 330,300 L 360,340 L 345,400 L 290,410 L 255,365 Z",
    centroid: [305, 355]
  },
  {
    id: "odisha",
    name: "Odisha",
    path: "M 330,340 L 390,330 L 420,380 L 400,440 L 340,450 L 310,400 Z",
    centroid: [365, 390]
  },
  {
    id: "maharashtra",
    name: "Maharashtra",
    path: "M 95,330 L 175,320 L 250,355 L 270,420 L 215,480 L 120,470 L 80,400 Z",
    centroid: [175, 405]
  },
  {
    id: "telangana",
    name: "Telangana",
    path: "M 215,415 L 280,400 L 320,430 L 305,490 L 250,505 L 210,470 Z",
    centroid: [265, 455]
  },
  {
    id: "andhra-pradesh",
    name: "Andhra Pradesh",
    path: "M 250,470 L 340,450 L 390,500 L 370,570 L 290,590 L 235,540 Z",
    centroid: [315, 520]
  },
  {
    id: "karnataka",
    name: "Karnataka",
    path: "M 120,460 L 200,450 L 245,510 L 235,590 L 160,610 L 105,550 Z",
    centroid: [175, 530]
  },
  {
    id: "goa",
    name: "Goa",
    path: "M 100,525 L 120,520 L 125,545 L 108,555 Z",
    centroid: [112, 537]
  },
  {
    id: "kerala",
    name: "Kerala",
    path: "M 140,590 L 175,585 L 185,660 L 160,710 L 130,695 L 125,630 Z",
    centroid: [155, 645]
  },
  {
    id: "tamil-nadu",
    name: "Tamil Nadu",
    path: "M 175,570 L 260,560 L 305,600 L 290,680 L 220,710 L 170,665 Z",
    centroid: [235, 630]
  },
  {
    id: "puducherry",
    name: "Puducherry",
    path: "M 232,615 L 248,612 L 252,628 L 238,632 Z",
    centroid: [242, 622]
  },
  {
    id: "andaman-nicobar",
    name: "Andaman & Nicobar Islands",
    path: "M 490,450 L 510,440 L 520,490 L 515,560 L 495,600 L 480,570 L 485,500 Z",
    centroid: [500, 520]
  },
  {
    id: "lakshadweep",
    name: "Lakshadweep",
    path: "M 65,580 L 85,575 L 90,610 L 75,625 L 60,605 Z",
    centroid: [75, 598]
  },
  {
    id: "dadra-nagar-haveli-daman-diu",
    name: "Dadra & Nagar Haveli and Daman & Diu",
    path: "M 78,340 L 98,335 L 105,360 L 88,370 L 75,355 Z",
    centroid: [88, 352]
  }
];

// Sample district data for Maharashtra (simplified)
export const maharashtraDistricts: Region[] = [
  { id: "mumbai", name: "Mumbai", path: "M 50,350 L 80,340 L 90,380 L 60,395 Z", centroid: [70, 365] },
  { id: "pune", name: "Pune", path: "M 100,320 L 160,310 L 175,360 L 120,380 Z", centroid: [135, 345] },
  { id: "nagpur", name: "Nagpur", path: "M 280,280 L 340,270 L 355,320 L 295,340 Z", centroid: [315, 305] },
  { id: "nashik", name: "Nashik", path: "M 120,260 L 180,250 L 195,300 L 135,320 Z", centroid: [155, 285] },
  { id: "thane", name: "Thane", path: "M 70,310 L 115,300 L 125,345 L 80,360 Z", centroid: [95, 330] },
  { id: "aurangabad", name: "Aurangabad", path: "M 175,290 L 240,280 L 255,330 L 190,350 Z", centroid: [210, 315] },
  { id: "solapur", name: "Solapur", path: "M 160,370 L 225,360 L 240,415 L 175,430 Z", centroid: [195, 395] },
  { id: "kolhapur", name: "Kolhapur", path: "M 100,420 L 160,410 L 175,460 L 115,475 Z", centroid: [135, 445] },
];

// Sample blocks for Pune district
export const puneBlocks: Region[] = [
  { id: "haveli", name: "Haveli", path: "M 110,320 L 145,315 L 150,345 L 115,355 Z", centroid: [130, 335] },
  { id: "mulshi", name: "Mulshi", path: "M 80,340 L 110,335 L 115,365 L 85,375 Z", centroid: [95, 355] },
  { id: "maval", name: "Maval", path: "M 85,305 L 115,300 L 120,330 L 90,340 Z", centroid: [100, 320] },
  { id: "khed", name: "Khed", path: "M 130,290 L 165,285 L 170,315 L 135,325 Z", centroid: [150, 305] },
  { id: "junnar", name: "Junnar", path: "M 145,270 L 180,265 L 185,295 L 150,305 Z", centroid: [165, 285] },
  { id: "ambegaon", name: "Ambegaon", path: "M 115,280 L 145,275 L 150,305 L 120,315 Z", centroid: [132, 295] },
];

// Helper function to get regions by level
export const getRegionsByLevel = (
  level: 'national' | 'state' | 'district',
  stateName?: string,
  districtName?: string
): Region[] => {
  if (level === 'national') {
    return indiaStates;
  }
  if (level === 'state' && stateName === 'Maharashtra') {
    return maharashtraDistricts;
  }
  if (level === 'district' && districtName === 'Pune') {
    return puneBlocks;
  }
  // Return placeholder regions for other states/districts
  return [];
};
