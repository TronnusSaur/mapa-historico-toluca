import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import type { PotholeData } from '../utils/dataProcessors.ts';

interface Props {
  data: PotholeData[];
  clusterColor?: string;
}

export default function MarkerClusterGroup({ data, clusterColor }: Props) {
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    // Initialize cluster group with custom aesthetics
    const baseColor = clusterColor || '#e63946';
    const clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let size = '40px';
        if (count > 1000) size = '60px';
        else if (count > 100) size = '50px';

        return L.divIcon({
          html: `<div class="custom-marker-cluster" style="width: ${size}; height: ${size}; font-size: 12px; background: ${baseColor};">${count}</div>`,
          className: '',
          iconSize: L.point(parseInt(size), parseInt(size))
        });
      }
    });

    clusterGroupRef.current = clusterGroup;
    map.addLayer(clusterGroup);

    return () => {
      map.removeLayer(clusterGroup);
    };
  }, [map, clusterColor]);

  useEffect(() => {
    if (!clusterGroupRef.current) return;

    const clusterGroup = clusterGroupRef.current;
    clusterGroup.clearLayers();

    // Create markers for data
    const markers = data.map(p => {
      if (!p.lat || !p.lng || isNaN(p.lat) || isNaN(p.lng)) return null;

      // Dynamic color based on status
      let color = '#e63946'; // Default: Red (tickets)
      let borderAccent = '#e63946';
      if (p.status === 'EJECUTADO') {
        color = '#16a34a'; // Green for executed
        borderAccent = '#16a34a';
      } else if (p.status === 'HISTORICO') {
        color = '#ff9f1c';
        borderAccent = '#ff9f1c';
      }

      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 6,
        fillColor: color,
        color: '#fff',
        weight: 1,
        fillOpacity: 0.9
      });

      // Build popup content based on status
      let popupContent = '';

      if (p.status === 'EJECUTADO') {
        const dateStr = p.date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
        const stageLabel = p.stage ? `Etapa ${p.stage}` : '';
        popupContent = `
          <div style="font-family: sans-serif; min-width: 180px;">
            <div style="border-bottom: 2px solid #16a34a; padding-bottom: 4px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
              <b style="color: #16a34a; font-size: 13px;">Bacheo Ejecutado</b>
              ${stageLabel ? `<span style="background: #16a34a; color: white; font-size: 9px; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${stageLabel}</span>` : ''}
            </div>
            <div style="font-size: 12px; margin-bottom: 4px;">
              <b>Calle:</b> ${p.street || 'S/N'}<br/>
              <b>Delegación:</b> ${p.delegation || 'Toluca'}
            </div>
            <div style="background: #f0fdf4; padding: 6px; border-radius: 6px; font-size: 11px; border-left: 3px solid #16a34a;">
              <b>Fecha:</b> ${dateStr}<br/>
              <b>Área:</b> ${p.m2?.toFixed(2) || '—'} m²
            </div>
          </div>
        `;
      } else {
        // Ticket / Historico popup
        const reportStr = (p.reportDate || p.date).toLocaleDateString();
        const resolvedStr = p.resolvedDate ? p.resolvedDate.toLocaleDateString() : 'Pendiente';
        popupContent = `
          <div style="font-family: sans-serif; min-width: 150px;">
            <div style="border-bottom: 2px solid #7a1531; padding-bottom: 4px; margin-bottom: 6px;">
              <b style="color: #7a1531; font-size: 14px;">Ticket: ${p.originalId}</b>
            </div>
            <div style="font-size: 12px; margin-bottom: 4px;">
              <b>Calle:</b> ${p.street || 'S/N'}<br/>
              <b>Región:</b> ${p.delegation || 'Toluca'}
            </div>
            <div style="background: #f8fafc; padding: 6px; border-radius: 6px; font-size: 11px; border-left: 3px solid ${borderAccent};">
              <b>Reportado:</b> ${reportStr}<br/>
              <b>Resuelto:</b> <span style="color: ${p.resolvedDate ? '#16a34a' : '#e63946'}; font-weight: bold;">${resolvedStr}</span>
            </div>
          </div>
        `;
      }

      marker.bindPopup(popupContent);
      return marker;
    }).filter(m => m !== null) as L.CircleMarker[];

    clusterGroup.addLayers(markers);

  }, [data]);

  return null;
}
