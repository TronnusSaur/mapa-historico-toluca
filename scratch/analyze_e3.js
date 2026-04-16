
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

// Mocking some simple logic to simulate the parser and filter
const boundariesPath = path.join('public', 'data', 'UTB_REAL.geojson');
const stage3Path = path.join('public', 'data', '3 - ETAPA 3 MASTER.csv');

const geojson = JSON.parse(fs.readFileSync(boundariesPath, 'utf8'));
const csvData = fs.readFileSync(stage3Path, 'utf8');

// Simple point in polygon (from dataProcessors.ts)
function isPointInPolygon(lat, lng, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function isPointInGeoJSON(lat, lng, geojson) {
    if (!geojson || !geojson.features) return true;
    for (const feature of geojson.features) {
        const { type, coordinates } = feature.geometry;
        if (type === 'Polygon') {
            if (isPointInPolygon(lat, lng, coordinates[0])) return true;
        } else if (type === 'MultiPolygon') {
            for (const poly of coordinates) {
                if (isPointInPolygon(lat, lng, poly[0])) return true;
            }
        }
    }
    return false;
}

Papa.parse(csvData, {
    header: true,
    complete: (results) => {
        const data = results.data;
        let total = 0;
        let invalidCoords = 0;
        let outside = 0;
        let ok = 0;

        data.forEach(row => {
            if (!row.latitude || !row.longitude) {
                invalidCoords++;
                return;
            }
            total++;
            const lat = parseFloat(row.latitude);
            const lng = parseFloat(row.longitude);
            if (isNaN(lat) || isNaN(lng)) {
                invalidCoords++;
                return;
            }

            if (isPointInGeoJSON(lat, lng, geojson)) {
                ok++;
            } else {
                outside++;
            }
        });

        console.log(`Summary for Stage 3:`);
        console.log(`Total rows processed: ${data.length}`);
        console.log(`Valid records with coords: ${total}`);
        console.log(`Records with info but NO coords: ${invalidCoords}`);
        console.log(`Records OUTSIDE boundaries: ${outside}`);
        console.log(`Records OK: ${ok}`);
    }
});
