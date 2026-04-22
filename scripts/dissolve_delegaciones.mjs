/**
 * dissolve_delegaciones.mjs
 * 
 * Reads UTB_REAL.geojson (colonia/UTB polygons), groups them by NOMDEL (delegation name),
 * and unions each group into a single MultiPolygon per delegation.
 * Output: public/data/DELEGACIONES.geojson
 */
import fs from 'fs';
import * as turf from '@turf/turf';

const INPUT  = 'public/data/UTB_REAL.geojson';
const OUTPUT = 'public/data/DELEGACIONES.geojson';

console.log('Reading', INPUT, '...');
const raw = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
console.log(`  Total UTB features: ${raw.features.length}`);

// Normalize accents for grouping (e.g., "SANTA MARÍA" and "SANTA MARIA" → same key)
function normalizeKey(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();
}

// Group features by delegation name (accent-normalized)
const groups = new Map();       // normalizedKey → features[]
const canonicalNames = new Map(); // normalizedKey → display name (prefer accented version)

for (const feature of raw.features) {
  const del = feature.properties.NOMDEL || 'SIN DELEGACION';
  const key = normalizeKey(del);
  if (!groups.has(key)) {
    groups.set(key, []);
    canonicalNames.set(key, del);
  }
  // Prefer the accented version as the canonical name
  if (del !== canonicalNames.get(key) && del.normalize('NFD').length > canonicalNames.get(key).normalize('NFD').length) {
    canonicalNames.set(key, del);
  }
  groups.get(key).push(feature);
}

console.log(`  Unique delegations: ${groups.size}`);

const outputFeatures = [];
let i = 0;

for (const [key, features] of groups) {
  const delName = canonicalNames.get(key);
  i++;
  process.stdout.write(`  [${i}/${groups.size}] Dissolving: ${delName} (${features.length} UTBs)...`);

  try {
    let merged;

    if (features.length === 1) {
      // Single polygon — just use it directly
      merged = features[0];
    } else {
      // Union all polygons in this delegation
      // Start with the first feature and progressively union
      merged = features[0];
      for (let j = 1; j < features.length; j++) {
        try {
          const result = turf.union(
            turf.featureCollection([merged, features[j]])
          );
          if (result) merged = result;
        } catch (err) {
          // If union fails for a specific polygon (e.g., invalid geometry),
          // skip it and continue with what we have
          console.warn(`\n    ⚠ Skipping invalid polygon ${j} in ${delName}: ${err.message}`);
        }
      }
    }

    // Build clean output feature
    outputFeatures.push({
      type: 'Feature',
      properties: {
        NOMDEL: delName,
        UTB_COUNT: features.length
      },
      geometry: merged.geometry
    });

    console.log(' ✓');
  } catch (err) {
    console.error(` ✗ FAILED: ${err.message}`);
  }
}

const output = {
  type: 'FeatureCollection',
  features: outputFeatures
};

fs.writeFileSync(OUTPUT, JSON.stringify(output));
const sizeMB = (fs.statSync(OUTPUT).size / 1024 / 1024).toFixed(2);
console.log(`\nDone! Written ${OUTPUT} (${sizeMB} MB, ${outputFeatures.length} delegations)`);
