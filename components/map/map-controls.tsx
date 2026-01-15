'use client';

import React from 'react';
import { Map, Satellite, Layers } from 'lucide-react';
import { BaseMapKey, baseMaps } from '@/services/baseMaps';

interface MapControlsProps {
  currentBaseMap: BaseMapKey;
  onBaseMapChange: (key: BaseMapKey) => void;
  onLayersToggle?: () => void;
}

import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const MapControls = ({ 
  currentBaseMap, 
  onBaseMapChange,
  onLayersToggle 
}: MapControlsProps) => {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-[1000]">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onBaseMapChange('osm')}
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-110 active:scale-95 border-2 ${
                currentBaseMap === 'osm' 
                  ? 'bg-blue-600 text-white border-blue-400' 
                  : 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-600 dark:text-slate-200 border-transparent hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <Map size={22} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="font-medium">
            Oddiy xarita
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onBaseMapChange('satellite')}
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300 hover:scale-110 active:scale-95 border-2 ${
                currentBaseMap === 'satellite' 
                  ? 'bg-blue-600 text-white border-blue-400' 
                  : 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-600 dark:text-slate-200 border-transparent hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              <Satellite size={22} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="font-medium">
            Sputnik xaritasi
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
