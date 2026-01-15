export interface GeoJSONGeometry {
  type: 'Polygon' | 'MultiPolygon' | 'LineString' | 'Point';
  coordinates: number[][][] | number[][][][] | number[][] | number[];
}

export interface RegionData {
  id: string;
  nameUz: string;
  nameRu?: string | null;
  code: string;
  geometry: GeoJSONGeometry;
  center?: { lat: number; lng: number } | null;
}

export interface DistrictData {
  id: string;
  nameUz: string;
  nameRu?: string | null;
  code: string;
  geometry: GeoJSONGeometry;
  center?: { lat: number; lng: number } | null;
  regionId: string;
}

export interface MahallaData {
  id: string;
  nameUz: string;
  nameRu?: string | null;
  code: string;
  geoCode?: string | null;
  streetCount?: number;
  geometry: GeoJSONGeometry;
  center?: { lat: number; lng: number } | null;
  districtId: string;
  regulation?: string | null;
  oldName?: string | null;
}

export interface PropertyData {
  id: string;
  owner?: string | null;
  address?: string | null;
  type?: string | null;
  districtId?: string | null;
  houseNumber?: string | null;
  streetName?: string | null;
  mahalla?: string | null;
  geometry: GeoJSONGeometry;
  center?: { lat: number; lng: number } | null;
  cadastralNumber?: string | null;
  areaInDoc?: string | null;
  areaReal?: string | null;
}
