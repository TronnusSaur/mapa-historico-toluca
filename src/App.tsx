import { useState, useEffect, useMemo } from 'react';
import { useThrottle } from './hooks/useThrottle.ts';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { 
  parseCSV, 
  groupIntoTramos, 
  isPointInGeoJSON, 
  parsePavimentaciones, 
  mapSupabaseRowToPothole,
  parseContratosTramos,
  parseContratosPuntuales,
  fetchObrasTramosSupabase,
  fetchObrasPuntualesSupabase,
  fetchEvidenciasObras,
  vincularEvidenciasAObras
} from './utils/dataProcessors.ts';
import type { PotholeData, Tramo, PavimentacionData } from './utils/dataProcessors.ts';
import type { FiltrosModulos, ObraTramo, ObraPuntual, Obra, YearFilter } from './types/obras.ts';
import { supabase } from './lib/supabase.ts';
import { 
  BarChart3, 
  History, 
  Play, 
  Pause, 
  Filter, 
  Landmark, 
  Calendar,
  ChevronRight,
  Info,
  Loader2
} from 'lucide-react';

// Marker Cluster component (manual instantiation for better control with 50k points)
import MarkerClusterGroup from './components/MarkerClusterGroup.tsx';
import CoordinateSearch from './components/CoordinateSearch.tsx';
import { ModuleFilterBar, toggleModuloFilter } from './components/ModuleFilterBar.tsx';
import { ObrasLayers } from './components/ObrasLayers.tsx';
import { MapLegend } from './components/MapLegend.tsx';
import { ObraDetailModal } from './components/ObraDetailModal.tsx';

const CARTO_KEY = import.meta.env.VITE_CARTO_KEY || 'cb1_2v8k_1_77d3a08b9dfcaeb412cca4b0';

export default function App() {
  const [data, setData] = useState<PotholeData[]>([]);
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dbLoading, setDbLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<YearFilter>('todos');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [filters, setFilters] = useState({
    showHistorico: true,
    showTramos: true,
    showGeoJSON: true,
    showPlaneado: false,
    showE1: true,
    showE2: true,
    showE3: true,
    showSP2025: true,
    showSP2026: true,
    showSP2027: false,
    showPavimentaciones: true,
    renderMode: 'tramos' as 'tramos' | 'clusters'
  });
  // Statistics are now calculated dynamically in a useMemo below based on currentDate
  // Tramos are computed once on load — NOT on every timeline change
  const [allTramos, setAllTramos] = useState<Tramo[]>([]);
  const [obrasTramos, setObrasTramos] = useState<ObraTramo[]>([]);
  const [obrasPuntuales, setObrasPuntuales] = useState<ObraPuntual[]>([]);
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null);
  const [filtrosModulos, setFiltrosModulos] = useState<FiltrosModulos>({
    moduloActivo: 'todos',
    showBacheo: true,
    showPavimentacion: true,
    showSlurry: true,
    showSenderos: true,
    showArcotechos: true,
    showPozos: true,
    showSenalamiento: true,
    showEquipamiento: true,
    pavAsfaltica: true,
    pavHidraulico: true,
    pavEcologico: true,
    showConcluidas: true,
    showEnProceso: true,
    showProgramadas: true
  });

  useEffect(() => {
    const loadAll = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let loadedBoundaries: any = null;
      try {
        const baseUrl = import.meta.env.BASE_URL;
        
        // 1. Load boundaries, tickets CSV, and pavimentaciones in parallel
        const fetchGeoJSONBoundaries = async () => {
          try {
            const geoResp = await fetch(`${baseUrl}data/DELEGACIONES.geojson`);
            const boundaries = await geoResp.json();
            
            // Precalculate bbox for each feature to allow fast bounding-box reject in spatial queries
            if (boundaries && boundaries.features) {
              boundaries.features.forEach((feature: any) => {
                if (!feature.bbox && feature.geometry) {
                  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
                  const coords = feature.geometry.coordinates;
                  const processRing = (ring: [number, number][]) => {
                    for (const pt of ring) {
                      if (pt[0] < minLng) minLng = pt[0];
                      if (pt[1] < minLat) minLat = pt[1];
                      if (pt[0] > maxLng) maxLng = pt[0];
                      if (pt[1] > maxLat) maxLat = pt[1];
                    }
                  };
                  if (feature.geometry.type === 'Polygon') {
                    coords.forEach(processRing);
                  } else if (feature.geometry.type === 'MultiPolygon') {
                    coords.forEach((poly: any) => poly.forEach(processRing));
                  }
                  feature.bbox = [minLng, minLat, maxLng, maxLat];
                }
              });
            }
            setGeoData(boundaries);
            loadedBoundaries = boundaries;
            return boundaries;
          } catch (geoErr) {
            console.error("Error loading GeoJSON boundaries:", geoErr);
            return null;
          }
        };

        const fetchStageBacheos = async (stageFilter: string, stageName: string): Promise<PotholeData[]> => {
          try {
            console.log(`Iniciando descarga de ${stageName}...`);
            let query = supabase
              .from('bacheo')
              .select('Id, idEtapa, fecha, folio, latitude, longitude, m2total, largo');

            if (stageFilter === '1') query = query.eq('idEtapa', 1);
            else if (stageFilter === '2') query = query.eq('idEtapa', 2);
            else if (stageFilter === '3') query = query.eq('idEtapa', 3);
            else if (stageFilter === 'sp') query = query.in('idEtapa', [101, 102, 103]);

            const response = await (Promise.race([
              query,
              new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error(`Timeout en ${stageName} (45s)`)), 45000)
              )
            ]) as Promise<{ data: Record<string, unknown>[] | null; error: unknown }>);

            const { data: rows, error } = response;
            if (error) throw error;
            if (!rows) return [];
            console.log(`Descargados ${rows.length} registros de ${stageName}`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (rows as unknown as any[]).map(mapSupabaseRowToPothole);
          } catch (err) {
            console.error(`Error al descargar ${stageName}:`, err);
            return [];
          }
        };

        const fetchPavimentacionesWithFallback = async (): Promise<PavimentacionData[]> => {
          const remoteUrl = `https://docs.google.com/spreadsheets/d/1ghxpCxkAQB-y_dh0dEbcMHvnhPI1r42lkbqEN7Q8kDg/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('DGOP - Pavimentacion')}`;
          const localUrl = `${baseUrl}DGOP - Pavimentacion.csv`;
          
          try {
            return await Promise.race([
              parsePavimentaciones(remoteUrl),
              new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('Google Sheets Timeout (5s)')), 5000)
              )
            ]);
          } catch (err) {
            console.warn("Fallo la carga remota de pavimentaciones (usando respaldo local):", err);
            try {
              return await parsePavimentaciones(localUrl);
            } catch (localErr) {
              console.error("Fallo tambien la carga local de pavimentaciones:", localErr);
              return [];
            }
          }
        };

        const CONTRATOS_SPREADSHEET_ID = '1fHaAXj9qtGqgDBIbTh2jxryElklH6NN6bFWrnUZmYdk';

        const fetchContratosTramosWithFallback = async (): Promise<ObraTramo[]> => {
          // 1. Intento primario: Base de datos Supabase Alfa (public.mapeo_t)
          try {
            const data = await fetchObrasTramosSupabase();
            if (data && data.length > 0) {
              console.log(`Cargadas ${data.length} obras de tramo desde Supabase Alfa.`);
              return data;
            }
          } catch (e) {
            console.warn("Fallo carga de Tramos desde Supabase Alfa, probando respaldos:", e);
          }

          // 2. Intento secundario: Google Sheets
          const remoteUrl = `https://docs.google.com/spreadsheets/d/${CONTRATOS_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('TRAMOS')}&headers=1`;
          const localUrl = `${baseUrl}INFO CONTRATOS MAPEO - TRAMOS.csv`;
          
          try {
            return await Promise.race([
              parseContratosTramos(remoteUrl),
              new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('Google Sheets Tramos Timeout (3.5s)')), 3500)
              )
            ]);
          } catch (err) {
            console.warn("Fallo carga remota de Tramos (usando respaldo local):", err);
            try {
              return await parseContratosTramos(localUrl);
            } catch (localErr) {
              console.error("Fallo tambien la carga local de Tramos:", localErr);
              return [];
            }
          }
        };

        const fetchContratosPuntualesWithFallback = async (): Promise<ObraPuntual[]> => {
          // 1. Intento primario: Base de datos Supabase Alfa (public.mapeo_p)
          try {
            const data = await fetchObrasPuntualesSupabase();
            if (data && data.length > 0) {
              console.log(`Cargadas ${data.length} obras puntuales desde Supabase Alfa.`);
              return data;
            }
          } catch (e) {
            console.warn("Fallo carga de Puntuales desde Supabase Alfa, probando respaldos:", e);
          }

          // 2. Intento secundario: Google Sheets
          const remoteUrl = `https://docs.google.com/spreadsheets/d/${CONTRATOS_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('PUNTUALES')}&headers=1`;
          const localUrl = `${baseUrl}INFO CONTRATOS MAPEO - PUNTUALES.csv`;
          
          try {
            return await Promise.race([
              parseContratosPuntuales(remoteUrl),
              new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error('Google Sheets Puntuales Timeout (3.5s)')), 3500)
              )
            ]);
          } catch (err) {
            console.warn("Fallo carga remota de Puntuales (usando respaldo local):", err);
            try {
              return await parseContratosPuntuales(localUrl);
            } catch (localErr) {
              console.error("Fallo tambien la carga local de Puntuales:", localErr);
              return [];
            }
          }
        };

        // FASE 1: Carga INMEDIATA y prioritaria de Obras 2026, Pavimentaciones y Límites (<1 segundo)
        const [, parsedPavimentaciones, contratosTramos, contratosPuntuales, evidenciasMap] = await Promise.all([
          fetchGeoJSONBoundaries(),
          fetchPavimentacionesWithFallback(),
          fetchContratosTramosWithFallback(),
          fetchContratosPuntualesWithFallback(),
          fetchEvidenciasObras(baseUrl)
        ]);

        // Convert DGOP Pavimentaciones to ObraTramo structure for unified presentation
        const dgopTramos: ObraTramo[] = (parsedPavimentaciones || []).map(p => {
          const isSlurry = p.tipoObra.toLowerCase().includes('slurry');
          const isEco = p.tipoObra.toLowerCase().includes('ecol') || p.tipoObra.toLowerCase().includes('permeable');
          const isHidr = p.tipoObra.toLowerCase().includes('hidr');
          const subtipo = isEco ? 'ecologico' : isHidr ? 'hidraulico' : 'asfaltica';
          
          return {
            id: `dgop-p-${p.no}`,
            contrato: `DGOP-PAV-${p.no.toString().padStart(3, '0')}`,
            nombre: p.descripcion || `Obra No. ${p.no} - ${p.tipoObra}`,
            tipo: isSlurry ? 'slurry' : 'pavimentacion',
            subtipo: isSlurry ? 'Mantenimiento con Slurry' : subtipo,
            tipoRaw: p.tipoObra,
            anio: 2025,
            fechaInicio: new Date(2025, 0, 1),
            fechaFin: new Date(2025, 11, 31),
            delegacion: p.delegacion,
            superficie: p.superficie,
            metrosLineales: p.metrosLineales,
            inversion: p.inversion,
            geometriaTipo: 'tramo',
            coords: p.coords
          };
        });

        const combinedTramos = vincularEvidenciasAObras([...(contratosTramos || []), ...dgopTramos], evidenciasMap);
        const puntualesConEvidencias = vincularEvidenciasAObras(contratosPuntuales || [], evidenciasMap);
        setObrasTramos(combinedTramos);
        setObrasPuntuales(puntualesConEvidencias);

        // ¡DESMONTAR PANTALLA DE CARGA INMEDIATAMENTE!
        // El mapa, polígonos de Toluca, tramos y pines ya están listos e interactivos
        setLoading(false);
        console.log(`Fase 1 completada: ${combinedTramos.length} obras de tramo y ${puntualesConEvidencias.length} obras puntuales listas en mapa.`);

        // FASE 2: Sincronización en segundo plano de Bacheo (+50,000 registros, no bloquea el mapa)
        setDbLoading(true);

        (async () => {
          try {
            // 1. Cargar tickets locales (50,000 registros)
            const totalTickets = await parseCSV(`${baseUrl}data/6 - TICKETS TOTALES.csv`, 'TICKET_TOTAL');
            const enrichedTickets = totalTickets
              .filter(p => p !== null && p !== undefined)
              .map(p => ({
                ...p,
                inZona: loadedBoundaries ? isPointInGeoJSON(p.lat, p.lng, loadedBoundaries) : true
              }));

            setData(enrichedTickets);
            console.log(`Tickets locales cargados en segundo plano: ${enrichedTickets.length}`);

            // 2. Sincronizar etapas ejecutadas de Supabase
            const stageTasks = [
              { filter: '1', name: 'Etapa 1' },
              { filter: 'sp', name: 'Servicios Públicos' },
              { filter: '3', name: 'Etapa 3' },
              { filter: '2', name: 'Etapa 2' }
            ];

            let allLoadedBacheos: PotholeData[] = [];

            for (const task of stageTasks) {
              const stageBacheos = await fetchStageBacheos(task.filter, task.name);
              if (stageBacheos.length > 0) {
                const enriched = stageBacheos.map(p => ({
                  ...p,
                  inZona: loadedBoundaries ? isPointInGeoJSON(p.lat, p.lng, loadedBoundaries) : true
                }));

                allLoadedBacheos = [...allLoadedBacheos, ...enriched];

                setData(prev => {
                  const existingIds = new Set(prev.map(item => item.id));
                  const uniqueNew = enriched.filter(item => !existingIds.has(item.id));
                  return [...prev, ...uniqueNew];
                });
              }
            }

            // Precalcular tramos de bacheo una vez sincronizados
            const ejecutadosEnZona = allLoadedBacheos.filter(p => 
               p.status === 'EJECUTADO' && 
               p.inZona && 
               !(p.stage && p.stage >= 100) &&
               !isNaN(p.lat) && p.lat !== 0
            );
            const computed = groupIntoTramos(ejecutadosEnZona, 80, 2);
            setAllTramos(computed);
            setDbLoading(false);
            console.log(`Carga de base de datos de bacheo completa. ${allLoadedBacheos.length} baches ejecutados sincronizados.`);
          } catch (bgErr) {
            console.warn("Aviso en sincronización de bacheo en segundo plano:", bgErr);
            setDbLoading(false);
          }
        })();

      } catch (err) {
        console.error("Error loading initial data:", err);
        setLoading(false);
      }
    };
    loadAll();
  }, []);  // Helper para filtrar por año seleccionado
  const matchesYear = (d?: Date | null, stage?: number): boolean => {
    if (selectedYear === 'todos') return true;
    const y = parseInt(selectedYear, 10);
    if (stage === 101) return y === 2025;
    if (stage === 102) return y === 2026;
    if (stage === 103) return y === 2027;
    if (d instanceof Date && !isNaN(d.getTime())) {
      return d.getFullYear() === y;
    }
    return true;
  };

  // Obras de Tramo y Puntuales filtradas por año
  const filteredObrasTramos = useMemo(() => {
    if (selectedYear === 'todos') return obrasTramos;
    const y = parseInt(selectedYear, 10);
    return obrasTramos.filter(o => (o.anio || 2026) === y);
  }, [obrasTramos, selectedYear]);

  const filteredObrasPuntuales = useMemo(() => {
    if (selectedYear === 'todos') return obrasPuntuales;
    const y = parseInt(selectedYear, 10);
    return obrasPuntuales.filter(o => (o.anio || 2026) === y);
  }, [obrasPuntuales, selectedYear]);

  // Límites dinámicos del slider temporal según el año activo
  const sliderBounds = useMemo(() => {
    if (selectedYear === '2025') {
      return {
        min: new Date(2025, 0, 1).getTime(),
        max: new Date(2025, 11, 31).getTime()
      };
    }
    if (selectedYear === '2026') {
      return {
        min: new Date(2026, 0, 1).getTime(),
        max: new Date(2026, 11, 31).getTime()
      };
    }
    if (selectedYear === '2027') {
      return {
        min: new Date(2027, 0, 1).getTime(),
        max: new Date(2027, 11, 31).getTime()
      };
    }
    // 'todos' (GENERAL): Todo el trienio
    return {
      min: new Date(2024, 11, 31).getTime(),
      max: new Date().getTime()
    };
  }, [selectedYear]);

  const handleSelectYear = (year: YearFilter) => {
    setSelectedYear(year);
    setIsPlaying(false);
    const now = new Date();
    if (year === '2025') {
      setCurrentDate(new Date(2025, 11, 31));
      setFilters(f => ({ ...f, showSP2025: true, showSP2026: false, showSP2027: false }));
    } else if (year === '2026') {
      setCurrentDate(now.getFullYear() === 2026 ? now : new Date(2026, 11, 31));
      setFilters(f => ({ ...f, showSP2025: false, showSP2026: true, showSP2027: false }));
    } else if (year === '2027') {
      setCurrentDate(new Date(2027, 0, 1));
      setFilters(f => ({ ...f, showSP2025: false, showSP2026: false, showSP2027: true }));
    } else {
      // GENERAL ('todos')
      setCurrentDate(now);
      setFilters(f => ({ ...f, showSP2025: true, showSP2026: true, showSP2027: false }));
    }
  };

  // Statistics: dynamic calculation based on timeline and active year
  const stats = useMemo(() => {
    // 1. All Work Progress up to today (regardless of visibility, for integrity)
    // We count EVERY record from the CSV here that matches the year filter.
    const allDoneUpToDate = data.filter(p => p.status === 'EJECUTADO' && p.date <= currentDate && matchesYear(p.date, p.stage));
    
    // 2. Filtered Work Progress (respecting stage toggles only, for global header/summary)
    const filteredDoneUpToDate = allDoneUpToDate.filter(p => {
       if (p.stage === 1 && !filters.showE1) return false;
       if (p.stage === 2 && !filters.showE2) return false;
       if (p.stage === 3 && !filters.showE3) return false;
       if (p.stage === 101 && !filters.showSP2025) return false;
       if (p.stage === 102 && !filters.showSP2026) return false;
       if (p.stage === 103 && !filters.showSP2027) return false;
       return true;
    });

    // 3. Stage-Specific metrics (Stable - always use allDoneUpToDate)
    const e1Done = allDoneUpToDate.filter(p => p.stage === 1);
    const e2Done = allDoneUpToDate.filter(p => p.stage === 2);
    const e3Done = allDoneUpToDate.filter(p => p.stage === 3);

    // 4. Tickets Logic (Independent of project stages)
    const ticketsTotal = data.filter(p => p.status === 'TICKET_TOTAL' && matchesYear(p.date));
    
    // Active (Pending) tickets at current date
    const activeTicketsAtDate = ticketsTotal.filter(p => {
      const wasReported = (p.reportDate || p.date) <= currentDate;
      const isStillPending = !p.resolvedDate || p.resolvedDate > currentDate;
      return wasReported && isStillPending;
    });

    // Attended tickets at current date
    const attendedTicketsAtDate = ticketsTotal.filter(p => {
       const wasReported = (p.reportDate || p.date) <= currentDate;
       const wasAttended = p.resolvedDate && p.resolvedDate <= currentDate;
       return wasReported && wasAttended;
     });

    return {
      total: data.length,
      // Global metrics recalculate with filters (SPATIAL IGNORED FOR RECONTEO INTEGRITY)
      m2: filteredDoneUpToDate.reduce((acc, curr) => acc + (curr.m2 || 0), 0),
      ml: filteredDoneUpToDate.reduce((acc, curr) => acc + (curr.largo || 0), 0),
      baches: filteredDoneUpToDate.length,
      demandaActiva: activeTicketsAtDate.length,
      ticketsAtendidos: attendedTicketsAtDate.length,
      // Stage-specific stats
      e1Baches: e1Done.length,
      e1M2: e1Done.reduce((acc, curr) => acc + (curr.m2 || 0), 0),
      e2Baches: e2Done.length,
      e2M2: e2Done.reduce((acc, curr) => acc + (curr.m2 || 0), 0),
      e3Baches: e3Done.length,
      e3M2: e3Done.reduce((acc, curr) => acc + (curr.m2 || 0), 0)
    };
  }, [data, currentDate, selectedYear, filters.showE1, filters.showE2, filters.showE3, filters.showSP2025, filters.showSP2026, filters.showSP2027]);

  // Map Visualization Data (Optimized: uses pre-calculated p.inZona)
  const visibleData = useMemo(() => {
    return data.filter(p => {
       // 1. Geography filter (must be inside Toluca + 800m buffer)
       if (!p.inZona) return false;
       
       // 2. Valid Coords Check (Don't try to render 0,0 points or NaN)
       if (!p.lat || !p.lng || isNaN(p.lat)) return false;

       // 3. Year filter
       if (!matchesYear(p.date, p.stage)) return false;

       // 4. Stage filter
       if (p.stage === 1 && !filters.showE1) return false;
       if (p.stage === 2 && !filters.showE2) return false;
       if (p.stage === 3 && !filters.showE3) return false;
       if (p.stage === 101 && !filters.showSP2025) return false;
       if (p.stage === 102 && !filters.showSP2026) return false;
       if (p.stage === 103 && !filters.showSP2027) return false;

       // 5. Status/Timeline filter
       if (p.status === 'EJECUTADO') return p.date <= currentDate;
       
       if (p.status === 'TICKET_TOTAL') {
         const wasReported = (p.reportDate || p.date) <= currentDate;
         const isNotYetResolved = !p.resolvedDate || p.resolvedDate > currentDate;
         return wasReported && isNotYetResolved;
       }

       return p.date <= currentDate;
    });
  }, [data, currentDate, selectedYear, filters.showE1, filters.showE2, filters.showE3, filters.showSP2025, filters.showSP2026, filters.showSP2027]);

  // Tramos: filter the pre-computed chains by currentDate, stage, and selectedYear
  const tramos = useMemo(() => {
    return allTramos.filter(t => {
      if (!matchesYear(t.date, t.stage)) return false;
      if (t.stage === 1 && !filters.showE1) return false;
      if (t.stage === 2 && !filters.showE2) return false;
      if (t.stage === 3 && !filters.showE3) return false;
      if (t.stage === 101 && !filters.showSP2025) return false;
      if (t.stage === 102 && !filters.showSP2026) return false;
      if (t.stage === 103 && !filters.showSP2027) return false;
      return t.date <= currentDate;
    });
  }, [allTramos, currentDate, selectedYear, filters.showE1, filters.showE2, filters.showE3, filters.showSP2025, filters.showSP2026, filters.showSP2027]);

  // Convert filtered tramos to a single GeoJSON FeatureCollection for high-performance rendering.
  // This avoids mounting thousands of individual <Polyline> components which freezes React.
  const tramosGeoJSON = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: tramos.map((t, idx) => ({
        type: 'Feature',
        id: idx,
        geometry: {
          type: 'LineString',
          coordinates: t.coords.map(c => [c[1], c[0]]) // Leaflet GeoJSON expects [lng, lat]
        }
      }))
    };
  }, [tramos]);

  // Throttled cluster data — limits re-clustering to max once per 300ms.
  // This keeps UI responsive during rapid slider dragging or animation playback.
  const throttledClusterData = useThrottle(visibleData, 400);

  // Animation Loop
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentDate(prev => {
          const next = new Date(prev.getTime() + 86400000 * 7); // Move 1 week at a time
          if (next.getTime() >= sliderBounds.max) {
            setIsPlaying(false);
            return new Date(sliderBounds.max);
          }
          return next;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, sliderBounds.max]);

  const moduleCounts = useMemo(() => {
    const bacheoCount = stats.baches;
    const pavTramos = filteredObrasTramos.filter(o => o.tipo === 'pavimentacion');
    const slurryTramos = filteredObrasTramos.filter(o => o.tipo === 'slurry');
    const senderosCount = filteredObrasTramos.filter(o => o.tipo === 'senderos').length + filteredObrasPuntuales.filter(o => o.tipo === 'senderos').length;
    const arcotechosCount = filteredObrasTramos.filter(o => o.tipo === 'arcotechos').length + filteredObrasPuntuales.filter(o => o.tipo === 'arcotechos').length;
    const pozosCount = filteredObrasPuntuales.filter(o => o.tipo === 'pozos').length + filteredObrasTramos.filter(o => o.tipo === 'pozos').length;
    const senalamientoCount = filteredObrasPuntuales.filter(o => o.tipo === 'senalamiento').length;
    const equipamientoCount = filteredObrasPuntuales.filter(o => o.tipo === 'equipamiento').length;

    const pavAsfaltica = pavTramos.filter(o => o.subtipo === 'asfaltica').length;
    const pavHidraulico = pavTramos.filter(o => o.subtipo === 'hidraulico').length;
    const pavEcologico = pavTramos.filter(o => o.subtipo === 'ecologico').length;

    return {
      bacheo: bacheoCount,
      pavimentacion: pavTramos.length,
      slurry: slurryTramos.length,
      senderos: senderosCount,
      arcotechos: arcotechosCount,
      pozos: pozosCount,
      senalamiento: senalamientoCount,
      equipamiento: equipamientoCount,
      pavAsfaltica,
      pavHidraulico,
      pavEcologico
    };
  }, [stats.baches, filteredObrasTramos, filteredObrasPuntuales]);

  const renderHeaderMetrics = () => {
    if (filtrosModulos.moduloActivo === 'pavimentacion') {
      const pavs = filteredObrasTramos.filter(o => o.tipo === 'pavimentacion');
      const totalMl = pavs.reduce((acc, curr) => acc + (curr.metrosLineales || 0), 0);
      const totalM2 = pavs.reduce((acc, curr) => acc + (curr.superficie || 0), 0);
      return (
        <>
          <div className="text-center">
            <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Contratos Activos</p>
            <p className="text-2xl font-black text-white">{pavs.length} <span className="text-sm font-normal opacity-50">Obras</span></p>
          </div>
          <div className="w-[1px] h-10 bg-white/10 mt-1" />
          <div className="text-center">
            <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Avance Lineal</p>
            <p className="text-2xl font-black text-toluca-gold">{totalMl.toLocaleString()} <span className="text-sm font-normal opacity-50">ML</span></p>
          </div>
          <div className="w-[1px] h-10 bg-white/10 mt-1" />
          <div className="text-center">
            <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Superficie Total</p>
            <p className="text-2xl font-black text-toluca-gold">{totalM2.toLocaleString()} <span className="text-sm font-normal opacity-50">m²</span></p>
          </div>
        </>
      );
    }
    if (filtrosModulos.moduloActivo === 'pozos') {
      const pozosPuntuales = filteredObrasPuntuales.filter(o => o.tipo === 'pozos');
      const drenajesTramos = filteredObrasTramos.filter(o => o.tipo === 'pozos');
      const totalMl = drenajesTramos.reduce((acc, curr) => acc + (curr.metrosLineales || 0), 0);
      const totalObras = pozosPuntuales.length + drenajesTramos.length;
      return (
        <>
          <div className="text-center">
            <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Obras OAyST</p>
            <p className="text-2xl font-black text-cyan-300">{totalObras} <span className="text-sm font-normal opacity-50">Totales</span></p>
          </div>
          <div className="w-[1px] h-10 bg-white/10 mt-1" />
          <div className="text-center">
            <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Red de Drenaje</p>
            <p className="text-2xl font-black text-toluca-gold">{totalMl.toLocaleString()} <span className="text-sm font-normal opacity-50">ML</span></p>
          </div>
          <div className="w-[1px] h-10 bg-white/10 mt-1" />
          <div className="text-center">
            <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Pozos de Agua</p>
            <p className="text-2xl font-black text-white">{pozosPuntuales.length} <span className="text-sm font-normal opacity-50">Pozos</span></p>
          </div>
          <div className="w-[1px] h-10 bg-white/10 mt-1" />
          <div className="text-center">
            <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Organismo</p>
            <p className="text-xl font-black text-toluca-gold mt-1">OAyST <span className="text-xs font-normal opacity-60">Toluca</span></p>
          </div>
        </>
      );
    }
    if (filtrosModulos.moduloActivo === 'slurry') {
      const slurries = filteredObrasTramos.filter(o => o.tipo === 'slurry');
      const totalMl = slurries.reduce((acc, curr) => acc + (curr.metrosLineales || 0), 0);
      return (
        <>
          <div className="text-center">
            <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Obras Slurry</p>
            <p className="text-2xl font-black text-amber-300">{slurries.length} <span className="text-sm font-normal opacity-50">Vialidades</span></p>
          </div>
          <div className="w-[1px] h-10 bg-white/10 mt-1" />
          <div className="text-center">
            <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Longitud Preservada</p>
            <p className="text-2xl font-black text-toluca-gold">{totalMl.toLocaleString()} <span className="text-sm font-normal opacity-50">ML</span></p>
          </div>
          <div className="w-[1px] h-10 bg-white/10 mt-1" />
          <div className="text-center">
            <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Tratamiento</p>
            <p className="text-xl font-black text-white mt-1">Sello Preventivo</p>
          </div>
        </>
      );
    }
    if (filtrosModulos.moduloActivo === 'senalamiento') {
      const senales = filteredObrasPuntuales.filter(o => o.tipo === 'senalamiento');
      return (
        <>
          <div className="text-center">
            <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Intervenciones</p>
            <p className="text-2xl font-black text-yellow-300">{senales.length} <span className="text-sm font-normal opacity-50">Cruces</span></p>
          </div>
          <div className="w-[1px] h-10 bg-white/10 mt-1" />
          <div className="text-center">
            <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Tipo de Obra</p>
            <p className="text-xl font-black text-white mt-1">Señalamiento Vial</p>
          </div>
          <div className="w-[1px] h-10 bg-white/10 mt-1" />
          <div className="text-center">
            <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Dirección</p>
            <p className="text-xl font-black text-toluca-gold mt-1">Seguridad y Tránsito</p>
          </div>
        </>
      );
    }
    if (filtrosModulos.moduloActivo === 'senderos') {
      const senderos = filteredObrasTramos.filter(o => o.tipo === 'senderos');
      const totalMl = senderos.reduce((acc, curr) => acc + (curr.metrosLineales || 0), 0);
      return (
        <>
          <div className="text-center">
            <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Rutas Seguras</p>
            <p className="text-2xl font-black text-purple-300">{senderos.length} <span className="text-sm font-normal opacity-50">Tramos</span></p>
          </div>
          <div className="w-[1px] h-10 bg-white/10 mt-1" />
          <div className="text-center">
            <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Longitud Intervenida</p>
            <p className="text-2xl font-black text-toluca-gold">{totalMl.toLocaleString()} <span className="text-sm font-normal opacity-50">ML</span></p>
          </div>
          <div className="w-[1px] h-10 bg-white/10 mt-1" />
          <div className="text-center">
            <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Enfoque Integral</p>
            <p className="text-xl font-black text-white mt-1">Movilidad y Género</p>
          </div>
        </>
      );
    }
    if (filtrosModulos.moduloActivo === 'arcotechos') {
      const arcotechos = filteredObrasPuntuales.filter(o => o.tipo === 'arcotechos');
      return (
        <>
          <div className="text-center">
            <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Techados Escolares</p>
            <p className="text-2xl font-black text-amber-400">{arcotechos.length} <span className="text-sm font-normal opacity-50">Arcotechos</span></p>
          </div>
          <div className="w-[1px] h-10 bg-white/10 mt-1" />
          <div className="text-center">
            <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Planteles Beneficiados</p>
            <p className="text-2xl font-black text-white">{arcotechos.length} <span className="text-sm font-normal opacity-50">Escuelas</span></p>
          </div>
          <div className="w-[1px] h-10 bg-white/10 mt-1" />
          <div className="text-center">
            <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Impacto Social</p>
            <p className="text-xl font-black text-toluca-gold mt-1">Comunidad Estudiantil</p>
          </div>
        </>
      );
    }
    if (filtrosModulos.moduloActivo === 'equipamiento') {
      const equip = filteredObrasPuntuales.filter(o => o.tipo === 'equipamiento');
      return (
        <>
          <div className="text-center">
            <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Equipamiento Social</p>
            <p className="text-2xl font-black text-purple-300">{equip.length} <span className="text-sm font-normal opacity-50">Planteles</span></p>
          </div>
          <div className="w-[1px] h-10 bg-white/10 mt-1" />
          <div className="text-center">
            <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Infraestructura</p>
            <p className="text-xl font-black text-white mt-1">Arcotechos y Aulas</p>
          </div>
          <div className="w-[1px] h-10 bg-white/10 mt-1" />
          <div className="text-center">
            <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Impacto</p>
            <p className="text-xl font-black text-toluca-gold mt-1">Comunidad Escolar</p>
          </div>
        </>
      );
    }
    if (filtrosModulos.moduloActivo === 'multiple') {
      const selectedTramos = filteredObrasTramos.filter(o => {
        if (o.tipo === 'pavimentacion') return filtrosModulos.showPavimentacion;
        if (o.tipo === 'slurry') return filtrosModulos.showSlurry;
        if (o.tipo === 'senderos') return filtrosModulos.showSenderos;
        if (o.tipo === 'arcotechos') return filtrosModulos.showArcotechos;
        return false;
      });
      const selectedPuntuales = filteredObrasPuntuales.filter(o => {
        if (o.tipo === 'arcotechos') return filtrosModulos.showArcotechos;
        if (o.tipo === 'pozos') return filtrosModulos.showPozos;
        if (o.tipo === 'senalamiento') return filtrosModulos.showSenalamiento;
        if (o.tipo === 'equipamiento') return filtrosModulos.showEquipamiento;
        return false;
      });
      const totalObras = (filtrosModulos.showBacheo ? stats.baches : 0) + selectedTramos.length + selectedPuntuales.length;
      const totalMl = selectedTramos.reduce((acc, curr) => acc + (curr.metrosLineales || 0), 0) + (filtrosModulos.showBacheo ? stats.ml : 0);

      const activeNames: string[] = [];
      if (filtrosModulos.showBacheo) activeNames.push('Bacheo');
      if (filtrosModulos.showPavimentacion) activeNames.push('Pavimentos');
      if (filtrosModulos.showSlurry) activeNames.push('Slurry');
      if (filtrosModulos.showSenderos) activeNames.push('Senderos');
      if (filtrosModulos.showArcotechos) activeNames.push('Arcotechos');
      if (filtrosModulos.showPozos) activeNames.push('Pozos');
      if (filtrosModulos.showSenalamiento) activeNames.push('Señalamiento');

      return (
        <>
          <div className="text-center">
            <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Obras Activas</p>
            <p className="text-2xl font-black text-white">{totalObras.toLocaleString()} <span className="text-sm font-normal opacity-50">Intervenciones</span></p>
          </div>
          <div className="w-[1px] h-10 bg-white/10 mt-1" />
          <div className="text-center">
            <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Alcance Lineal</p>
            <p className="text-2xl font-black text-toluca-gold">{totalMl.toLocaleString()} <span className="text-sm font-normal opacity-50">ML</span></p>
          </div>
          <div className="w-[1px] h-10 bg-white/10 mt-1" />
          <div className="text-center">
            <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Filtros Activos</p>
            <p className="text-sm font-black text-toluca-gold mt-1 truncate max-w-[210px]" title={activeNames.join(', ')}>
              {activeNames.length > 0 ? activeNames.join(' + ') : 'Ninguno'}
            </p>
          </div>
        </>
      );
    }
    // Por defecto (Bacheo o Todos)
    return (
      <>
        <div className="text-center">
          <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Impacto Global</p>
          <p className="text-2xl font-black text-white">{stats.baches.toLocaleString()} <span className="text-sm font-normal opacity-50">Baches</span></p>
        </div>
        <div className="w-[1px] h-10 bg-white/10 mt-1" />
        <div className="text-center">
          <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Avance Lineal</p>
          <p className="text-2xl font-black text-toluca-gold">{stats.ml.toLocaleString()} <span className="text-sm font-normal opacity-50">ML</span></p>
        </div>
        <div className="w-[1px] h-10 bg-white/10 mt-1" />
        <div className="text-center">
          <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Superficie Total</p>
          <p className="text-2xl font-black text-toluca-gold">{stats.m2.toLocaleString()} <span className="text-sm font-normal opacity-50">m²</span></p>
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header Premium - Toluca Capital Style */}
      <header className="bg-toluca-burgundy text-white shadow-xl z-50">
        <div className="max-w-9xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-toluca-burgundy p-2.5 rounded-full border-2 border-white/30 shadow-lg flex items-center justify-center">
                <Landmark className="text-white w-7 h-7" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-black tracking-tighter leading-none">TOLUCA CAPITAL</h1>
                <p className="text-[9px] font-bold tracking-[0.3em] opacity-60 uppercase mt-1">AYUNTAMIENTO 2025-2027</p>
              </div>
            </div>

            <div className="w-[1px] h-10 bg-white/10 hidden md:block" />

            <div className="hidden lg:block">
              <h2 className="text-xl font-black tracking-tight leading-none">
                {filtrosModulos.moduloActivo === 'pavimentacion' ? 'Torre de Control de Pavimentaciones' :
                 filtrosModulos.moduloActivo === 'pozos' ? 'Torre de Control de Pozos y Drenajes' :
                 filtrosModulos.moduloActivo === 'slurry' ? 'Torre de Control de Mantenimiento Slurry' :
                 filtrosModulos.moduloActivo === 'senderos' ? 'Torre de Control de Senderos Seguros' :
                 filtrosModulos.moduloActivo === 'arcotechos' ? 'Torre de Control de Arcotechos Escolares' :
                 filtrosModulos.moduloActivo === 'senalamiento' ? 'Torre de Control de Señalamiento' :
                 filtrosModulos.moduloActivo === 'equipamiento' ? 'Torre de Control de Equipamiento' :
                 filtrosModulos.moduloActivo === 'bacheo' ? 'Torre de Control de Bacheo' :
                 filtrosModulos.moduloActivo === 'multiple' ? 'Torre de Control · Selección Combinada' :
                 'Geoportal de Obra Pública'}
              </h2>
              <p className="text-[9px] font-bold tracking-[0.2em] opacity-40 uppercase mt-1">
                {filtrosModulos.moduloActivo === 'todos' ? 'VISOR INTEGRAL MULTI-MÓDULO TOLUCA' : 
                 filtrosModulos.moduloActivo === 'multiple' ? 'FILTRO DINÁMICO MULTI-OBRA' : 
                 'ESTRATEGIA INTEGRAL DE REHABILITACIÓN'}
              </p>
            </div>
          </div>

          <div className="flex gap-10">
            {renderHeaderMetrics()}
          </div>

          <div className="flex items-center gap-3">
             <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                {dbLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 text-toluca-gold animate-spin" />
                    <span className="text-[11px] font-bold tracking-wider text-toluca-gold animate-pulse">CARGANDO BACHES (+50K)...</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[11px] font-bold tracking-wider">SISTEMA ACTIVO</span>
                  </>
                )}
             </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Táctico */}
        <aside className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col z-40 shadow-inner overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6 flex-1">
            {/* 1. Selector de Módulos de Obra y Subtipos */}
            <ModuleFilterBar
              filtros={filtrosModulos}
              onFiltrosChange={setFiltrosModulos}
              counts={moduleCounts}
            />

            {/* 2. Secciones Específicas de Bacheo (solo visibles si el módulo Bacheo está activo) */}
            {filtrosModulos.moduloActivo === 'bacheo' && (
              <>
                {/* --- ETAPA 3 (ACTUAL) --- */}
                <div>
                  <h3 className="text-xs font-black text-toluca-burgundy tracking-widest uppercase mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2"><BarChart3 size={14} /> Etapa 3 (Actual)</span>
                    <span className="bg-toluca-burgundy/10 text-[10px] px-2 py-0.5 rounded text-toluca-burgundy">EN PROCESO</span>
                  </h3>
                  <div className="space-y-3">
                     <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                       <div className="flex justify-between items-end mb-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Superficie (m²)</span>
                          <span className="text-xs font-black text-slate-800">{Math.min(100, Math.round((stats.e3M2 / 104610.31) * 100))}%</span>
                       </div>
                       <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                           className="bg-toluca-gold h-full transition-all duration-500" 
                           style={{ width: `${Math.min(100, (stats.e3M2 / 104610.31) * 100)}%` }} 
                          />
                       </div>
                       <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase text-right">Meta: 104,610.31 m²</p>
                     </div>
                     <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                       <div className="flex justify-between items-end mb-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Baches Realizados</span>
                          <span className="text-xs font-black text-slate-800">{Math.min(100, Math.round((stats.e3Baches / 20866) * 100))}%</span>
                       </div>
                       <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                           className="bg-toluca-burgundy h-full transition-all duration-500" 
                           style={{ width: `${Math.min(100, (stats.e3Baches / 20866) * 100)}%` }} 
                          />
                       </div>
                       <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase text-right">Meta: 20,866 Baches</p>
                     </div>
                  </div>
                </div>

                {/* --- ETAPA 2 (HISTÓRICA) --- */}
                <div>
                  <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2"><History size={14} /> Etapa 2</span>
                    <span className="text-[10px] opacity-70">FINALIZADA</span>
                  </h3>
                  <div className="space-y-2 opacity-80">
                     <div className="bg-slate-100/50 p-2 rounded-lg border border-slate-200">
                       <div className="flex justify-between items-end mb-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Superficie (m²)</span>
                          <span className="text-[10px] font-black">{Math.min(100, Math.round((stats.e2M2 / 125095.34) * 100))}%</span>
                       </div>
                       <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                          <div 
                           className="bg-slate-400 h-full" 
                           style={{ width: `${Math.min(100, (stats.e2M2 / 125095.34) * 100)}%` }} 
                          />
                       </div>
                     </div>
                     <div className="bg-slate-100/50 p-2 rounded-lg border border-slate-200">
                       <div className="flex justify-between items-end mb-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Baches</span>
                          <span className="text-[10px] font-black">{Math.min(100, Math.round((stats.e2Baches / 24906) * 100))}%</span>
                       </div>
                       <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                          <div 
                           className="bg-slate-400 h-full" 
                           style={{ width: `${Math.min(100, (stats.e2Baches / 24906) * 100)}%` }} 
                          />
                       </div>
                     </div>
                  </div>
                </div>

                {/* --- ETAPA 1 (HISTÓRICA) --- */}
                <div>
                  <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2"><History size={14} /> Etapa 1</span>
                    <span className="text-[10px] opacity-70">FINALIZADA</span>
                  </h3>
                  <div className="space-y-2 opacity-80">
                     <div className="bg-slate-100/50 p-2 rounded-lg border border-slate-200">
                       <div className="flex justify-between items-end mb-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Superficie (m²)</span>
                          <span className="text-[10px] font-black">{Math.min(100, Math.round((stats.e1M2 / 126698.07) * 100))}%</span>
                       </div>
                       <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                          <div 
                           className="bg-slate-400 h-full" 
                           style={{ width: `${Math.min(100, (stats.e1M2 / 126698.07) * 100)}%` }} 
                          />
                       </div>
                     </div>
                     <div className="bg-slate-100/50 p-2 rounded-lg border border-slate-200">
                       <div className="flex justify-between items-end mb-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Baches</span>
                          <span className="text-[10px] font-black">{Math.min(100, Math.round((stats.e1Baches / 12773) * 100))}%</span>
                       </div>
                       <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                          <div 
                           className="bg-slate-400 h-full" 
                           style={{ width: `${Math.min(100, (stats.e1Baches / 12773) * 100)}%` }} 
                          />
                       </div>
                     </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                   <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-3 mt-4 flex items-center gap-2">
                      <Filter size={14} /> DGOP (Obras Públicas)
                   </h3>
                   <div className="grid grid-cols-3 gap-2 mb-4">
                      <button 
                        onClick={() => setFilters(f => ({ ...f, showE1: !f.showE1 }))}
                        className={`p-2 rounded-lg border text-[10px] font-bold transition-all ${filters.showE1 ? 'bg-toluca-gold border-toluca-gold text-white' : 'bg-white border-slate-200 text-slate-400'}`}
                      >
                        ETAPA 1
                      </button>
                      <button 
                        onClick={() => setFilters(f => ({ ...f, showE2: !f.showE2 }))}
                        className={`p-2 rounded-lg border text-[10px] font-bold transition-all ${filters.showE2 ? 'bg-toluca-burgundy border-toluca-burgundy text-white' : 'bg-white border-slate-200 text-slate-400'}`}
                      >
                        ETAPA 2
                      </button>
                      <button 
                        onClick={() => setFilters(f => ({ ...f, showE3: !f.showE3 }))}
                        className={`p-2 rounded-lg border text-[10px] font-bold transition-all ${filters.showE3 ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}
                      >
                        ETAPA 3
                      </button>
                   </div>

                   <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-3 mt-4 flex items-center gap-2">
                      <Filter size={14} /> Servicios Públicos (DGSP)
                   </h3>
                   <div className="grid grid-cols-3 gap-2 mb-4">
                      <button 
                        onClick={() => setFilters(f => ({ ...f, showSP2025: !f.showSP2025 }))}
                        className={`p-2 rounded-lg border text-[10px] font-bold transition-all ${filters.showSP2025 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}
                      >
                        2025
                      </button>
                      <button 
                        onClick={() => setFilters(f => ({ ...f, showSP2026: !f.showSP2026 }))}
                        className={`p-2 rounded-lg border text-[10px] font-bold transition-all ${filters.showSP2026 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}
                      >
                        2026
                      </button>
                      <button 
                        disabled
                        className="p-1.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-400 text-[10px] font-bold cursor-not-allowed opacity-60 flex flex-col items-center justify-center"
                        title="Próximamente"
                      >
                        <span>2027</span>
                        <span className="text-[7px] text-slate-400 font-normal uppercase">Próximamente</span>
                      </button>
                   </div>

                   <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-4 mt-4 flex items-center gap-2">
                      <BarChart3 size={14} /> Resumen de Operación
                   </h3>
                   <div className="space-y-3">
                      {/* KPI: Baches Realizados */}
                      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                         <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Baches Totales</p>
                         <p className="text-2xl font-black text-toluca-burgundy">{stats.baches.toLocaleString()}</p>
                         <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 flex items-center gap-1">
                            <ChevronRight size={10} /> Consolidado Histórico
                         </p>
                      </div>

                      {/* KPI: Tickets Atendidos */}
                      <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                         <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Tickets Atendidos</p>
                         <p className="text-2xl font-black text-green-800">{stats.ticketsAtendidos.toLocaleString()}</p>
                         <p className="text-[9px] text-green-400 font-bold uppercase mt-1 flex items-center gap-1">
                            <ChevronRight size={10} /> Eficiencia Operativa
                         </p>
                      </div>

                      {/* KPI: Demanda Activa */}
                      <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                         <p className="text-[10px] font-bold text-red-600 uppercase mb-1">Demanda Activa</p>
                         <p className="text-2xl font-black text-red-800">{stats.demandaActiva.toLocaleString()}</p>
                         <p className="text-[9px] text-red-400 font-bold uppercase mt-1 flex items-center gap-1">
                            <Info size={10} /> Tickets sin atención
                         </p>
                      </div>
                   </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-4 flex items-center gap-2">
                    <Filter size={14} /> Modo de Visualización (Bacheo)
                  </h3>
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setFilters(f => ({ ...f, renderMode: 'tramos' }))}
                      className={`flex-1 p-3 rounded-lg border text-xs font-bold transition-all ${
                        filters.renderMode === 'tramos'
                          ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-600/20'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block text-[10px] opacity-70 mb-0.5">VISTA</span>
                      TRAMOS
                    </button>
                    <button
                      onClick={() => setFilters(f => ({ ...f, renderMode: 'clusters' }))}
                      className={`flex-1 p-3 rounded-lg border text-xs font-bold transition-all ${
                        filters.renderMode === 'clusters'
                          ? 'bg-green-600 border-green-600 text-white shadow-lg shadow-green-600/20'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <span className="block text-[10px] opacity-70 mb-0.5">VISTA</span>
                      PUNTOS
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Capas Territoriales Generales */}
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-3 flex items-center gap-2">
                <Filter size={14} /> Capas Territoriales
              </h3>
              <div className="space-y-2">
                {filtrosModulos.moduloActivo === 'bacheo' && (
                  <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={filters.showPlaneado} 
                      onChange={(e) => setFilters(f => ({ ...f, showPlaneado: e.target.checked }))}
                      className="w-4 h-4 accent-red-600" 
                    />
                    <span className="text-xs font-bold text-slate-700">Demanda Dinámica (Tickets Rojos)</span>
                  </label>
                )}
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={filters.showGeoJSON} 
                    onChange={(e) => setFilters(f => ({ ...f, showGeoJSON: e.target.checked }))}
                    className="w-4 h-4 accent-toluca-gold" 
                  />
                  <span className="text-xs font-bold text-slate-700">Límites Delegacionales (48 Zonas)</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-auto p-6 bg-slate-100/50">
             <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                <History className="w-6 h-6 text-toluca-burgundy mx-auto mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Conexión a Base de Datos</p>
                <p className="text-xs font-black text-slate-800 flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  En Tiempo Real
                </p>
             </div>
          </div>
        </aside>

        {/* Mapa Container */}
        <main className="flex-1 relative">
          <MapContainer center={[19.2827, -99.6557]} zoom={13} className="h-full w-full" zoomControl={false}>
            <TileLayer
              url={`https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${CARTO_KEY}`}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              subdomains="abcd"
              maxZoom={20}
            />
            
            {filters.showGeoJSON && geoData && (
              <GeoJSON 
                data={geoData} 
                style={{
                  color: '#d4af37',
                  weight: 2.5,
                  fillColor: '#7a1531',
                  fillOpacity: 0.03,
                  dashArray: '6 3'
                }}
                onEachFeature={(feature, layer) => {
                  const name = feature.properties.NOMDEL || 'Zona Toluca';
                  const utbCount = feature.properties.UTB_COUNT || '';
                  layer.bindTooltip(`
                    <div style="padding: 6px 10px; font-family: sans-serif;">
                      <b style="color: #7a1531; font-size: 14px; letter-spacing: -0.5px;">${name}</b><br/>
                      <span style="color: #999; font-size: 9px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Delegación · ${utbCount} colonias</span>
                    </div>
                  `, { 
                    sticky: true,
                    className: 'premium-tooltip',
                    opacity: 0.95
                  });

                  layer.on({
                    mouseover: (e) => {
                      const l = e.target;
                      l.setStyle({
                        fillOpacity: 0.15,
                        weight: 4,
                        dashArray: ''
                      });
                    },
                    mouseout: (e) => {
                      const l = e.target;
                      l.setStyle({
                        fillOpacity: 0.03,
                        weight: 2.5,
                        dashArray: '6 3'
                      });
                    }
                  });
                }}
              />
            )}
            
            {/* Tramos Verdes de Bacheo — solo visible en modo tramos y con módulo bacheo activo */}
            {filtrosModulos.showBacheo && filters.renderMode === 'tramos' && (
              <GeoJSON
                key={`tramos-geojson-${tramos.length}`}
                data={tramosGeoJSON as any}
                style={{
                  color: '#16a34a',
                  weight: 4,
                  opacity: 0.6
                }}
              />
            )}

            {/* Clusters Verdes (DGOP Bacheo) — solo visible en modo clusters con módulo bacheo activo */}
            {filtrosModulos.showBacheo && filters.renderMode === 'clusters' && (
              <MarkerClusterGroup
                key="cluster-ejecutado-op"
                clusterColor="#16a34a"
                iconType="hammer"
                data={throttledClusterData.filter(p => p.status === 'EJECUTADO' && !(p.stage && p.stage >= 100))}
              />
            )}

            {/* Clusters Azules (DGSP Bacheo) — solo visible en modo clusters con módulo bacheo activo */}
            {filtrosModulos.showBacheo && filters.renderMode === 'clusters' && (
              <MarkerClusterGroup
                key="cluster-ejecutado-sp"
                clusterColor="#2563eb"
                iconType="hammer"
                data={throttledClusterData.filter(p => p.status === 'EJECUTADO' && Boolean(p.stage && p.stage >= 100))}
              />
            )}

            {/* Marker Cluster for Dynamic Tickets (Red/Burgundy) */}
            {filtrosModulos.showBacheo && (
              <MarkerClusterGroup
                key="cluster-tickets"
                clusterColor="#7a1531"
                iconType="ticket"
                data={throttledClusterData.filter(p => {
                  if (p.status === 'TICKET_TOTAL') return filters.showPlaneado;
                  return false;
                })}
              />
            )}

            {/* Capa Unificada de Obras por Módulo (Pavimentación, Slurry, Senderos, Arcotechos, Pozos, Señalamiento, Equipamiento) */}
            <ObrasLayers
              tramos={filteredObrasTramos}
              puntuales={filteredObrasPuntuales}
              currentDate={currentDate}
              showPavimentacion={filtrosModulos.showPavimentacion}
              showSlurry={filtrosModulos.showSlurry}
              showSenderos={filtrosModulos.showSenderos}
              showArcotechos={filtrosModulos.showArcotechos}
              showPozos={filtrosModulos.showPozos}
              showSenalamiento={filtrosModulos.showSenalamiento}
              showEquipamiento={filtrosModulos.showEquipamiento}
              pavAsfaltica={filtrosModulos.pavAsfaltica}
              pavHidraulico={filtrosModulos.pavHidraulico}
              pavEcologico={filtrosModulos.pavEcologico}
              showConcluidas={filtrosModulos.showConcluidas}
              showEnProceso={filtrosModulos.showEnProceso}
              showProgramadas={filtrosModulos.showProgramadas}
              onSelectObra={(obra) => setSelectedObra(obra)}
            />
            <CoordinateSearch data={data} geoData={geoData} setFilters={setFilters} />
            <MapLegend 
              filtros={filtrosModulos} 
              onToggleModulo={(id) => setFiltrosModulos(prev => toggleModuloFilter(id, prev))} 
            />
          </MapContainer>

          {/* Timeline Overlay */}
          <div className="absolute bottom-8 left-8 right-8 z-[1000] pointer-events-none">
            <div className="premium-glass p-5 rounded-3xl shadow-2xl border border-white/50 max-w-5xl mx-auto flex items-center gap-5 pointer-events-auto backdrop-blur-md">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-13 h-13 bg-toluca-burgundy text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-toluca-burgundy/30 shrink-0"
              >
                {isPlaying ? <Pause fill="currentColor" size={20} /> : <Play className="ml-1" fill="currentColor" size={20} />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-2 items-end">
                   <div>
                     <p className="text-[10px] font-black text-toluca-burgundy/70 tracking-[0.2em] uppercase">Visualización Temporal</p>
                     <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                       <Calendar size={17} className="text-toluca-burgundy" /> 
                       {currentDate.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}
                     </h2>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Total Auditado</p>
                      <p className="text-sm font-black text-slate-700">{stats.baches.toLocaleString()} Baches</p>
                   </div>
                </div>
                <input 
                  type="range" 
                  min={sliderBounds.min} 
                  max={sliderBounds.max}
                  value={Math.min(Math.max(currentDate.getTime(), sliderBounds.min), sliderBounds.max)}
                  onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value)))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-toluca-burgundy"
                />
              </div>

              {/* Divisor vertical */}
              <div className="w-[1px] h-11 bg-slate-200 shrink-0 hidden sm:block" />

              {/* Selector de Periodo / Años (3 pequeños + 1 largo GENERAL) */}
              <div className="flex flex-col gap-1.5 shrink-0 w-36">
                <div className="grid grid-cols-3 gap-1">
                  <button 
                    onClick={() => handleSelectYear('2025')}
                    className={`py-1.5 px-1 rounded-lg text-[10px] font-black transition-all text-center ${
                      selectedYear === '2025' 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm ring-2 ring-blue-400/40' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    2025
                  </button>
                  <button 
                    onClick={() => handleSelectYear('2026')}
                    className={`py-1.5 px-1 rounded-lg text-[10px] font-black transition-all text-center ${
                      selectedYear === '2026' 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/40' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    2026
                  </button>
                  <button 
                    onClick={() => handleSelectYear('2027')}
                    className={`py-1.5 px-1 rounded-lg text-[10px] font-black transition-all text-center ${
                      selectedYear === '2027' 
                        ? 'bg-amber-600 border-amber-600 text-white shadow-sm ring-2 ring-amber-400/40' 
                        : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    2027
                  </button>
                </div>
                <button 
                  onClick={() => handleSelectYear('todos')}
                  className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-black tracking-wider transition-all uppercase text-center ${
                    selectedYear === 'todos' 
                      ? 'bg-toluca-burgundy border-toluca-burgundy text-white shadow-sm ring-2 ring-toluca-burgundy/30' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  GENERAL
                </button>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* Modal Interactivo de Detalle y Evidencias de Obra */}
      <ObraDetailModal
        obra={selectedObra}
        onClose={() => setSelectedObra(null)}
      />

      {loading && (
        <div className="fixed inset-0 bg-toluca-burgundy/90 z-[9999] flex flex-col items-center justify-center text-white backdrop-blur-sm">
           <div className="w-16 h-16 border-4 border-toluca-gold border-t-transparent rounded-full animate-spin mb-6" />
           <h2 className="text-2xl font-black tracking-widest uppercase">Toluca Capital</h2>
           <p className="text-sm font-medium tracking-widest opacity-60 mt-2 uppercase">Cargando Estrategia de Obras Públicas...</p>
        </div>
      )}
    </div>
  );
}
