'use client';

import { MapContainer } from './map-container';
import { GeoJSON } from 'react-leaflet';

export default function DetailMap({ geometry }: { geometry: any }) {
  if (!geometry) return <div className="h-full flex items-center justify-center bg-muted text-muted-foreground">Geometriya mavjud emas</div>;

  return (
    <div id="mahalla-detail-map-container" className="h-full w-full">
      <MapContainer
        tileUrl="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        focusGeometry={geometry}
        className="h-full w-full"
      >
        <GeoJSON 
          data={geometry} 
          style={{ color: '#2563eb', weight: 3, fillOpacity: 0.2 }} 
        />
      </MapContainer>
    </div>
  );
}
