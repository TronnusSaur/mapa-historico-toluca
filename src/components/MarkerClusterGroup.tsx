import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import type { PotholeData } from '../utils/dataProcessors.ts';

interface Props {
  data: PotholeData[];
  clusterColor?: string;
}

/**
 * Generates popup HTML on-demand (only when a marker is clicked).
 */
function buildPopupContent(p: PotholeData): string {
  if (p.status === 'EJECUTADO') {
    const dateStr = p.date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
    return `<div style="font-family:sans-serif;min-width:170px;">
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
  // These persist across renders so we can diff instead of full-rebuild.
  const markerCacheRef = useRef<Map<string, L.CircleMarker>>(new Map());
  const dataCacheRef = useRef<Map<string, PotholeData>>(new Map());
  const prevKeysRef = useRef<Set<string>>(new Set());

  // Create cluster group once (only recreated if clusterColor changes)
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
      if (!marker || marker._popupBound) return;

      const key = marker.options._dataKey;
      if (!key) return;

      const pData = dataCacheRef.current.get(key);
      if (!pData) return;

      marker.bindPopup(buildPopupContent(pData), { maxWidth: 220 });
      marker._popupBound = true;
      marker.openPopup();
    });

    clusterGroupRef.current = clusterGroup;
    map.addLayer(clusterGroup);

    // On clusterColor change, flush caches (full rebuild needed)
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
        if (p.status === 'EJECUTADO') color = '#16a34a';
        else if (p.status === 'HISTORICO') color = '#ff9f1c';

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
