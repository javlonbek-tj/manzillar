import * as turf from '@turf/turf';
import type { Polygon, LineString, Feature, Point } from 'geojson';

/**
 * Calculate a robust geometric centerline for a street polygon
 * Splits the polygon into two long sides and averages them ("spine-based")
 */
export function calculateCenterline(polygon: Polygon): LineString {
  try {
    const coords = polygon.coordinates[0];
    
    // 1. Find the two points furthest apart on the boundary (the "ends")
    let maxDist = 0;
    let idx1 = 0;
    let idx2 = 0;
    
    // Subsample for efficiency if the ring is very dense
    const step = Math.max(1, Math.floor(coords.length / 50));
    for (let i = 0; i < coords.length; i += step) {
      for (let j = i + step; j < coords.length; j += step) {
        const d = turf.distance(turf.point(coords[i]), turf.point(coords[j]));
        if (d > maxDist) {
          maxDist = d;
          idx1 = i;
          idx2 = j;
        }
      }
    }
    
    // 2. Split the boundary ring into two sides
    let sideA: number[][] = [];
    let sideB: number[][] = [];
    
    if (idx1 < idx2) {
      sideA = coords.slice(idx1, idx2 + 1);
      sideB = [...coords.slice(idx2), ...coords.slice(1, idx1 + 1)];
    } else {
      sideA = coords.slice(idx2, idx1 + 1);
      sideB = [...coords.slice(idx1), ...coords.slice(1, idx2 + 1)];
    }
    
    // 3. Resample both sides to the same number of points for averaging
    const resampleCount = 100;
    const resampledA: number[][] = [];
    const resampledB: number[][] = [];
    
    const lineA = turf.lineString(sideA);
    const lineB = turf.lineString(sideB);
    const lenA = turf.length(lineA);
    const lenB = turf.length(lineB);
    
    for (let i = 0; i <= resampleCount; i++) {
      const pA = turf.along(lineA, (i / resampleCount) * lenA);
      const pB = turf.along(lineB, (1 - i / resampleCount) * lenB); // Reverse B to match direction
      resampledA.push(pA.geometry.coordinates);
      resampledB.push(pB.geometry.coordinates);
    }
    
    // 4. Calculate midpoints to form the spine
    const spineCoords: number[][] = [];
    for (let i = 0; i <= resampleCount; i++) {
      const mid = turf.midpoint(turf.point(resampledA[i]), turf.point(resampledB[i]));
      spineCoords.push(mid.geometry.coordinates);
    }
    
    return {
      type: 'LineString',
      coordinates: spineCoords
    };
  } catch (error) {
    console.error('Error calculating spine-based centerline:', error);
    // Minimal fallback: straight line between first and middle point
    return {
      type: 'LineString',
      coordinates: [polygon.coordinates[0][0], polygon.coordinates[0][Math.floor(polygon.coordinates[0].length / 2)]]
    };
  }
}

/**
 * Segment a line into intervals of specified distance
 */
export function segmentLine(line: LineString, intervalMeters: number = 20): Feature<Point>[] {
  const lineFeature = turf.lineString(line.coordinates);
  const length = turf.length(lineFeature, { units: 'meters' });
  const segments: Feature<Point>[] = [];
  for (let distance = 0; distance <= length; distance += intervalMeters) {
    segments.push(turf.along(lineFeature, distance, { units: 'meters' }));
  }
  return segments;
}

/**
 * Calculate perpendicular offset point from a line segment
 */
export function calculatePerpendicularOffset(
  point: number[],
  nextPoint: number[],
  offsetMeters: number,
  side: 'left' | 'right'
): number[] {
  const bearing = turf.bearing(turf.point(point), turf.point(nextPoint));
  const perpBearing = side === 'right' ? bearing + 90 : bearing - 90;
  return turf.destination(turf.point(point), offsetMeters / 1000, perpBearing, { units: 'kilometers' }).geometry.coordinates;
}

export interface AddressPoint {
  id: string;
  position: number[];
  number: number;
  side: 'left' | 'right';
}

export interface CrossLine {
  id: string;
  start: number[];
  end: number[];
}

/**
 * Generate address points with ray-casting for precision
 */
export function generateAddressPoints(
  polygon: Polygon,
  centerline: LineString,
  intervalMeters: number = 20,
  offsetMeters: number = 5,
  startNumber: number = 0
): { addressPoints: AddressPoint[]; crossLines: CrossLine[] } {
  try {
    const lineFeature = turf.lineString(centerline.coordinates);
    const length = turf.length(lineFeature, { units: 'meters' });
    const addressPoints: AddressPoint[] = [];
    const crossLines: CrossLine[] = [];
    
    let oddNumber = startNumber % 2 === 0 ? startNumber + 1 : startNumber;
    let evenNumber = startNumber % 2 === 0 ? startNumber : startNumber + 1;
    
    const polygonFeature = turf.polygon(polygon.coordinates);
    const polygonBoundary = turf.polygonToLine(polygonFeature);
    
    // Generate cross lines and address labels
    for (let distance = 0; distance < length; distance += intervalMeters) {
      // 1. Cross Line
      const p = turf.along(lineFeature, distance, { units: 'meters' });
      const coord = p.geometry.coordinates;
      
      let bearing;
      if (distance + 1 <= length) {
        bearing = turf.bearing(p, turf.along(lineFeature, distance + 1, { units: 'meters' }));
      } else {
        bearing = turf.bearing(turf.along(lineFeature, distance - 1, { units: 'meters' }), p);
      }
      
      const rL = turf.destination(p, 0.1, bearing - 90, { units: 'kilometers' });
      const rR = turf.destination(p, 0.1, bearing + 90, { units: 'kilometers' });
      const rayLine = turf.lineString([rL.geometry.coordinates, rR.geometry.coordinates]);
      const intersects = turf.lineIntersect(rayLine, polygonFeature);
      
      if (intersects.features.length >= 2) {
        crossLines.push({
          id: `cross-${distance}`,
          start: intersects.features[0].geometry.coordinates,
          end: intersects.features[intersects.features.length - 1].geometry.coordinates
        });
      } else {
        const fallL = turf.destination(p, 0.01, bearing - 90, { units: 'kilometers' });
        const fallR = turf.destination(p, 0.01, bearing + 90, { units: 'kilometers' });
        crossLines.push({ id: `cross-${distance}`, start: fallL.geometry.coordinates, end: fallR.geometry.coordinates });
      }
      
      // 2. Address Numbers for the segment starting at 'distance'
      const nextSegmentEnd = Math.min(distance + intervalMeters, length);
      if (nextSegmentEnd > distance + 1) { // Only if segment is > 1 meter
        const midDist = (distance + nextSegmentEnd) / 2;
        const midP = turf.along(lineFeature, midDist, { units: 'meters' });
        
        let midBearing;
        if (midDist + 1 <= length) {
          midBearing = turf.bearing(midP, turf.along(lineFeature, midDist + 1, { units: 'meters' }));
        } else {
          midBearing = turf.bearing(turf.along(lineFeature, midDist - 1, { units: 'meters' }), midP);
        }
        
        // Left
        const leftRay = turf.lineString([midP.geometry.coordinates, turf.destination(midP, 0.1, midBearing - 90, { units: 'kilometers' }).geometry.coordinates]);
        const leftInt = turf.lineIntersect(leftRay, polygonBoundary);
        let leftPos;
        if (leftInt.features.length > 0) {
          const sorted = leftInt.features.map(f => ({ f, d: turf.distance(midP, f) })).sort((a, b) => a.d - b.d);
          leftPos = turf.destination(sorted[0].f, 0.004, midBearing - 90, { units: 'kilometers' });
        } else {
          leftPos = turf.destination(midP, 0.01, midBearing - 90, { units: 'kilometers' });
        }
        addressPoints.push({ id: `L-${distance}`, position: leftPos.geometry.coordinates, number: oddNumber, side: 'left' });
        oddNumber += 2;
        
        // Right
        const rightRay = turf.lineString([midP.geometry.coordinates, turf.destination(midP, 0.1, midBearing + 90, { units: 'kilometers' }).geometry.coordinates]);
        const rightInt = turf.lineIntersect(rightRay, polygonBoundary);
        let rightPos;
        if (rightInt.features.length > 0) {
          const sorted = rightInt.features.map(f => ({ f, d: turf.distance(midP, f) })).sort((a, b) => a.d - b.d);
          rightPos = turf.destination(sorted[0].f, 0.004, midBearing + 90, { units: 'kilometers' });
        } else {
          rightPos = turf.destination(midP, 0.01, midBearing + 90, { units: 'kilometers' });
        }
        addressPoints.push({ id: `R-${distance}`, position: rightPos.geometry.coordinates, number: evenNumber, side: 'right' });
        evenNumber += 2;
      }
    }

    // 3. Ensure a final cross line at the exact end if the interval didn't land there
    const remainder = length % intervalMeters;
    if (remainder > 1) { // If there's more than 1 meter left
      const endP = turf.along(lineFeature, length, { units: 'meters' });
      const endBearing = turf.bearing(turf.along(lineFeature, length - 1, { units: 'meters' }), endP);
      
      const rL = turf.destination(endP, 0.1, endBearing - 90, { units: 'kilometers' });
      const rR = turf.destination(endP, 0.1, endBearing + 90, { units: 'kilometers' });
      const rayLine = turf.lineString([rL.geometry.coordinates, rR.geometry.coordinates]);
      const intersects = turf.lineIntersect(rayLine, polygonFeature);
      
      if (intersects.features.length >= 2) {
        crossLines.push({
          id: `cross-end`,
          start: intersects.features[0].geometry.coordinates,
          end: intersects.features[intersects.features.length - 1].geometry.coordinates
        });
      }
    }
    
    return { addressPoints, crossLines };
  } catch (error) {
    console.error('Error generating address points:', error);
    throw error;
  }
}

export interface AddressingResult {
  centerline: LineString;
  addressPoints: AddressPoint[];
  crossLines: CrossLine[];
  totalLength: number;
}

export function generatePolygonAddressing(
  polygon: Polygon,
  options: {
    intervalMeters?: number;
    offsetMeters?: number;
    startNumber?: number;
    reverseDirection?: boolean;
  } = {}
): AddressingResult {
  const { intervalMeters = 20, offsetMeters = 5, startNumber = 0, reverseDirection = false } = options;
  try {
    let centerline = calculateCenterline(polygon);
    if (reverseDirection) {
      centerline = { ...centerline, coordinates: [...centerline.coordinates].reverse() };
    }
    const { addressPoints, crossLines } = generateAddressPoints(polygon, centerline, intervalMeters, offsetMeters, startNumber);
    const lineFeature = turf.lineString(centerline.coordinates);
    const totalLength = turf.length(lineFeature, { units: 'meters' });
    
    return { centerline, addressPoints, crossLines, totalLength };
  } catch (error) {
    console.error('Error generating polygon addressing:', error);
    throw error;
  }
}
