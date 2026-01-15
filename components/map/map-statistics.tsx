'use client';

import React from 'react';
import { Map, Navigation, Home, Waypoints } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatItem {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

interface MapStatisticsProps {
  stats: StatItem[];
  title?: string;
}

export function MapStatistics({ stats, title = "Statistika" }: MapStatisticsProps) {
  if (stats.length === 0) return null;

  return (
    <div className="absolute top-3 right-3 z-[1000] w-64 bg-background/95 backdrop-blur-md border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="px-4 py-3 border-b flex items-center justify-between bg-muted/30">
        <h3 className="font-semibold text-sm text-foreground/80">{title}</h3>
      </div>
      
      <div className="p-3 space-y-2">
        {stats.map((stat, idx) => (
          <div 
            key={idx}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-1.5 rounded-md transition-transform group-hover:scale-110",
                stat.bgColor
              )}>
                <stat.icon className={cn("size-4", stat.color)} />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
            </div>
            <span className="text-sm font-bold text-foreground tabular-nums">
              {stat.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
      
      {/* Bottom accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50" />
    </div>
  );
}
