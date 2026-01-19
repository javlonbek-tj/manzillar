import { Suspense } from 'react';
import { getDashboardAnalytics } from '@/lib/data';
import { DashboardWrapper } from '@/components/address/dashboard-wrapper';
import { DashboardOverview } from '@/components/dashboard/overview/DashboardOverview';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { revalidateTag } from 'next/cache';

async function DashboardOverviewFetcher() {
  const data = await getDashboardAnalytics();
  
  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Ma'lumotlarni yuklashda xatolik yuz berdi.
      </div>
    );
  }

  return <DashboardOverview data={data} />;
}

export default async function DashboardPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ refresh?: string }> 
}) {
  const params = await searchParams;
  
  if (params.refresh === 'true') {
    revalidateTag('dashboard-analytics');
  }

  return (
    <DashboardWrapper>
      <Suspense fallback={<LoadingSpinner fullPage={false} />}>
        <DashboardOverviewFetcher />
      </Suspense>
    </DashboardWrapper>
  );
}
