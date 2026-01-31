'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useMapEvents, Polyline, Polygon, Marker, Tooltip, CircleMarker } from 'react-leaflet';
import * as turf from '@turf/turf';
import L from 'leaflet';
import { MeasureMode } from './map-controls';

interface MeasurementToolProps {
  mode: MeasureMode;
  onModeChange: (mode: MeasureMode) => void;
}

export const MeasurementTool = ({ mode, onModeChange }: MeasurementToolProps) => {
  const [points, setPoints] = useState<L.LatLng[]>([]);
  const [mousePos, setMousePos] = useState<L.LatLng | null>(null);

  // Reset points when mode changes
  useEffect(() => {
    setPoints([]);
    setMousePos(null);
  }, [mode]);

  const map = useMapEvents({
    click(e) {
      if (!mode) return;
      setPoints((prev) => [...prev, e.latlng]);
    },
    mousemove(e) {
      if (!mode || points.length === 0) return;
      setMousePos(e.latlng);
    },
    contextmenu() {
      if (!mode) return;
      if (points.length > 0) {
        setPoints([]);
        setMousePos(null);
      } else {
        onModeChange(null);
      }
    }
  });

  const calculation = useMemo(() => {
    if (points.length < 2) return null;

    const coordinates = points.map(p => [p.lng, p.lat]);
    
    if (mode === 'distance') {
      const line = turf.lineString(coordinates as any);
      const distance = turf.length(line, { units: 'kilometers' });
      return {
        value: distance > 1 ? `${distance.toFixed(2)} km` : `${(distance * 1000).toFixed(0)} m`,
        type: 'distance'
      };
    }

    if (mode === 'area' && points.length >= 3) {
      // Close the polygon for turf
      const polygonCoords = [...coordinates, coordinates[0]];
      const polygon = turf.polygon([polygonCoords] as any);
      const area = turf.area(polygon);
      return {
        value: area > 1000000 
          ? `${(area / 1000000).toFixed(2)} km²` 
          : `${area.toFixed(0)} m²`,
        type: 'area'
      };
    }

    return null;
  }, [points, mode]);

  const linePoints = useMemo(() => {
    if (!mousePos || points.length === 0) return points;
    return [...points, mousePos];
  }, [points, mousePos]);

  if (!mode || points.length === 0) return null;

  return (
    <>
      {mode === 'distance' && (
        <Polyline 
          positions={linePoints} 
          pathOptions={{ 
            color: '#10b981', 
            weight: 3, 
            dashArray: '5, 10',
            lineCap: 'round'
          }} 
        />
      )}

      {mode === 'area' && (
        <Polygon 
          positions={linePoints} 
          pathOptions={{ 
            color: '#10b981', 
            fillColor: '#10b981', 
            fillOpacity: 0.2, 
            weight: 2,
            dashArray: '5, 5'
          }} 
        />
      )}

      {points.map((point, idx) => (
        <CircleMarker
          key={`point-${idx}`}
          center={point}
          radius={4}
          pathOptions={{
            fillColor: '#ffffff',
            fillOpacity: 1,
            color: '#10b981',
            weight: 2
          }}
        />
      ))}

      {calculation && (
        <Marker 
          position={points[points.length - 1]} 
          icon={L.divIcon({ className: 'hidden' })}
        >
          <Tooltip 
            permanent 
            direction="top" 
            offset={[0, -10]}
            className="measurement-tooltip"
          >
            <div className="flex flex-col items-center gap-0.5 px-2 py-1 bg-white dark:bg-slate-800 rounded shadow-lg border border-emerald-200 dark:border-emerald-800">
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">
                {mode === 'distance' ? 'Masofa' : 'Maydon'}
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                {calculation.value}
              </span>
              <span className="text-[9px] text-slate-400">
                O'chirish uchun o'ng tugmani bosing
              </span>
            </div>
          </Tooltip>
        </Marker>
      )}
    </>
  );
};
