'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const DetailMap = dynamic(() => import('./detail-map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-lg" />
});

export function DetailMapWrapper({ geometry }: { geometry: any }) {
  return <DetailMap geometry={geometry} />;
}
