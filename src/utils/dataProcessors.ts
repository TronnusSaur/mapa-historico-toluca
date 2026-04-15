import Papa from 'papaparse';

export interface PotholeData {
  id: string;
  lat: number;
  lng: number;
  date: Date;
  reportDate?: Date;
  resolvedDate?: Date | null;
  street: string;
  delegation: string;
  m2?: number;
  status: 'HISTORICO' | 'EJECUTADO' | 'PLANEADO' | 'TICKET_TOTAL';
  originalId?: string;
  stage?: number;
}

export interface GeoJSONFeature {
  type: string;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: any;
  };
  properties: any;
  bbox?: [number, number, number, number];
}

export interface GeoJSONData {
  type: string;
  features: GeoJSONFeature[];
}

export interface Tramo {
  coords: [number, number][];
  date: Date; // earliest point date in this chain
  stage?: number;
}

/**
 * Utility to parse numbers that might use commas as decimals or thousands separators
 */
const parseNumber = (val: any): number => {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  // Replace comma with dot ONLY if there is no dot already, or if it looks like a European decimal
  // For these files, they seem to use comma as decimal in Stage 2
  const cleaned = val.toString().replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Utility to find a value in an object regardless of key case or whitespace
 */
const getVal = (obj: Record<string, any>, keys: string[]) => {
  const foundKey = Object.keys(obj).find(k => 
    keys.some(key => k.trim().toLowerCase() === key.trim().toLowerCase())
  );
  return foundKey ? obj[foundKey] : undefined;
};

/**
 * Robustly extract lat/lng from various string formats
 */
const extractCoords = (str: string): { lat: number; lng: number } | null => {
  if (!str) return null;
  const matches = str.match(/(-?\d+\.\d+)/g);
  if (matches && matches.length >= 2) {
    return {
      lat: parseFloat(matches[0]),
      lng: parseFloat(matches[1])
    };
  }
  return null;
};

export const parseCSV = (
  url: string, 
  status: PotholeData['status'],
  stage?: number
): Promise<PotholeData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as Record<string, any>[];
        const parsed = data.map((row, index) => {
          let lat = 0, lng = 0, date = new Date(), street = '', delegation = '';
          let reportDate: Date | undefined;
          let resolvedDate: Date | null = null;
          
          if (status === 'TICKET_TOTAL') {
            const coordsStr = getVal(row, ['Coordenadas', 'coordinates']);
            const coords = extractCoords(coordsStr);
            if (!coords) return null;
            lat = coords.lat;
            lng = coords.lng;

            const recibido = getVal(row, ['Recibido', 'fecha_reporte']);
            reportDate = recibido ? new Date(recibido) : new Date();
            date = reportDate;

            const ticketStatus = getVal(row, ['Status', 'estatus', 'estado']);
            if (ticketStatus === 'Resuelto' || ticketStatus === 'TERMINADO') {
              const actualizado = getVal(row, ['Actualizado', 'fecha_respuesta']);
              resolvedDate = actualizado ? new Date(actualizado) : null;
            }

            street = getVal(row, ['Calle y número', 'calle', 'street']) || '';
            delegation = getVal(row, ['delegacion', 'delegación']) || '';

          } else if (status === 'EJECUTADO') {
            lat = parseFloat(getVal(row, ['latitude', 'latitud', 'lat']));
            lng = parseFloat(getVal(row, ['longitude', 'longitud', 'lng']));
            
            const rawDate = getVal(row, ['fecha', 'date']);
            const parts = rawDate?.split('/');
            if (parts && parts.length === 3) {
              const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
              date = new Date(`${year}-${parts[1]}-${parts[0]}`);
            }
            
            street = getVal(row, ['calle', 'street']) || '';
            delegation = getVal(row, ['delegacion', 'delegación']) || '';
          } else if (status === 'HISTORICO') {
            const coordsStr = getVal(row, ['Coordenadas', 'Latitud_Limpia']);
            const coords = extractCoords(coordsStr) || { 
              lat: parseFloat(getVal(row, ['Latitud_Limpia', 'latitude'])), 
              lng: parseFloat(getVal(row, ['Longitud_Limpia', 'longitude'])) 
            };
            lat = coords.lat;
            lng = coords.lng;
            date = new Date(getVal(row, ['Recibido', 'fecha']) || new Date());
            street = getVal(row, ['Calle y nǧmero', 'calle']) || '';
            delegation = getVal(row, ['delegacion', 'delegación']) || '';
          } else if (status === 'PLANEADO') {
            lat = parseFloat(getVal(row, ['latitude', 'latitud', 'lat']));
            lng = parseFloat(getVal(row, ['longitude', 'longitud', 'lng']));
            date = new Date();
            street = getVal(row, ['calle', 'Calle y nǧmero']) || '';
            delegation = getVal(row, ['delegacion', 'delegación', 'Delegación']) || '';
          }

          const m2Str = getVal(row, ['m2total', 'm2', 'M2TOTAL']);

          return {
            id: `${status}-${index}`,
            lat,
            lng,
            date,
            reportDate,
            resolvedDate,
            street,
            delegation,
            m2: parseNumber(m2Str),
            status,
            stage,
            originalId: getVal(row, ['ID', 'Ticket', 'folioRef', 'folio'])
          };
        }).filter(item => item !== null && !isNaN(item.lat) && !isNaN(item.lng)) as PotholeData[];
        
        resolve(parsed);
      },
      error: (err: Error) => reject(err)
    });
  });
};

/**
 * Haversine distance between two lat/lng points, returns meters.
 */
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildSpatialGrid(data: PotholeData[], cellSizeMeters: number) {
  const cellDeg = cellSizeMeters / 111320;
  const grid: Map<string, number[]> = new Map();

  data.forEach((p, i) => {
    const row = Math.floor(p.lat / cellDeg);
    const col = Math.floor(p.lng / cellDeg);
    const key = `${row}:${col}`;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key)!.push(i);
  });

  return { grid, cellDeg };
}

function getNeighbors(
  idx: number,
  data: PotholeData[],
  grid: Map<string, number[]>,
  cellDeg: number,
  thresholdMeters: number
): number[] {
  const p = data[idx];
  const row = Math.floor(p.lat / cellDeg);
  const col = Math.floor(p.lng / cellDeg);
  const neighbors: number[] = [];

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const key = `${row + dr}:${col + dc}`;
      const cell = grid.get(key);
      if (!cell) continue;
      for (const j of cell) {
        if (j === idx) continue;
        const dist = haversineDistance(p.lat, p.lng, data[j].lat, data[j].lng);
        if (dist <= thresholdMeters) {
          neighbors.push(j);
        }
      }
    }
  }
  return neighbors;
}

export const groupIntoTramos = (
  data: PotholeData[],
  threshold = 80,
  minLength = 2
): Tramo[] => {
  if (data.length === 0) return [];

  console.time('groupIntoTramos');

  const { grid, cellDeg } = buildSpatialGrid(data, threshold);
  const visited = new Uint8Array(data.length);
  const chains: Tramo[] = [];

  for (let startIdx = 0; startIdx < data.length; startIdx++) {
    if (visited[startIdx]) continue;
    visited[startIdx] = 1;

    const chain: [number, number][] = [[data[startIdx].lat, data[startIdx].lng]];
    const chainIndices: number[] = [startIdx];
    let current = startIdx;

    while (true) {
      const neighbors = getNeighbors(current, data, grid, cellDeg, threshold);
      let bestDist = Infinity;
      let bestIdx = -1;
      for (const n of neighbors) {
        if (visited[n]) continue;
        const d = haversineDistance(
          data[current].lat, data[current].lng,
          data[n].lat, data[n].lng
        );
        if (d < bestDist) {
          bestDist = d;
          bestIdx = n;
        }
      }

      if (bestIdx === -1) break;

      visited[bestIdx] = 1;
      chain.push([data[bestIdx].lat, data[bestIdx].lng]);
      chainIndices.push(bestIdx);
      current = bestIdx;
    }

    if (chain.length >= minLength) {
      const minDate = chainIndices.reduce((earliest, idx) => {
        const d = data[idx].date;
        return d < earliest ? d : earliest;
      }, data[chainIndices[0]].date);
      
      // Assign the stage of the first point to the tramo
      const stage = data[chainIndices[0]].stage;
      
      chains.push({ coords: chain, date: minDate, stage });
    }
  }

  console.timeEnd('groupIntoTramos');
  return chains;
};

/**
 * Ray-casting algorithm for point-in-polygon test.
 * @param lat  Point latitude
 * @param lng  Point longitude
 * @param polygon  Array of [lng, lat] coordinate pairs (GeoJSON order)
 */
export function isPointInPolygon(
  lat: number,
  lng: number,
  polygon: [number, number][]
): boolean {
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

/**
 * Minimum distance in meters from point [lat,lng] to a polygon ring edge.
 * Uses point-to-segment projection in degree space scaled to meters.
 */
function minDistToRingMeters(
  lat: number,
  lng: number,
  ring: [number, number][]
): number {
  const R = 111320; // meters per degree latitude (approx)
  const cosLat = Math.cos((lat * Math.PI) / 180);
  let minDist = Infinity;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    // Convert ring vertices to meters relative to the point
    const ax = (ring[j][0] - lng) * R * cosLat;
    const ay = (ring[j][1] - lat) * R;
    const bx = (ring[i][0] - lng) * R * cosLat;
    const by = (ring[i][1] - lat) * R;

    // Project point (0,0) onto segment [a, b]
    const dx = bx - ax, dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    let t = lenSq > 0 ? -(ax * dx + ay * dy) / lenSq : 0;
    t = Math.max(0, Math.min(1, t));

    const px = ax + t * dx;
    const py = ay + t * dy;
    const dist = Math.sqrt(px * px + py * py);
    if (dist < minDist) minDist = dist;
  }
  return minDist;
}

/**
 * Checks whether a [lat, lng] point falls inside ANY feature of a GeoJSON FeatureCollection,
 * with an optional buffer in meters for points near the boundary.
 * Returns true (keep the point) when no boundaries are loaded.
 */
export function isPointInGeoJSON(
  lat: number,
  lng: number,
  geojson: GeoJSONData,
  bufferMeters = 500
): boolean {
  if (!geojson || !geojson.features) return true;

  // Convert buffer to a degree-based bbox expansion for fast-reject
  const bufDeg = bufferMeters / 111320;

  for (const feature of geojson.features) {
    const { type, coordinates } = feature.geometry;

    // Bounding-box fast reject (expanded by buffer)
    if (feature.bbox) {
      const [minLng, minLat, maxLng, maxLat] = feature.bbox;
      if (
        lng < minLng - bufDeg || lng > maxLng + bufDeg ||
        lat < minLat - bufDeg || lat > maxLat + bufDeg
      ) continue;
    }

    if (type === 'Polygon') {
      const ring = coordinates[0] as [number, number][];
      if (isPointInPolygon(lat, lng, ring)) return true;
      if (minDistToRingMeters(lat, lng, ring) <= bufferMeters) return true;
    } else if (type === 'MultiPolygon') {
      for (const poly of coordinates) {
        const ring = poly[0] as [number, number][];
        if (isPointInPolygon(lat, lng, ring)) return true;
        if (minDistToRingMeters(lat, lng, ring) <= bufferMeters) return true;
      }
    }
  }
  return false;
}

