'use client';

import React from 'react';
import { X } from 'lucide-react';

interface PropertyPopupProps {
  property: {
    id: string;
    owner?: string | null;
    address?: string | null;
    type?: string | null;
    houseNumber?: string | null;
    cadastralNumber?: string | null;
    areaInDoc?: string | null;
    areaReal?: string | null;
    mahalla?: string | null;
    streetName?: string | null;
  };
  onClose: () => void;
}

export const PropertyPopup = ({ property, onClose }: PropertyPopupProps) => {
  return (
    <div className="w-[270px] bg-white dark:bg-[#1e293b] rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.4)] border border-slate-200/50 dark:border-slate-700/50 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      {/* Refined Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b-[2px] border-blue-200 dark:border-blue-800 bg-white dark:bg-[#1e293b]">
        <span className="font-extrabold text-[12px] text-slate-800 dark:text-slate-100 tracking-tight">
          Ko'chmas mulk ma'lumotlari
        </span>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-300 hover:text-slate-500 dark:hover:text-slate-200 transition-all duration-200"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Elegant Info List */}
      <div className="p-1.5 px-3 space-y-0.5">
        <div className="flex justify-between items-center py-2 px-1 border-b border-slate-50/80 dark:border-slate-800/50">
          <span className="text-slate-600 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Uy raqami:</span>
          <span className="font-black text-slate-900 dark:text-slate-50 text-[11px]">{property.houseNumber || '—'}</span>
        </div>

        <div className="flex justify-between items-start py-2 px-1 border-b border-slate-50/80 dark:border-slate-800/50">
          <span className="text-slate-600 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-wider mt-0.5">Mulkdor:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200 text-right leading-[1.3] text-[11px] max-w-[150px]">
            {property.owner || 'Ma\'lumot yo\'q'}
          </span>
        </div>

        <div className="flex justify-between items-start py-2 px-1 border-b border-slate-50/80 dark:border-slate-800/50">
          <span className="text-slate-600 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-wider mt-0.5">Manzil:</span>
          <span className="font-semibold text-slate-600 dark:text-slate-300 text-right leading-[1.3] text-[11px] max-w-[170px]">
            {property.address || `${property.mahalla || ''} ${property.streetName || ''} ${property.houseNumber || ''}`.trim() || 'Ma\'lumot yo\'q'}
          </span>
        </div>

        <div className="flex justify-between items-center py-2 px-1 border-b border-slate-50/80 dark:border-slate-800/50">
          <span className="text-slate-600 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Turi:</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400 text-[11px] bg-indigo-50/50 dark:bg-indigo-900/20 px-1.5 py-0.5 rounded uppercase tracking-tighter">
            {property.type || 'turar'}
          </span>
        </div>

        <div className="flex justify-between items-center py-2 px-1">
          <span className="text-slate-600 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Kadastr raqami:</span>
          <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-[11px] tracking-tight">
            {property.cadastralNumber || '—'}
          </span>
        </div>
      </div>
    </div>
  );
};
