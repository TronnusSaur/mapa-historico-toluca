import Papa from 'papaparse';
import type { ModuloObraId, SubtipoPavimentacion, Obra, ObraTramo, ObraPuntual, EstadoTemporalObra } from '../types/obras.ts';

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
  largo?: number;
  ancho?: number;
  status: 'HISTORICO' | 'EJECUTADO' | 'PLANEADO' | 'TICKET_TOTAL';
  originalId?: string;
  stage?: number;
  inZona?: boolean;
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
 * Utility to normalize strings for comparison (removes accents, punctuation, case)
 */
const normalizeKey = (str: string) => 
  str.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

/**
 * Utility to find a value in an object regardless of key case, accents or whitespace
 */
const getVal = (obj: Record<string, any>, keys: string[]) => {
  const normKeys = keys.map(normalizeKey);
  const foundActualKey = Object.keys(obj).find(k => normKeys.includes(normalizeKey(k)));
  return foundActualKey ? obj[foundActualKey] : undefined;
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
            lat = coords?.lat || 0;
            lng = coords?.lng || 0;

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
            if (rawDate) {
              const parts = rawDate.split(/[\/\-]/);
              if (parts && parts.length === 3) {
                const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
                // Force 00:00:00 to avoid time-of-day comparison issues
                date = new Date(parseInt(year), parseInt(parts[1]) - 1, parseInt(parts[0]));
              } else {
                // Try direct parsing if split fails
                const attempt = new Date(rawDate);
                if (!isNaN(attempt.getTime())) date = attempt;
                else date = new Date('2026-01-01'); // Default for missing/invalid in E3
              }
            } else {
              date = new Date('2026-01-01');
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
            largo: parseNumber(getVal(row, ['largo', 'LARGO'])),
            ancho: parseNumber(getVal(row, ['ancho', 'ANCHO'])),
            status,
            stage,
            originalId: getVal(row, ['folio', 'Ticket', 'folioRef', 'ID'])
          };
        }).filter(p => p !== null) as PotholeData[];
        
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
  bufferMeters = 800
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

export interface PavimentacionData {
  id: string;
  no: number;
  tipoObra: string;
  descripcion: string;
  delegacion: string;
  coords: [number, number][];
  superficie: number;
  inversion: string;
  metrosLineales: number;
}

export const parsePavimentaciones = (url: string): Promise<PavimentacionData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as Record<string, any>[];
        const parsed: PavimentacionData[] = [];
        
        data.forEach((row, index) => {
          const noStr = getVal(row, ['No.', 'no']);
          if (!noStr) return;
          
          const trimmedNo = noStr.toString().trim();
          if (trimmedNo.toLowerCase().includes('total') || trimmedNo === '') return;
          
          const no = parseInt(trimmedNo);
          if (isNaN(no)) return;

          const tipoObra = getVal(row, ['Tipo de Obra', 'tipo_obra']) || '';
          const descripcion = getVal(row, ['Descripción de la Obra', 'descripcion']) || '';
          const delegacion = getVal(row, ['Delegación', 'delegacion']) || '';
          
          // Find all keys matching P[number] (case-insensitive) and sort them numerically
          const pKeys = Object.keys(row)
            .filter(key => /^P\d+$/i.test(key.trim()))
            .sort((a, b) => {
              const numA = parseInt(a.trim().match(/\d+/)![0], 10);
              const numB = parseInt(b.trim().match(/\d+/)![0], 10);
              return numA - numB;
            });
          
          const coords: [number, number][] = [];
          
          pKeys.forEach(key => {
            const pStr = row[key];
            if (pStr) {
              const pt = extractCoords(pStr.toString());
              if (pt && !isNaN(pt.lat) && !isNaN(pt.lng) && pt.lat !== 0 && pt.lng !== 0) {
                coords.push([pt.lat, pt.lng]);
              }
            }
          });

          const superficieStr = getVal(row, ['Superficie en m2 rehabilitada', 'superficie']);
          const inversionStr = getVal(row, ['Inversión Ejecutada', 'inversion']) || '';
          const metrosLinealesStr = getVal(row, ['Metros Lineales', 'metros_lineales']);

          parsed.push({
            id: `pavimentacion-${index}`,
            no,
            tipoObra,
            descripcion,
            delegacion,
            coords,
            superficie: parseNumber(superficieStr),
            inversion: inversionStr.toString().trim(),
            metrosLineales: parseNumber(metrosLinealesStr)
          });
        });
        
        resolve(parsed);
      },
      error: (err: Error) => reject(err)
    });
  });
};

export const mapSupabaseRowToPothole = (row: any): PotholeData => {
  const lat = parseFloat(row.latitude);
  const lng = parseFloat(row.longitude);
  
  let date = new Date();
  if (row.fecha) {
    const parts = row.fecha.split(/[\/\-]/);
    if (parts && parts.length === 3) {
      if (parts[0].length === 4) {
        date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        date = new Date(parseInt(year), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    } else {
      const attempt = new Date(row.fecha);
      if (!isNaN(attempt.getTime())) date = attempt;
    }
  } else if (row.date_added) {
    const attempt = new Date(row.date_added);
    if (!isNaN(attempt.getTime())) date = attempt;
  }
  
  return {
    id: `db-${row.Id}`,
    lat: isNaN(lat) ? 0 : lat,
    lng: isNaN(lng) ? 0 : lng,
    date,
    street: row.calle || '',
    delegation: row.delegacion || '',
    m2: row.m2total ? parseFloat(row.m2total) : 0,
    largo: row.largo ? parseFloat(row.largo) : 0,
    ancho: row.ancho ? parseFloat(row.ancho) : 0,
    status: 'EJECUTADO',
    stage: row.idEtapa || 1,
    originalId: row.folio || row.folioRef || ''
  };
};

/**
 * Parsea fechas flexibles en formatos DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
 */
export const parseFechaFlexible = (val: any): Date | null => {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  const str = val.toString().trim();
  if (!str) return null;

  const parts = str.split(/[\/\-]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      if (!isNaN(d.getTime())) return d;
    } else {
      const yearStr = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
      const d = new Date(parseInt(yearStr, 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
      if (!isNaN(d.getTime())) return d;
    }
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Clasifica automáticamente el módulo y subtipo de la obra según su texto y tipo reportado
 */
export const clasificarObra = (
  tipoRaw: string = '', 
  nombreRaw: string = ''
): { modulo: ModuloObraId; subtipo: SubtipoPavimentacion | string } => {
  const combined = `${tipoRaw} ${nombreRaw}`.toLowerCase();

  if (combined.includes('slurry')) {
    return { modulo: 'slurry', subtipo: 'Mantenimiento con Slurry' };
  }
  if (combined.includes('pozo')) {
    return { modulo: 'pozos', subtipo: 'Pozo de Agua / Absorción' };
  }
  if (
    combined.includes('señal') || 
    combined.includes('senalamiento') || 
    combined.includes('balizamiento') || 
    combined.includes('nomenclatura') || 
    combined.includes('transito') || 
    combined.includes('tránsito')
  ) {
    return { modulo: 'senalamiento', subtipo: 'Señalamiento y Balizamiento' };
  }
  if (
    combined.includes('arcotecho') || 
    combined.includes('techado') || 
    combined.includes('escuela') || 
    combined.includes('aula') || 
    combined.includes('multideportivo') || 
    combined.includes('cancha') ||
    combined.includes('edificacion') ||
    combined.includes('edificación') ||
    combined.includes('sendero') ||
    combined.includes('andador') ||
    combined.includes('banqueta')
  ) {
    const subtipo = combined.includes('sendero') 
      ? 'Sendero Seguro' 
      : combined.includes('arcotecho') || combined.includes('techado') 
      ? 'Arcotecho' 
      : 'Equipamiento e Infraestructura Social';
    return { modulo: 'equipamiento', subtipo };
  }
  if (combined.includes('bacheo') || combined.includes('bache')) {
    return { modulo: 'bacheo', subtipo: 'Bacheo' };
  }
  if (
    combined.includes('paviment') || 
    combined.includes('repaviment') || 
    combined.includes('carpeta') || 
    combined.includes('hidraulico') || 
    combined.includes('hidráulico') || 
    combined.includes('asfált') || 
    combined.includes('asfalt')
  ) {
    if (combined.includes('ecol') || combined.includes('permeable')) {
      return { modulo: 'pavimentacion', subtipo: 'ecologico' };
    }
    if (combined.includes('hidr') || combined.includes('hidráulico')) {
      return { modulo: 'pavimentacion', subtipo: 'hidraulico' };
    }
    return { modulo: 'pavimentacion', subtipo: 'asfaltica' };
  }

  return { modulo: 'pavimentacion', subtipo: 'asfaltica' };
};

/**
 * Extrae la delegación de una descripción de obra si no viene en columna propia
 */
export const extraerDelegacion = (texto: string = ''): string => {
  const match = texto.match(/DELEGACI[ÓO]N\s+([^,.;\n]+)/i);
  if (match && match[1]) {
    return match[1].trim().toUpperCase();
  }
  return 'TOLUCA';
};

/**
 * Calcula la distancia total en metros a lo largo de un arreglo de coordenadas [lat, lng]
 */
export const calcularMetrosLinealesTramo = (coords: [number, number][]): number => {
  if (coords.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    total += haversineDistance(coords[i][0], coords[i][1], coords[i + 1][0], coords[i + 1][1]);
  }
  return Math.round(total);
};

/**
 * Determina el estado temporal de una obra con respecto a la fecha seleccionada en el mapa
 */
export const getObraTimelineStatus = (obra: Obra, currentDate: Date): EstadoTemporalObra => {
  if (!obra.fechaInicio) return 'CONCLUIDA';
  if (currentDate < obra.fechaInicio) return 'POR_INICIAR';
  if (obra.fechaFin && currentDate > obra.fechaFin) return 'CONCLUIDA';
  return 'EN_EJECUCION';
};

/**
 * Parsea el CSV de Obras de Tramo (INFO CONTRATOS MAPEO - TRAMOS.csv)
 */
export const parseContratosTramos = (url: string): Promise<ObraTramo[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as Record<string, any>[];
        const parsed: ObraTramo[] = [];

        data.forEach((row, index) => {
          const rawContrato = getVal(row, ['No. Contrato', 'contrato', 'no_contrato']);
          const tipoRaw = getVal(row, ['Tipo de Obra', 'tipo', 'tipo_obra']) || '';
          const contrato = (rawContrato && rawContrato.toString().trim()) 
            ? rawContrato.toString().trim() 
            : (tipoRaw ? `${tipoRaw.toString().trim().toUpperCase()} #${index + 1}` : `OBRA-TRAMO #${index + 1}`);

          const nombre = getVal(row, ['Nombre de la Obra', 'nombre', 'descripcion', 'obra']) || '';
          if (!nombre && !rawContrato) return;

          const inicioRaw = getVal(row, ['Inicio de Ejecucion', 'inicio_de_ejecucion', 'inicio']);
          const terminoRaw = getVal(row, ['Termino de Ejecucion', 'termino_de_ejecucion', 'termino', 'fin']);
          
          const fechaInicio = parseFechaFlexible(inicioRaw);
          const fechaFin = parseFechaFlexible(terminoRaw);

          // Extraer dinámicamente columnas P1, P2... Pn o Geolocalización P1...
          const pKeys = Object.keys(row)
            .filter(key => /P\d+$/i.test(key.trim()))
            .sort((a, b) => {
              const numA = parseInt(a.trim().match(/\d+/)![0], 10);
              const numB = parseInt(b.trim().match(/\d+/)![0], 10);
              return numA - numB;
            });

          const coords: [number, number][] = [];
          pKeys.forEach(key => {
            const val = row[key];
            if (val) {
              const pt = extractCoords(val.toString());
              if (pt && !isNaN(pt.lat) && !isNaN(pt.lng) && pt.lat !== 0 && pt.lng !== 0) {
                // Validación para Toluca: lat positiva, lng negativa
                let lat = pt.lat;
                let lng = pt.lng;
                if (lat < 0 && lng > 0) {
                  lat = pt.lng;
                  lng = pt.lat;
                }
                coords.push([lat, lng]);
              }
            }
          });

          const { modulo, subtipo } = clasificarObra(tipoRaw, nombre);
          const delegacionCol = getVal(row, ['Delegación', 'delegacion']);
          const delegacion = delegacionCol ? delegacionCol.toString().trim() : extraerDelegacion(nombre);
          const metrosLineales = coords.length >= 2 ? calcularMetrosLinealesTramo(coords) : 0;

          parsed.push({
            id: `tramo-ctr-${index + 1}`,
            contrato: contrato.toString().trim(),
            nombre: nombre.toString().trim(),
            tipo: modulo,
            subtipo,
            tipoRaw: tipoRaw.toString().trim(),
            fechaInicio,
            fechaFin,
            delegacion,
            metrosLineales,
            geometriaTipo: 'tramo',
            coords
          });
        });

        resolve(parsed);
      },
      error: (err: Error) => reject(err)
    });
  });
};

/**
 * Parsea el CSV de Obras Puntuales (INFO CONTRATOS MAPEO - PUNTUALES.csv)
 */
export const parseContratosPuntuales = (url: string): Promise<ObraPuntual[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as Record<string, any>[];
        const parsed: ObraPuntual[] = [];

        data.forEach((row, index) => {
          const rawContrato = getVal(row, ['No. Contrato', 'contrato', 'no_contrato']);
          const tipoRaw = getVal(row, ['Tipo de Obra', 'tipo', 'tipo_obra']) || '';
          const contrato = (rawContrato && rawContrato.toString().trim()) 
            ? rawContrato.toString().trim() 
            : (tipoRaw ? `${tipoRaw.toString().trim().toUpperCase()} #${index + 1}` : `OBRA-PUNTUAL #${index + 1}`);

          const nombre = getVal(row, ['Nombre de la Obra', 'nombre', 'descripcion', 'obra']) || '';
          if (!nombre && !rawContrato) return;

          const inicioRaw = getVal(row, ['Inicio de Ejecucion', 'inicio_de_ejecucion', 'inicio']);
          const terminoRaw = getVal(row, ['Termino de Ejecucion', 'termino_de_ejecucion', 'termino', 'fin']);
          
          const fechaInicio = parseFechaFlexible(inicioRaw);
          const fechaFin = parseFechaFlexible(terminoRaw);

          // Extraer coordenadas de la columna Geolocalización
          const geoStr = getVal(row, ['Geolocalización', 'geolocalizacion', 'coordenadas', 'coordinates']) || '';
          let lat = 0;
          let lng = 0;
          if (geoStr) {
            const pt = extractCoords(geoStr.toString());
            if (pt) {
              lat = pt.lat;
              lng = pt.lng;
              if (lat < 0 && lng > 0) {
                lat = pt.lng;
                lng = pt.lat;
              }
            }
          }

          const { modulo, subtipo } = clasificarObra(tipoRaw, nombre);
          const delegacionCol = getVal(row, ['Delegación', 'delegacion']);
          const delegacion = delegacionCol ? delegacionCol.toString().trim() : extraerDelegacion(nombre);

          parsed.push({
            id: `puntual-ctr-${index + 1}`,
            contrato: contrato.toString().trim(),
            nombre: nombre.toString().trim(),
            tipo: modulo,
            subtipo,
            tipoRaw: tipoRaw.toString().trim(),
            fechaInicio,
            fechaFin,
            delegacion,
            geometriaTipo: 'puntual',
            lat,
            lng
          });
        });

        resolve(parsed);
      },
      error: (err: Error) => reject(err)
    });
  });
};

