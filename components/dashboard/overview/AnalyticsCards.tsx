'use client';

import { Map, Navigation, Home, Waypoints, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalyticsCardsProps {
  counts: {
    regions: number;
    districts: number;
    mahallas: number;
    streets: number;
    properties: number;
  };
}

export function AnalyticsCards({ counts }: AnalyticsCardsProps) {
  const cards = [
    {
      title: 'Viloyatlar',
      value: counts.regions,
      icon: Map,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Tumanlar',
      value: counts.districts,
      icon: Navigation,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
    {
      title: 'Mahallalar',
      value: counts.mahallas,
      icon: Home,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      title: "Ko'chalar",
      value: counts.streets,
      icon: Waypoints,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      title: "Ko'chmas Mulk",
      value: counts.properties,
      icon: Building2,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-900/20',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-700 hover:border-primary/30 dark:hover:border-primary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
