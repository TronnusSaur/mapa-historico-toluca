import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

// Ensure global window.L exists so leaflet.heat can attach to it cleanly
if (typeof window !== 'undefined') {
  (window as any).L = L;
}
import 'leaflet.heat';

interface HeatmapLayerProps {
  points: [number, number, number][]; // [lat, lng, intensity]
  visible: boolean;
  radius?: number;
  blur?: number;
  maxZoom?: number;
  minOpacity?: number;
}

export const HeatmapLayer: React.FC<HeatmapLayerProps> = React.memo(({
  points,
  visible,
  radius = 30,
  blur = 20,
  maxZoom = 17,
  minOpacity = 0.25
}) => {
  const map = useMap();
  const heatLayerRef = useRef<any>(null);

  useEffect(() => {
    // If not visible or no points, remove layer if present
    if (!visible || !points || points.length === 0) {
      if (heatLayerRef.current && map.hasLayer(heatLayerRef.current)) {
        map.removeLayer(heatLayerRef.current);
      }
      return;
    }

    // If layer already exists on map, update points dynamically without recreating canvas
    if (heatLayerRef.current && map.hasLayer(heatLayerRef.current)) {
      heatLayerRef.current.setLatLngs(points);
      return;
    }

    try {
      // Create heatmap layer with custom thermal gradient
      const layer = (L as any).heatLayer(points, {
        radius,
        blur,
        maxZoom,
        minOpacity,
        gradient: {
          0.15: '#2563eb', // Indigo / Azul
          0.35: '#06b6d4', // Cian
          0.55: '#10b981', // Verde
          0.70: '#f59e0b', // Ámbar / Amarillo
          0.85: '#f97316', // Naranja intenso
          1.00: '#dc2626'  // Rojo fuego crítico
        }
      });

      layer.addTo(map);
      heatLayerRef.current = layer;
    } catch (err) {
      console.error('Error initializing Leaflet.heat layer:', err);
    }

    return () => {
      if (heatLayerRef.current && map.hasLayer(heatLayerRef.current)) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, visible, points, radius, blur, maxZoom, minOpacity]);

  return null;
});
