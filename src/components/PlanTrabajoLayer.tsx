import React, { useState } from 'react';
import { Polyline, Marker, Tooltip, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Briefcase, MapPin, AlertCircle, FileText } from 'lucide-react';
import type { PlanTrabajoFeature } from '../types/obras.ts';

interface PlanTrabajoLayerProps {
  routes: PlanTrabajoFeature[];
  visible: boolean;
  selectedRouteId?: string | null;
  onSelectRoute?: (route: PlanTrabajoFeature) => void;
}

// Calcula el punto medio geométrico real a lo largo del tramo
const getRouteMidpoint = (coords: [number, number][]): [number, number] => {
  if (!coords || coords.length === 0) return [19.2826, -99.6557];
  if (coords.length === 1) return coords[0];
  if (coords.length === 2) {
    return [(coords[0][0] + coords[1][0]) / 2, (coords[0][1] + coords[1][1]) / 2];
  }

  let totalDist = 0;
  const dists: number[] = [0];
  for (let i = 1; i < coords.length; i++) {
    const dLat = coords[i][0] - coords[i - 1][0];
    const dLng = coords[i][1] - coords[i - 1][1];
    totalDist += Math.hypot(dLat, dLng);
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

// Ícono SVG exclusivo para el Plan de Trabajo (Maletín / Portafolio de Obra Proyectada)
const planPinIcon = L.divIcon({
  className: 'plan-trabajo-pin-marker',
  html: `
    <div style="
      width: 26px; 
      height: 26px; 
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); 
      border: 2px solid #ffffff; 
      border-radius: 50%; 
      box-shadow: 0 3px 8px rgba(124, 58, 237, 0.4), 0 0 0 2px rgba(124, 58, 237, 0.25); 
      display: flex; 
      align-items: center; 
      justify-content: center;
      cursor: pointer;
      transition: transform 0.15s ease;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
    </div>
  `,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -14],
});

export const PlanTrabajoLayer: React.FC<PlanTrabajoLayerProps> = React.memo(({
  routes,
  visible,
  selectedRouteId,
  onSelectRoute
}) => {
  const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null);

  if (!visible || !routes || routes.length === 0) return null;

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <>
      {routes.map((route) => {
        if (!route.coords || route.coords.length < 2) return null;

        const isHovered = hoveredRouteId === route.id;
        const isSelected = selectedRouteId === route.id;
        const midpoint = getRouteMidpoint(route.coords);

        const strokeColor = isSelected ? '#a855f7' : isHovered ? '#9333ea' : '#7c3aed';
        const strokeWeight = isSelected ? 8 : isHovered ? 7 : 5;
        const strokeOpacity = isSelected ? 1 : isHovered ? 0.95 : 0.85;

        return (
          <React.Fragment key={route.id}>
            {/* 1. Capa de resplandor / borde exterior para destacar visualmente sobre calles y otras capas */}
            <Polyline
              positions={route.coords}
              pathOptions={{
                color: isSelected ? '#d8b4fe' : '#ffffff',
                weight: strokeWeight + 3,
                opacity: 0.75,
                lineCap: 'round',
                lineJoin: 'round'
              }}
              interactive={false}
            />

            {/* 2. Trazo principal interactivo del tramo */}
            <Polyline
              positions={route.coords}
              pathOptions={{
                color: strokeColor,
                weight: strokeWeight,
                opacity: strokeOpacity,
                dashArray: isSelected ? undefined : '10, 6', // Patrón distintivo de proyecto planificado
                lineCap: 'round',
                lineJoin: 'round'
              }}
              eventHandlers={{
                mouseover: () => setHoveredRouteId(route.id),
                mouseout: () => setHoveredRouteId(null),
                click: () => onSelectRoute?.(route)
              }}
            >
              <Tooltip sticky direction="top" offset={[0, -10]} opacity={0.97}>
                <div className="p-2 text-xs font-sans max-w-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-purple-700 font-extrabold uppercase tracking-wide text-[10px]">
                    <Briefcase size={12} />
                    Plan de Trabajo · Proyectado
                  </div>
                  <div className="font-bold text-slate-900 leading-tight">
                    {route.nombre}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                    <span>Delegación: <b className="text-slate-800">{route.delegacion}</b></span>
                    <span>Longitud: <b className="text-purple-700">{route.metrosLineales.toLocaleString('es-MX')} m</b></span>
                  </div>
                  <div className="text-[11px] font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 mt-1">
                    Inversión: {formatMoney(route.presupuestoEstimadoMxn)}
                  </div>
                </div>
              </Tooltip>

              <Popup maxWidth={360} className="plan-trabajo-popup">
                <div className="p-3 text-slate-800 font-sans space-y-3">
                  {/* Encabezado */}
                  <div className="flex items-start justify-between gap-2 border-b border-purple-100 pb-2">
                    <div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase bg-purple-100 text-purple-800 border border-purple-200 mb-1">
                        <Briefcase size={10} /> Plan de Trabajo · Proyecto Ejecutivo
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 leading-snug">
                        {route.nombre}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin size={11} className="text-purple-600 shrink-0" />
                        Delegación: <b className="text-slate-700">{route.delegacion}</b>
                      </p>
                    </div>
                  </div>

                  {/* Tarjetas de Métricas Físicas */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-purple-50/70 p-2 rounded-lg border border-purple-100">
                      <span className="text-[9px] font-bold text-purple-700 block uppercase">Longitud</span>
                      <span className="text-xs font-black text-slate-900">
                        {route.metrosLineales.toLocaleString('es-MX', { maximumFractionDigits: 1 })} m
                      </span>
                    </div>
                    <div className="bg-purple-50/70 p-2 rounded-lg border border-purple-100">
                      <span className="text-[9px] font-bold text-purple-700 block uppercase">Superficie</span>
                      <span className="text-xs font-black text-slate-900">
                        {route.superficieM2.toLocaleString('es-MX', { maximumFractionDigits: 1 })} m²
                      </span>
                    </div>
                    <div className="bg-purple-50/70 p-2 rounded-lg border border-purple-100">
                      <span className="text-[9px] font-bold text-purple-700 block uppercase">Ancho</span>
                      <span className="text-xs font-black text-slate-900">{route.anchoCalzadaM} m</span>
                    </div>
                  </div>

                  {/* Presupuesto e Inversión */}
                  <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-2.5 rounded-xl shadow-xs">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-purple-200 font-medium">Presupuesto Estimado:</span>
                      <span className="text-[10px] bg-purple-700/80 px-1.5 py-0.5 rounded text-purple-100">
                        ${route.costoUnitarioM2} / m²
                      </span>
                    </div>
                    <div className="text-base font-black tracking-tight text-white">
                      {formatMoney(route.presupuestoEstimadoMxn)}
                    </div>
                    <div className="text-[10px] text-purple-300 mt-0.5">
                      Pavimento proyectado: <b className="text-purple-100 uppercase">{route.tipoPavimento}</b>
                    </div>
                  </div>

                  {/* Justificación y Diagnóstico Territorial en el Corredor */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase block mb-1.5">
                      Diagnóstico y Prioridad Territorial
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2 p-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                        <AlertCircle size={14} className="text-emerald-600 shrink-0" />
                        <div>
                          <b className="block leading-tight text-slate-900">{route.bachesPreviosCorredor}</b>
                          <span className="text-[10px] text-emerald-700 leading-none">Baches en tramo</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800">
                        <FileText size={14} className="text-indigo-600 shrink-0" />
                        <div>
                          <b className="block leading-tight text-slate-900">{route.peticionesCiudadanasCorredor}</b>
                          <span className="text-[10px] text-indigo-700 leading-none">Peticiones ciudadanas</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Polyline>

            {/* 3. Marcador de punto central para fácil identificación en zooms macro */}
            <Marker
              position={midpoint}
              icon={planPinIcon}
              eventHandlers={{
                click: () => onSelectRoute?.(route)
              }}
            >
              <Tooltip direction="top" offset={[0, -14]} opacity={0.95}>
                <span className="font-bold text-xs">{route.nombre} ({route.metrosLineales}m)</span>
              </Tooltip>
            </Marker>
          </React.Fragment>
        );
      })}
    </>
  );
});
