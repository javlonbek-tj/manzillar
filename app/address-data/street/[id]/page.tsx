import React, { Suspense } from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DetailMapWrapper } from '@/components/map/detail-map-wrapper';
import { DashboardWrapper } from '@/components/address/dashboard-wrapper';
import { MapLoadingSkeleton } from '@/components/map/map-loading-skeleton';

export default async function StreetDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  
  const street = await prisma.street.findUnique({
    where: { id },
    include: { 
      district: {
        include: { region: true }
      },
      mahalla: true
    }
  });

  if (!street) return <div className="p-6">Ma'lumot topilmadi</div>;

  return (
    <DashboardWrapper title="Ko'cha ma'lumotlari">
      <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/address-data">
           <Button variant="outline" size="icon">
             <ArrowLeft className="w-4 h-4" />
           </Button>
        </Link>
        <h1 className="text-2xl font-bold">{street.nameUz}</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Asosiy ma'lumotlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-3 gap-2 border-b pb-2">
               <span className="font-medium text-muted-foreground col-span-1">Viloyat:</span>
               <Link href={`/address-data/region/${street.district.regionId}`} className="col-span-2 font-medium text-blue-600 hover:underline">
                 {street.district.region.nameUz}
               </Link>
             </div>
             <div className="grid grid-cols-3 gap-2 border-b pb-2">
               <span className="font-medium text-muted-foreground col-span-1">Tuman:</span>
               <Link href={`/address-data/district/${street.districtId}`} className="col-span-2 font-medium text-blue-600 hover:underline">
                 {street.district.nameUz}
               </Link>
             </div>
             <div className="grid grid-cols-3 gap-2 border-b pb-2">
               <span className="font-medium text-muted-foreground col-span-1">Mahalla:</span>
               <Link href={`/address-data/mahalla/${street.mahallaId}`} className="col-span-2 font-medium text-blue-600 hover:underline">
                 {street.mahalla.nameUz}
               </Link>
             </div>
             <div className="grid grid-cols-3 gap-2 border-b pb-2">
               <span className="font-medium text-muted-foreground col-span-1">Nomlanishi:</span>
               <span className="col-span-2 font-medium">{street.nameUz}</span>
             </div>
             <div className="grid grid-cols-3 gap-2 border-b pb-2">
               <span className="font-medium text-muted-foreground col-span-1">Kod:</span>
               <span className="col-span-2">{street.code}</span>
             </div>
             <div className="grid grid-cols-3 gap-2 border-b pb-2">
               <span className="font-medium text-muted-foreground col-span-1">UzKad kodi:</span>
               <span className="col-span-2">{street.uzKadCode || '—'}</span>
             </div>
             <div className="grid grid-cols-3 gap-2 border-b pb-2">
               <span className="font-medium text-muted-foreground col-span-1">Turi:</span>
               <span className="col-span-2">{street.type}</span>
             </div>
          </CardContent>
        </Card>

        <Suspense fallback={<MapLoadingSkeleton />}>
          <Card className="flex flex-col min-h-[500px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5" />
                Geometriya va Joylashuv
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative overflow-hidden rounded-b-lg">
               <div className="absolute inset-0">
                 <DetailMapWrapper geometry={street.geometry} />
               </div>
            </CardContent>
          </Card>
        </Suspense>
      </div>
      </div>
    </DashboardWrapper>
  );
}
