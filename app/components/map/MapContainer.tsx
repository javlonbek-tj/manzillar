'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import type { Map as LeafletMap } from 'leaflet';

interface Props {
  className?: string;
}

export const MapContainer = ({ className }: Props) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      const map = L.map(mapRef.current!).setView([41.377491, 64.585262], 6);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return <div ref={mapRef} className={className} />;
};
