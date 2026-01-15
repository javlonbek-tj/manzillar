import { Suspense } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset } from '@/components/ui/sidebar';
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
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col flex-1 overflow-hidden">
        <header className='flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-all duration-300'>
          <h1 className='text-lg font-semibold'>Ochiq xarita</h1>
          <HeaderActions />
        </header>
        <div className='flex-1 w-full relative'>
          <Suspense fallback={<MapLoader />}>
            <MapSection />
          </Suspense>
        </div>
      </SidebarInset>
    </div>
  );
}