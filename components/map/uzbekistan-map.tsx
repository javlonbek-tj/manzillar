'use client';
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { MapContainer } from './map-container';
import { MapFilters } from './map-filters';
import { MapControls } from './map-controls';
import { MahallaPopup } from './mahalla-popup';
import { StreetPopup } from './street-popup';
import { PropertyPopup } from './property-popup';
import { MapStatistics } from './map-statistics';
import { useMapFilters } from '@/hooks/use-map-filters';
import { useMapLayers } from '@/hooks/use-map-layers';
import { MAP_LEVEL_STYLES } from '@/constants/map-styles';
import { baseMaps, type BaseMapKey } from '@/services/baseMaps';
import { getGlobalStatistics, getRegionStatistics, getDistrictStatistics } from '@/lib/data';
import type { RegionData, PropertyData } from '@/types/map';
import L from 'leaflet';
import type { Map as LeafletMap } from 'leaflet';
import { useMapEvents, Popup, Marker, Polyline, FeatureGroup } from 'react-leaflet';
import { LayoutDashboard, Map as MapIcon, Navigation, Home, Waypoints, Loader2, CaseSensitive } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import * as turf from '@turf/turf';
import { AddressGenerationDialog } from './address-generation-dialog';
import { generatePolygonAddressing, type AddressPoint, type CrossLine } from '@/lib/address-generator';
import type { LineString } from 'geojson';

// Component to handle zoom-dependent classes
const MapZoomListener = ({ onChange }: { onChange: (zoom: number) => void }) => {
  const map = useMapEvents({
    zoomend: () => {
      onChange(map.getZoom());
    },
  });
  return null;
};

const UzbekistanMap = ({ initialRegions }: { initialRegions: RegionData[] }) => {
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
  const [zoomLevel, setZoomLevel] = useState(6);
  const [currentBaseMap, setCurrentBaseMap] = useState<BaseMapKey>('osm');
  const [showMahallaPopup, setShowMahallaPopup] = useState(false);
  const [showStreetPopup, setShowStreetPopup] = useState(false);
  const [showPropertyPopup, setShowPropertyPopup] = useState(false);
  const [streetPopupPos, setStreetPopupPos] = useState<L.LatLng | null>(null);
  const [propertyPopupPos, setPropertyPopupPos] = useState<L.LatLng | null>(null);
  const [selectedPropertyData, setSelectedPropertyData] = useState<any>(null);
  const [streetDetails, setStreetDetails] = useState<{
    name: string;
    type?: string;
    length?: number;
    startPoint?: { lat: number; lng: number };
    endPoint?: { lat: number; lng: number };
    direction?: number; // bearing in degrees
  } | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(false);
  const [streetPolygons, setStreetPolygons] = useState<any[]>([]);
  const [selectedStreetPolygon, setSelectedStreetPolygon] = useState<string>("");
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [selectedPolygonForAddressing, setSelectedPolygonForAddressing] = useState<any>(null);
  const [generatedCrossLines, setGeneratedCrossLines] = useState<CrossLine[]>([]);
  const [generatedAddresses, setGeneratedAddresses] = useState<AddressPoint[]>([]);
  const propertyLabelsRef = React.useRef<L.LayerGroup>(L.layerGroup());
  
  const filterState = useMapFilters();
  const { renderLayer, setLayerStyle, clearLayer, clearLayers, zoomToGeometry } = useMapLayers(mapInstance);

  // Fetch Statistics based on selection
  useEffect(() => {
    const fetchStats = async () => {
      if (filterState.selectedDistrict) {
        const stats = await getDistrictStatistics(filterState.selectedDistrict);
        setStatistics(stats);
      } else if (filterState.selectedRegion) {
        const stats = await getRegionStatistics(filterState.selectedRegion);
        setStatistics(stats);
      } else {
        const stats = await getGlobalStatistics();
        setStatistics(stats);
      }
    };
    fetchStats();
  }, [filterState.selectedRegion, filterState.selectedDistrict]);

  // Map statistics to display format
  const displayStats = useMemo(() => {
    if (!statistics) return [];
    
    const items = [];
    if (statistics.regions !== undefined) {
      items.push({ label: "Viloyatlar", value: statistics.regions, icon: MapIcon, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/20' });
    }
    if (statistics.districts !== undefined) {
      items.push({ label: "Tumanlar", value: statistics.districts, icon: Navigation, color: 'text-indigo-500', bgColor: 'bg-indigo-50 dark:bg-indigo-900/20' });
    }
    if (statistics.mahallas !== undefined && !filterState.selectedMahalla) {
      items.push({ label: "Mahallalar", value: statistics.mahallas, icon: Home, color: 'text-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' });
    }
    if (statistics.streets !== undefined) {
      // If mahalla is selected, use local streetCount from filterState
      const streetCount = filterState.selectedMahalla 
        ? filterState.streets.filter(s => s.mahallaId === filterState.mahallas.find(m => m.id === filterState.selectedMahalla)?.code).length
        : statistics.streets;
      items.push({ label: "Ko'chalar", value: streetCount, icon: Waypoints, color: 'text-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-900/20' });
    }
    return items;
  }, [statistics, filterState.selectedMahalla, filterState.streets, filterState.mahallas]);

  // Helper to calculate street details
  const calculateStreetDetails = useCallback((feature: any) => {
    const geometry = feature.geometry;
    if (!geometry || geometry.type !== 'LineString') return null;

    const coords = geometry.coordinates;
    const line = turf.lineString(coords);
    const length = turf.length(line, { units: 'meters' });
    
    const start = coords[0];
    const end = coords[coords.length - 1];
    
    // Calculate direction (bearing) of the last segment
    let bearing = 0;
    if (coords.length >= 2) {
      const p1 = turf.point(coords[coords.length - 2]);
      const p2 = turf.point(coords[coords.length - 1]);
      bearing = turf.bearing(p1, p2);
    }

    return {
      name: feature.properties.nameUz || '',
      type: feature.properties.type || '',
      length,
      startPoint: { lat: start[1], lng: start[0] },
      endPoint: { lat: end[1], lng: end[0] },
      direction: bearing
    };
  }, []);

  // Track initialization more reliably
  useEffect(() => {
    if (mapInstance && initialRegions.length > 0) {
      // 1. Initialize Map Panes for explicit stacking (Z-index)
      if (!mapInstance.getPane('regionsPane')) {
        const rPane = mapInstance.createPane('regionsPane');
        rPane.style.zIndex = '250';
        rPane.style.pointerEvents = 'none'; // Background only
      }
      if (!mapInstance.getPane('districtsPane')) {
        const dPane = mapInstance.createPane('districtsPane');
        dPane.style.zIndex = '300';
      }
      if (!mapInstance.getPane('mahallasPane')) {
        const mPane = mapInstance.createPane('mahallasPane');
        mPane.style.zIndex = '350';
      }
      if (!mapInstance.getPane('streetsPane')) {
        const sPane = mapInstance.createPane('streetsPane');
        sPane.style.zIndex = '400';
      }
      if (!mapInstance.getPane('streetPolygonsPane')) {
        const spPane = mapInstance.createPane('streetPolygonsPane');
        spPane.style.zIndex = '375'; // Between mahallas (350) and streets (400)
      }
      if (!mapInstance.getPane('propertiesPane')) {
        const pPane = mapInstance.createPane('propertiesPane');
        pPane.style.zIndex = '450';
      }

      // Small delay to ensure panes are rendered
      const timer = setTimeout(() => setIsInitializing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [mapInstance, initialRegions.length > 0]);

  // Refs for tracking selection inside event handlers (avoiding stale closures)
  const selectedMahallaRef = useRef(filterState.selectedMahalla);
  const selectedStreetRef = useRef(filterState.selectedStreet);
  const selectedPropertyRef = useRef(filterState.selectedProperty);
  const selectedStreetPolygonRef = useRef(selectedStreetPolygon);

  // Sync refs with state
  useEffect(() => {
    selectedMahallaRef.current = filterState.selectedMahalla;
  }, [filterState.selectedMahalla]);

  useEffect(() => {
    selectedStreetRef.current = filterState.selectedStreet;
  }, [filterState.selectedStreet]);

  useEffect(() => {
    selectedPropertyRef.current = filterState.selectedProperty;
  }, [filterState.selectedProperty]);

  useEffect(() => {
    selectedStreetPolygonRef.current = selectedStreetPolygon;
  }, [selectedStreetPolygon]);

  // Handle Property Labels (Simple zoom-based approach)
  const handlePropertyLabels = useCallback(() => {
    if (!mapInstance || !filterState.showPropertyLabels) {
      if (propertyLabelsRef.current) propertyLabelsRef.current.clearLayers();
      return;
    }

    const currentZoom = mapInstance.getZoom();
    const bounds = mapInstance.getBounds();

    if (currentZoom < 17) {
      propertyLabelsRef.current.clearLayers();
      return;
    }

    // Clear and redraw labels only for what's visible
    propertyLabelsRef.current.clearLayers();

    properties.forEach((prop) => {
      // Use center if available, otherwise geometry
      let latlng = null;
      
      if (prop.center) {
        // Handle different center formats
        if ((prop.center as any).lat !== undefined && (prop.center as any).lng !== undefined) {
          // Format: { lat: number, lng: number }
          latlng = L.latLng((prop.center as any).lat, (prop.center as any).lng);
        } else if ((prop.center as any).coordinates && Array.isArray((prop.center as any).coordinates)) {
          // Format: GeoJSON Point { type: "Point", coordinates: [lng, lat] }
          latlng = L.latLng((prop.center as any).coordinates[1], (prop.center as any).coordinates[0]);
        } else if ((prop.center as any).type === 'Point' && (prop.center as any).coordinates) {
          // Another GeoJSON Point format
          latlng = L.latLng((prop.center as any).coordinates[1], (prop.center as any).coordinates[0]);
        }
      } else if (prop.geometry && prop.geometry.type === 'Polygon') {
        // Fallback to first point of polygon
        latlng = L.latLng((prop.geometry.coordinates[0] as any)[0][1], (prop.geometry.coordinates[0] as any)[0][0]);
      }

      if (latlng && bounds.contains(latlng)) {
        if (prop.houseNumber) {
          const labelIcon = L.divIcon({
            className: 'property-label-icon',
            html: `<div class="property-label-text">${prop.houseNumber}</div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          L.marker(latlng, { 
            icon: labelIcon,
            interactive: false
          }).addTo(propertyLabelsRef.current);
        }
      }
    });

    if (!mapInstance.hasLayer(propertyLabelsRef.current)) {
      propertyLabelsRef.current.addTo(mapInstance);
    }
  }, [mapInstance, properties, filterState.showPropertyLabels]);

  // Sync labels on map move/zoom
  useEffect(() => {
    if (mapInstance) {
      mapInstance.on('moveend zoomend', handlePropertyLabels);
      handlePropertyLabels(); // Initial call
      return () => {
        mapInstance.off('moveend zoomend', handlePropertyLabels);
      };
    }
  }, [mapInstance, handlePropertyLabels]);

  // 1. Initial Load: Render Regions
  useEffect(() => {
    if (mapInstance && initialRegions.length > 0) {
      // Hide regions entirely if a district is selected
      if (filterState.selectedDistrict) {
        clearLayer('regions');
        return;
      }

      // If a region is selected, show only that one. Otherwise show all.
      const regionsToShow = filterState.selectedRegion 
        ? initialRegions.filter(r => r.id === filterState.selectedRegion)
        : initialRegions;

      renderLayer('regions', regionsToShow, 
        (feature: any) => 
          feature.properties.id === filterState.selectedRegion 
            ? MAP_LEVEL_STYLES.highlight.region 
            : MAP_LEVEL_STYLES.region,
        (feature: any, layer: any) => {
          layer.on({
            click: (e: any) => {
              L.DomEvent.stopPropagation(e);
              filterState.setSelectedRegion(feature.properties.id);
            },
            mouseover: (e: any) => {
              // Only change border if desired, but keep transparency
              e.target.setStyle({ weight: 4 });
            },
            mouseout: (e: any) => {
              const matches = feature.properties.id === filterState.selectedRegion;
              e.target.setStyle({ 
                weight: matches ? MAP_LEVEL_STYLES.highlight.region.weight : MAP_LEVEL_STYLES.region.weight
              });
            }
          });
          layer.getElement()?.style.setProperty('cursor', 'pointer');
        },
        undefined, 
        undefined, 
        false, 
        'regionsPane'
      );
    }
  }, [mapInstance, initialRegions, renderLayer, clearLayer, filterState.selectedRegion, filterState.selectedDistrict, filterState.setSelectedRegion]);

  // 2. When Region Selected -> Render Districts
  useEffect(() => {
    if (filterState.selectedRegion && filterState.districts.length > 0) {
      // Filter districts: if one is selected, show only that one. Otherwise show all.
      const districtsToShow = filterState.selectedDistrict 
        ? filterState.districts.filter(d => d.id === filterState.selectedDistrict)
        : filterState.districts;

      renderLayer('districts', districtsToShow, 
        (feature: any) => {
          const isSelected = feature.properties.id === filterState.selectedDistrict;
          if (currentBaseMap === 'satellite') {
            return isSelected ? MAP_LEVEL_STYLES.satellite.highlight.district : MAP_LEVEL_STYLES.satellite.district;
          }
          return isSelected ? MAP_LEVEL_STYLES.highlight.district : MAP_LEVEL_STYLES.district;
        },
        (feature: any, layer: any) => {
          layer.on({
            click: (e: any) => {
              L.DomEvent.stopPropagation(e);
              filterState.setSelectedDistrict(feature.properties.id);
            },
            mouseover: (e: any) => {
              e.target.setStyle({ weight: 4 });
            },
            mouseout: (e: any) => {
              const matches = feature.properties.id === filterState.selectedDistrict;
              if (currentBaseMap === 'satellite') {
                e.target.setStyle({ 
                  weight: matches ? MAP_LEVEL_STYLES.satellite.highlight.district.weight : MAP_LEVEL_STYLES.satellite.district.weight
                });
              } else {
                e.target.setStyle({ 
                  weight: matches ? MAP_LEVEL_STYLES.highlight.district.weight : MAP_LEVEL_STYLES.district.weight
                });
              }
            }
          });
          layer.getElement()?.style.setProperty('cursor', 'pointer');
        },
        'nameUz',
        undefined,
        false,
        'districtsPane'
      );
    } else if (!filterState.selectedRegion) {
      clearLayers(['districts', 'mahallas', 'streets']);
    }
  }, [filterState.selectedRegion, filterState.districts, filterState.selectedDistrict, renderLayer, zoomToGeometry, initialRegions, clearLayers, filterState.setSelectedDistrict, currentBaseMap]);

  // 3. When District Selected -> Render Mahallas AND Streets DATA
  useEffect(() => {
    if (filterState.selectedDistrict) {
      if (filterState.mahallas.length > 0) {
        renderLayer('mahallas', filterState.mahallas, 
          (feature: any) => {
            const isSelected = feature.properties.id === filterState.selectedMahalla;
            if (currentBaseMap === 'satellite') {
              return isSelected ? MAP_LEVEL_STYLES.satellite.highlight.mahalla : MAP_LEVEL_STYLES.satellite.mahalla;
            }
            return isSelected ? MAP_LEVEL_STYLES.highlight.mahalla : MAP_LEVEL_STYLES.mahalla;
          },
          (feature: any, layer: any) => {
            layer.on({
              click: (e: any) => {
                L.DomEvent.stopPropagation(e);
                filterState.setSelectedMahalla(feature.properties.id);
                setShowMahallaPopup(true);
              },
              mouseover: (e: any) => {
                const isSelected = feature.properties.id === selectedMahallaRef.current;
                if (!isSelected) {
                   e.target.setStyle(currentBaseMap === 'satellite' ? MAP_LEVEL_STYLES.satellite.highlight.mahalla : MAP_LEVEL_STYLES.highlight.mahalla);
                }
              },
              mouseout: (e: any) => {
                const isSelected = feature.properties.id === selectedMahallaRef.current;
                if (!isSelected) {
                   e.target.setStyle(currentBaseMap === 'satellite' ? MAP_LEVEL_STYLES.satellite.mahalla : MAP_LEVEL_STYLES.mahalla);
                }
              }
            });
            layer.getElement()?.style.setProperty('cursor', 'pointer');
          },
          'nameUz',
          undefined,
          false,
          'mahallasPane'
        );
      }

      // Render Streets at District level if available and showStreets is true
      if (filterState.streets.length > 0 && filterState.showStreets) {
        renderLayer('streets', filterState.streets, 
          (feature: any) => 
            feature.properties.id === filterState.selectedStreet 
              ? MAP_LEVEL_STYLES.highlight.street 
              : MAP_LEVEL_STYLES.street,
          (feature: any, layer: any) => {
            layer.on({
              click: (e: any) => {
                L.DomEvent.stopPropagation(e);
                // Apply highlight style immediately for instant feedback
                e.target.setStyle(MAP_LEVEL_STYLES.highlight.street);
                
                const details = calculateStreetDetails(feature);
                setStreetDetails(details);
                filterState.setSelectedStreet(feature.properties.id);
                setStreetPopupPos(e.latlng);
                setShowStreetPopup(true);
              },
              mouseover: (e: any) => {
                // Preview highlight on hover
                e.target.setStyle(MAP_LEVEL_STYLES.highlight.street);
              },
              mouseout: (e: any) => {
                // Return to normal style (or stay highlighted if selected)
                const isSelected = feature.properties.id === selectedStreetRef.current;
                e.target.setStyle(isSelected ? MAP_LEVEL_STYLES.highlight.street : MAP_LEVEL_STYLES.street);
              }
            });
            layer.getElement()?.style.setProperty('cursor', 'pointer');
          },
          (filterState.showStreets && filterState.showStreetLabels) ? 'nameUz' : undefined, 
          'street-label',
          true, // bringToFront
          'streetsPane'
        );
      } else if (filterState.streets.length > 0 && !filterState.showStreets) {
        // Clear streets layer when showStreets is false
        clearLayer('streets');
      }
      
      // Fetch street polygons when district changes
      const fetchStreetPolygons = async () => {
        try {
          const response = await fetch(`/api/street-polygons?districtId=${filterState.selectedDistrict}`);
          if (response.ok) {
            const data = await response.json();
            setStreetPolygons(data);
          }
        } catch (error) {
          console.error("Error fetching street polygons:", error);
        }
      };
      fetchStreetPolygons();

      // Fetch properties when district changes
      const fetchProperties = async () => {
        setIsLoadingProperties(true);
        try {
          const response = await fetch(`/api/properties?districtId=${filterState.selectedDistrict}`);
          if (response.ok) {
            const data = await response.json();
            setProperties(data);
          }
        } catch (error) {
          console.error("Error fetching properties:", error);
        } finally {
          setIsLoadingProperties(false);
        }
      };
      fetchProperties();
    } else {
      clearLayers(['mahallas', 'streets', 'streetPolygons']);
      setProperties([]);
      setStreetPolygons([]);
    }
    // Only re-run when DATA or VISIBILITY changes
  }, [filterState.selectedDistrict, filterState.mahallas.length, filterState.streets.length, filterState.showStreets, filterState.showStreetLabels, renderLayer, zoomToGeometry, filterState.districts, clearLayers]);

  // 3b. Render Street Polygons when data is available
  useEffect(() => {
    if (mapInstance && filterState.selectedDistrict && streetPolygons.length > 0) {
      renderLayer('streetPolygons', streetPolygons,
        (feature: any) => {
          const isSelected = feature.properties.id === selectedStreetPolygon;
          return isSelected ? MAP_LEVEL_STYLES.highlight.streetPolygon : MAP_LEVEL_STYLES.streetPolygon;
        },
        (feature: any, layer: any) => {
          layer.on({
            click: async (e: any) => {
              L.DomEvent.stopPropagation(e);
              setSelectedStreetPolygon(feature.properties.id);
              
              // Store both properties and geometry
              setSelectedPolygonForAddressing({
                ...feature.properties,
                geometry: feature.geometry
              });
              
              // Try to load existing addressing
              try {
                const response = await fetch(`/api/street-addressing?streetPolygonId=${feature.properties.id}`);
                if (response.ok) {
                  const addressing = await response.json();
                  setGeneratedCrossLines(addressing.crossLines || []);
                  setGeneratedAddresses(addressing.addressPoints);
                  console.log('✅ Loaded existing addressing');
                } else {
                  // No existing addressing, clear previous data
                  setGeneratedCrossLines([]);
                  setGeneratedAddresses([]);
                }
              } catch (error) {
                console.log('No existing addressing found');
                setGeneratedCrossLines([]);
                setGeneratedAddresses([]);
              }
              
              setShowAddressDialog(true);
            },
            mouseover: (e: any) => {
              const isSelected = feature.properties.id === selectedStreetPolygonRef.current;
              if (!isSelected) {
                e.target.setStyle(MAP_LEVEL_STYLES.highlight.streetPolygon);
              }
            },
            mouseout: (e: any) => {
              const isSelected = feature.properties.id === selectedStreetPolygonRef.current;
              if (!isSelected) {
                e.target.setStyle(MAP_LEVEL_STYLES.streetPolygon);
              }
            }
          });
          layer.getElement()?.style.setProperty('cursor', 'pointer');
        },
        undefined,
        undefined,
        false,
        'streetPolygonsPane'
      );
    } else {
      clearLayer('streetPolygons');
    }
  }, [mapInstance, filterState.selectedDistrict, streetPolygons, selectedStreetPolygon, renderLayer, clearLayer]);

  // 3c. Render Property Polygons
  useEffect(() => {
    if (mapInstance && filterState.showProperties && properties.length > 0) {
      renderLayer('property', properties,
        (feature: any) => ({
          fillColor: '#fbbf24', // Amber glow from pattern
          weight: 1.5,
          opacity: 0.8,
          fillOpacity: 0.2,
          color: '#fbbf24',
        }),
        (feature: any, layer: any) => {
          layer.on({
            click: (e: any) => {
              // Safely stop propagation to the map
              if (e.originalEvent) {
                L.DomEvent.stopPropagation(e.originalEvent);
              } else if (e.baseEvent) {
                L.DomEvent.stopPropagation(e.baseEvent);
              }
              
              const propertyData = feature.properties;
              filterState.setSelectedProperty(propertyData.id);
              setSelectedPropertyData(propertyData);
              setPropertyPopupPos(e.latlng);
              setShowPropertyPopup(true);
            },
            mouseover: (e: any) => {
              e.target.setStyle({ fillOpacity: 0.6 });
            },
            mouseout: (e: any) => {
              const isSelected = feature.properties.id === selectedPropertyRef.current;
              e.target.setStyle({ fillOpacity: isSelected ? 0.5 : 0.2 });
            }
          });
        },
        undefined, // Labels handled separately by viewport clipping
        undefined,
        true,
        'propertiesPane'
      );
    } else {
      clearLayer('property');
      propertyLabelsRef.current.clearLayers();
    }
    // Only re-run when base data or visibility changes
  }, [mapInstance, properties, filterState.showProperties, renderLayer, clearLayer]);

  // Update property style when selection changes
  useEffect(() => {
    if (filterState.selectedProperty) {
      setLayerStyle('property', (feature: any) => ({
        weight: feature.properties.id === filterState.selectedProperty ? 3 : 1.5,
        fillOpacity: feature.properties.id === filterState.selectedProperty ? 0.5 : 0.2,
      }));
    }
  }, [filterState.selectedProperty, setLayerStyle]);

  // 4. FAST STYLE UPDATES: Update styles when selection or basemap changes
  useEffect(() => {
    if (!filterState.selectedDistrict) return;

    // Fast update mahallas
    setLayerStyle('mahallas', (feature: any) => {
      const isSelected = feature.properties.id === filterState.selectedMahalla;
      if (currentBaseMap === 'satellite') {
        return isSelected ? MAP_LEVEL_STYLES.satellite.highlight.mahalla : MAP_LEVEL_STYLES.satellite.mahalla;
      }
      return isSelected ? MAP_LEVEL_STYLES.highlight.mahalla : MAP_LEVEL_STYLES.mahalla;
    });

    // Fast update streets
    setLayerStyle('streets', (feature: any) => 
      feature.properties.id === filterState.selectedStreet 
        ? MAP_LEVEL_STYLES.highlight.street 
        : MAP_LEVEL_STYLES.street
    );
  }, [filterState.selectedMahalla, filterState.selectedStreet, currentBaseMap, setLayerStyle, filterState.selectedDistrict]);

  // 4b. ZOOM LOGIC: Separate from rendering to prevent map "shaking" on style/toggle changes
  useEffect(() => {
    if (filterState.selectedRegion && !filterState.selectedDistrict) {
      const region = initialRegions.find(r => r.id === filterState.selectedRegion);
      if (region) zoomToGeometry(region.geometry);
    }
  }, [filterState.selectedRegion, initialRegions, zoomToGeometry]);

  useEffect(() => {
    if (filterState.selectedDistrict && !filterState.selectedMahalla) {
      const district = filterState.districts.find(d => d.id === filterState.selectedDistrict);
      if (district) zoomToGeometry(district.geometry);
    }
  }, [filterState.selectedDistrict, filterState.districts, zoomToGeometry]);


  // 5. Explicit Zoom Handler for Filter Selections
  const handleFilterStreetSelect = useCallback((streetId: string) => {
    filterState.setSelectedStreet(streetId);
    const street = filterState.streets.find(s => s.id === streetId);
    if (street) {
      const details = calculateStreetDetails(street);
      setStreetDetails(details);
      
      // Find center/start point for the popup when selected via filter
      if (street.geometry.type === 'LineString') {
        const coords = street.geometry.coordinates;
        const midIdx = Math.floor(coords.length / 2);
        setStreetPopupPos(L.latLng(coords[midIdx][1], coords[midIdx][0]));
      }
      setShowStreetPopup(true);
      zoomToGeometry(street.geometry);
    }
  }, [filterState.streets, filterState.setSelectedStreet, zoomToGeometry, calculateStreetDetails]);

  const handleFilterMahallaSelect = useCallback((mahallaId: string) => {
    filterState.setSelectedMahalla(mahallaId);
    const mahalla = filterState.mahallas.find(m => m.id === mahallaId);
    if (mahalla) {
      zoomToGeometry(mahalla.geometry);
      setShowMahallaPopup(true);
    }
  }, [filterState.mahallas, filterState.setSelectedMahalla, zoomToGeometry]);

  // Handle address generation
  const handleGenerateAddresses = useCallback(async (options: {
    intervalMeters: number;
    offsetMeters: number;
    startNumber: number;
    reverseDirection: boolean;
  }) => {
    if (!selectedPolygonForAddressing || !selectedPolygonForAddressing.geometry) {
      console.error('No polygon selected for addressing');
      return;
    }

    try {
      // Generate addressing
      const result = generatePolygonAddressing(
        selectedPolygonForAddressing.geometry,
        options
      );

      // Save to database
      const response = await fetch('/api/street-addressing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streetPolygonId: selectedPolygonForAddressing.id,
          centerline: result.centerline,
          addressPoints: result.addressPoints,
          crossLines: result.crossLines,
          intervalMeters: options.intervalMeters,
          offsetMeters: options.offsetMeters,
          startNumber: options.startNumber,
          totalLength: result.totalLength,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save addressing to database');
      }

      // Update UI
      setGeneratedCrossLines(result.crossLines);
      setGeneratedAddresses(result.addressPoints);
      
      console.log('✅ Addressing generated and saved:', result);
    } catch (error) {
      console.error('Error generating addresses:', error);
    }
  }, [selectedPolygonForAddressing]);

  return (
    <div className={`relative w-full h-full ${zoomLevel >= 16 ? 'zoom-detailed' : ''}`}>
      <MapFilters 
        regions={initialRegions} 
        filterState={filterState} 
        onStreetSelect={handleFilterStreetSelect}
        onMahallaSelect={handleFilterMahallaSelect}
      />
      
      <MapControls 
        currentBaseMap={currentBaseMap} 
        onBaseMapChange={setCurrentBaseMap}
        onLayersToggle={() => console.log('Layers toggle')}
      />

      {/* Map Control Toggles - Bottom Left */}
      <TooltipProvider delayDuration={300}>
        <div className="absolute left-4 bottom-10 z-[1000] flex flex-col gap-2">
          {/* Toggle Properties */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => filterState.setShowProperties(!filterState.showProperties)}
                className={`p-2.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-110 active:scale-95 border-2 ${
                  !filterState.showProperties 
                    ? 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-400 border-transparent opacity-80' 
                    : 'bg-white dark:bg-slate-800 text-amber-500 border-amber-200 dark:border-amber-900/50 ring-4 ring-amber-500/10'
                }`}
              >
                <Home className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {filterState.showProperties ? "Ko'chmas mulklarni yashirish" : "Ko'chmas mulklarni ko'rsatish"}
            </TooltipContent>
          </Tooltip>

          {/* Toggle Streets (Lines and Labels) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => filterState.setShowStreets(!filterState.showStreets)}
                className={`p-2.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-110 active:scale-95 border-2 ${
                  !filterState.showStreets 
                    ? 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-400 border-transparent opacity-80' 
                    : 'bg-white dark:bg-slate-800 text-purple-500 border-purple-200 dark:border-purple-900/50 ring-4 ring-purple-500/10'
                }`}
              >
                <Waypoints className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {filterState.showStreets ? "Ko'chalarni yashirish" : "Ko'chalarni ko'rsatish"}
            </TooltipContent>
          </Tooltip>

          {/* Toggle Street Labels */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => filterState.setShowStreetLabels(!filterState.showStreetLabels)}
                className={`p-2.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-110 active:scale-95 border-2 ${
                  !filterState.showStreetLabels 
                    ? 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-400 border-transparent opacity-80' 
                    : 'bg-white dark:bg-slate-800 text-blue-500 border-blue-200 dark:border-blue-900/50 ring-4 ring-blue-500/10'
                }`}
              >
                <CaseSensitive className="w-5 h-5 transition-transform duration-300 group-hover:-rotate-12" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {filterState.showStreetLabels ? "Ko'cha nomlarini yashirish" : "Ko'cha nomlarini ko'rsatish"}
            </TooltipContent>
          </Tooltip>

          {/* Toggle Property Labels */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => filterState.setShowPropertyLabels(!filterState.showPropertyLabels)}
                className={`p-2.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-110 active:scale-95 border-2 ${
                  !filterState.showPropertyLabels 
                    ? 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-400 border-transparent opacity-80' 
                    : 'bg-white dark:bg-slate-800 text-green-500 border-green-200 dark:border-green-900/50 ring-4 ring-green-500/10'
                }`}
              >
                <span className="text-lg font-bold transition-transform duration-300">#</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {filterState.showPropertyLabels ? "Uy raqamlarini yashirish" : "Uy raqamlarini ko'rsatish"}
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <MapStatistics stats={displayStats} />

      {showMahallaPopup && filterState.selectedMahalla && (
        <MahallaPopup 
          mahalla={{
            ...filterState.mahallas.find(m => m.id === filterState.selectedMahalla)!,
            streetCount: filterState.streets.filter(s => s.mahallaId === filterState.mahallas.find(m => m.id === filterState.selectedMahalla)?.code).length
          }}
          region={initialRegions.find(r => r.id === filterState.selectedRegion)}
          district={filterState.districts.find(d => d.id === filterState.selectedDistrict)}
          onClose={() => setShowMahallaPopup(false)}
        />
      )}

      <MapContainer 
        className='w-full h-full' 
        tileUrl={baseMaps[currentBaseMap].url}
        attribution={baseMaps[currentBaseMap].attribution}
        maxZoom={baseMaps[currentBaseMap].maxZoom}
        onMapReady={(map) => {
          setMapInstance(map);
          setZoomLevel(map.getZoom());
        }} 
      >
        <MapZoomListener onChange={setZoomLevel} />
        
        {/* Render cross lines every 20m */}
        <FeatureGroup>
          {generatedCrossLines.map((crossLine) => (
            <Polyline
              key={crossLine.id}
              positions={[
                [crossLine.start[1], crossLine.start[0]],
                [crossLine.end[1], crossLine.end[0]]
              ]}
              pathOptions={{
                color: '#ffffff',
                weight: 2,
                opacity: 0.9,
              }}
            />
          ))}
        </FeatureGroup>

        {/* Render generated address points */}
        {generatedAddresses.map((addr) => {
          const icon = L.divIcon({
            className: 'address-label-marker',
            html: `<div style="
              background: white;
              border: 1px solid black;
              border-radius: 50%;
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              font-weight: bold;
              color: black;
            ">${addr.number}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          return (
            <Marker
              key={addr.id}
              position={[addr.position[1], addr.position[0]]}
              icon={icon}
            />
          );
        })}
        
        {showStreetPopup && filterState.selectedStreet && streetPopupPos && streetDetails && (
          <>
            <Popup 
              position={streetPopupPos}
              closeButton={false}
              autoPan={true}
              className="custom-street-popup"
              offset={[0, -10]}
            >
              <StreetPopup 
                {...streetDetails}
                onClose={() => setShowStreetPopup(false)}
              />
            </Popup>
            
            {/* Direction Arrow at the end point */}
            {streetDetails.endPoint && (
              <Marker 
                position={L.latLng(streetDetails.endPoint.lat, streetDetails.endPoint.lng)}
                icon={L.divIcon({
                  className: 'street-direction-arrow',
                  html: `<div style="transform: rotate(${streetDetails.direction || 0}deg); color: #f59e0b; display: flex; align-items: center; justify-content: center;">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                      <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" />
                    </svg>
                  </div>`,
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
                })}
              />
            )}
          </>
        )}

        {showPropertyPopup && selectedPropertyData && propertyPopupPos && (
          <Popup 
            position={propertyPopupPos}
            closeButton={false}
            autoPan={true}
            className="custom-property-popup"
            offset={[0, -10]}
            eventHandlers={{
              remove: () => setShowPropertyPopup(false)
            }}
          >
            <PropertyPopup 
              property={selectedPropertyData}
              onClose={() => setShowPropertyPopup(false)}
            />
          </Popup>
        )}
      </MapContainer>


      {/* Internal Loading Overlay */}
      {isInitializing && (
        <div className="absolute inset-0 z-[5000] flex items-center justify-center bg-background/40 backdrop-blur-[1px] animate-in fade-in duration-500">
          <div className="flex flex-col items-center gap-3 p-6 bg-background/80 backdrop-blur-md rounded-2xl shadow-2xl border border-primary/10">
            <Loader2 className="size-8 text-primary animate-spin" />
            <span className="text-sm font-medium text-foreground/80">Ma'lumotlar yuklanmoqda...</span>
          </div>
        </div>
      )}

      {/* Address Generation Dialog */}
      <AddressGenerationDialog
        open={showAddressDialog}
        onOpenChange={setShowAddressDialog}
        polygonData={selectedPolygonForAddressing}
        onGenerate={handleGenerateAddresses}
      />
    </div>
  );
}
export default UzbekistanMap;