import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Tramo } from '../utils/dataProcessors.ts';

interface TramosLayerProps {
  tramos: Tramo[];
  visible: boolean;
  color?: string;
  weight?: number;
  opacity?: number;
}

/**
 * High-performance Bacheo Tramos layer.
 * Instead of mounting thousands of individual GeoJSON <path> layers which freezes
 * Leaflet during pan and zoom, this component compiles all tramos into a SINGLE
 * Leaflet MultiPolyline rendered directly onto the hardware-accelerated Canvas.
 */
export const TramosLayer: React.FC<TramosLayerProps> = React.memo(({
  tramos,
  visible,
  color = '#16a34a',
  weight = 4,
  opacity = 0.65
}) => {
  const map = useMap();
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    // If hidden or empty, cleanly remove layer
    if (!visible || !tramos || tramos.length === 0) {
      if (polylineRef.current && map.hasLayer(polylineRef.current)) {
        map.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }
      return;
    }

    // Extract array of coordinates: LatLng[][]
    const multiCoords: [number, number][][] = tramos.map(t => t.coords);

    if (polylineRef.current && map.hasLayer(polylineRef.current)) {
      // Fast in-place coordinate update without recreating layer
      polylineRef.current.setLatLngs(multiCoords);
      polylineRef.current.setStyle({ color, weight, opacity });
    } else {
      // Create a single MultiPolyline layer
      const polyline = L.polyline(multiCoords, {
        color,
        weight,
        opacity,
        smoothFactor: 1.2, // Fast Douglas-Peucker simplification for 60 FPS
        interactive: false // Disable per-segment DOM hit detection across 4,000+ lines
      });
      polyline.addTo(map);
      polylineRef.current = polyline;
    }

    return () => {
      if (polylineRef.current && map.hasLayer(polylineRef.current)) {
        map.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }
    };
  }, [map, visible, tramos, color, weight, opacity]);

  return null;
});
