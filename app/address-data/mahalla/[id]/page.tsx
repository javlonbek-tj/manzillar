import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft, Map, CheckCircle2, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DetailMapWrapper } from '@/components/map/detail-map-wrapper';
import { DashboardWrapper } from '@/components/address/dashboard-wrapper';
import { DownloadMahallaPdf } from '@/components/address/download-mahalla-pdf';

export default async function MahallaDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  
  const mahalla = await prisma.mahalla.findUnique({
    where: { id },
    include: { 
      district: {
        include: { region: true, }
      },
      streets: true 
    }
  });

  if (!mahalla) return <div className="p-6">Ma'lumot topilmadi</div>;

  return (
    <DashboardWrapper title="Mahalla ma'lumotlari">
      <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/address-data">
             <Button variant="outline" size="icon">
               <ArrowLeft className="w-4 h-4" />
             </Button>
          </Link>
          <h1 className="text-2xl font-bold">{mahalla.nameUz} - Mahalla ma'lumotlari</h1>
        </div>
        <DownloadMahallaPdf mahalla={mahalla as any} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Asosiy ma'lumotlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-3 gap-2 border-b pb-2">
               <span className="font-medium text-muted-foreground col-span-1">Viloyat:</span>
               <Link href={`/address-data/region/${mahalla.district.regionId}`} className="col-span-2 font-medium text-blue-600 hover:underline">
                 {mahalla.district.region.nameUz}
               </Link>
             </div>
             <div className="grid grid-cols-3 gap-2 border-b pb-2">
               <span className="font-medium text-muted-foreground col-span-1">Tuman:</span>
               <Link href={`/address-data/district/${mahalla.districtId}`} className="col-span-2 font-medium text-blue-600 hover:underline">
                 {mahalla.district.nameUz}
               </Link>
             </div>
             <div className="grid grid-cols-3 gap-2 border-b pb-2">
               <span className="font-medium text-muted-foreground col-span-1">Nomlanishi:</span>
               <span className="col-span-2 font-medium">{mahalla.nameUz}</span>
             </div>
             <div className="grid grid-cols-3 gap-2 border-b pb-2">
               <span className="font-medium text-muted-foreground col-span-1">UzKad kodi:</span>
               <span className="col-span-2">{mahalla.code}</span>
             </div>
             <div className="grid grid-cols-3 gap-2 border-b pb-2">
               <span className="font-medium text-muted-foreground col-span-1">APU kodi:</span>
               <span className="col-span-2">{mahalla.geoCode}</span>
             </div>
             <div className="grid grid-cols-3 gap-2 border-b pb-2">
               <span className="font-medium text-muted-foreground col-span-1">Qaror:</span>
               <span className="col-span-2">{mahalla.regulation || '-'}</span>
             </div>
             <div className="grid grid-cols-3 gap-2 border-b pb-2">
               <span className="font-medium text-muted-foreground col-span-1">Tarixiy nomi:</span>
               <span className="col-span-2">{mahalla.oldName || '-'}</span>
             </div>
             {mahalla.hidden && (
               <>
                 <div className="grid grid-cols-3 gap-2 border-b pb-2">
                   <span className="font-medium text-muted-foreground col-span-1">Optimallashgan:</span>
                   <div className="col-span-2">
                     <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800">
                       <CheckCircle2 className="w-3 h-3 mr-1" />
                       Ha
                     </Badge>
                   </div>
                 </div>
                 {mahalla.mergedIntoName && (
                   <div className="grid grid-cols-3 gap-2 border-b pb-2">
                     <span className="font-medium text-muted-foreground col-span-1">Birlashtiruvchi MFY:</span>
                     <span className="col-span-2 font-medium text-blue-600">
                       {mahalla.mergedIntoName}
                     </span>
                   </div>
                 )}
               </>
             )}
             {mahalla.regulationUrl && (
               <div className="grid grid-cols-3 gap-2 border-b pb-2 items-center">
                 <span className="font-medium text-muted-foreground col-span-1">Optimallashish asosi:</span>
                 <div className="col-span-2">
                   <a href={mahalla.regulationUrl} target="_blank" rel="noopener noreferrer">
                     <Button size="sm" variant="outline" className="h-8 gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400">
                       <FileDown className="w-3.5 h-3.5" />
                       Yuklab olish
                     </Button>
                   </a>
                 </div>
               </div>
             )}
            {mahalla.streets.length > 0 &&  <div className="grid grid-cols-3 gap-2 border-b pb-2">
               <span className="font-medium text-muted-foreground col-span-1">Ko'chalar soni:</span>
               <span className="col-span-2">{mahalla.streets.length}</span>
             </div>}
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
               <DetailMapWrapper geometry={mahalla.geometry} />
             </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </DashboardWrapper>
  );
}
