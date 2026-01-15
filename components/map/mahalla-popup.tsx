'use client';

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MahallaData, RegionData, DistrictData } from '@/types/map';

interface MahallaPopupProps {
  mahalla: MahallaData;
  region?: RegionData;
  district?: DistrictData;
  onClose: () => void;
}

export function MahallaPopup({ mahalla, region, district, onClose }: MahallaPopupProps) {
  return (
    <div className="absolute bottom-6 right-6 z-[2000] w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="bg-[#2D334A] p-4 flex items-center justify-between">
        <h3 className="text-white font-semibold text-base truncate">
          Mahalla ma'lumotlari
        </h3>
        <button 
          onClick={onClose}
          className="text-white/70 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <div className="space-y-3">
          <InfoRow label="Mahalla nomi" value={mahalla.nameUz} />
          <InfoRow 
            label="Manzili" 
            value={`${region?.nameUz || ''}, ${district?.nameUz || ''}`} 
          />
          <InfoRow label="UzKad kodi" value={mahalla.code} />
          <InfoRow label="Geonames kodi" value={mahalla.geoCode || '-'} />
          <InfoRow label="Mavjud ko'chalar soni" value={mahalla.streetCount?.toString() || '0'} />
          <InfoRow label="Kengash qarori" value={mahalla.regulation || '-'} />
          <InfoRow label="Tarixiy nomi" value={mahalla.oldName || '-'} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 text-sm leading-tight py-1">
      <span className="text-slate-500 dark:text-slate-400 font-medium">{label}</span>
      <span className="text-slate-900 dark:text-slate-100 font-semibold text-right break-words">
        {value}
      </span>
    </div>
  );
}
