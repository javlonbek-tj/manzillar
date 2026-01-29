import { Suspense } from 'react';
import { DashboardWrapper } from '@/components/address/dashboard-wrapper';
import { UsersContent } from '@/components/users/users-content';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getUsersMetadata() {
  try {
    const [regions, districts] = await Promise.all([
      prisma.region.findMany({
        select: { id: true, nameUz: true },
        orderBy: { nameUz: 'asc' },
      }),
      prisma.district.findMany({
        select: { id: true, nameUz: true, regionId: true },
        orderBy: { nameUz: 'asc' },
      }),
    ]);
    return { regions, districts };
  } catch (error) {
    console.error('Error fetching users metadata:', error);
    return { regions: [], districts: [] };
  }
}

async function UsersDataFetcher() {
  const data = await getUsersMetadata();
  return <UsersContent regions={data.regions} allDistricts={data.districts} />;
}

export default function XodimlarPage() {
  return (
    <DashboardWrapper title="Xodimlar">
      <Suspense fallback={<LoadingSpinner fullPage={false} />}>
        <UsersDataFetcher />
      </Suspense>
    </DashboardWrapper>
  );
}
