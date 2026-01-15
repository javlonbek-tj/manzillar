import { useState } from 'react';
import * as XLSX from 'xlsx';
import type { DashboardItem, TabType } from '@/types/dashboard';
import type { Region, District, Mahalla, Street } from '@/types/dashboard';

export function useDashboardExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportToExcel = async (
    activeTab: TabType,
    filteredData: DashboardItem[]
  ) => {
    setIsExporting(true);
    try {
      let data: unknown[] = [];
      let filename = '';

      switch (activeTab) {
        case 'regions':
          data = (filteredData as Region[]).map((item, index) => ({
            'T/R': index + 1,
            Nomi: item.nameUz,
            'Soato kodi': item.code,
          }));
          filename = 'Hududlar';
          break;
        case 'districts':
          data = (filteredData as District[]).map((item, index) => ({
            'T/R': index + 1,
            Viloyat: item.region.nameUz,
            'Viloyat SOATO': item.region.code,
            'Tuman nomi': item.nameUz,
            'Tuman SOATO': item.code,
          }));
          filename = 'Tumanlar';
          break;
        case 'mahallas':
          data = (filteredData as Mahalla[]).map((item, index) => ({
            'T/R': index + 1,
            Viloyat: item.district.region.nameUz,
            'Viloyat SOATO': item.district.region.code,
            Tuman: item.district.nameUz,
            'Tuman SOATO': item.district.code,
            'Mahalla nomi': item.nameUz,
            'UzKad kodi': item.code,
            'UzKad nomi': item.uzKadName || '—',
            'APU kodi': item.geoCode || '—',
            '1C kodi': item.oneId || '—',
          }));
          filename = 'Mahallalar';
          break;
        case 'streets':
          data = (filteredData as Street[]).map((item, index) => ({
            'T/R': index + 1,
            Viloyat: item.district.region.nameUz,
            'Viloyat SOATO': item.district.region.code,
            Tuman: item.district.nameUz,
            'Tuman SOATO': item.district.code,
            Mahalla: item.mahalla.nameUz,
            'Koʻcha nomi': item.nameUz,
            'Koʻcha kodi (SOATO)': item.code,
          }));
          filename = 'Kochalar';
          break;
      }

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, activeTab);

      const date = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `${filename}_${date}.xlsx`);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportToExcel,
  };
}

