'use client';

import dynamic from 'next/dynamic';
import type { RegionData } from '@/types/map';

import { MapLoader } from './map-loader';

const UzbekistanMap = dynamic(() => import('./uzbekistan-map'), {
  ssr: false,
  loading: () => <MapLoader />,
});

export default function MapWrapper({ initialRegions }: { initialRegions: RegionData[] }) {
  return <UzbekistanMap initialRegions={initialRegions} />;
}
