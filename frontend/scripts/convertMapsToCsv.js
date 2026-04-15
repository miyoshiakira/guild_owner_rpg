import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the mapCellMaster.ts file
const mapCellMasterPath = path.join(__dirname, '../src/data/masters/mapCellMaster.ts');
const mapCellMasterContent = fs.readFileSync(mapCellMasterPath, 'utf-8');

// Extract map data using regex
const allMatches = [...mapCellMasterContent.matchAll(/export const MAP(\d+)_TILES: number\[\]\[\] = \[([\s\S]*?)\];/g)];

const outputDir = path.join(__dirname, '../public/data/maps');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

allMatches.forEach((match) => {
  const mapNum = match[1];
  const mapId = `map-${mapNum.padStart(3, '0')}`;
  const tilesStr = match[2];
  
  // Parse the tiles array
  const tiles = eval(`[${tilesStr}]`);
  
  // Convert to CSV format (each row on a separate line, comma-separated)
  const csvContent = tiles.map(row => row.join(',')).join('\n');
  
  const outputPath = path.join(outputDir, `${mapId}.csv`);
  fs.writeFileSync(outputPath, csvContent);
  console.log(`Created ${mapId}.csv`);
});

console.log('All CSV files created successfully!');
