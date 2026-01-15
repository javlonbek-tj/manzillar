'use client';

import React from 'react';
import { Beaker } from 'lucide-react';

export const TestModeBanner = () => {
  return (
    <div className="fixed top-4 left-0 w-full z-[9999] pointer-events-none overflow-hidden h-10">
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 backdrop-blur-md border border-amber-500/30 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.3)] dark:shadow-[0_4px_20px_-4px_rgba(245,158,11,0.1)] animate-marquee w-fit whitespace-nowrap">
        <Beaker className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-widest">
          Sayt test rejimida ishlamoqda
        </span>
      </div>
    </div>
  );
};
