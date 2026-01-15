import { useMemo } from 'react';
import type { DashboardData, TabType, DashboardItem } from '@/types/dashboard';

export function useDashboardData(
  data: DashboardData,
  activeTab: TabType,
  searchTerm: string,
  selectedRegion: string,
  selectedDistrict: string
) {
  const filteredData = useMemo(() => {
    let filtered: DashboardItem[] = [];

    switch (activeTab) {
      case 'regions':
        filtered = data.regions;
        break;
      case 'districts':
        filtered = selectedRegion
          ? data.districts.filter((d) => d.regionId === selectedRegion)
          : data.districts;
        break;
      case 'mahallas':
        filtered = data.mahallas;
        if (selectedRegion) {
          filtered = (filtered as any[]).filter(
            (m) => m.district.regionId === selectedRegion
          );
        }
        if (selectedDistrict) {
          filtered = (filtered as any[]).filter((m) => m.districtId === selectedDistrict);
        }
        break;
      case 'streets':
        filtered = data.streets;
        if (selectedRegion) {
          filtered = (filtered as any[]).filter(
            (s) => s.district.regionId === selectedRegion
          );
        }
        if (selectedDistrict) {
          filtered = (filtered as any[]).filter((s) => s.districtId === selectedDistrict);
        }
        break;
      case 'addresses':
        filtered = data.addresses;
        if (selectedRegion) {
          filtered = (filtered as any[]).filter(
            (a) => a.regionId === selectedRegion
          );
        }
        if (selectedDistrict) {
          filtered = (filtered as any[]).filter((a) => a.districtId === selectedDistrict);
        }
        break;
    }

    if (searchTerm) {
      filtered = filtered.filter((item) => {
        if (activeTab === 'addresses') {
          const addr = item as any;
          return (
            (addr.regionName && addr.regionName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (addr.districtName && addr.districtName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (addr.mahallaName && addr.mahallaName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (addr.streetName && addr.streetName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (addr.houseNumber && addr.houseNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (addr.description && addr.description.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }
        return (
          item.nameUz.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.nameRu &&
            item.nameRu.toLowerCase().includes(searchTerm.toLowerCase())) ||
          item.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    return filtered;
  }, [data, activeTab, searchTerm, selectedRegion, selectedDistrict]);

  const availableDistricts = useMemo(() => {
    if (!selectedRegion) return [];
    return data.districts.filter((d) => d.regionId === selectedRegion);
  }, [selectedRegion, data.districts]);

  return {
    filteredData,
    availableDistricts,
  };
}

