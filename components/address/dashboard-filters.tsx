import type { Region, District, TabType } from '@/types/dashboard';
import { ExportButton } from './export-button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DashboardFiltersProps {
  activeTab: TabType;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedRegion: string;
  onRegionChange: (regionId: string) => void;
  selectedDistrict: string;
  onDistrictChange: (districtId: string) => void;
  availableDistricts: District[];
  regions: Region[];
  onExport: () => void;
  isExporting: boolean;
  canExport: boolean;
  selectedHidden?: string;
  onHiddenChange?: (value: string) => void;
}

export function DashboardFilters({
  activeTab,
  searchTerm,
  onSearchChange,
  selectedRegion,
  onRegionChange,
  selectedDistrict,
  onDistrictChange,
  availableDistricts,
  regions,
  onExport,
  isExporting,
  canExport,
  selectedHidden = '',
  onHiddenChange = () => {},
}: DashboardFiltersProps) {
  return (
    <div className='p-4'>
      <div className='flex flex-wrap justify-between items-center gap-4 mb-4'>
        {/* Search Input */}
        <Input
          placeholder='Qidiruv...'
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
          className="w-80 shadow-sm transition-all focus:ring-4 focus:ring-primary/10"
        />

      <div className='flex flex-wrap items-center gap-4'>
              {/* Region Select */}
        {activeTab !== 'regions' && (
          <Select
            value={selectedRegion || "all"}
            onValueChange={(value) => onRegionChange(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Hudud tanlang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Hudud tanlang</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.id}>
                  {region.nameUz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* District Select */}
        {(activeTab === 'mahallas' || activeTab === 'streets' || activeTab === 'addresses') &&
          selectedRegion && (
            <Select
              value={selectedDistrict || "all"}
              onValueChange={(value) => onDistrictChange(value === "all" ? "" : value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tuman tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tuman tanlang</SelectItem>
                {availableDistricts.map((district) => (
                  <SelectItem key={district.id} value={district.id}>
                    {district.nameUz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

        {/* Hidden Status Filter for Mahallas */}
        {activeTab === 'mahallas' && (
          <Select
            value={selectedHidden || "all"}
            onValueChange={(value) => onHiddenChange(value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Optimallashgan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Optimallashgan</SelectItem>
              <SelectItem value="true">Optimallashgan (ha)</SelectItem>
              <SelectItem value="false">Optimallashgan (yo'q)</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Export Button */}
        <ExportButton
          onExport={onExport}
          isExporting={isExporting}
          disabled={!canExport}
        />
      </div>
      </div>
    </div>
  );
}
