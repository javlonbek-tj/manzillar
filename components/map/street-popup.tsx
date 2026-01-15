'use client';

import React from 'react';
import { X, Waypoints, MapPin, Hash, Ruler, Tag } from 'lucide-react';

interface StreetPopupProps {
  name: string;
  type?: string;
  length?: number;
  startPoint?: { lat: number; lng: number };
  endPoint?: { lat: number; lng: number };
  onClose: () => void;
}

export function StreetPopup({ 
  name, 
  type, 
  length, 
  startPoint, 
  endPoint, 
  onClose 
}: StreetPopupProps) {
  const formatCoord = (coord?: number) => coord?.toFixed(6) || '—';

  return (
    <div className="min-w-[220px] max-w-[280px] bg-white dark:bg-slate-900 overflow-hidden rounded-lg shadow-xl border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-amber-100 dark:bg-amber-900/30 rounded">
            <Waypoints size={14} className="text-amber-600 dark:text-amber-400" />
          </div>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Ko'cha ma'lumotlari
          </span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X size={14} />
        </button>
      </div>

      <div className="p-3 space-y-3">
        {/* Name section */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Tag size={12} className="text-slate-400" />
            Nomi
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 break-words leading-tight">
            {name}
          </p>
        </div>

        {/* Type & Length grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
              <Hash size={10} />
              Turi
            </div>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {type || 'Aniqlanmagan'}
            </p>
          </div>
          <div className="space-y-1 border-l border-slate-100 dark:border-slate-800 pl-3">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
              <Ruler size={10} />
              Uzunligi
            </div>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {length ? (length > 1000 ? `${(length / 1000).toFixed(2)} km` : `${length.toFixed(0)} m`) : '—'}
            </p>
          </div>
        </div>

        {/* Points section */}
        <div className="pt-2 border-t border-slate-50 dark:border-slate-800/50 space-y-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">
              <MapPin size={10} className="text-emerald-500" />
              Boshlang'ich nuqta
            </div>
            <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded">
              {formatCoord(startPoint?.lat)}, {formatCoord(startPoint?.lng)}
            </p>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">
              <MapPin size={10} className="text-red-500" />
              Tugash nuqtasi
            </div>
            <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded">
              {formatCoord(endPoint?.lat)}, {formatCoord(endPoint?.lng)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
