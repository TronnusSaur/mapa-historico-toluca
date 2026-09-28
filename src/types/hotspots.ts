export interface CitizenReportItem {
  id: string;
  fuente: 'Demanda General' | 'Petición DGOP';
  tipo: string;
  calle: string;
  delegacion: string;
  lat: number;
  lng: number;
  folio?: string;
  solicitante?: string;
  detalle?: string;
  fecha?: string;
}

export type HotspotSeverity = 'critica' | 'alta' | 'moderada';

export interface HotspotCluster {
  id: string;
  rank: number;
  center: [number, number]; // [lat, lng]
  count: number;
  radiusMeters: number;
  topDelegacion: string;
  topCalle: string;
  fuenteCounts: {
    demandaGeneral: number;
    peticionesDGOP: number;
  };
  tipoCounts: Record<string, number>;
  severity: HotspotSeverity;
  points: CitizenReportItem[];
}

export interface HotspotFilterOptions {
  radiusMeters: number; // 200, 300, 500
  minPoints: number; // min points to qualify as hotspot (e.g. 3, 5)
  sourceFilter: 'todos' | 'demanda' | 'peticiones';
}
