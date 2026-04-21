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
 * This avoids creating 46,000 DOM string objects upfront.
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

export default function MarkerClusterGroup({ data, clusterColor }: Props) {
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  // Store data references keyed by a unique marker id for lazy popup lookup
  const dataMapRef = useRef<Map<number, PotholeData>>(new Map());
  const markerIdCounter = useRef(0);

  // Create cluster group once
  useEffect(() => {
    const baseColor = clusterColor || '#e63946';

    const clusterGroup = L.markerClusterGroup({
      // --- PERFORMANCE SETTINGS ---
      chunkedLoading: true,
      chunkInterval: 200,
      chunkDelay: 50,

      animate: false,
      animateAddingMarkers: false,
      removeOutsideVisibleBounds: true,
      disableClusteringAtZoom: 18,  // At max zoom, show individual markers (no clustering overhead)

      maxClusterRadius: 80,  // Larger radius = fewer clusters = faster rendering

      // Spiderfy settings for dense areas
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,  // Disable the polygon outline on hover (saves CPU)

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

      const uid = marker.options._dataUid;
      if (uid === undefined) return;

      const pData = dataMapRef.current.get(uid);
      if (!pData) return;

      // Build popup content on-demand (lazy)
      marker.bindPopup(buildPopupContent(pData), { maxWidth: 220 });
      marker._popupBound = true;
      marker.openPopup();
    });

    clusterGroupRef.current = clusterGroup;
    map.addLayer(clusterGroup);

    return () => {
      clusterGroup.off('click');
      map.removeLayer(clusterGroup);
    };
  }, [map, clusterColor]);

  // Rebuild markers when data changes
  useEffect(() => {
    const clusterGroup = clusterGroupRef.current;
    if (!clusterGroup) return;

    clusterGroup.clearLayers();
    dataMapRef.current.clear();
    markerIdCounter.current = 0;

    if (data.length === 0) return;

    // --- VIEWPORT CULLING ---
    // Get current map bounds with a generous buffer (50% extra on each side)
    // so that panning slightly doesn't cause a full rebuild.
    const bounds = map.getBounds();
    const latBuffer = (bounds.getNorth() - bounds.getSouth()) * 0.5;
    const lngBuffer = (bounds.getEast() - bounds.getWest()) * 0.5;
    const north = bounds.getNorth() + latBuffer;
    const south = bounds.getSouth() - latBuffer;
    const east = bounds.getEast() + lngBuffer;
    const west = bounds.getWest() - lngBuffer;

    // At zoom >= 14 (city-level), apply viewport culling
    // At lower zooms (overview), show everything (clusters handle it well)
    const zoom = map.getZoom();
    const shouldCull = zoom >= 14;

    const markers: L.CircleMarker[] = [];
    const localDataMap = dataMapRef.current;

    for (let i = 0; i < data.length; i++) {
      const p = data[i];
      if (!p.lat || !p.lng || isNaN(p.lat) || isNaN(p.lng) || p.lat === 0) continue;

      // Viewport culling: skip points outside the padded bounds
      if (shouldCull) {
        if (p.lat < south || p.lat > north || p.lng < west || p.lng > east) continue;
      }

      let color = '#e63946';
      if (p.status === 'EJECUTADO') color = '#16a34a';
      else if (p.status === 'HISTORICO') color = '#ff9f1c';

      const uid = markerIdCounter.current++;

      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 5,
        fillColor: color,
        color: '#fff',
        weight: 1,
        fillOpacity: 0.85,
        bubblingMouseEvents: false,
        _dataUid: uid  // lightweight ref instead of full popup object
      } as any);

      // Store data reference — only a Map entry, no popup DOM created
      localDataMap.set(uid, p);
      markers.push(marker);
    }

    clusterGroup.addLayers(markers);
  }, [data, map]);

  return null;
}
