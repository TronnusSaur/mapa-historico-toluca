import React from 'react';
import type { ModuloObraId, FiltrosModulos } from '../types/obras.ts';
import { 
  Hammer, 
  Droplet, 
  Construction, 
  Flame, 
  AlertTriangle, 
  Building2, 
  Layers, 
  CheckCircle2, 
  Clock, 
  CalendarClock,
  Footprints
} from 'lucide-react';

interface ModuleCounts {
  bacheo: number;
  pavimentacion: number;
  slurry: number;
  senderos: number;
  arcotechos: number;
  pozos: number;
  senalamiento: number;
  equipamiento: number;
  pavAsfaltica: number;
  pavHidraulico: number;
  pavEcologico: number;
}

interface ModuleFilterBarProps {
  filtros: FiltrosModulos;
  onFiltrosChange: React.Dispatch<React.SetStateAction<FiltrosModulos>>;
  counts: ModuleCounts;
}

export const ModuleFilterBar: React.FC<ModuleFilterBarProps> = ({
  filtros,
  onFiltrosChange,
  counts
}) => {
  const modulos: { id: ModuloObraId; label: string; icon: React.ReactNode; color: string; count: number }[] = [
    { id: 'todos', label: 'Todos', icon: <Layers size={13} />, color: 'bg-slate-800 text-white', count: counts.bacheo + counts.pavimentacion + counts.slurry + counts.senderos + counts.arcotechos + counts.pozos + counts.senalamiento + counts.equipamiento },
    { id: 'bacheo', label: 'Bacheo', icon: <Hammer size={13} />, color: 'bg-emerald-600 text-white', count: counts.bacheo },
    { id: 'pavimentacion', label: 'Pavimentaciones', icon: <Construction size={13} />, color: 'bg-blue-600 text-white', count: counts.pavimentacion },
    { id: 'slurry', label: 'Slurry', icon: <Flame size={13} />, color: 'bg-amber-600 text-white', count: counts.slurry },
    { id: 'senderos', label: 'Senderos Seguros', icon: <Footprints size={13} />, color: 'bg-purple-600 text-white', count: counts.senderos },
    { id: 'arcotechos', label: 'Arcotechos', icon: <Building2 size={13} />, color: 'bg-[#78350f] text-white', count: counts.arcotechos },
    { id: 'pozos', label: 'Pozos', icon: <Droplet size={13} />, color: 'bg-cyan-600 text-white', count: counts.pozos },
    { id: 'senalamiento', label: 'Señalamiento', icon: <AlertTriangle size={13} />, color: 'bg-yellow-500 text-slate-950', count: counts.senalamiento },
  ];

  const handleSelectModulo = (id: ModuloObraId) => {
    onFiltrosChange(prev => {
      if (id === 'todos') {
        return {
          ...prev,
          moduloActivo: 'todos',
          showBacheo: true,
          showPavimentacion: true,
          showSlurry: true,
          showSenderos: true,
          showArcotechos: true,
          showPozos: true,
          showSenalamiento: true,
          showEquipamiento: true
        };
      }
      return {
        ...prev,
        moduloActivo: id,
        showBacheo: id === 'bacheo',
        showPavimentacion: id === 'pavimentacion',
        showSlurry: id === 'slurry',
        showSenderos: id === 'senderos',
        showArcotechos: id === 'arcotechos',
        showPozos: id === 'pozos',
        showSenalamiento: id === 'senalamiento',
        showEquipamiento: id === 'equipamiento'
      };
    });
  };

  return (
    <div className="space-y-4">
      {/* 1. Selector de Módulo Activo (Chips de navegación) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
            <Layers size={12} /> Módulos de Obra
          </span>
          <button
            onClick={() => handleSelectModulo('todos')}
            className="text-[9px] font-bold text-toluca-burgundy hover:underline uppercase"
          >
            Ver Todo
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {modulos.filter(m => m.id !== 'todos').map((m) => {
            const isActive = filtros.moduloActivo === m.id || (filtros.moduloActivo === 'todos');
            const isExclusive = filtros.moduloActivo === m.id;

            return (
              <button
                key={m.id}
                onClick={() => handleSelectModulo(m.id)}
                className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-left border transition-all text-xs font-bold ${
                  isExclusive
                    ? `${m.color} shadow-md scale-[1.02] border-transparent`
                    : isActive
                    ? 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                    : 'bg-slate-100/60 border-slate-200/60 text-slate-400 opacity-60'
                }`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  {m.icon}
                  <span className="truncate text-[11px]">{m.label}</span>
                </span>
                <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                  isExclusive ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {m.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Subtipos de Pavimentación (Solo visible si Pavimentaciones está activa) */}
      {(filtros.showPavimentacion || filtros.moduloActivo === 'pavimentacion' || filtros.moduloActivo === 'todos') && (
        <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black tracking-wider text-blue-900 uppercase flex items-center gap-1">
              <Construction size={11} className="text-blue-600" /> Tipos de Pavimentación
            </span>
            <span className="text-[9px] font-bold text-blue-600">{counts.pavimentacion} Obras</span>
          </div>

          <div className="space-y-1.5">
            {/* Carpeta Asfáltica */}
            <label className="flex items-center justify-between text-xs font-semibold text-slate-700 cursor-pointer hover:text-slate-900">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filtros.pavAsfaltica}
                  onChange={(e) => onFiltrosChange(f => ({ ...f, pavAsfaltica: e.target.checked }))}
                  className="rounded text-blue-600 accent-blue-600 w-3.5 h-3.5"
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 inline-block"></span>
                  Carpeta Asfáltica
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">{counts.pavAsfaltica}</span>
            </label>

            {/* Concreto Hidráulico */}
            <label className="flex items-center justify-between text-xs font-semibold text-slate-700 cursor-pointer hover:text-slate-900">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filtros.pavHidraulico}
                  onChange={(e) => onFiltrosChange(f => ({ ...f, pavHidraulico: e.target.checked }))}
                  className="rounded text-cyan-600 accent-cyan-600 w-3.5 h-3.5"
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-600 inline-block"></span>
                  Concreto Hidráulico
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">{counts.pavHidraulico}</span>
            </label>

            {/* Concreto Ecológico / Permeable */}
            <label className="flex items-center justify-between text-xs font-semibold text-slate-700 cursor-pointer hover:text-slate-900">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filtros.pavEcologico}
                  onChange={(e) => onFiltrosChange(f => ({ ...f, pavEcologico: e.target.checked }))}
                  className="rounded text-emerald-600 accent-emerald-600 w-3.5 h-3.5"
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                  Concreto Ecológico
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">{counts.pavEcologico}</span>
            </label>
          </div>
        </div>
      )}

      {/* 3. Filtros de Estatus de Contrato (Concluidas / En Proceso / Programadas) */}
      <div className="pt-2 border-t border-slate-200">
        <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase flex items-center gap-1.5 mb-2.5">
          <CalendarClock size={12} /> Estado de Ejecución
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => onFiltrosChange(f => ({ ...f, showConcluidas: !f.showConcluidas }))}
            className={`p-1.5 rounded-lg border text-center transition-all flex flex-col items-center justify-center ${
              filtros.showConcluidas
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-400 opacity-60'
            }`}
          >
            <CheckCircle2 size={12} className="mb-0.5 text-emerald-600" />
            <span className="text-[9px] font-black uppercase">Concluidas</span>
          </button>

          <button
            onClick={() => onFiltrosChange(f => ({ ...f, showEnProceso: !f.showEnProceso }))}
            className={`p-1.5 rounded-lg border text-center transition-all flex flex-col items-center justify-center ${
              filtros.showEnProceso
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-slate-200 text-slate-400 opacity-60'
            }`}
          >
            <Clock size={12} className="mb-0.5 text-amber-600" />
            <span className="text-[9px] font-black uppercase">En Proceso</span>
          </button>

          <button
            onClick={() => onFiltrosChange(f => ({ ...f, showProgramadas: !f.showProgramadas }))}
            className={`p-1.5 rounded-lg border text-center transition-all flex flex-col items-center justify-center ${
              filtros.showProgramadas
                ? 'bg-slate-100 border-slate-300 text-slate-800'
                : 'bg-white border-slate-200 text-slate-400 opacity-60'
            }`}
          >
            <CalendarClock size={12} className="mb-0.5 text-slate-500" />
            <span className="text-[9px] font-black uppercase">Programadas</span>
          </button>
        </div>
      </div>
    </div>
  );
};
