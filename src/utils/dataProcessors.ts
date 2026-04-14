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

export interface Tramo {
  coords: [number, number][];
  date: Date; // earliest point date in this chain
}

/**
 * Utility to find a value in an object regardless of key case
 */
const getVal = (obj: any, keys: string[]) => {
  const foundKey = Object.keys(obj).find(k => 
    keys.some(key => k.toLowerCase() === key.toLowerCase())
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
        const data = results.data as any[];
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
            m2: m2Str ? parseFloat(m2Str) : 0,
            status,
            stage,
            originalId: getVal(row, ['ID', 'Ticket', 'folioRef', 'folio'])
          };
        }).filter(item => item !== null && !isNaN(item.lat) && !isNaN(item.lng)) as PotholeData[];
        
        resolve(parsed);
      },
      error: (err) => reject(err)
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
      chains.push({ coords: chain, date: minDate });
    }
  }

  console.timeEnd('groupIntoTramos');
  return chains;
};
