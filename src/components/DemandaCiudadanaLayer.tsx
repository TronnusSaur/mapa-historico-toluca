import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import type { DemandaCiudadana } from '../types/obras.ts';

interface DemandaCiudadanaLayerProps {
  data: DemandaCiudadana[];
  visible: boolean;
}

export const DemandaCiudadanaLayer: React.FC<DemandaCiudadanaLayerProps> = React.memo(({ data, visible }) => {
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!visible || !data || data.length === 0) {
      if (clusterGroupRef.current && map.hasLayer(clusterGroupRef.current)) {
        map.removeLayer(clusterGroupRef.current);
      }
      return;
    }

    const clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      chunkInterval: 150,
      chunkDelay: 30,
      animate: true,
      maxClusterRadius: 65,
      disableClusteringAtZoom: 17,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        const size = count > 100 ? 46 : count > 30 ? 40 : 36;
        const fontSize = count > 100 ? 12 : 11;
        
        return L.divIcon({
          html: `
            <div style="
              width: ${size}px;
              height: ${size}px;
              background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
              border: 2.5px solid #ffffff;
              border-radius: 50%;
              box-shadow: 0 4px 12px rgba(234, 88, 12, 0.45);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-family: inherit;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m3 11 18-5v12L3 14v-3z"/>
                <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
              </svg>
              <span style="font-size: ${fontSize}px; font-weight: 900; line-height: 1; margin-top: 1px;">
                ${count}
              </span>
            </div>
          `,
          className: 'demanda-cluster-marker',
          iconSize: L.point(size, size)
        });
      }
    });

    const pinIcon = L.divIcon({
      html: `
        <div style="
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          border: 2px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 3px 10px rgba(234, 88, 12, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.15s ease;
        " class="hover:scale-115">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 11 18-5v12L3 14v-3z"/>
            <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
          </svg>
        </div>
      `,
      className: 'demanda-pin-marker',
      iconSize: L.point(28, 28),
      iconAnchor: [14, 14],
      popupAnchor: [0, -14]
    });

    // Delegated popup builder: Only create DOM when marker is actually clicked
    clusterGroup.on('click', (e: any) => {
      const marker = e.layer;
      if (!marker || !marker._itemData) return;
      if (marker._hasPopup) {
        marker.openPopup();
        return;
      }
      const item = marker._itemData as DemandaCiudadana;
      const popupHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; padding: 2px 2px; min-width: 250px; max-width: 320px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 8px;">
            <span style="background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; padding: 2px 8px; border-radius: 9999px; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
              Demanda Ciudadana
            </span>
            <span style="font-family: monospace; font-size: 11px; font-weight: 800; color: #0f172a;">
              #${escapeHtml(item.ticket)}
            </span>
          </div>

          <div style="margin-bottom: 6px;">
            <span style="font-size: 8.5px; font-weight: 800; text-transform: uppercase; color: #94a3b8; display: block; letter-spacing: 0.5px;">
              Solicitante
            </span>
            <span style="font-size: 12px; font-weight: 700; color: #1e293b;">
              ${escapeHtml(item.solicitante || 'Ciudadano')}
            </span>
          </div>

          <div style="background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 8px; padding: 8px; margin-bottom: 8px;">
            <div style="font-size: 11px; font-weight: 600; color: #334155; margin-bottom: 4px;">
              📍 ${escapeHtml(item.calleYNumero || 'Dirección no especificada')}
            </div>
            <div style="font-size: 9.5px; font-weight: 700; color: #64748b; text-transform: uppercase;">
              Delegación: <strong style="color: #0f172a;">${escapeHtml(item.delegacion || 'Toluca')}</strong>
            </div>
          </div>

          <div style="margin-bottom: 8px;">
            <span style="font-size: 8.5px; font-weight: 800; text-transform: uppercase; color: #94a3b8; display: block; letter-spacing: 0.5px; margin-bottom: 2px;">
              Petición / Reporte (${escapeHtml(item.trabajo)})
            </span>
            <p style="font-size: 11px; color: #475569; line-height: 1.4; margin: 0; background: #fff; border-left: 2px solid #f97316; padding-left: 8px; font-style: italic;">
              ${escapeHtml(item.observaciones || 'Reporte de solicitud de bacheo / intervención vial.')}
            </p>
          </div>

          <div style="font-size: 9px; color: #94a3b8; font-family: monospace; text-align: right; border-top: 1px solid #f8fafc; pt-1;">
            ${item.lat.toFixed(5)}, ${item.lng.toFixed(5)}
          </div>
        </div>
      `;
      marker.bindPopup(popupHtml, { maxWidth: 340 });
      marker._hasPopup = true;
      marker.openPopup();
    });

    // Crear pines individuales de forma ligera
    data.forEach((item) => {
      const marker = L.marker([item.lat, item.lng], { icon: pinIcon }) as any;
      marker._itemData = item;
      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;

    return () => {
      if (clusterGroup && map.hasLayer(clusterGroup)) {
        map.removeLayer(clusterGroup);
      }
    };
  }, [map, data, visible]);

  return null;
});

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
