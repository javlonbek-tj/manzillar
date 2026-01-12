'use client';

import dynamic from 'next/dynamic';

// Import dynamically with SSR disabled (Leaflet doesn't work with SSR)
const UzbekistanMap = dynamic(() => import('./components/map/UzbekistanMap'), {
  ssr: false,
  loading: () => (
    <div className='flex justify-center items-center bg-gray-900 w-full h-full'></div>
  ),
});

export default function HomePage() {
  return (
    <div className='w-full h-[calc(100vh-4rem)]'>
      <UzbekistanMap />
    </div>
  );
}
