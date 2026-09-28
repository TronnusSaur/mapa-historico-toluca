import React, { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import type { ModuloObraId, FiltrosModulos } from '../types/obras.ts';
import { 
  Hammer, 
  Construction, 
  Flame, 
  Footprints, 
  Building2, 
  Droplet, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Layers,
  Megaphone,
  FileText
} from 'lucide-react';

interface MapLegendProps {
  filtros: FiltrosModulos;
  onToggleModulo?: (id: ModuloObraId) => void;
  showDemandaCiudadana?: boolean;
  onToggleDemandaCiudadana?: () => void;
  demandaCount?: number;
  showPeticionesCiudadanas?: boolean;
  onTogglePeticionesCiudadanas?: () => void;
  peticionesCount?: number;
}

interface SimbologiaItem {
  id: ModuloObraId;
  label: string;
  sublabel: string;
  color: string;
  icon: React.ReactNode;
  tipoGeometria: 'Tramo vial' | 'Punto específico' | 'Baches masivos' | 'Mixto (Trazados y Puntos)';
  isActive: boolean;
}

export const MapLegend: React.FC<MapLegendProps> = ({ 
  filtros, 
  onToggleModulo,
  showDemandaCiudadana = true,
  onToggleDemandaCiudadana,
  demandaCount = 288,
  showPeticionesCiudadanas = true,
  onTogglePeticionesCiudadanas,
  peticionesCount = 601
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  // Evitar que el zoom de Leaflet se active cuando se hace scroll dentro de la simbología
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    L.DomEvent.disableScrollPropagation(el);
    L.DomEvent.disableClickPropagation(el);

    const stopWheel = (e: WheelEvent) => {
      e.stopPropagation();
    };

    el.addEventListener('wheel', stopWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', stopWheel);
    };
  }, [isExpanded]);

  const items: SimbologiaItem[] = [
    {
      id: 'bacheo',
      label: 'Bacheo (DGOP / DGSP)',
      sublabel: 'Verde: DGOP · Azul: DGSP',
      color: 'bg-emerald-600',
      icon: <Hammer size={12} className="text-white" />,
      tipoGeometria: 'Baches masivos',
      isActive: filtros.showBacheo,
    },
    {
      id: 'pavimentacion',
      label: 'Pavimentaciones',
      sublabel: 'Asfáltica, hidráulico y ecológico',
      color: 'bg-blue-600',
      icon: <Construction size={12} className="text-white" />,
      tipoGeometria: 'Tramo vial',
      isActive: filtros.showPavimentacion,
    },
    {
      id: 'slurry',
      label: 'Mantenimiento Slurry',
      sublabel: 'Sello asfáltico preventivo',
      color: 'bg-amber-600',
      icon: <Flame size={12} className="text-white" />,
      tipoGeometria: 'Tramo vial',
      isActive: filtros.showSlurry,
    },
    {
      id: 'dragon',
      label: 'Diablo Dragón',
      sublabel: 'Reciclado y repavimentación en frío/caliente con máquina Dragón',
      color: 'bg-red-600',
      icon: <Flame size={12} className="text-white" />,
      tipoGeometria: 'Tramo vial',
      isActive: filtros.showDragon,
    },
    {
      id: 'senderos',
      label: 'Senderos Seguros',
      sublabel: 'Caminos peatonales iluminados',
      color: 'bg-purple-600',
      icon: <Footprints size={12} className="text-white" />,
      tipoGeometria: 'Tramo vial',
      isActive: filtros.showSenderos,
    },
    {
      id: 'arcotechos',
      label: 'Arcotechos Escolares',
      sublabel: 'Techados en planteles educativos',
      color: 'bg-[#78350f]',
      icon: <Building2 size={12} className="text-white" />,
      tipoGeometria: 'Punto específico',
      isActive: filtros.showArcotechos,
    },
    {
      id: 'pozos',
      label: 'Pozos y Drenajes',
      sublabel: 'Pozos de agua, colectores y redes sanitarias (OAyST)',
      color: 'bg-cyan-600',
      icon: <Droplet size={12} className="text-white" />,
      tipoGeometria: 'Mixto (Trazados y Puntos)',
      isActive: filtros.showPozos,
    },
    {
      id: 'senalamiento',
      label: 'Señalamiento Vial',
      sublabel: 'Pintura, balizamiento y señalética',
      color: 'bg-yellow-500',
      icon: <AlertTriangle size={12} className="text-slate-950" />,
      tipoGeometria: 'Punto específico',
      isActive: filtros.showSenalamiento,
    },
  ];

  return (
    <div className="absolute top-[72px] right-4 z-[990] pointer-events-none flex flex-col items-end select-none">
      {/* Boton Colapsado o Tarjeta Expandida */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="pointer-events-auto bg-white/90 hover:bg-white backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-200/90 flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-toluca-burgundy transition-all hover:scale-105 group"
          title="Mostrar Simbología de Obras"
        >
          <div className="w-5 h-5 rounded-full bg-toluca-burgundy text-white flex items-center justify-center text-[10px]">
            <Layers size={11} />
          </div>
          <span>Simbología</span>
          <ChevronDown size={14} className="text-slate-400 group-hover:text-toluca-burgundy transition-colors" />
        </button>
      ) : (
        <div 
          ref={cardRef}
          onWheel={(e) => e.stopPropagation()}
          className="pointer-events-auto w-[290px] sm:w-[310px] bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Header de la Simbologia */}
          <div className="bg-gradient-to-r from-toluca-burgundy to-[#8b1c3b] px-3.5 py-2.5 flex items-center justify-between text-white shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center text-toluca-gold">
                <Layers size={13} />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-tight leading-tight uppercase flex items-center gap-1.5">
                  Simbología de Obras
                </h4>
                <p className="text-[9px] text-white/70 font-semibold tracking-wider uppercase">
                  Toluca Capital 2025-2027
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors"
              title="Minimizar simbología"
            >
              <ChevronUp size={15} />
            </button>
          </div>

          {/* Lista de Iconos y Obras */}
          <div 
            onWheel={(e) => e.stopPropagation()}
            className="p-2.5 space-y-1 max-h-[340px] overflow-y-auto custom-scrollbar"
          >
            <div className="text-[9px] font-bold tracking-widest text-slate-400 uppercase px-1.5 pb-1 flex items-center justify-between">
              <span>Tipo de Intervención</span>
              <span className="text-[8px] text-slate-400">Click para filtrar</span>
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => onToggleModulo && onToggleModulo(item.id)}
                className={`group flex items-center justify-between p-1.5 rounded-xl transition-all cursor-pointer border ${
                  item.isActive
                    ? 'bg-slate-50/80 hover:bg-slate-100/90 border-slate-200/80'
                    : 'bg-slate-50/30 hover:bg-slate-100/50 border-transparent opacity-40 hover:opacity-75'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Badge circular con borde blanco identico al del mapa */}
                  <div className={`relative shrink-0 w-6 h-6 rounded-full ${item.color} flex items-center justify-center shadow-sm border-2 border-white ring-1 ring-slate-200/50 transition-transform group-hover:scale-110`}>
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <span className="text-[11px] font-bold text-slate-800 truncate leading-tight group-hover:text-toluca-burgundy transition-colors">
                      {item.label}
                    </span>
                    <span className="text-[9px] text-slate-400 truncate leading-tight">
                      {item.tipoGeometria}
                    </span>
                  </div>
                </div>

                {/* Indicador de activo */}
                <div className="shrink-0 flex items-center gap-1 pl-1.5">
                  {item.isActive ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" title="Capa visible" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-300" title="Capa oculta" />
                  )}
                </div>
              </div>
            ))}

            {/* Capa de Demanda Ciudadana */}
            <div className="pt-2 mt-1 border-t border-slate-100 px-1">
              <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase block mb-1">
                Participación y Demanda
              </span>
              <div 
                onClick={onToggleDemandaCiudadana}
                className={`group flex items-center justify-between p-1.5 rounded-xl transition-all cursor-pointer border ${
                  showDemandaCiudadana
                    ? 'bg-amber-50/70 hover:bg-amber-100/80 border-amber-200/80'
                    : 'bg-slate-50/30 hover:bg-slate-100/50 border-transparent opacity-40 hover:opacity-75'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0 w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center shadow-sm border-2 border-white ring-1 ring-amber-200/50 transition-transform group-hover:scale-110">
                    <Megaphone size={11} className="text-white" />
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <span className="text-[11px] font-bold text-slate-800 truncate leading-tight group-hover:text-amber-800 transition-colors">
                      Demanda Ciudadana
                    </span>
                    <span className="text-[9px] text-amber-700 font-semibold truncate leading-tight">
                      {demandaCount} reportes
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1 pl-1.5">
                  {showDemandaCiudadana ? (
                    <span className="w-2 h-2 rounded-full bg-amber-500 shadow-sm" title="Capa visible" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-300" title="Capa oculta" />
                  )}
                </div>
              </div>

              {/* Peticiones Ciudadanas (Oficios DGOP) */}
              <div 
                onClick={onTogglePeticionesCiudadanas}
                className={`group flex items-center justify-between p-1.5 rounded-xl transition-all cursor-pointer border mt-1 ${
                  showPeticionesCiudadanas
                    ? 'bg-indigo-50/70 hover:bg-indigo-100/80 border-indigo-200/80'
                    : 'bg-slate-50/30 hover:bg-slate-100/50 border-transparent opacity-40 hover:opacity-75'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0 w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-sm border-2 border-white ring-1 ring-indigo-200/50 transition-transform group-hover:scale-110">
                    <FileText size={11} className="text-white" />
                  </div>
                  <div className="min-w-0 flex flex-col">
                    <span className="text-[11px] font-bold text-slate-800 truncate leading-tight group-hover:text-indigo-800 transition-colors">
                      Peticiones Ciudadanas
                    </span>
                    <span className="text-[9px] text-indigo-700 font-semibold truncate leading-tight">
                      {peticionesCount} oficios DGOP
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1 pl-1.5">
                  {showPeticionesCiudadanas ? (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm" title="Capa visible" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-300" title="Capa oculta" />
                  )}
                </div>
              </div>
            </div>

            {/* Convención de Estados y Trazos */}
            <div className="pt-2.5 mt-2 border-t border-slate-100 space-y-1.5 px-1">
              <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase block mb-1">
                Estatus de Ejecución
              </span>
              <div className="grid grid-cols-3 gap-1 text-[9px] font-bold">
                <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50/80 px-2 py-1 rounded-lg border border-[#d4af37]/60" title="Borde dorado en mapa">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#d4af37] shadow-sm shrink-0" />
                  <span className="truncate">Concluida</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50/80 px-2 py-1 rounded-lg border border-amber-200/60">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  <span className="truncate">En Proceso</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100/80 px-2 py-1 rounded-lg border border-slate-200/60">
                  <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                  <span className="truncate">Programada</span>
                </div>
              </div>
              <p className="text-[8.5px] text-slate-500 font-medium tracking-tight pt-1 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-[#d4af37] bg-white inline-block shrink-0 shadow-xs" />
                <span>Pines con <strong className="text-[#b89327] font-extrabold">borde dorado</strong> = Obra concluida</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
