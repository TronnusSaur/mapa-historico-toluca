import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { HotspotCluster } from '../types/hotspots.ts';

interface HotspotsLayerProps {
  hotspots: HotspotCluster[];
  visible: boolean;
  selectedHotspotId?: string | null;
  onSelectHotspot?: (hotspot: HotspotCluster) => void;
}

function escapeHtml(text?: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const HotspotsLayer: React.FC<HotspotsLayerProps> = React.memo(({
  hotspots,
  visible,
  selectedHotspotId,
  onSelectHotspot
}) => {
  const map = useMap();
  const [currentZoom, setCurrentZoom] = useState<number>(() => map.getZoom());

  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());
  const circlesMapRef = useRef<Map<string, L.Circle>>(new Map());
  const hoverCircleRef = useRef<L.Circle | null>(null);
  const onSelectRef = useRef(onSelectHotspot);
  onSelectRef.current = onSelectHotspot;

  // Track map zoom for Level of Detail (LOD)
  useEffect(() => {
    const handleZoom = () => {
      setCurrentZoom(map.getZoom());
    };
    map.on('zoomend', handleZoom);
    return () => {
      map.off('zoomend', handleZoom);
    };
  }, [map]);

  // Level of Detail (LOD) filtering based on current zoom:
  // - Zoom <= 12: Regional macro view — Only Top 15 / 'critica'
  // - Zoom 13: Municipal view — Top 25 / 'critica' & 'alta'
  // - Zoom 14: Semi-detailed view — Top 35 prioritarios
  // - Zoom >= 15: Neighborhood / street view — Full 101 hotspots
  // Hotspot selected by user is always preserved regardless of zoom level.
  const visibleHotspots = useMemo(() => {
    if (!hotspots || hotspots.length === 0) return [];
    if (currentZoom <= 12) {
      return hotspots.filter((h, idx) => h.severity === 'critica' || idx < 15 || h.id === selectedHotspotId);
    }
    if (currentZoom === 13) {
      return hotspots.filter((h, idx) => h.severity === 'critica' || h.severity === 'alta' || idx < 25 || h.id === selectedHotspotId);
    }
    if (currentZoom === 14) {
      return hotspots.filter((h, idx) => h.severity === 'critica' || h.severity === 'alta' || idx < 35 || h.id === selectedHotspotId);
    }
    return hotspots;
  }, [hotspots, currentZoom, selectedHotspotId]);

  useEffect(() => {
    // If not visible or no hotspots, clean up
    if (!visible || !visibleHotspots || visibleHotspots.length === 0) {
      if (hoverCircleRef.current && map.hasLayer(hoverCircleRef.current)) {
        map.removeLayer(hoverCircleRef.current);
        hoverCircleRef.current = null;
      }
      if (layerGroupRef.current && map.hasLayer(layerGroupRef.current)) {
        map.removeLayer(layerGroupRef.current);
      }
      return;
    }

    if (layerGroupRef.current && map.hasLayer(layerGroupRef.current)) {
      map.removeLayer(layerGroupRef.current);
    }

    const layerGroup = L.layerGroup();
    markersMapRef.current.clear();
    circlesMapRef.current.clear();

    visibleHotspots.forEach((cluster) => {
      const isCritical = cluster.severity === 'critica';
      const isAlta = cluster.severity === 'alta';

      const mainColor = isCritical ? '#dc2626' : isAlta ? '#ea580c' : '#d97706';
      const bgGradient = isCritical
        ? 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)'
        : isAlta
        ? 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)'
        : 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)';
      const glowColor = isCritical
        ? 'rgba(220, 38, 38, 0.45)'
        : isAlta
        ? 'rgba(234, 88, 12, 0.45)'
        : 'rgba(217, 119, 6, 0.4)';

      const isSelected = cluster.id === selectedHotspotId;
      // High-performance animation budgeting: only animate Top 3 or the selected hotspot
      const shouldPulse = (cluster.rank <= 3) || isSelected;

      // 1. Círculo de cobertura espacial (radio del hotspot en metros)
      // En vistas intermedias (zoom < 16), NO dibujamos 101 círculos continuos para no saturar.
      // Solo se dibuja el círculo si está seleccionado activamente o si estamos a nivel calle (>= 16).
      if (isSelected || currentZoom >= 16) {
        const circle = L.circle(cluster.center, {
          radius: cluster.radiusMeters,
          color: mainColor,
          fillColor: mainColor,
          fillOpacity: isSelected ? 0.25 : 0.08,
          weight: isSelected ? 2.5 : 1.5,
          dashArray: isSelected ? undefined : '5 5'
        });
        layerGroup.addLayer(circle);
        circlesMapRef.current.set(cluster.id, circle);
      }

      // 2. Icono con badge y contador
      const size = isCritical ? 44 : isAlta ? 38 : 34;
      const pulseHtml = shouldPulse ? `
        <div style="
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          background: ${glowColor};
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          z-index: 1;
        "></div>
      ` : '';

      const iconHtml = `
        <div style="position: relative; width: ${size}px; height: ${size}px;">
          ${pulseHtml}
          <!-- Main Badge -->
          <div style="
            position: relative;
            z-index: 2;
            width: 100%;
            height: 100%;
            background: ${bgGradient};
            border: 2.5px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 4px 14px ${glowColor};
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-family: system-ui, -apple-system, sans-serif;
            font-weight: 900;
            cursor: pointer;
            transition: transform 0.2s ease;
          " class="hover:scale-115">
            <span style="font-size: ${size > 40 ? 11 : 9.5}px; line-height: 1; opacity: 0.95;">
              ${isCritical ? '🔥' : isAlta ? '⚡' : '📍'}
            </span>
            <span style="font-size: ${size > 40 ? 13 : 11}px; line-height: 1; margin-top: 1px;">
              ${cluster.count}
            </span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'hotspot-marker',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2 - 4]
      });

      const marker = L.marker(cluster.center, { icon: customIcon });

      // Círculo interactivo al pasar el cursor (Hover on-demand):
      // Dibuja el radio de cobertura al posar el cursor, sin costo continuo en reposo
      marker.on('mouseover', () => {
        if (selectedHotspotId === cluster.id || currentZoom >= 16) return;
        if (hoverCircleRef.current && map.hasLayer(hoverCircleRef.current)) {
          map.removeLayer(hoverCircleRef.current);
        }
        hoverCircleRef.current = L.circle(cluster.center, {
          radius: cluster.radiusMeters,
          color: mainColor,
          fillColor: mainColor,
          fillOpacity: 0.18,
          weight: 2,
          dashArray: '4 4'
        }).addTo(map);
      });

      marker.on('mouseout', () => {
        if (hoverCircleRef.current && map.hasLayer(hoverCircleRef.current)) {
          map.removeLayer(hoverCircleRef.current);
          hoverCircleRef.current = null;
        }
      });

      // Breakdown of types HTML
      const topTipos = Object.entries(cluster.tipoCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([tipo, cnt]) => `
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10.5px; padding: 2px 0;">
            <span style="color: #475569; font-weight: 600;">${escapeHtml(tipo)}</span>
            <span style="background: #f1f5f9; color: #1e293b; font-weight: 800; padding: 1px 6px; border-radius: 4px;">${cnt}</span>
          </div>
        `)
        .join('');

      // Sample points preview HTML
      const samplePointsHtml = cluster.points.slice(0, 4).map(p => `
        <div style="background: #ffffff; border: 1px solid #f1f5f9; border-radius: 6px; padding: 6px; margin-bottom: 4px;">
          <div style="display: flex; justify-content: space-between; font-size: 9.5px; margin-bottom: 2px;">
            <strong style="color: ${p.fuente === 'Demanda General' ? '#ea580c' : '#4f46e5'};">${escapeHtml(p.fuente)}</strong>
            <span style="color: #94a3b8; font-family: monospace;">#${escapeHtml(p.folio || '')}</span>
          </div>
          <div style="font-size: 10px; color: #334155; line-height: 1.3;">
            ${escapeHtml(p.detalle?.slice(0, 75) || p.calle || 'Sin detalles')}...
          </div>
        </div>
      `).join('');

      const popupHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px; min-width: 270px; max-width: 320px;">
          <!-- Top Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span style="
              background: ${isCritical ? '#fee2e2' : '#ffedd5'}; 
              color: ${isCritical ? '#b91c1c' : '#c2410c'}; 
              font-size: 9.5px; 
              font-weight: 800; 
              padding: 2px 8px; 
              border-radius: 9999px; 
              text-transform: uppercase;
              letter-spacing: 0.5px;
            ">
              #${cluster.rank} Epicentro de Demanda
            </span>
            <span style="font-size: 10px; font-weight: 700; color: #64748b;">
              Radio ${cluster.radiusMeters}m
            </span>
          </div>

          <!-- Street & Delegacion -->
          <div style="margin-bottom: 10px;">
            <h3 style="font-size: 13.5px; font-weight: 900; color: #0f172a; margin: 0 0 3px 0; line-height: 1.2;">
              ${escapeHtml(cluster.topCalle)}
            </h3>
            <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
              Delegación: <span style="color: #0f172a;">${escapeHtml(cluster.topDelegacion)}</span>
            </div>
          </div>

          <!-- Total Count Card -->
          <div style="
            background: linear-gradient(135deg, ${mainColor}12 0%, ${mainColor}05 100%);
            border: 1px solid ${mainColor}30;
            border-radius: 8px;
            padding: 8px 10px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          ">
            <div>
              <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: ${mainColor}; letter-spacing: 0.5px;">
                Concentración Detectada
              </div>
              <div style="font-size: 11px; font-weight: 600; color: #334155;">
                Puntos a corta distancia
              </div>
            </div>
            <div style="font-size: 20px; font-weight: 900; color: ${mainColor};">
              ${cluster.count} <span style="font-size: 11px; font-weight: 700;">reportes</span>
            </div>
          </div>

          <!-- Origin Breakdown -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; margin-bottom: 10px;">
            <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; margin-bottom: 6px;">
              Desglose de Canales
            </div>
            <div style="display: flex; gap: 6px;">
              <div style="flex: 1; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 6px; padding: 5px 6px; text-align: center;">
                <div style="font-size: 8px; font-weight: 700; color: #ea580c; text-transform: uppercase;">Demanda Gral.</div>
                <div style="font-size: 13px; font-weight: 900; color: #9a3412;">${cluster.fuenteCounts.demandaGeneral}</div>
              </div>
              <div style="flex: 1; background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 6px; padding: 5px 6px; text-align: center;">
                <div style="font-size: 8px; font-weight: 700; color: #4f46e5; text-transform: uppercase;">Petición DGOP</div>
                <div style="font-size: 13px; font-weight: 900; color: #3730a3;">${cluster.fuenteCounts.peticionesDGOP}</div>
              </div>
            </div>
          </div>

          <!-- Problem Types -->
          <div style="margin-bottom: 10px;">
            <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; margin-bottom: 4px;">
              Problemáticas Principales
            </div>
            ${topTipos}
          </div>

          <!-- Sample Reports -->
          <div style="margin-bottom: 10px;">
            <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; margin-bottom: 4px;">
              Reportes en esta zona (${Math.min(cluster.points.length, 4)} de ${cluster.count})
            </div>
            <div style="max-height: 120px; overflow-y: auto;">
              ${samplePointsHtml}
            </div>
          </div>

          <!-- Coords -->
          <div style="font-size: 9px; color: #94a3b8; font-family: monospace; text-align: right; border-top: 1px solid #f1f5f9; padding-top: 4px;">
            Centro: ${cluster.center[0].toFixed(5)}, ${cluster.center[1].toFixed(5)}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 330 });

      marker.on('click', () => {
        if (onSelectRef.current) onSelectRef.current(cluster);
      });

      layerGroup.addLayer(marker);
      markersMapRef.current.set(cluster.id, marker);
    });

    layerGroup.addTo(map);
    layerGroupRef.current = layerGroup;

    return () => {
      if (hoverCircleRef.current && map.hasLayer(hoverCircleRef.current)) {
        map.removeLayer(hoverCircleRef.current);
        hoverCircleRef.current = null;
      }
      if (layerGroupRef.current && map.hasLayer(layerGroupRef.current)) {
        map.removeLayer(layerGroupRef.current);
      }
    };
  }, [map, visible, visibleHotspots, currentZoom, selectedHotspotId]);

  // If a hotspot was selected externally, fly to it and open its popup
  useEffect(() => {
    circlesMapRef.current.forEach((circle, id) => {
      const isSelected = selectedHotspotId === id;
      circle.setStyle({
        fillOpacity: isSelected ? 0.25 : 0.08,
        weight: isSelected ? 2.5 : 1.5
      });
    });

    if (!selectedHotspotId || !markersMapRef.current.has(selectedHotspotId)) return;
    const marker = markersMapRef.current.get(selectedHotspotId);
    if (marker) {
      const latLng = marker.getLatLng();
      map.flyTo(latLng, 16.5, { duration: 1.2 });
      setTimeout(() => {
        marker.openPopup();
      }, 700);
    }
  }, [selectedHotspotId, map]);

  return null;
});
