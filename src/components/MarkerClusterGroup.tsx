import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import type { PotholeData } from '../utils/dataProcessors.ts';

interface Props {
  data: PotholeData[];
}

export default function MarkerClusterGroup({ data }: Props) {
  const map = useMap();
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    // Initialize cluster group with custom aesthetics
    const clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let size = '40px';
        if (count > 1000) size = '60px';
        else if (count > 100) size = '50px';

        return L.divIcon({
          html: `<div class="custom-marker-cluster" style="width: ${size}; height: ${size}; font-size: 12px;">${count}</div>`,
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
  }, [map]);

  useEffect(() => {
    if (!clusterGroupRef.current) return;

    const clusterGroup = clusterGroupRef.current;
    clusterGroup.clearLayers();

    // Create markers for data
    // We only add a subset or use optimization for 50k
    const markers = data.map(p => {
      // Color logic: Dynamic tickets are red
      let color = '#e63946'; 
      if (p.status === 'HISTORICO') color = '#ff9f1c';

      if (p.status === 'EJECUTADO') return null;

      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 6,
        fillColor: color,
        color: '#fff',
        weight: 1,
        fillOpacity: 0.9
      });

      const reportStr = (p.reportDate || p.date).toLocaleDateString();
      const resolvedStr = p.resolvedDate ? p.resolvedDate.toLocaleDateString() : 'Pendiente';

      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 150px;">
          <div style="border-bottom: 2px solid #7a1531; padding-bottom: 4px; margin-bottom: 6px;">
            <b style="color: #7a1531; font-size: 14px;">Ticket: ${p.originalId}</b>
          </div>
          <div style="font-size: 12px; margin-bottom: 4px;">
            <b>Calle:</b> ${p.street || 'S/N'}<br/>
            <b>Región:</b> ${p.delegation || 'Toluca'}
          </div>
          <div style="background: #f8fafc; padding: 6px; border-radius: 6px; font-size: 11px; border-left: 3px solid #e63946;">
            <b>Reportado:</b> ${reportStr}<br/>
            <b>Resuelto:</b> <span style="color: ${p.resolvedDate ? '#16a34a' : '#e63946'}; font-weight: bold;">${resolvedStr}</span>
          </div>
        </div>
      `);

      return marker;
    }).filter(m => m !== null) as L.CircleMarker[];

    clusterGroup.addLayers(markers);

  }, [data]);

  return null;
}
