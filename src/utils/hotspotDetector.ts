import type { DemandaCiudadana, PeticionCiudadana } from '../types/obras.ts';
import type { CitizenReportItem, HotspotCluster, HotspotFilterOptions, HotspotSeverity } from '../types/hotspots.ts';

/**
 * Calculates Haversine distance in meters between two coordinates.
 */
export function getHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const rad = Math.PI / 180;
  const φ1 = lat1 * rad;
  const φ2 = lat2 * rad;
  const Δφ = (lat2 - lat1) * rad;
  const Δλ = (lon2 - lon1) * rad;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Converts raw DemandaCiudadana and PeticionCiudadana into unified CitizenReportItem array.
 */
export function unifyCitizenReports(
  demandas: DemandaCiudadana[],
  peticiones: PeticionCiudadana[]
): CitizenReportItem[] {
  const items: CitizenReportItem[] = [];

  demandas.forEach((d) => {
    if (!d.lat || !d.lng || isNaN(d.lat) || isNaN(d.lng)) return;
    // Basic Toluca bounding check
    if (d.lat < 19.1 || d.lat > 19.5 || d.lng < -99.9 || d.lng > -99.4) return;

    items.push({
      id: d.id,
      fuente: 'Demanda General',
      tipo: cleanTipoName(d.trabajo || 'Bacheo'),
      calle: cleanStreetName(d.calleYNumero),
      delegacion: cleanDelegacionName(d.delegacion),
      lat: d.lat,
      lng: d.lng,
      folio: d.ticket,
      solicitante: d.solicitante,
      detalle: d.observaciones
    });
  });

  peticiones.forEach((p) => {
    if (!p.lat || !p.lng || isNaN(p.lat) || isNaN(p.lng)) return;
    if (p.lat < 19.1 || p.lat > 19.5 || p.lng < -99.9 || p.lng > -99.4) return;

    items.push({
      id: p.id,
      fuente: 'Petición DGOP',
      tipo: cleanTipoName(p.tipoSolicitud || 'Bacheo'),
      calle: cleanStreetName(p.calle),
      delegacion: cleanDelegacionName(p.delegacion),
      lat: p.lat,
      lng: p.lng,
      folio: p.oficio,
      solicitante: p.asunto?.slice(0, 50),
      detalle: p.asunto,
      fecha: p.fecha
    });
  });

  return items;
}

/**
 * Normalizes street names to avoid clutter and improve presentation.
 */
function cleanStreetName(name?: string): string {
  if (!name || !name.trim()) return 'Vialidad sin nombre especificado';
  let str = name.trim();
  // Capitalize nicely
  return str.replace(/\b\w+/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}

/**
 * Normalizes delegacion names.
 */
function cleanDelegacionName(name?: string): string {
  if (!name || !name.trim()) return 'Toluca';
  return name.trim().toUpperCase();
}

/**
 * Standardizes common problem types into clean categories.
 */
function cleanTipoName(tipo?: string): string {
  if (!tipo) return 'Bacheo';
  const upper = tipo.toUpperCase().trim();
  if (upper.includes('BACHEO')) return 'Bacheo';
  if (upper.includes('PAVIMENT') || upper.includes('REENCARPET')) return 'Pavimentación';
  if (upper.includes('REHABILIT')) return 'Rehabilitación Vial';
  if (upper.includes('DRENAJE') || upper.includes('ALCANTARILL')) return 'Drenaje y Alcantarillado';
  if (upper.includes('ALUMBR') || upper.includes('LAMPARA')) return 'Alumbrado Público';
  if (upper.includes('AGUA') || upper.includes('FUGA')) return 'Agua Potable';
  if (upper.includes('ESCOMBRO') || upper.includes('LIMPIEZA')) return 'Limpieza y Escombros';
  return tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();
}

/**
 * Detects spatial hotspots by clustering citizen reports within a physical radius.
 */
export function detectHotspots(
  allPoints: CitizenReportItem[],
  options: HotspotFilterOptions
): HotspotCluster[] {
  const { radiusMeters = 300, minPoints = 3, sourceFilter = 'todos' } = options;

  const filteredPoints = allPoints.filter((p) => {
    if (sourceFilter === 'demanda') return p.fuente === 'Demanda General';
    if (sourceFilter === 'peticiones') return p.fuente === 'Petición DGOP';
    return true;
  });

  if (filteredPoints.length === 0) return [];

  // Calculate neighbor density for each candidate seed
  const candidates = filteredPoints.map((p) => {
    const neighbors: { index: number; dist: number }[] = [];
    for (let j = 0; j < filteredPoints.length; j++) {
      const dist = getHaversineDistanceMeters(p.lat, p.lng, filteredPoints[j].lat, filteredPoints[j].lng);
      if (dist <= radiusMeters) {
        neighbors.push({ index: j, dist });
      }
    }
    return { point: p, count: neighbors.length, neighbors };
  });

  // Sort descending by highest neighbor density
  candidates.sort((a, b) => b.count - a.count);

  const visitedIds = new Set<string>();
  const rawClusters: {
    center: [number, number];
    points: CitizenReportItem[];
    topCalle: string;
    topDelegacion: string;
    fuenteCounts: { demandaGeneral: number; peticionesDGOP: number };
    tipoCounts: Record<string, number>;
  }[] = [];

  for (const item of candidates) {
    if (visitedIds.has(item.point.id)) continue;
    if (item.count < minPoints) continue;

    // Collect all unassigned points within radius
    const clusterPoints: CitizenReportItem[] = [];
    for (const n of item.neighbors) {
      const pt = filteredPoints[n.index];
      if (!visitedIds.has(pt.id)) {
        clusterPoints.push(pt);
        visitedIds.add(pt.id);
      }
    }

    if (clusterPoints.length >= minPoints) {
      const avgLat = clusterPoints.reduce((sum, p) => sum + p.lat, 0) / clusterPoints.length;
      const avgLng = clusterPoints.reduce((sum, p) => sum + p.lng, 0) / clusterPoints.length;

      // Calculate street and delegación frequencies
      const calleFreq: Record<string, number> = {};
      const delFreq: Record<string, number> = {};
      const tipoFreq: Record<string, number> = {};
      let demandaCount = 0;
      let peticionesCount = 0;

      clusterPoints.forEach((p) => {
        if (p.calle) calleFreq[p.calle] = (calleFreq[p.calle] || 0) + 1;
        if (p.delegacion) delFreq[p.delegacion] = (delFreq[p.delegacion] || 0) + 1;
        if (p.tipo) tipoFreq[p.tipo] = (tipoFreq[p.tipo] || 0) + 1;

        if (p.fuente === 'Demanda General') demandaCount++;
        else if (p.fuente === 'Petición DGOP') peticionesCount++;
      });

      const topCalle = Object.entries(calleFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Vialidad Principal';
      const topDelegacion = Object.entries(delFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || 'TOLUCA';

      rawClusters.push({
        center: [avgLat, avgLng],
        points: clusterPoints,
        topCalle,
        topDelegacion,
        fuenteCounts: {
          demandaGeneral: demandaCount,
          peticionesDGOP: peticionesCount
        },
        tipoCounts: tipoFreq
      });
    }
  }

  // Sort final clusters by total count descending and assign ranking & severity
  rawClusters.sort((a, b) => b.points.length - a.points.length);

  return rawClusters.map((c, index) => {
    const count = c.points.length;
    let severity: HotspotSeverity = 'moderada';
    if (count >= 12) severity = 'critica';
    else if (count >= 6) severity = 'alta';

    return {
      id: `hotspot-${index + 1}`,
      rank: index + 1,
      center: c.center,
      count,
      radiusMeters,
      topDelegacion: c.topDelegacion,
      topCalle: c.topCalle,
      fuenteCounts: c.fuenteCounts,
      tipoCounts: c.tipoCounts,
      severity,
      points: c.points
    };
  });
}

/**
 * Prepares weighted heatmap coordinates [lat, lng, intensity] for Leaflet.heat
 */
export function getHeatmapPoints(
  points: CitizenReportItem[],
  hotspots: HotspotCluster[]
): [number, number, number][] {
  // Create a fast lookup for hotspot proximity
  return points.map((p) => {
    // If the point belongs to a hotspot, assign higher intensity
    const isCritical = hotspots.some((h) => h.severity === 'critica' && h.points.some((hp) => hp.id === p.id));
    const isAlta = hotspots.some((h) => h.severity === 'alta' && h.points.some((hp) => hp.id === p.id));

    let intensity = 0.5;
    if (isCritical) intensity = 1.0;
    else if (isAlta) intensity = 0.8;

    return [p.lat, p.lng, intensity];
  });
}
