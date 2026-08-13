import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import type { PotholeData } from '../utils/dataProcessors.ts';
import { supabase } from '../lib/supabase.ts';

interface Props {
  data: PotholeData[];
  clusterColor?: string;
}

interface PotholeDetails {
  calle: string;
  delegacion: string;
  colonia: string;
  photos: string[];
}

/**
 * Fetches pothole details and photos on-demand from Supabase by ID.
 */
async function fetchPotholeDetails(id: string): Promise<PotholeDetails> {
  const dbId = parseInt(id.replace('db-', ''), 10);
  if (isNaN(dbId)) {
    return { calle: '', delegacion: '', colonia: '', photos: [] };
  }

  try {
    const { data, error } = await supabase
      .from('bacheo')
      .select('calle, delegacion, colonia, fotoBache1, fotoBache2, fotoBache3, fotoBacheProceso1, fotoBacheProceso2, fotoBacheProceso3, fotoBacheProceso4, fotoBacheProceso5, fotoBacheTerminado1, fotoBacheTerminado2, fotoBacheTerminado3')
      .eq('Id', dbId)
      .single();

    if (error || !data) {
      return { calle: '', delegacion: '', colonia: '', photos: [] };
    }

    const photoFields = [
      'fotoBache1', 'fotoBache2', 'fotoBache3',
      'fotoBacheProceso1', 'fotoBacheProceso2', 'fotoBacheProceso3', 'fotoBacheProceso4', 'fotoBacheProceso5',
      'fotoBacheTerminado1', 'fotoBacheTerminado2', 'fotoBacheTerminado3'
    ];

    const photosUrlBase = import.meta.env.VITE_PHOTOS_URL || 'http://192.168.1.33:8080';
    const urls: string[] = [];

    for (const field of photoFields) {
      const val = data[field as keyof typeof data];
      if (val && typeof val === 'string' && val.trim() !== '') {
        let url = val.trim();
        // If it is a relative path, prefix it with the photos url base
        if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:')) {
          const base = photosUrlBase.endsWith('/') ? photosUrlBase.slice(0, -1) : photosUrlBase;
          const path = url.startsWith('/') ? url : '/' + url;
          url = `${base}${path}`;
        }
        urls.push(url);
      }
    }
    return {
      calle: data.calle || 'S/N',
      delegacion: data.delegacion || 'Toluca',
      colonia: data.colonia || '',
      photos: urls
    };
  } catch (err) {
    console.error("Error fetching details from Supabase:", err);
    return { calle: '', delegacion: '', colonia: '', photos: [] };
  }
}

/**
 * Generates popup HTML on-demand (only when a marker is clicked).
 */
function buildPopupContent(p: PotholeData, details?: PotholeDetails, isLoading = false): string {
  if (p.status === 'EJECUTADO') {
    const street = details ? details.calle : (p.street || '...');
    const delegation = details ? details.delegacion : (p.delegation || '...');
    const colonia = details ? details.colonia : '';

    if (p.stage && p.stage >= 100) {
      let yearLabel = '2025';
      if (p.stage === 102) yearLabel = '2026';
      if (p.stage === 103) yearLabel = '2027';

      let photoHTML = '';
      if (isLoading) {
        photoHTML = `<div style="margin-top:8px;font-size:11px;color:#4b5563;text-align:center;padding:12px;border-top:1px dashed #cbd5e1;background:#f8fafc;border-radius:6px;">
          <span style="display:inline-block;animation:pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;">⏳ Cargando foto...</span>
        </div>`;
      } else if (details && details.photos.length > 0) {
        photoHTML = `<div style="margin-top:8px;display:flex;flex-direction:column;align-items:center;">
          <a href="${details.photos[0]}" target="_blank" rel="noopener noreferrer" style="display:block;width:100%;">
            <img src="${details.photos[0]}" style="width:100%;height:220px;object-fit:cover;border-radius:8px;border:2px solid #2563eb;box-shadow:0 4px 6px -1px rgba(37, 99, 235, 0.15);" 
                 alt="Foto de Bache" 
                 onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'50\\' height=\\'50\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'%232563eb\\' stroke-width=\\'2\\'><rect width=\\'18\\' height=\\'18\\' x=\\'3\\' y=\\'3\\' rx=\\'2\\'/><circle cx=\\'9\\' cy=\\'9\\' r=\\'2\\'/><path d=\\'m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\\'/></svg>';" />
          </a>
        </div>`;
      } else if (details && details.photos.length === 0) {
        photoHTML = `<div style="margin-top:8px;font-size:11px;color:#94a3b8;text-align:center;padding:12px;border-top:1px dashed #cbd5e1;">
          Sin foto registrada
        </div>`;
      }

      return `<div style="font-family:sans-serif;min-width:320px;max-width:380px;">
        <div style="border-bottom:2px solid #2563eb;padding-bottom:4px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
          <b style="color:#2563eb;font-size:14px;">Servicios Públicos (${yearLabel})</b>
          <span style="background:#2563eb;color:white;font-size:9px;padding:2px 6px;border-radius:4px;font-weight:bold;">Folio: ${p.originalId || '—'}</span>
        </div>
        <div style="font-size:12px;color:#475569;margin-bottom:6px;line-height:1.4;">
          <b>Ubicación:</b> ${street}
        </div>
        ${photoHTML}
      </div>`;
    }

    const dateStr = p.date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
    let photosHTML = '';
    if (isLoading) {
      photosHTML = `<div style="margin-top:8px;font-size:11px;color:#4b5563;text-align:center;padding:8px 4px;border-top:1px dashed #cbd5e1;background:#f8fafc;border-radius:4px;">
        <span style="display:inline-block;animation:pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;">⏳ Cargando detalles y fotos...</span>
      </div>`;
    } else if (details && details.photos.length > 0) {
      photosHTML = `<div style="margin-top:10px;border-top:1px dashed #cbd5e1;padding-top:8px;">
        <b style="font-size:11px;color:#475569;display:block;margin-bottom:6px;">Evidencia fotográfica (${details.photos.length}):</b>
        <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:6px;max-height:180px;overflow-y:auto;padding-right:2px;">
          ${details.photos.map((url, i) => `
            <a href="${url}" target="_blank" rel="noopener noreferrer" style="display:block;">
              <img src="${url}" style="width:100%;height:80px;object-fit:cover;border-radius:6px;border:1px solid #cbd5e1;cursor:pointer;transition:transform 0.2s;" 
                   alt="Foto ${i+1}" 
                   onmouseover="this.style.transform='scale(1.05)'"
                   onmouseout="this.style.transform='scale(1)'"
                   onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'50\\' height=\\'50\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'%2394a3b8\\' stroke-width=\\'2\\'><rect width=\\'18\\' height=\\'18\\' x=\\'3\\' y=\\'3\\' rx=\\'2\\'/><circle cx=\\'9\\' cy=\\'9\\' r=\\'2\\'/><path d=\\'m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\\'/></svg>';" />
            </a>
          `).join('')}
        </div>
      </div>`;
    } else if (details && details.photos.length === 0) {
      photosHTML = `<div style="margin-top:8px;font-size:11px;color:#94a3b8;text-align:center;padding:4px;border-top:1px dashed #cbd5e1;">
        Sin fotos registradas
      </div>`;
    }

    return `<div style="font-family:sans-serif;min-width:320px;max-width:380px;">
      <div style="border-bottom:2px solid #16a34a;padding-bottom:4px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
        <b style="color:#16a34a;font-size:14px;">Bacheo Ejecutado</b>
        ${p.stage ? `<span style="background:#16a34a;color:white;font-size:9px;padding:2px 6px;border-radius:4px;font-weight:bold;">Etapa ${p.stage}</span>` : ''}
      </div>
      <div style="font-size:13px;margin-bottom:4px;line-height:1.4;">
        <b>Folio:</b> ${p.originalId || '—'}<br/>
        <b>Calle:</b> ${street}<br/>
        <b>Colonia:</b> ${colonia || '—'}<br/>
        <b>Delegación:</b> ${delegation}
      </div>
      <div style="background:#f0fdf4;padding:8px;border-radius:6px;font-size:12px;border-left:3px solid #16a34a;margin-top:6px;">
        <b>Fecha:</b> ${dateStr}<br/>
        <b>Área:</b> ${p.m2?.toFixed(2) ?? '—'} m²
      </div>
      ${photosHTML}
    </div>`;
  }

  const reportStr = (p.reportDate || p.date).toLocaleDateString();
  const resolvedStr = p.resolvedDate ? p.resolvedDate.toLocaleDateString() : 'Pendiente';
  return `<div style="font-family:sans-serif;min-width:150px;">
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
  </div>`;
}

/**
 * Generates a stable unique key for each data point.
 * Used to diff previous vs current dataset for incremental updates.
 */
function getKey(p: PotholeData): string {
  return `${p.lat}_${p.lng}_${p.originalId || ''}_${p.status}`;
}

export default function MarkerClusterGroup({ data, clusterColor }: Props) {
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  // --- INCREMENTAL UPDATE CACHES ---
  const markerCacheRef = useRef<Map<string, L.CircleMarker>>(new Map());
  const dataCacheRef = useRef<Map<string, PotholeData>>(new Map());
  const prevKeysRef = useRef<Set<string>>(new Set());

  // Create cluster group once
  useEffect(() => {
    const baseColor = clusterColor || '#e63946';

    const clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      chunkInterval: 200,
      chunkDelay: 50,
      animate: false,
      animateAddingMarkers: false,
      removeOutsideVisibleBounds: true,
      disableClusteringAtZoom: 18,
      maxClusterRadius: 80,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let size = 38;
        if (count > 5000) size = 62;
        else if (count > 1000) size = 54;
        else if (count > 100) size = 46;

        const label = count > 9999
          ? (count / 1000).toFixed(0) + 'k'
          : count > 999
            ? (count / 1000).toFixed(1) + 'k'
            : count;

        return L.divIcon({
          html: `<div class="custom-marker-cluster" style="width:${size}px;height:${size}px;font-size:11px;background:${baseColor};">${label}</div>`,
          className: '',
          iconSize: L.point(size, size)
        });
      }
    });

    // --- DELEGATED POPUP: single click handler for all markers ---
    clusterGroup.on('click', (e: any) => {
      const marker = e.layer;
      if (!marker) return;

      const key = marker.options._dataKey;
      if (!key) return;

      const pData = dataCacheRef.current.get(key);
      if (!pData) return;

      if (marker._popupBound) {
        marker.openPopup();
        return;
      }

      if (pData.status === 'EJECUTADO' && pData.id.startsWith('db-')) {
        // Bind loading popup
        marker.bindPopup(buildPopupContent(pData, undefined, true), { maxWidth: 400 });
        marker._popupBound = true;
        marker.openPopup();

        // Fetch details on demand
        fetchPotholeDetails(pData.id).then((details) => {
          marker.setPopupContent(buildPopupContent(pData, details, false));
        }).catch((err) => {
          console.error("Error fetching details:", err);
          marker.setPopupContent(buildPopupContent(pData, undefined, false));
        });
      } else {
        // Bind standard popup
        marker.bindPopup(buildPopupContent(pData), { maxWidth: 380 });
        marker._popupBound = true;
        marker.openPopup();
      }
    });

    clusterGroupRef.current = clusterGroup;
    map.addLayer(clusterGroup);

    // On clusterColor change, flush caches
    return () => {
      clusterGroup.off('click');
      map.removeLayer(clusterGroup);
      markerCacheRef.current.clear();
      dataCacheRef.current.clear();
      prevKeysRef.current.clear();
    };
  }, [map, clusterColor]);

  // --- INCREMENTAL DATA UPDATE ---
  // Instead of clearLayers + addLayers(ALL), we diff old vs new and
  // only add/remove the DELTA.  During forward playback this is ~200 points
  // instead of ~40,000 — roughly a 200x speedup per tick.
  useEffect(() => {
    const clusterGroup = clusterGroupRef.current;
    if (!clusterGroup) return;

    const cache = markerCacheRef.current;
    const dataCache = dataCacheRef.current;
    const prevKeys = prevKeysRef.current;

    // Build the set of keys that SHOULD be visible right now
    const currentKeys = new Set<string>();
    const dataByKey = new Map<string, PotholeData>();

    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      if (!p.lat || !p.lng || isNaN(p.lat) || isNaN(p.lng) || p.lat === 0) continue;
      const key = getKey(p);
      currentKeys.add(key);
      dataByKey.set(key, p);
    }

    // --- Phase 1: Find markers to ADD (in current but NOT in previous) ---
    const toAdd: L.CircleMarker[] = [];
    for (const key of currentKeys) {
      if (!prevKeys.has(key)) {
        const p = dataByKey.get(key)!;

        let color = '#e63946';
        if (p.status === 'EJECUTADO') {
          color = p.stage === 101 ? '#2563eb' : '#16a34a';
        } else if (p.status === 'HISTORICO') {
          color = '#ff9f1c';
        }

        const marker = L.circleMarker([p.lat, p.lng], {
          radius: 5,
          fillColor: color,
          color: '#fff',
          weight: 1,
          fillOpacity: 0.85,
          bubblingMouseEvents: false,
          _dataKey: key
        } as any);

        cache.set(key, marker);
        dataCache.set(key, p);
        toAdd.push(marker);
      }
    }

    // --- Phase 2: Find markers to REMOVE (in previous but NOT in current) ---
    const toRemove: L.CircleMarker[] = [];
    for (const key of prevKeys) {
      if (!currentKeys.has(key)) {
        const marker = cache.get(key);
        if (marker) {
          toRemove.push(marker);
          cache.delete(key);
          dataCache.delete(key);
        }
      }
    }

    // --- Phase 3: Apply ONLY the delta ---
    if (toRemove.length > 0) {
      clusterGroup.removeLayers(toRemove);
    }
    if (toAdd.length > 0) {
      clusterGroup.addLayers(toAdd);
    }

    // Update the reference set for the next tick
    prevKeysRef.current = currentKeys;

  }, [data]);

  return null;
}
