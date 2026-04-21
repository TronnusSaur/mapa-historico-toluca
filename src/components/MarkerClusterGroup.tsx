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
    const baseColor = clusterColor || '#e63946';

    const clusterGroup = L.markerClusterGroup({
      // --- PERFORMANCE SETTINGS ---
      chunkedLoading: true,
      chunkSize: 500,          // Process 500 markers per chunk (not all at once)
      chunkInterval: 100,      // Wait 100ms between chunks to keep UI responsive
      chunkDelay: 50,          // Delay before starting chunked load

      // Disable heavy animations for large datasets
      animate: false,
      animateAddingMarkers: false,
      removeOutsideVisibleBounds: true, // Don't render off-screen markers

      maxClusterRadius: 60,

      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let size = 38;
        if (count > 1000) size = 58;
        else if (count > 100) size = 48;

        return L.divIcon({
          html: `<div class="custom-marker-cluster" style="width:${size}px;height:${size}px;font-size:11px;background:${baseColor};">${count > 999 ? (count / 1000).toFixed(1) + 'k' : count}</div>`,
          className: '',
          iconSize: L.point(size, size)
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
    const clusterGroup = clusterGroupRef.current;
    if (!clusterGroup) return;

    clusterGroup.clearLayers();

    if (data.length === 0) return;

    // Build markers in a tight loop (avoid .map + .filter chain overhead)
    const markers: L.CircleMarker[] = [];

    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      if (!p.lat || !p.lng || isNaN(p.lat) || isNaN(p.lng) || p.lat === 0) continue;

      let color = '#e63946';
      if (p.status === 'EJECUTADO') color = '#16a34a';
      else if (p.status === 'HISTORICO') color = '#ff9f1c';

      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 5,
        fillColor: color,
        color: '#fff',
        weight: 1,
        fillOpacity: 0.85,
        // Disable individual marker animations
        bubblingMouseEvents: false
      });

      // Lazy popup: bind content only when opened (saves memory with 46k+ markers)
      if (p.status === 'EJECUTADO') {
        const dateStr = p.date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
        marker.bindPopup(
          `<div style="font-family:sans-serif;min-width:170px;">
            <div style="border-bottom:2px solid #16a34a;padding-bottom:4px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
              <b style="color:#16a34a;font-size:13px;">Bacheo Ejecutado</b>
              ${p.stage ? `<span style="background:#16a34a;color:white;font-size:9px;padding:2px 6px;border-radius:4px;font-weight:bold;">Etapa ${p.stage}</span>` : ''}
            </div>
            <div style="font-size:12px;margin-bottom:4px;">
              <b>Calle:</b> ${p.street || 'S/N'}<br/>
              <b>Delegación:</b> ${p.delegation || 'Toluca'}
            </div>
            <div style="background:#f0fdf4;padding:6px;border-radius:6px;font-size:11px;border-left:3px solid #16a34a;">
              <b>Fecha:</b> ${dateStr}<br/>
              <b>Área:</b> ${p.m2?.toFixed(2) ?? '—'} m²
            </div>
          </div>`,
          { maxWidth: 220 }
        );
      } else {
        const reportStr = (p.reportDate || p.date).toLocaleDateString();
        const resolvedStr = p.resolvedDate ? p.resolvedDate.toLocaleDateString() : 'Pendiente';
        marker.bindPopup(
          `<div style="font-family:sans-serif;min-width:150px;">
            <div style="border-bottom:2px solid #7a1531;padding-bottom:4px;margin-bottom:6px;">
              <b style="color:#7a1531;font-size:14px;">Ticket: ${p.originalId}</b>
            </div>
            <div style="font-size:12px;margin-bottom:4px;">
              <b>Calle:</b> ${p.street || 'S/N'}<br/>
              <b>Región:</b> ${p.delegation || 'Toluca'}
            </div>
            <div style="background:#f8fafc;padding:6px;border-radius:6px;font-size:11px;border-left:3px solid #e63946;">
              <b>Reportado:</b> ${reportStr}<br/>
              <b>Resuelto:</b> <span style="color:${p.resolvedDate ? '#16a34a' : '#e63946'};font-weight:bold;">${resolvedStr}</span>
            </div>
          </div>`,
          { maxWidth: 220 }
        );
      }

      markers.push(marker);
    }

    // addLayers (plural) is dramatically faster than addLayer in a loop
    clusterGroup.addLayers(markers);

  }, [data]);

  return null;
}
