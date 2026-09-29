import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import type { DemandaCiudadana, PeticionCiudadana } from '../types/obras.ts';

interface CitizenDemandLayerProps {
  demandas: DemandaCiudadana[];
  peticiones: PeticionCiudadana[];
  showDemanda: boolean;
  showPeticiones: boolean;
}

function escapeHtml(str?: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Capa Unificada de Demanda Ciudadana y Peticiones DGOP.
 * Consolida ambos canales en un ÚNICO motor de clustering de alto rendimiento.
 * Evita colisiones de badges duplicados en las mismas coordenadas y acelera
 * el paneo/zoom a 60 FPS mediante CSS containment y hardware acceleration.
 */
export const CitizenDemandLayer: React.FC<CitizenDemandLayerProps> = React.memo(({
  demandas,
  peticiones,
  showDemanda,
  showPeticiones
}) => {
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    // Si ninguna capa está activa o no hay datos, desmontar limpiamente
    const hasDemanda = showDemanda && demandas && demandas.length > 0;
    const hasPeticiones = showPeticiones && peticiones && peticiones.length > 0;

    if (!hasDemanda && !hasPeticiones) {
      if (clusterGroupRef.current && map.hasLayer(clusterGroupRef.current)) {
        map.removeLayer(clusterGroupRef.current);
        clusterGroupRef.current = null;
      }
      return;
    }

    if (clusterGroupRef.current && map.hasLayer(clusterGroupRef.current)) {
      map.removeLayer(clusterGroupRef.current);
      clusterGroupRef.current = null;
    }

    // Crear grupo unificado con configuración de máximo rendimiento
    const clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      chunkInterval: 200,
      chunkDelay: 40,
      animate: false,
      animateAddingMarkers: false,
      removeOutsideVisibleBounds: true,
      disableClusteringAtZoom: 17,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      maxClusterRadius: (zoom: number) => {
        if (zoom <= 12) return 110;
        if (zoom <= 14) return 85;
        if (zoom <= 15) return 65;
        return 45;
      },
      iconCreateFunction: (cluster) => {
        const children = cluster.getAllChildMarkers() as any[];
        let demandaCount = 0;
        let peticionCount = 0;

        for (let i = 0; i < children.length; i++) {
          if (children[i]._fuente === 'demanda') {
            demandaCount++;
          } else {
            peticionCount++;
          }
        }

        const total = demandaCount + peticionCount;
        const isMixed = demandaCount > 0 && peticionCount > 0;
        const isOnlyPeticion = demandaCount === 0;

        // Tamaño adaptativo por volumen
        const size = total > 100 ? 48 : total > 30 ? 42 : 38;
        const fontSize = total > 100 ? 12 : 11;

        let bgStyle = '';
        let glowColor = '';
        let subBadgeHtml = '';

        if (isMixed) {
          // Badge Híbrido Unificado: Degradado Naranja (Demanda) y Morado (Peticiones)
          bgStyle = 'background: linear-gradient(135deg, #f97316 0%, #ea580c 48%, #6366f1 52%, #4338ca 100%);';
          glowColor = 'rgba(79, 70, 229, 0.45)';
          subBadgeHtml = `
            <div style="font-size: 8px; font-weight: 800; display: flex; gap: 3px; align-items: center; opacity: 0.95; margin-top: 1px;">
              <span>${demandaCount}📣</span>
              <span style="opacity: 0.6;">·</span>
              <span>${peticionCount}📄</span>
            </div>
          `;
        } else if (isOnlyPeticion) {
          // Solo Peticiones DGOP (Morado)
          bgStyle = 'background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);';
          glowColor = 'rgba(67, 56, 202, 0.45)';
          subBadgeHtml = `
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.9;">
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
              <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
            </svg>
          `;
        } else {
          // Solo Demanda General (Naranja)
          bgStyle = 'background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);';
          glowColor = 'rgba(234, 88, 12, 0.45)';
          subBadgeHtml = `
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.9;">
              <path d="m3 11 18-5v12L3 14v-3z"/>
              <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
            </svg>
          `;
        }

        return L.divIcon({
          html: `
            <div style="
              width: ${size}px;
              height: ${size}px;
              ${bgStyle}
              border: 2.5px solid #ffffff;
              border-radius: 50%;
              box-shadow: 0 4px 14px ${glowColor};
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-family: system-ui, -apple-system, sans-serif;
              cursor: pointer;
              will-change: transform;
              contain: layout style;
            ">
              <span style="font-size: ${fontSize}px; font-weight: 900; line-height: 1;">
                ${total}
              </span>
              ${subBadgeHtml}
            </div>
          `,
          className: 'unified-citizen-cluster',
          iconSize: L.point(size, size)
        });
      }
    });

    // Pines individuales optimizados con aceleración por GPU
    const pinDemandaIcon = L.divIcon({
      html: `
        <div style="
          width: 26px;
          height: 26px;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          border: 2px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 3px 10px rgba(234, 88, 12, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          will-change: transform;
          contain: layout style;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 11 18-5v12L3 14v-3z"/>
            <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
          </svg>
        </div>
      `,
      className: 'citizen-demanda-pin',
      iconSize: L.point(26, 26),
      iconAnchor: [13, 13],
      popupAnchor: [0, -13]
    });

    const pinPeticionIcon = L.divIcon({
      html: `
        <div style="
          width: 26px;
          height: 26px;
          background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
          border: 2px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 3px 10px rgba(67, 56, 202, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          will-change: transform;
          contain: layout style;
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
            <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
            <path d="M10 9H8"/>
            <path d="M16 13H8"/>
          </svg>
        </div>
      `,
      className: 'citizen-peticion-pin',
      iconSize: L.point(26, 26),
      iconAnchor: [13, 13],
      popupAnchor: [0, -13]
    });

    // Delegated popup builder: solo construye HTML cuando el usuario hace clic
    clusterGroup.on('click', (e: any) => {
      const marker = e.layer;
      if (!marker || !marker._itemData) return;
      if (marker._hasPopup) {
        marker.openPopup();
        return;
      }

      let popupHtml = '';

      if (marker._fuente === 'demanda') {
        const item = marker._itemData as DemandaCiudadana;
        popupHtml = `
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
            <div style="font-size: 9px; color: #94a3b8; font-family: monospace; text-align: right; border-top: 1px solid #f8fafc; padding-top: 4px;">
              ${item.lat.toFixed(5)}, ${item.lng.toFixed(5)}
            </div>
          </div>
        `;
      } else {
        const item = marker._itemData as PeticionCiudadana;
        popupHtml = `
          <div style="font-family: system-ui, -apple-system, sans-serif; padding: 2px 2px; min-width: 260px; max-width: 330px;">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 8px;">
              <span style="background: #eef2ff; color: #4338ca; border: 1px solid #c7d2fe; padding: 2px 8px; border-radius: 9999px; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                Petición Ciudadana (Oficio)
              </span>
              <span style="font-family: monospace; font-size: 10px; font-weight: 800; color: #1e1b4b;">
                ${escapeHtml(item.oficio)}
              </span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="background: #f1f5f9; color: #334155; font-size: 9.5px; font-weight: 800; padding: 2px 6px; border-radius: 6px; text-transform: uppercase;">
                ${escapeHtml(item.tipoSolicitud || 'BACHEO')}
              </span>
              ${item.fecha ? `
                <span style="font-size: 9px; font-weight: 700; color: #64748b;">
                  📅 ${escapeHtml(item.fecha)}
                </span>
              ` : ''}
            </div>
            <div style="background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 8px; padding: 8px; margin-bottom: 8px;">
              <div style="font-size: 11px; font-weight: 600; color: #334155; margin-bottom: 4px;">
                📍 ${escapeHtml(item.calle || 'Vialidad no especificada')}
              </div>
              <div style="font-size: 9.5px; font-weight: 700; color: #64748b; text-transform: uppercase;">
                Delegación: <strong style="color: #0f172a;">${escapeHtml(item.delegacion || 'Toluca')}</strong>
              </div>
            </div>
            <div style="margin-bottom: 8px;">
              <span style="font-size: 8.5px; font-weight: 800; text-transform: uppercase; color: #94a3b8; display: block; letter-spacing: 0.5px; margin-bottom: 2px;">
                Detalle del Oficio / Petición
              </span>
              <p style="font-size: 11px; color: #334155; line-height: 1.4; margin: 0; background: #fff; border-left: 2px solid #6366f1; padding-left: 8px;">
                ${escapeHtml(item.asunto || 'Petición de intervención turnada a la DGOP.')}
              </p>
            </div>
            <div style="font-size: 9px; color: #94a3b8; font-family: monospace; text-align: right; border-top: 1px solid #f8fafc; padding-top: 4px;">
              ${item.lat.toFixed(5)}, ${item.lng.toFixed(5)} · Reg. #${escapeHtml(item.noProg)}
            </div>
          </div>
        `;
      }

      marker.bindPopup(popupHtml, { maxWidth: 350 });
      marker._hasPopup = true;
      marker.openPopup();
    });

    // Inyectar datos activos
    if (hasDemanda) {
      demandas.forEach((item) => {
        const marker = L.marker([item.lat, item.lng], { icon: pinDemandaIcon }) as any;
        marker._fuente = 'demanda';
        marker._itemData = item;
        clusterGroup.addLayer(marker);
      });
    }

    if (hasPeticiones) {
      peticiones.forEach((item) => {
        const marker = L.marker([item.lat, item.lng], { icon: pinPeticionIcon }) as any;
        marker._fuente = 'peticion';
        marker._itemData = item;
        clusterGroup.addLayer(marker);
      });
    }

    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;

    return () => {
      if (clusterGroup && map.hasLayer(clusterGroup)) {
        map.removeLayer(clusterGroup);
        clusterGroupRef.current = null;
      }
    };
  }, [map, demandas, peticiones, showDemanda, showPeticiones]);

  return null;
});
