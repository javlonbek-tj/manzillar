'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import { useMapFilters } from '@/hooks/use-map-filters';
import type { RegionData } from '@/types/map';
import { cn } from '@/lib/utils';

interface MapFiltersProps {
  regions: RegionData[];
  filterState: ReturnType<typeof useMapFilters>;
  onStreetSelect?: (streetId: string) => void;
  onMahallaSelect?: (mahallaId: string) => void;
}

export function MapFilters({ regions, filterState, onStreetSelect, onMahallaSelect }: MapFiltersProps) {
  const {
    selectedRegion,
    setSelectedRegion,
    districts,
    selectedDistrict,
    setSelectedDistrict,
    mahallas,
    selectedMahalla,
    setSelectedMahalla,
    streets, 
    selectedStreet, 
    setSelectedStreet
  } = filterState;

  const clearFilter = (level: 'region' | 'district' | 'mahalla' | 'street', e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening select
    switch (level) {
      case 'region': setSelectedRegion(''); break;
      case 'district': setSelectedDistrict(''); break;
      case 'mahalla': setSelectedMahalla(''); break;
      case 'street': setSelectedStreet(''); break;
    }
  };

  return (
    <div className='absolute top-3 left-1/2 -translate-x-1/2 z-[1000] w-fit max-w-[95%]'>
      <div className='flex items-center gap-3 p-2 bg-background/95 backdrop-blur-md border rounded-xl shadow-lg'>
        
        {/* Region Select */}
        <div className='flex-shrink-0 relative group'>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className={cn(
              "w-44 h-10 border rounded-lg bg-background text-sm px-3 pr-8",
              selectedRegion && "[&_svg]:hidden"
            )}>
              <SelectValue placeholder="Viloyat" />
            </SelectTrigger>
            {selectedRegion && (
              <button 
                onClick={(e) => clearFilter('region', e)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-md text-slate-400 z-10"
              >
                <X size={14} />
              </button>
            )}
            <SelectContent className='rounded-xl shadow-xl'>
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.id} className='rounded-lg'>
                  {region.nameUz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* District Select */}
        <div className='flex-shrink-0 relative group'>
          <Select 
            value={selectedDistrict} 
            onValueChange={setSelectedDistrict}
            disabled={!selectedRegion}
          >
            <SelectTrigger className={cn(
              "w-44 h-10 border rounded-lg bg-background text-sm px-3 pr-8 disabled:opacity-50",
              selectedDistrict && "[&_svg]:hidden"
            )}>
              <SelectValue placeholder="Tuman" />
            </SelectTrigger>
            {selectedDistrict && (
              <button 
                onClick={(e) => clearFilter('district', e)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-md text-slate-400 z-10"
              >
                <X size={14} />
              </button>
            )}
            <SelectContent className='rounded-xl shadow-xl'>
              {districts.map((d) => (
                <SelectItem key={d.id} value={d.id} className='rounded-lg'>
                  {d.nameUz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mahalla Select */}
        <div className='flex-shrink-0 relative group'>
          <Select 
            value={selectedMahalla} 
            onValueChange={(val) => {
              if (onMahallaSelect) onMahallaSelect(val);
              else setSelectedMahalla(val);
            }}
            disabled={!selectedDistrict}
          >
            <SelectTrigger className={cn(
              "w-44 h-10 border rounded-lg bg-background text-sm px-3 pr-8 disabled:opacity-50",
              selectedMahalla && "[&_svg]:hidden"
            )}>
              <SelectValue placeholder="Mahalla" />
            </SelectTrigger>
            {selectedMahalla && (
              <button 
                onClick={(e) => clearFilter('mahalla', e)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-md text-slate-400 z-10"
              >
                <X size={14} />
              </button>
            )}
            <SelectContent className='rounded-xl shadow-xl'>
              {mahallas.map((m) => (
                <SelectItem key={m.id} value={m.id} className='rounded-lg'>
                  {m.nameUz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Street Select */}
        <div className='flex-shrink-0 relative group'>
          <Select 
            value={selectedStreet} 
            onValueChange={(val) => {
              if (onStreetSelect) onStreetSelect(val);
              else setSelectedStreet(val);
            }}
            disabled={!selectedMahalla}
          >
            <SelectTrigger className={cn(
              "w-44 h-10 border rounded-lg bg-background text-sm px-3 pr-8 disabled:opacity-50",
              selectedStreet && "[&_svg]:hidden"
            )}>
              <SelectValue placeholder="Ko'cha" />
            </SelectTrigger>
            {selectedStreet && (
              <button 
                onClick={(e) => clearFilter('street', e)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-md text-slate-400 z-10"
              >
                <X size={14} />
              </button>
            )}
            <SelectContent className='rounded-xl shadow-xl'>
              {streets.map((s) => (
                <SelectItem key={s.id} value={s.id} className='rounded-lg'>
                  {s.nameUz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
