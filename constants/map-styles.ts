export const MAP_LEVEL_STYLES = {
  region: {
    fillColor: '#3b82f6',
    weight: 2.5,
    opacity: 1,
    color: '#1d4ed8',
    fillOpacity: 0,
  },
  district: {
    fillColor: '#10b981',
    weight: 2,
    opacity: 1,
    color: '#047857',
    fillOpacity: 0,
  },
  mahalla: {
    fillColor: '#f59e0b',
    weight: 2,
    opacity: 1,
    color: '#b45309',
    fillOpacity: 0,
  },
  street: {
    color: '#3b82f6',
    weight: 5, // Increased from 3 to 5 for better clickability
    opacity: 0.8,
  },
  streetPolygon: {
    fillColor: 'oklch(45.5% 0.188 13.697)', // Same as border color
    weight: 2,
    fillOpacity: 0.8,
    color: 'oklch(45.5% 0.188 13.697)',
  },
   property: {
    fillColor: '#6366f1',
    weight: 1,
    opacity: 1,
    color: '#4338ca',
    fillOpacity: 0.5,
  },
  highlight: {
    region: {
      fillColor: '#1d4ed8',
      fillOpacity: 0,
      weight: 4,
      color: '#1d4ed8',
    },
    district: {
      fillColor: '#047857',
      fillOpacity: 0,
      weight: 4,
      color: '#047857',
    },
    mahalla: {
      fillColor: '#b45309',
      fillOpacity: 0,
      weight: 5,
      color: '#b45309',
    },
    street: {
      color: '#f59e0b', 
      weight: 8, 
      opacity: 1,
    },
    streetPolygon: {
      fillColor: '#3b82f6', 
      weight: 2, 
      opacity: 1,
      color: '#3b82f6',
      fillOpacity: 1,
    },
  },
  satellite: {
    mahalla: {
      fillColor: '#ffffff',
      weight: 2,
      opacity: 1,
      color: '#ffffff',
      fillOpacity: 0,
    },
    district: {
      fillColor: '#3b82f6',
      weight: 3,
      opacity: 1,
      color: '#3b82f6', // Changed from Yellow to Blue
      fillOpacity: 0,
    },
    highlight: {
      mahalla: {
        fillColor: '#ffffff',
        fillOpacity: 0,
        weight: 6,
        color: '#ffffff',
      },
      district: {
        fillColor: '#60a5fa',
        fillOpacity: 0,
        weight: 6,
        color: '#60a5fa', // Highlight blue
      }
    }
  },
  // Address generation styles
  addressing: {
    centerline: {
      color: '#ffffff',
      weight: 3,
      opacity: 1,
      dashArray: '10, 10', // Dashed line
    },
    addressMarker: {
      radius: 4,
      fillColor: '#ffffff',
      color: '#000000',
      weight: 1,
      opacity: 1,
      fillOpacity: 0.9,
    }
  }
};