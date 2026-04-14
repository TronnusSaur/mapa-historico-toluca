import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { parseCSV, groupIntoTramos } from './utils/dataProcessors.ts';
import type { PotholeData, Tramo } from './utils/dataProcessors.ts';
import { 
  BarChart3, 
  History, 
  Play, 
  Pause, 
  Filter, 
  Landmark, 
  Calendar,
  ChevronRight,
  Info
} from 'lucide-react';

// Marker Cluster component (manual instantiation for better control with 50k points)
import MarkerClusterGroup from './components/MarkerClusterGroup.tsx';

export default function App() {
  const [data, setData] = useState<PotholeData[]>([]);
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date('2025-01-01'));
  const [isPlaying, setIsPlaying] = useState(false);
  const [filters, setFilters] = useState({
    showHistorico: true,
    showTramos: true,
    showGeoJSON: true,
    showPlaneado: true
  });
  // Statistics are now calculated dynamically in a useMemo below based on currentDate
  // Tramos are computed once on load — NOT on every timeline change
  const [allTramos, setAllTramos] = useState<Tramo[]>([]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const baseUrl = import.meta.env.BASE_URL;
        const [e1, e2, e3, totalTickets] = await Promise.all([
          parseCSV(`${baseUrl}data/1 - ETAPA 1 MASTER.csv`, 'EJECUTADO', 1),
          parseCSV(`${baseUrl}data/2 - ETAPA 2 MASTER.csv`, 'EJECUTADO', 2),
          parseCSV(`${baseUrl}data/3 - ETAPA 3 MASTER.csv`, 'EJECUTADO', 3),
          parseCSV(`${baseUrl}data/6 - TICKETS TOTALES.csv`, 'TICKET_TOTAL'),
        ]);

        // Load territorial boundaries
        try {
          const geoResp = await fetch(`${baseUrl}data/UTB_REAL.geojson`);
          const geoJson = await geoResp.json();
          setGeoData(geoJson);
        } catch (geoErr) {
          console.error("Error loading GeoJSON boundaries:", geoErr);
        }

        const combined = [...e1, ...e2, ...e3, ...totalTickets];
        setData(combined);

        // Compute tramos once — heavy spatial algorithm, not re-run on timeline changes
        // Run after a short yield so the loading spinner renders first
        setTimeout(() => {
          const ejecutados = [...e1, ...e2, ...e3];
          const computed = groupIntoTramos(ejecutados, 80, 2);
          setAllTramos(computed);
          setLoading(false);
        }, 50);
        
        // Metrics are now handled by useMemo below
      } catch (err) {
        console.error("Error loading CSV data:", err);
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  // Statistics: dynamic calculation based on timeline
  const stats = useMemo(() => {
    // 1. Current Work Progress (E1+E2+E3) up to today
    const doneUpToDate = data.filter(p => p.status === 'EJECUTADO' && p.date <= currentDate);
    
    // 2. Stage-Specific metrics
    const e1Done = doneUpToDate.filter(p => p.stage === 1);
    const e2Done = doneUpToDate.filter(p => p.stage === 2);
    const e3Done = doneUpToDate.filter(p => p.stage === 3);

    // 3. Tickets Logic
    const ticketsTotal = data.filter(p => p.status === 'TICKET_TOTAL');
    
    // Active (Pending) tickets at current date
    const activeTicketsAtDate = ticketsTotal.filter(p => {
      const wasReported = (p.reportDate || p.date) <= currentDate;
      const isStillPending = !p.resolvedDate || p.resolvedDate > currentDate;
      return wasReported && isStillPending;
    });

    // Attended tickets at current date (Reported <= currentDate AND Status != Pendiente)
    // Note: If resolved, we count it as attended if resolvedDate <= currentDate
    const attendedTicketsAtDate = ticketsTotal.filter(p => {
       const wasReported = (p.reportDate || p.date) <= currentDate;
       const wasAttended = p.resolvedDate && p.resolvedDate <= currentDate;
       // The user defined "Atendido" as "No diga Pendiente"
       // In our logic, a ticket is attended when its resolvedDate has passed.
       return wasReported && wasAttended;
    });

    return {
      total: data.length,
      m2: doneUpToDate.reduce((acc, curr) => acc + (curr.m2 || 0), 0),
      baches: doneUpToDate.length,
      demandaActiva: activeTicketsAtDate.length,
      ticketsAtendidos: attendedTicketsAtDate.length,
      // Stage 1
      e1Baches: e1Done.length,
      e1M2: e1Done.reduce((acc, curr) => acc + (curr.m2 || 0), 0),
      // Stage 2
      e2Baches: e2Done.length,
      e2M2: e2Done.reduce((acc, curr) => acc + (curr.m2 || 0), 0),
      // Stage 3
      e3Baches: e3Done.length,
      e3M2: e3Done.reduce((acc, curr) => acc + (curr.m2 || 0), 0)
    };
  }, [data, currentDate]);

  // Filter data by timeline - Modern Lifecycle Logic
  const visibleData = useMemo(() => {
    return data.filter(p => {
       // Executed points (master) are handled by tramos mostly, 
       // but here we filter what goes into the cluster if needed.
       if (p.status === 'EJECUTADO') return p.date <= currentDate;
       
       // Dynamic Tickets Lifecycle:
       // Visible if reported <= current AND (not resolved yet OR resolved > current)
       if (p.status === 'TICKET_TOTAL') {
         const wasReported = (p.reportDate || p.date) <= currentDate;
         const isNotYetResolved = !p.resolvedDate || p.resolvedDate > currentDate;
         return wasReported && isNotYetResolved;
       }

       return p.date <= currentDate;
    });
  }, [data, currentDate]);

  // Tramos: filter the pre-computed chains by currentDate (cheap O(n) filter,
  // no spatial recomputation on every slider move)
  const tramos = useMemo(() => {
    return allTramos.filter(t => t.date <= currentDate);
  }, [allTramos, currentDate]);

  // Animation Loop
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentDate(prev => {
          const now = new Date();
          const next = new Date(prev);
          next.setDate(next.getDate() + 7); // Move 1 week at a time

          if (next >= now) {
            setIsPlaying(false);
            return now; // Lock to exactly now
          }
          return next;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

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
              <h2 className="text-xl font-black tracking-tight leading-none">Torre de Control de Bacheo</h2>
              <p className="text-[9px] font-bold tracking-[0.2em] opacity-40 uppercase mt-1">ESTRATEGIA INTEGRAL DE REHABILITACIÓN</p>
            </div>
          </div>

          <div className="flex gap-12">
            <div className="text-center">
              <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Impacto Global</p>
              <p className="text-2xl font-black text-white">{stats.baches.toLocaleString()} <span className="text-sm font-normal opacity-50">Baches</span></p>
            </div>
            <div className="w-[1px] h-10 bg-white/10 mt-1" />
            <div className="text-center">
              <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase mb-1">Superficie Total</p>
              <p className="text-2xl font-black text-toluca-gold">{stats.m2.toLocaleString()} <span className="text-sm font-normal opacity-50">m²</span></p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[11px] font-bold tracking-wider">SISTEMA ACTIVO</span>
             </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Táctico */}
        <aside className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col z-40 shadow-inner overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6 flex-1">
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
                 <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-4 mt-4 flex items-center gap-2">
                    <Target size={14} /> Resumen de Operación
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

                    {/* KPI: Tickets Atendidos (NUEVO) */}
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
            </div>

            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-4 flex items-center gap-2">
                <Filter size={14} /> Filtros de Capa
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={filters.showTramos} 
                    onChange={(e) => setFilters(f => ({ ...f, showTramos: e.target.checked }))}
                    className="w-4 h-4 accent-green-600" 
                  />
                  <span className="text-sm font-bold text-slate-700">Tramos Ejecutados</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={filters.showPlaneado} 
                    onChange={(e) => setFilters(f => ({ ...f, showPlaneado: e.target.checked }))}
                    className="w-4 h-4 accent-red-600" 
                  />
                  <span className="text-sm font-bold text-slate-700">Demanda Dinámica (Roja)</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={filters.showGeoJSON} 
                    onChange={(e) => setFilters(f => ({ ...f, showGeoJSON: e.target.checked }))}
                    className="w-4 h-4 accent-toluca-gold" 
                  />
                  <span className="text-sm font-bold text-slate-700">Límites UTB</span>
                </label>
              </div>
            </div>

          <div className="mt-auto p-6 bg-slate-100/50">
             <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                <History className="w-6 h-6 text-toluca-burgundy mx-auto mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Última actualización</p>
                <p className="text-xs font-black text-slate-800">13 de Abril, 2026</p>
             </div>
          </div>
        </aside>

        {/* Mapa Container */}
        <main className="flex-1 relative">
          <MapContainer center={[19.2827, -99.6557]} zoom={13} className="h-full w-full" zoomControl={false}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            
            {filters.showGeoJSON && geoData && (
              <GeoJSON 
                data={geoData} 
                style={{
                  color: '#d4af37',
                  weight: 1.5,
                  fillColor: '#7a1531',
                  fillOpacity: 0.05
                }}
                onEachFeature={(feature, layer) => {
                  const name = feature.properties.name || feature.properties.NOMUT || feature.properties.NOMDEL || 'Zona Toluca';
                  layer.bindTooltip(`
                    <div style="padding: 4px 8px; font-family: sans-serif;">
                      <b style="color: #7a1531; font-size: 14px;">${name}</b><br/>
                      <span style="color: #666; font-size: 10px; font-weight: bold; text-transform: uppercase;">Territorio Toluca Capital</span>
                    </div>
                  `, { 
                    sticky: true,
                    className: 'premium-tooltip',
                    opacity: 0.9
                  });

                  layer.on({
                    mouseover: (e) => {
                      const l = e.target;
                      l.setStyle({
                        fillOpacity: 0.2,
                        weight: 3
                      });
                    },
                    mouseout: (e) => {
                      const l = e.target;
                      l.setStyle({
                        fillOpacity: 0.05,
                        weight: 1.5
                      });
                    }
                  });
                }}
              />
            )}
            
            {/* Tramos Verdes — filtered by currentDate via the useMemo above */}
            {filters.showTramos && tramos.map((t, i) => (
              <Polyline key={`tramo-${i}`} positions={t.coords} color="#16a34a" weight={4} opacity={0.6} />
            ))}

            {/* Marker Cluster for points - Dynamic Tickets (Red) */}
            <MarkerClusterGroup data={visibleData.filter(p => {
              if (p.status === 'TICKET_TOTAL') return filters.showPlaneado;
              return false; // Executed are shown as Tramos, and old hist/novos are gone
            })} />
          </MapContainer>

          {/* Timeline Overlay */}
          <div className="absolute bottom-10 left-10 right-10 z-[1000]">
            <div className="premium-glass p-6 rounded-3xl shadow-2xl border border-white/40 max-w-4xl mx-auto flex items-center gap-6">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-14 h-14 bg-toluca-burgundy text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-toluca-burgundy/30"
              >
                {isPlaying ? <Pause fill="currentColor" /> : <Play className="ml-1" fill="currentColor" />}
              </button>

              <div className="flex-1">
                <div className="flex justify-between mb-3 items-end">
                   <div>
                     <p className="text-[10px] font-black text-toluca-burgundy/60 tracking-[0.2em] uppercase">Visualización Temporal</p>
                     <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                       <Calendar size={18} className="text-toluca-burgundy" /> 
                       {currentDate.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase()}
                     </h2>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Progreso</p>
                      <p className="text-sm font-black text-slate-600">{visibleData.length.toLocaleString()} Puntos</p>
                   </div>
                </div>
                <input 
                  type="range" 
                  min={new Date('2025-01-01').getTime()} 
                  max={new Date().getTime()}
                  value={currentDate.getTime()}
                  onChange={(e) => setCurrentDate(new Date(parseInt(e.target.value)))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-toluca-burgundy"
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-toluca-burgundy/90 z-[9999] flex flex-col items-center justify-center text-white backdrop-blur-sm">
           <div className="w-16 h-16 border-4 border-toluca-gold border-t-transparent rounded-full animate-spin mb-6" />
           <h2 className="text-2xl font-black tracking-widest uppercase">Cargando Estrategia</h2>
           <p className="text-sm font-medium tracking-widest opacity-60 mt-2 uppercase">Procesando +50,000 registros históricos</p>
        </div>
      )}
    </div>
  );
}
