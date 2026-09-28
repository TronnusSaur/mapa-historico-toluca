import React from 'react';
import { 
  Flame, 
  X, 
  ChevronRight, 
  Activity, 
  Megaphone, 
  FileText 
} from 'lucide-react';
import type { HotspotCluster, HotspotFilterOptions } from '../types/hotspots.ts';

interface HotspotsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  hotspots: HotspotCluster[];
  totalPointsCount: number;
  showHeatmap: boolean;
  onToggleHeatmap: (val: boolean) => void;
  showHotspots: boolean;
  onToggleHotspots: (val: boolean) => void;
  filterOptions: HotspotFilterOptions;
  onChangeFilterOptions: (options: HotspotFilterOptions) => void;
  selectedHotspotId: string | null;
  onSelectHotspot: (hotspot: HotspotCluster) => void;
}

export const HotspotsPanel: React.FC<HotspotsPanelProps> = ({
  isOpen,
  onClose,
  hotspots,
  totalPointsCount,
  showHeatmap,
  onToggleHeatmap,
  showHotspots,
  onToggleHotspots,
  filterOptions,
  onChangeFilterOptions,
  selectedHotspotId,
  onSelectHotspot
}) => {
  if (!isOpen) return null;

  const topHotspot = hotspots[0];
  const totalClusteredReports = hotspots.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="absolute top-20 right-6 z-[1100] w-96 max-w-[calc(100vw-3rem)] max-h-[calc(100vh-6.5rem)] flex flex-col bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-toluca-burgundy via-red-900 to-toluca-burgundy p-4 text-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-tight leading-tight">
              Concentración de Demanda
            </h2>
            <p className="text-[9px] font-bold text-amber-200/80 uppercase tracking-widest mt-0.5">
              Epicentros y Focos Críticos
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          title="Cerrar panel"
        >
          <X size={15} />
        </button>
      </div>

      {/* Controles de Capas y Análisis */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
        {/* Interruptores rápidos */}
        <div className="grid grid-cols-2 gap-2">
          {/* Toggle Mapa de Calor */}
          <button
            onClick={() => onToggleHeatmap(!showHeatmap)}
            className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
              showHeatmap
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-900'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${showHeatmap ? 'bg-amber-500 animate-ping' : 'bg-slate-300'}`} />
              <span className="text-[11px] font-black">Mapa de Calor</span>
            </div>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${showHeatmap ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {showHeatmap ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Toggle Focos Radiales */}
          <button
            onClick={() => onToggleHotspots(!showHotspots)}
            className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
              showHotspots
                ? 'bg-red-500/10 border-red-500/30 text-red-900'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${showHotspots ? 'bg-red-500' : 'bg-slate-300'}`} />
              <span className="text-[11px] font-black">Focos Rojos</span>
            </div>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${showHotspots ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {showHotspots ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        {/* Radio de Proximidad */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Radio de Proximidad
            </span>
            <span className="text-[10px] font-bold text-toluca-burgundy">
              {filterOptions.radiusMeters} metros
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[200, 300, 500].map((r) => (
              <button
                key={r}
                onClick={() => onChangeFilterOptions({ ...filterOptions, radiusMeters: r })}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-black tracking-tight transition-all text-center ${
                  filterOptions.radiusMeters === r
                    ? 'bg-toluca-burgundy text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {r === 200 ? '200m (Calle)' : r === 300 ? '300m (Óptimo)' : '500m (Sector)'}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro por Fuente */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Canal de Demanda
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => onChangeFilterOptions({ ...filterOptions, sourceFilter: 'todos' })}
              className={`py-1.5 px-1.5 rounded-lg text-[10px] font-bold transition-all text-center truncate ${
                filterOptions.sourceFilter === 'todos'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Todos ({totalPointsCount})
            </button>
            <button
              onClick={() => onChangeFilterOptions({ ...filterOptions, sourceFilter: 'demanda' })}
              className={`py-1.5 px-1.5 rounded-lg text-[10px] font-bold transition-all text-center truncate ${
                filterOptions.sourceFilter === 'demanda'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-amber-50'
              }`}
            >
              Demanda Gral.
            </button>
            <button
              onClick={() => onChangeFilterOptions({ ...filterOptions, sourceFilter: 'peticiones' })}
              className={`py-1.5 px-1.5 rounded-lg text-[10px] font-bold transition-all text-center truncate ${
                filterOptions.sourceFilter === 'peticiones'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-indigo-50'
              }`}
            >
              Peticiones DGOP
            </button>
          </div>
        </div>
      </div>

      {/* Resumen Métricas Rápidas */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 bg-white border-b border-slate-200 p-2 text-center">
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase">Epicentros</p>
          <p className="text-base font-black text-toluca-burgundy">{hotspots.length}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase">Concentrados</p>
          <p className="text-base font-black text-amber-600">{totalClusteredReports}</p>
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase">Máx. Zona</p>
          <p className="text-base font-black text-red-600">{topHotspot ? `${topHotspot.count} pts` : '0'}</p>
        </div>
      </div>

      {/* Lista de Hotspots */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[380px] custom-scrollbar">
        {hotspots.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-40 animate-spin" />
            <p className="text-xs font-semibold">No se detectaron concentraciones con estos filtros.</p>
            <p className="text-[10px] opacity-75 mt-1">Prueba ampliando el radio a 500m.</p>
          </div>
        ) : (
          hotspots.map((cluster) => {
            const isSelected = selectedHotspotId === cluster.id;
            const isCritical = cluster.severity === 'critica';
            const isAlta = cluster.severity === 'alta';

            return (
              <div
                key={cluster.id}
                onClick={() => onSelectHotspot(cluster)}
                className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-red-50/80 border-red-500 shadow-md ring-2 ring-red-400/30'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {/* Ranking y Contador */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isCritical
                          ? 'bg-red-100 text-red-700'
                          : isAlta
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      #{cluster.rank}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {cluster.topDelegacion}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-lg flex items-center gap-1 ${
                      isCritical
                        ? 'bg-red-600 text-white'
                        : isAlta
                        ? 'bg-orange-500 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    <Flame size={11} /> {cluster.count} reportes
                  </span>
                </div>

                {/* Calle Principal */}
                <h4 className="text-xs font-black text-slate-800 line-clamp-1 group-hover:text-toluca-burgundy transition-colors">
                  {cluster.topCalle}
                </h4>

                {/* Desglose de Canales Mini */}
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[9.5px]">
                  {cluster.fuenteCounts.demandaGeneral > 0 && (
                    <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                      <Megaphone size={9} /> {cluster.fuenteCounts.demandaGeneral} Demanda Gral.
                    </span>
                  )}
                  {cluster.fuenteCounts.peticionesDGOP > 0 && (
                    <span className="inline-flex items-center gap-1 text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                      <FileText size={9} /> {cluster.fuenteCounts.peticionesDGOP} Peticiones DGOP
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-0.5 text-toluca-burgundy font-black text-[10px] group-hover:translate-x-0.5 transition-transform">
                    <span>Ver</span>
                    <ChevronRight size={12} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
          Algoritmo Espacial Basado en Densidad Haversine
        </p>
      </div>
    </div>
  );
};
