import React from 'react';
import L from 'leaflet';
import { Polyline, Marker, Popup, Tooltip } from 'react-leaflet';
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

// Genera el SVG blanco centrado correspondiente al tipo de obra
const getObraSvg = (tipo: string): string => {
  if (tipo === 'senderos') {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"></path><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"></path><path d="M16 17h4"></path><path d="M4 13h4"></path></svg>';
  }
  if (tipo === 'arcotechos' || tipo === 'equipamiento') {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M10 12h4"></path><path d="M10 8h4"></path><path d="M14 21v-3a2 2 0 0 0-4 0v3"></path><path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"></path><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"></path></svg>';
  }
  if (tipo === 'slurry') {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"></path></svg>';
  }
  if (tipo === 'pozos') {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg>';
  }
  if (tipo === 'senalamiento') {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>';
  }
  // Default pavimentaciones (construcción)
  return '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="8" rx="1"></rect><path d="M17 14v7"></path><path d="M7 14v7"></path><path d="M17 3v3"></path><path d="M7 3v3"></path><path d="M10 14 2.3 6.3"></path><path d="m14 6 7.7 7.7"></path><path d="m8 6 8 8"></path></svg>';
};

// Calcula el punto medio geométrico real a lo largo del trazado de una calle
const getTramoMidpoint = (coords: [number, number][]): [number, number] => {
  if (!coords || coords.length === 0) return [19.2826, -99.6557];
  if (coords.length === 1) return coords[0];
  if (coords.length === 2) {
    return [
      (coords[0][0] + coords[1][0]) / 2,
      (coords[0][1] + coords[1][1]) / 2
    ];
  }

  let totalDist = 0;
  const dists: number[] = [0];
  for (let i = 1; i < coords.length; i++) {
    const dLat = coords[i][0] - coords[i - 1][0];
    const dLng = coords[i][1] - coords[i - 1][1];
    const segDist = Math.hypot(dLat, dLng);
    totalDist += segDist;
    dists.push(totalDist);
  }

  const halfDist = totalDist / 2;
  for (let i = 1; i < dists.length; i++) {
    if (dists[i] >= halfDist) {
      const segLength = dists[i] - dists[i - 1];
      if (segLength === 0) return coords[i];
      const ratio = (halfDist - dists[i - 1]) / segLength;
      return [
        coords[i - 1][0] + ratio * (coords[i][0] - coords[i - 1][0]),
        coords[i - 1][1] + ratio * (coords[i][1] - coords[i - 1][1])
      ];
    }
  }
  return coords[Math.floor(coords.length / 2)];
};

// Crea el DivIcon con borde blanco, centro de color y el ícono en blanco
const createObraPinIcon = (obra: ObraTramo | ObraPuntual, color: string, status: EstadoTemporalObra) => {
  const svg = getObraSvg(obra.tipo);
  const isEnProceso = status === 'EN_EJECUCION';
  return L.divIcon({
    className: 'obra-pin-marker',
    html: `<div class="obra-pin-badge ${isEnProceso ? 'is-in-progress' : ''}" style="background-color: ${color};" title="${obra.nombre.replace(/"/g, '&quot;')}">${svg}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });
};

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
  const getTimelineStatus = (fechaInicio?: Date | null, fechaFin?: Date | null, anio?: number): EstadoTemporalObra => {
    const year = anio || 2026;
    if (fechaFin && currentDate > fechaFin) return 'CONCLUIDA';
    if (year === 2025 && (!fechaInicio || currentDate.getFullYear() >= 2026)) return 'CONCLUIDA';
    if (!fechaInicio) return year === 2025 ? 'CONCLUIDA' : 'EN_EJECUCION';
    if (currentDate < fechaInicio) return 'POR_INICIAR';
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
    if (obra.tipo === 'senderos') return '#9333ea'; // Morado senderos seguros (#9333ea)
    if (obra.tipo === 'arcotechos' || obra.tipo === 'equipamiento') return '#78350f'; // Café arcotechos / equipamiento (#78350f)
    if (obra.tipo === 'senalamiento') return '#eab308'; // Amarillo vial
    if (obra.tipo === 'pozos') return '#06b6d4'; // Cyan agua
    if (obra.subtipo === 'ecologico') return '#059669'; // Verde esmeralda
    if (obra.subtipo === 'hidraulico') return '#0284c7'; // Azul cielo / cian
    return '#2563eb'; // Azul rey asfáltico
  };

  const getPuntualColor = (obra: ObraPuntual): string => {
    if (obra.tipo === 'pozos') return '#06b6d4'; // Cyan agua
    if (obra.tipo === 'senalamiento') return '#eab308'; // Amarillo vial
    if (obra.tipo === 'arcotechos' || obra.tipo === 'equipamiento') return '#78350f'; // Café arcotechos / equipamiento (#78350f)
    if (obra.tipo === 'senderos') return '#9333ea'; // Morado senderos seguros (#9333ea)
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
      return <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">En Proceso</span>;
    }
    return <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-300">Programada</span>;
  };

  const renderTramoPopup = (obra: ObraTramo, status: EstadoTemporalObra) => (
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
  );

  const renderPuntualPopup = (obra: ObraPuntual, status: EstadoTemporalObra) => (
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
  );

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
        const status = getTimelineStatus(obra.fechaInicio, obra.fechaFin, obra.anio);
        if (!matchesStatusFilter(status)) return null;

        if (!obra.coords || obra.coords.length === 0) return null;

        const color = getTramoColor(obra);
        const dashArray = status === 'POR_INICIAR' ? '6, 6' : undefined;
        const opacity = status === 'POR_INICIAR' ? 0.45 : 0.85;
        const weight = status === 'EN_EJECUCION' ? 6 : 5;

        const midpoint = obra.coords.length === 1 ? obra.coords[0] : getTramoMidpoint(obra.coords);

        const pinMarker = (
          <Marker
            key={`pin-${obra.id}`}
            position={midpoint}
            icon={createObraPinIcon(obra, color, status)}
          >
            <Tooltip sticky className="premium-tooltip">
              <div className="font-sans">
                <p className="text-[10px] font-bold text-slate-500 uppercase">{obra.tipo.toUpperCase()} · {obra.subtipo}</p>
                <p className="text-xs font-black text-slate-800 line-clamp-2">{obra.nombre}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{obra.metrosLineales ? `${obra.metrosLineales.toLocaleString()} ML · ` : ''}{obra.delegacion}</p>
              </div>
            </Tooltip>
            <Popup>
              {renderTramoPopup(obra, status)}
            </Popup>
          </Marker>
        );

        if (obra.coords.length === 1) {
          return pinMarker;
        }

        return (
          <React.Fragment key={obra.id}>
            <Polyline
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
                  <p className="text-[10px] text-slate-500 mt-0.5">{obra.metrosLineales ? `${obra.metrosLineales.toLocaleString()} ML · ` : ''}{obra.delegacion}</p>
                </div>
              </Tooltip>
              <Popup>
                {renderTramoPopup(obra, status)}
              </Popup>
            </Polyline>
            {pinMarker}
          </React.Fragment>
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

        const status = getTimelineStatus(obra.fechaInicio, obra.fechaFin, obra.anio);
        if (!matchesStatusFilter(status)) return null;

        if (!obra.lat || !obra.lng || obra.lat === 0 || obra.lng === 0) return null;

        const color = getPuntualColor(obra);

        return (
          <Marker
            key={obra.id}
            position={[obra.lat, obra.lng]}
            icon={createObraPinIcon(obra, color, status)}
          >
            <Tooltip sticky className="premium-tooltip">
              <div className="font-sans">
                <p className="text-[10px] font-bold text-slate-500 uppercase">{obra.tipo.toUpperCase()}</p>
                <p className="text-xs font-black text-slate-800">{obra.contrato}</p>
                <p className="text-[10px] text-slate-500">{obra.delegacion}</p>
              </div>
            </Tooltip>
            <Popup>
              {renderPuntualPopup(obra, status)}
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};
