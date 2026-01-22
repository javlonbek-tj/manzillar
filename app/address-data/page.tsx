import { Suspense } from 'react';
import prisma from '@/lib/prisma';
import { DashboardWrapper } from '@/components/address/dashboard-wrapper';
import { DashboardContent } from '@/components/address/dashboard-content';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

export const dynamic = 'force-dynamic';

async function getDashboardData() {
  const [regions, districts, mahallas, streets] = await Promise.all([
    prisma.region.findMany({
      select: { id: true, nameUz: true, nameRu: true, code: true },
      orderBy: { nameUz: 'asc' },
    }),
    prisma.district.findMany({
      select: {
        id: true,
        nameUz: true,
        nameRu: true,
        code: true,
        regionId: true,
        region: { select: { nameUz: true, code: true } },
      },
      orderBy: { nameUz: 'asc' },
    }),
    prisma.mahalla.findMany({
      select: {
        id: true,
        nameUz: true,
        nameRu: true,
        code: true,
        uzKadName: true,
        geoCode: true,
        oneId: true,
        districtId: true,
        hidden: true,
        mergedIntoId: true,
        mergedIntoName: true,
        district: {
          select: {
            nameUz: true,
            code: true,
            regionId: true,
            region: { select: { nameUz: true, code: true } },
          },
        },
      },
      orderBy: { nameUz: 'asc' },
    }),
    prisma.street.findMany({
      select: {
        id: true,
        nameUz: true,
        nameRu: true,
        code: true,
        uzKadCode: true,
        districtId: true,
        mahallaId: true,
        type: true,
        oldName: true,
        mahalla: {
          select: { nameUz: true },
        },
        district: {
          select: {
            nameUz: true,
            code: true,
            regionId: true,
            region: { select: { nameUz: true, code: true } },
          },
        },
      },
      orderBy: { nameUz: 'asc' },
    }),
  ]);

  return { regions, districts, mahallas, streets };
}

async function DashboardDataFetcher() {
  const data = await getDashboardData();
  // @ts-ignore - Assuming types match or will be handled in DashboardContent
  return <DashboardContent initialData={data} />;
}

export default function DashboardPage() {
  return (
    <DashboardWrapper title="Manzil tuzilmasi">
      <Suspense fallback={<LoadingSpinner fullPage={false} />}>
        <DashboardDataFetcher />
      </Suspense>
    </DashboardWrapper>
  );
}
