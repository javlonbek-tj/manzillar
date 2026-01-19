export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import MapWrapper from '@/components/map/map-wrapper';
import { HeaderActions } from '@/components/header-actions';
import { MapLoader } from '@/components/map/map-loader';
import { getRegions } from '@/lib/data';

async function MapSection() {
  const initialRegions = await getRegions();
  return <MapWrapper initialRegions={initialRegions} />;
}

export default function HomePage() {
  return (
    <>
      <header className='flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-all duration-300'>
        <h1 className='text-lg font-semibold'>Ochiq xarita</h1>
        <HeaderActions />
      </header>
      <div className='flex-1 w-full relative'>
        <Suspense fallback={<MapLoader />}>
          <MapSection />
        </Suspense>
      </div>
    </>
  );
}