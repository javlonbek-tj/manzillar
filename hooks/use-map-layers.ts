'use client';
import { useRef, useCallback } from 'react';
import L from 'leaflet';
import type { Map as LeafletMap, GeoJSON } from 'leaflet';
import * as turf from '@turf/turf';

export function useMapLayers(map: LeafletMap | null) {
  const layersRef = useRef<{
    regions?: GeoJSON;
    districts?: GeoJSON;
    mahallas?: GeoJSON;
    streets?: GeoJSON;
    streetPolygons?: GeoJSON;
    property?: GeoJSON;
  }>({});

  const clearLayer = useCallback((layerName: keyof typeof layersRef.current) => {
    if (layersRef.current[layerName] && map) {
      map.removeLayer(layersRef.current[layerName]!);
      delete layersRef.current[layerName];
    }
  }, [map]);

  const clearLayers = useCallback((layerNames: (keyof typeof layersRef.current)[]) => {
    layerNames.forEach(name => clearLayer(name));
  }, [clearLayer]);

  const clearAllLayers = useCallback(() => {
    Object.keys(layersRef.current).forEach((key) => clearLayer(key as any));
  }, [clearLayer]);

  const zoomToGeometry = useCallback((geometry: any) => {
    if (!map || !geometry) return;
    try {
      const bbox = turf.bbox(geometry);
      const bounds = L.latLngBounds([bbox[1], bbox[0]], [bbox[3], bbox[2]]);
      map.fitBounds(bounds, { padding: [40, 40], animate: true });
    } catch (e) {
      console.error("Zoom failed", e);
    }
  }, [map]);

  const renderLayer = useCallback((
    layerName: keyof typeof layersRef.current,
    data: any[],
    style: any | ((feature: any) => any),
    onEachFeature?: (feature: any, layer: any) => void,
    labelProp?: string,
    tooltipClassName?: string,
    bringToFront?: boolean,
    pane?: string
  ) => {
    if (!map) return null;
    
    // Clear the existing layer synchronously
    clearLayer(layerName);
    
    if (!data || data.length === 0) return null;

    const geoJsonData = {
      type: 'FeatureCollection',
      features: data.map(item => ({
        type: 'Feature',
        properties: { ...item, geometry: undefined },
        geometry: item.geometry
      }))
    };

    const newLayer = L.geoJSON(geoJsonData as any, {
      style,
      pane: pane || 'overlayPane', // Default to Leaflet's overlayPane
      onEachFeature: (feature, layer) => {
        // Add permanent label if requested
        if (labelProp && feature.properties[labelProp]) {
          layer.bindTooltip(feature.properties[labelProp], {
            permanent: true,
            direction: 'center',
            className: `map-label-tooltip ${tooltipClassName || ''}`,
            offset: [0, 0],
            pane: 'tooltipPane' // Tooltips should always be above interactive layers
          });
        }
        
        // Call original onEachFeature if provided
        if (onEachFeature) onEachFeature(feature, layer);
      }
    }).addTo(map);

    if (bringToFront) {
      newLayer.bringToFront();
    }
    
    layersRef.current[layerName] = newLayer;
    return newLayer;
  }, [map, clearLayer]);

  const setLayerStyle = useCallback((
    layerName: keyof typeof layersRef.current,
    styleFn: (feature: any) => any
  ) => {
    const layer = layersRef.current[layerName];
    if (layer) {
      layer.setStyle(styleFn);
    }
  }, []);

  return {
    renderLayer,
    setLayerStyle,
    clearLayer,
    clearLayers,
    clearAllLayers,
    zoomToGeometry,
  };
}
