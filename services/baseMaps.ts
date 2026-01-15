export const baseMaps = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    label: "Standart Map",
    maxZoom: 17, // Further reduced to prevent sparse data errors
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
    label: "Sun'iy yo'ldosh",
    maxZoom: 17, // Most regions in Uzbekistan have guaranteed level 17 data
  },
} as const;

export type BaseMapKey = keyof typeof baseMaps;
