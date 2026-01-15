'use client';

import { useEffect } from 'react';
import { MapContainer as RLMapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as turf from '@turf/turf';
import L from 'leaflet';

interface Props {
  className?: string;
  focusGeometry?: any;
  onMapReady?: (map: L.Map) => void;
  children?: React.ReactNode;
  tileUrl: string;
  attribution: string;
  maxZoom?: number;
}

// Sub-component to sync map instance and limits with parent
function MapEventListener({ onMapReady, maxZoom }: { onMapReady?: (map: L.Map) => void; maxZoom?: number }) {
  const map = useMap();
  
  useEffect(() => {
    if (onMapReady) onMapReady(map);
  }, [map, onMapReady]);

  // Syncing maxZoom ensures manual scrolling is also capped
  useEffect(() => {
    if (maxZoom) {
      map.setMaxZoom(maxZoom + 1); // Allow one level of over-zoom for better label visibility
    }
  }, [map, maxZoom]);

  return null;
}

// Sub-component to handle map effects like zooming to geometry
function MapController({ focusGeometry, maxZoom }: { focusGeometry: any; maxZoom?: number }) {
  const map = useMap();

  useEffect(() => {
    if (!focusGeometry) return;

    try {
      const bbox = turf.bbox(focusGeometry);
      const southwest = L.latLng(bbox[1], bbox[0]);
      const northeast = L.latLng(bbox[3], bbox[2]);
      const bounds = L.latLngBounds(southwest, northeast);

      map.fitBounds(bounds, {
        padding: [40, 40],
        animate: true,
        duration: 1,
        // Capping automatic zoom to prevent "data not available"
        maxZoom: maxZoom || 17,
      });
    } catch (error) {
      console.error('Error zooming to geometry:', error);
    }
  }, [focusGeometry, map, maxZoom]);

  return null;
}

export const MapContainer = ({ 
  className, 
  focusGeometry, 
  onMapReady, 
  children,
  tileUrl,
  attribution,
  maxZoom = 17
}: Props) => {
  return (
    <RLMapContainer
      center={[41.377491, 64.585262]}
      zoom={6}
      className={className}
      zoomControl={true}
      maxZoom={maxZoom + 1} // One level above native to allow scaling
    >
      <TileLayer
        url={tileUrl}
        attribution={attribution}
        maxNativeZoom={maxZoom} // CRITICAL: Stop requesting tiles at this level
        maxZoom={maxZoom + 1}   // Scale tiles visually instead of showing error
        crossOrigin="anonymous"
      />
      
      <MapEventListener onMapReady={onMapReady} maxZoom={maxZoom} />
      <MapController focusGeometry={focusGeometry} maxZoom={maxZoom} />
      {children}
    </RLMapContainer>
  );
};
