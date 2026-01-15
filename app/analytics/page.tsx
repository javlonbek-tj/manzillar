import { Suspense } from 'react';
import { getRegionalAnalytics } from '@/lib/data';
import { RegionalAnalytics } from '@/components/analytics/RegionalAnalytics';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import { HeaderActions } from '@/components/header-actions';

export const dynamic = 'force-dynamic';

async function AnalyticsDataFetcher() {
  const data = await getRegionalAnalytics();
  
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Ma'lumotlarni yuklashda xatolik yuz berdi.
      </div>
    );
  }

  return <RegionalAnalytics data={data} />;
}

export default function AnalyticsPage() {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar />
      <SidebarInset className="flex flex-col flex-1 overflow-hidden">
        <header className='flex h-16 shrink-0 items-center justify-between gap-4 border-b px-6'>
          <h1 className='text-lg font-semibold'>Manzil tahlili</h1>
          <HeaderActions />
        </header>
        <main className="flex-1 overflow-hidden">
          <Suspense fallback={<LoadingSpinner fullPage={false} />}>
            <AnalyticsDataFetcher />
          </Suspense>
        </main>
      </SidebarInset>
    </div>
  );
}
