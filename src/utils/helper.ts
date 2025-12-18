import { Region } from "@/types/map";

// Helper to calculate the bounding box from a list of regions
const getBoundingBox = (regions: Region[]) => {
  if (regions.length === 0) return { minX: 0, minY: 0, width: 600, height: 750 };

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  regions.forEach(region => {
    // Extract all numbers from the path string (e.g., "M 170,30 L 200,20...")
    const coords = region.path.match(/-?\d+(\.\d+)?/g)?.map(Number) || [];
    
    for (let i = 0; i < coords.length; i += 2) {
      const x = coords[i];
      const y = coords[i + 1];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  });

  // Add padding (approx 10%) so the map isn't touching the edges
  const width = maxX - minX;
  const height = maxY - minY;
  const paddingX = width * 0.1;
  const paddingY = height * 0.1;

  return {
    minX: minX - paddingX,
    minY: minY - paddingY,
    width: width + (paddingX * 2),
    height: height + (paddingY * 2)
  };
};