'use client';

import React from 'react';
import { Loader2, Map as MapIcon, Navigation, Home, Waypoints, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MapLoader() {
  return (
    <div className="relative w-full h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Mocked Filters Navbar */}
      <div className='absolute top-3 left-1/2 -translate-x-1/2 z-[1000] w-fit max-w-[95%] opacity-50 pointer-events-none'>
        <div className='flex items-center gap-3 p-2 bg-background/95 backdrop-blur-md border rounded-xl shadow-lg'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-44 h-10 border rounded-lg bg-background flex items-center justify-between px-3">
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <ChevronDown size={16} className="text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>

      {/* Mocked Statistics Panel */}
      <div className="absolute top-3 right-3 z-[1000] w-64 bg-background/95 backdrop-blur-md border rounded-xl shadow-xl overflow-hidden opacity-50 pointer-events-none">
        <div className="px-4 py-3 border-b bg-muted/30">
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        </div>
        <div className="p-3 space-y-2">
          {[
            { icon: MapIcon, color: 'text-blue-500', bgColor: 'bg-blue-50' },
            { icon: Navigation, color: 'text-indigo-500', bgColor: 'bg-indigo-50' },
            { icon: Home, color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
            { icon: Waypoints, color: 'text-amber-500', bgColor: 'bg-amber-50' }
          ].map((stat, idx) => (
            <div key={idx} className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <div className={cn("p-1.5 rounded-md", stat.bgColor)}>
                  <stat.icon className={cn("size-4", stat.color)} />
                </div>
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-4 w-12 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Spinner */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/20 backdrop-blur-[2px]">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping scale-150" />
          <div className="relative bg-background p-4 rounded-full shadow-2xl border border-primary/20">
            <Loader2 className="size-10 text-primary animate-spin" />
          </div>
        </div>
        <div className="mt-6 text-center space-y-2">
          <p className="text-lg font-bold text-foreground animate-pulse">Xarita yuklanmoqda</p>
        </div>
      </div>

      {/* Mocked Map Contours (Visual Polish) */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] pointer-events-none select-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
    </div>
  );
}
