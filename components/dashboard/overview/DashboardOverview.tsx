'use client';

import { AnalyticsCards } from './AnalyticsCards';
import { RegionDistributionChart, StreetTypeChart, DataHealthChart } from './Charts';

interface DashboardOverviewProps {
  data: {
    counts: {
      regions: number;
      districts: number;
      mahallas: number;
      streets: number;
      properties: number;
    };
    charts: {
      regions: { name: string; mahallas: number; districts: number }[];
      streetTypes: { name: string; value: number }[];
      dataHealth: { hiddenMahallas: number; totalMahallas: number };
    };
  };
}

export function DashboardOverview({ data }: DashboardOverviewProps) {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Umumiy ko'rinish</h2>
      </div>
      
      <AnalyticsCards counts={data.counts} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RegionDistributionChart data={data.charts.regions} />
        <StreetTypeChart data={data.charts.streetTypes} />
        <DataHealthChart 
          hidden={data.charts.dataHealth.hiddenMahallas} 
          total={data.charts.dataHealth.totalMahallas} 
        />
      </div>
    </div>
  );
}
