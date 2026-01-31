'use client';

import { AnalyticsCharts } from '@/components/analytics/AnalyticsCharts';

interface RegionChartProps {
  data: {
    name: string;
    mahallas: number;
    districts: number;
  }[];
}

export function RegionDistributionChart({ data }: RegionChartProps) {
  // Map data to the format expected by AnalyticsCharts
  const chartData = data.map(region => ({
    name: region.name.replace(' viloyati', '').replace(' Respublikasi', ''),
    value: region.mahallas
  }));

  return (
    <div className="col-span-full lg:col-span-3">
      <AnalyticsCharts
        title="Viloyatlar bo'yicha taqsimot"
        type="bar"
        data={chartData}
        colors={['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']}
      />
    </div>
  );
}

interface StreetTypeChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

export function StreetTypeChart({ data }: StreetTypeChartProps) {
  // Filter and sort data for better visualization
  const filteredData = data.filter(d => d.value > 0).sort((a, b) => b.value - a.value);

  return (
    <div className="col-span-full lg:col-span-2">
      <AnalyticsCharts
        title="Ko'cha turlari"
        type="pie"
        data={filteredData}
        colors={['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#2563eb', '#1d4ed8']}
      />
    </div>
  );
}

interface DataHealthChartProps {
  hidden: number;
  total: number;
}

export function DataHealthChart({ hidden, total }: DataHealthChartProps) {
  const visible = total - hidden;
  const data = [
    { name: 'Faol', value: visible },
    { name: 'Optimallashgan', value: hidden },
  ];

  return (
    <div className="col-span-full lg:col-span-2">
      <AnalyticsCharts
        title="Ma'lumot holati"
        type="pie"
        data={data}
        colors={['#10b981', '#ef4444']}
      />
    </div>
  );
}
