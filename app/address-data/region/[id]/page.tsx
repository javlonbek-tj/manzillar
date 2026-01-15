import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DetailMapWrapper } from '@/components/map/detail-map-wrapper';
import { DashboardWrapper } from '@/components/address/dashboard-wrapper';

export default async function RegionDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  
  const region = await prisma.region.findUnique({
    where: { id },
    include: {
      districts: true,
    },
  });

  if (!region) return <div className="p-6">Ma'lumot topilmadi</div>;

  return (
    <DashboardWrapper title="Viloyat ma'lumotlari">
      <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/address-data">
           <Button variant="outline" size="icon">
             <ArrowLeft className="w-4 h-4" />
           </Button>
        </Link>
        <h1 className="text-2xl font-bold">{region.nameUz} - Viloyat ma'lumotlari</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Asosiy ma'lumotlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-3 gap-2 border-b pb-2">
               <span className="font-medium text-muted-foreground col-span-1">Nomlanishi:</span>
               <span className="col-span-2 font-medium">{region.nameUz}</span>
             </div>
             <div className="grid grid-cols-3 gap-2 border-b pb-2">
               <span className="font-medium text-muted-foreground col-span-1">Soato kodi:</span>
               <span className="col-span-2">{region.code}</span>
             </div>
             <div className="grid grid-cols-3 gap-2 border-b pb-2">
               <span className="font-medium text-muted-foreground col-span-1">Tumanlari soni:</span>
               <span className="col-span-2">{region.districts.length}</span>
             </div>
             
             {/* Add stats if available, e.g. number of districts via relation count? 
                 Prisma findUnique doesn't include relations unless requested.
                 I'll keep it simple for now. 
             */}
          </CardContent>
        </Card>

        <Card className="flex flex-col min-h-[500px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="w-5 h-5" />
              Geometriya va Joylashuv
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 relative overflow-hidden rounded-b-lg">
             <div className="absolute inset-0">
               <DetailMapWrapper geometry={region.geometry} />
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </DashboardWrapper>
  );
}
