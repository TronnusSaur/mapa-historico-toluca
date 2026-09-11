import React from 'react';
import { Polyline, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import type { ObraTramo, ObraPuntual, EstadoTemporalObra } from '../types/obras.ts';
import { Calendar, Layers, MapPin, Ruler } from 'lucide-react';

interface ObrasLayersProps {
  tramos: ObraTramo[];
  puntuales: ObraPuntual[];
  currentDate: Date;
  showPavimentacion: boolean;
  showSlurry: boolean;
  showSenderos: boolean;
  showArcotechos: boolean;
  showPozos: boolean;
  showSenalamiento: boolean;
  showEquipamiento: boolean;
  pavAsfaltica: boolean;
  pavHidraulico: boolean;
  pavEcologico: boolean;
  showConcluidas: boolean;
  showEnProceso: boolean;
  showProgramadas: boolean;
}

export const ObrasLayers: React.FC<ObrasLayersProps> = ({
  tramos,
  puntuales,
  currentDate,
  showPavimentacion,
  showSlurry,
  showSenderos,
  showArcotechos,
  showPozos,
  showSenalamiento,
  showEquipamiento,
  pavAsfaltica,
  pavHidraulico,
  pavEcologico,
  showConcluidas,
  showEnProceso,
  showProgramadas
}) => {
  const getTimelineStatus = (fechaInicio?: Date | null, fechaFin?: Date | null): EstadoTemporalObra => {
    if (!fechaInicio) return 'CONCLUIDA';
    if (currentDate < fechaInicio) return 'POR_INICIAR';
    if (fechaFin && currentDate > fechaFin) return 'CONCLUIDA';
    return 'EN_EJECUCION';
  };

  const matchesStatusFilter = (status: EstadoTemporalObra): boolean => {
    if (status === 'CONCLUIDA' && !showConcluidas) return false;
    if (status === 'EN_EJECUCION' && !showEnProceso) return false;
    if (status === 'POR_INICIAR' && !showProgramadas) return false;
    return true;
  };

  const getTramoColor = (obra: ObraTramo): string => {
    if (obra.tipo === 'slurry') return '#ea580c'; // Naranja intenso
    if (obra.tipo === 'senderos') return '#c026d3'; // Fucsia / Rosa senderos seguros
    if (obra.tipo === 'arcotechos' || obra.tipo === 'equipamiento') return '#9333ea'; // Morado arcotechos / equipamiento
    if (obra.tipo === 'senalamiento') return '#eab308'; // Amarillo vial
    if (obra.tipo === 'pozos') return '#06b6d4'; // Cyan agua
    if (obra.subtipo === 'ecologico') return '#059669'; // Verde esmeralda
    if (obra.subtipo === 'hidraulico') return '#0284c7'; // Azul cielo / cian
    return '#2563eb'; // Azul rey asfáltico
  };

  const getPuntualColor = (obra: ObraPuntual): string => {
    if (obra.tipo === 'pozos') return '#06b6d4'; // Cyan agua
    if (obra.tipo === 'senalamiento') return '#eab308'; // Amarillo vial
    if (obra.tipo === 'arcotechos') return '#9333ea'; // Morado arcotechos
    if (obra.tipo === 'senderos') return '#c026d3'; // Fucsia senderos
    if (obra.tipo === 'equipamiento') return '#a855f7'; // Violeta equipamiento
    if (obra.tipo === 'slurry') return '#ea580c'; // Naranja intenso
    if (obra.tipo === 'pavimentacion') return '#2563eb'; // Azul rey
    return '#64748b';
  };

  const formatDate = (date?: Date | null): string => {
    if (!date) return 'No definida';
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const renderBadge = (status: EstadoTemporalObra) => {
    if (status === 'CONCLUIDA') {
      return <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">Concluida</span>;
    }
    if (status === 'EN_EJECUCION') {
      return <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">En Ejecución</span>;
    }
    return <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300">Programada</span>;
  };

  return (
    <>
      {/* 1. Capa de Obras de Tramo (Pavimentaciones, Slurry, Senderos, etc.) */}
      {tramos.map((obra) => {
        // Filtrar por módulo
        if (obra.tipo === 'pavimentacion' && !showPavimentacion) return null;
        if (obra.tipo === 'slurry' && !showSlurry) return null;
        if (obra.tipo === 'senderos' && !showSenderos) return null;
        if (obra.tipo === 'arcotechos' && !showArcotechos) return null;
        if (obra.tipo === 'equipamiento' && !showEquipamiento) return null;
        if (obra.tipo === 'senalamiento' && !showSenalamiento) return null;
        if (obra.tipo === 'pozos' && !showPozos) return null;

        // Filtrar por subtipo de pavimentación
        if (obra.tipo === 'pavimentacion') {
          if (obra.subtipo === 'asfaltica' && !pavAsfaltica) return null;
          if (obra.subtipo === 'hidraulico' && !pavHidraulico) return null;
          if (obra.subtipo === 'ecologico' && !pavEcologico) return null;
        }

        // Filtrar por estado temporal
        const status = getTimelineStatus(obra.fechaInicio, obra.fechaFin);
        if (!matchesStatusFilter(status)) return null;

        if (!obra.coords || obra.coords.length === 0) return null;

        const color = getTramoColor(obra);
        const dashArray = status === 'POR_INICIAR' ? '6, 6' : undefined;
        const opacity = status === 'POR_INICIAR' ? 0.45 : 0.85;
        const weight = status === 'EN_EJECUCION' ? 6 : 5;

        if (obra.coords.length === 1) {
          return (
            <CircleMarker
              key={obra.id}
              center={obra.coords[0]}
              radius={7.5}
              pathOptions={{
                fillColor: color,
                color: '#ffffff',
                weight: 2,
                fillOpacity: opacity
              }}
            >
              <Tooltip sticky className="premium-tooltip">
                <div className="font-sans">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">{obra.tipo.toUpperCase()} · {obra.subtipo} (Punto Referencia)</p>
                  <p className="text-xs font-black text-slate-800 line-clamp-2">{obra.nombre}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{obra.metrosLineales ? `${obra.metrosLineales} ML · ` : ''}{obra.delegacion}</p>
                </div>
              </Tooltip>
              <Popup>
                <div className="font-sans min-w-[240px] max-w-[320px] p-1">
                  <div className="border-b border-slate-200 pb-2 mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        {obra.tipo.toUpperCase()} (REFERENCIA)
                      </span>
                      {renderBadge(status)}
                    </div>
                    <b className="text-xs font-bold text-slate-900 leading-tight block">
                      {obra.contrato}
                    </b>
                    <span className="text-[10px] font-semibold text-toluca-burgundy block mt-0.5">
                      {obra.subtipo}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-snug mb-3">
                    {obra.nombre}
                  </p>
                  <div className="bg-slate-50 rounded-lg p-2.5 space-y-1.5 text-[11px] border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin size={13} className="text-toluca-gold shrink-0" />
                      <span><b>Delegación:</b> {obra.delegacion || 'Toluca'}</span>
                    </div>
                    {obra.metrosLineales ? (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Ruler size={13} className="text-blue-600 shrink-0" />
                        <span><b>Avance Lineal:</b> {obra.metrosLineales.toLocaleString()} ML</span>
                      </div>
                    ) : null}
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Calendar size={13} className="text-slate-400 shrink-0" />
                      <span><b>Periodo:</b> {formatDate(obra.fechaInicio)} al {formatDate(obra.fechaFin)}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        }

        return (
          <Polyline
            key={obra.id}
            positions={obra.coords}
            pathOptions={{
              color,
              weight,
              opacity,
              dashArray
            }}
          >
            <Tooltip sticky className="premium-tooltip">
              <div className="font-sans">
                <p className="text-[10px] font-bold text-slate-500 uppercase">{obra.tipo.toUpperCase()} · {obra.subtipo}</p>
                <p className="text-xs font-black text-slate-800 line-clamp-2">{obra.nombre}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{obra.metrosLineales} ML · {obra.delegacion}</p>
              </div>
            </Tooltip>
            <Popup>
              <div className="font-sans min-w-[240px] max-w-[320px] p-1">
                {/* Header Popup Institucional */}
                <div className="border-b border-slate-200 pb-2 mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                      {obra.tipo.toUpperCase()}
                    </span>
                    {renderBadge(status)}
                  </div>
                  <b className="text-xs font-bold text-slate-900 leading-tight block">
                    {obra.contrato}
                  </b>
                  <span className="text-[10px] font-semibold text-toluca-burgundy block mt-0.5">
                    {obra.subtipo}
                  </span>
                </div>

                {/* Nombre de la obra */}
                <p className="text-xs text-slate-700 leading-snug mb-3">
                  {obra.nombre}
                </p>

                {/* Métricas y Datos */}
                <div className="bg-slate-50 rounded-lg p-2.5 space-y-1.5 text-[11px] border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <MapPin size={13} className="text-toluca-gold shrink-0" />
                    <span><b>Delegación:</b> {obra.delegacion || 'Toluca'}</span>
                  </div>
                  {obra.metrosLineales ? (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Ruler size={13} className="text-blue-600 shrink-0" />
                      <span><b>Avance Lineal:</b> {obra.metrosLineales.toLocaleString()} ML</span>
                    </div>
                  ) : null}
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Calendar size={13} className="text-slate-400 shrink-0" />
                    <span><b>Periodo:</b> {formatDate(obra.fechaInicio)} al {formatDate(obra.fechaFin)}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Polyline>
        );
      })}

      {/* 2. Capa de Obras Puntuales (Pozos, Arcotechos, Señalamiento, etc.) */}
      {puntuales.map((obra) => {
        if (obra.tipo === 'pozos' && !showPozos) return null;
        if (obra.tipo === 'senalamiento' && !showSenalamiento) return null;
        if (obra.tipo === 'arcotechos' && !showArcotechos) return null;
        if (obra.tipo === 'senderos' && !showSenderos) return null;
        if (obra.tipo === 'equipamiento' && !showEquipamiento) return null;
        if (obra.tipo === 'pavimentacion' && !showPavimentacion) return null;
        if (obra.tipo === 'slurry' && !showSlurry) return null;

        const status = getTimelineStatus(obra.fechaInicio, obra.fechaFin);
        if (!matchesStatusFilter(status)) return null;

        if (!obra.lat || !obra.lng || obra.lat === 0 || obra.lng === 0) return null;

        const color = getPuntualColor(obra);
        const radius = status === 'EN_EJECUCION' ? 9 : 7.5;
        const opacity = status === 'POR_INICIAR' ? 0.5 : 0.9;

        return (
          <CircleMarker
            key={obra.id}
            center={[obra.lat, obra.lng]}
            radius={radius}
            pathOptions={{
              fillColor: color,
              color: '#ffffff',
              weight: 2,
              fillOpacity: opacity
            }}
          >
            <Tooltip sticky className="premium-tooltip">
              <div className="font-sans">
                <p className="text-[10px] font-bold text-slate-500 uppercase">{obra.tipo.toUpperCase()}</p>
                <p className="text-xs font-black text-slate-800">{obra.contrato}</p>
                <p className="text-[10px] text-slate-500">{obra.delegacion}</p>
              </div>
            </Tooltip>
            <Popup>
              <div className="font-sans min-w-[240px] max-w-[320px] p-1">
                <div className="border-b border-slate-200 pb-2 mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                      {obra.tipo.toUpperCase()}
                    </span>
                    {renderBadge(status)}
                  </div>
                  <b className="text-xs font-bold text-slate-900 leading-tight block">
                    {obra.contrato}
                  </b>
                  <span className="text-[10px] font-semibold text-toluca-burgundy block mt-0.5">
                    {obra.subtipo}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-snug mb-3">
                  {obra.nombre}
                </p>

                <div className="bg-slate-50 rounded-lg p-2.5 space-y-1.5 text-[11px] border border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <MapPin size={13} className="text-toluca-gold shrink-0" />
                    <span><b>Delegación:</b> {obra.delegacion || 'Toluca'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Calendar size={13} className="text-slate-400 shrink-0" />
                    <span><b>Periodo:</b> {formatDate(obra.fechaInicio)} al {formatDate(obra.fechaFin)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Layers size={13} className="text-slate-400 shrink-0" />
                    <span><b>Coordenadas:</b> {obra.lat.toFixed(4)}, {obra.lng.toFixed(4)}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
};
