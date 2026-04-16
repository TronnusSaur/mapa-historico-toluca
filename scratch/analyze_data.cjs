
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const boundariesPath = path.join('public', 'data', 'UTB_REAL.geojson');
const geojson = JSON.parse(fs.readFileSync(boundariesPath, 'utf8'));

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

async function analyze(filePath, label) {
    const csvData = fs.readFileSync(filePath, 'utf8');
    return new Promise((resolve) => {
        Papa.parse(csvData, {
            header: true,
            complete: (results) => {
                const data = results.data;
                let total = 0;
                let invalidCoords = 0;
                let outside = 0;
                let ok = 0;
                let duplicatedIds = new Set();
                let uniqueIds = new Set();
                let countPerStatus = {};

                data.forEach(row => {
                    const id = row.ID || row.folio || row.folioRef;
                    if (uniqueIds.has(id)) {
                        duplicatedIds.add(id);
                    }
                    uniqueIds.add(id);

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

                console.log(`Summary for ${label}:`);
                console.log(`- Total rows: ${data.length}`);
                console.log(`- Unique IDs: ${uniqueIds.size}`);
                console.log(`- Duplicated IDs: ${duplicatedIds.size}`);
                console.log(`- Records with invalid/missing coords: ${invalidCoords}`);
                console.log(`- Records outside spatial filter: ${outside}`);
                console.log(`- Final valid records: ${ok}`);
                console.log('------------------------------');
                resolve();
            }
        });
    });
}

async function run() {
    await analyze(path.join('public', 'data', '2 - ETAPA 2 MASTER.csv'), 'Stage 2');
    await analyze(path.join('public', 'data', '3 - ETAPA 3 MASTER.csv'), 'Stage 3');
}

run();
