'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { StatCard } from './StatCard';
import { getDistrictAnalytics } from '@/lib/data';

interface RegionalAnalyticsProps {
  data: {
    region: {
      id: string;
      nameUz: string;
      nameRu: string | null;
      code: string;
    };
    districts: {
      id: string;
      nameUz: string;
      code: string;
    }[];
    stats: {
      districts: number;
      mahallas: {
        total: number;
        active: number;
        hidden: number;
        merged: number;
      };
      streets: {
        total: number;
        byType: { type: string; count: number }[];
      };
      properties: {
        total: number;
        byType: { type: string; count: number }[];
      };
    };
  }[];
}

export function RegionalAnalytics({ data }: RegionalAnalyticsProps) {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());
  const [districtData, setDistrictData] = useState<any>(null);
  const [isLoadingDistrict, setIsLoadingDistrict] = useState(false);
  
  // Calculate Respublika-level aggregated data
  const respublikaData = {
    region: {
      id: 'respublika',
      nameUz: 'Respublika',
      nameRu: null,
      code: 'UZ'
    },
    stats: {
      mahallas: {
        total: data.reduce((sum, item) => sum + item.stats.mahallas.total, 0),
        active: data.reduce((sum, item) => sum + item.stats.mahallas.active, 0),
        hidden: data.reduce((sum, item) => sum + item.stats.mahallas.hidden, 0),
        merged: data.reduce((sum, item) => sum + item.stats.mahallas.merged, 0),
      },
      streets: {
        total: data.reduce((sum, item) => sum + item.stats.streets.total, 0),
        byType: (() => {
          // Aggregate street types across all regions
          const typeMap = new Map<string, number>();
          data.forEach(region => {
            region.stats.streets.byType.forEach(st => {
              const current = typeMap.get(st.type) || 0;
              typeMap.set(st.type, current + st.count);
            });
          });
          return Array.from(typeMap.entries()).map(([type, count]) => ({ type, count }));
        })()
      },
      properties: {
        total: data.reduce((sum, item) => sum + item.stats.properties.total, 0),
        byType: (() => {
          const typeMap = new Map<string, number>();
          data.forEach(region => {
            region.stats.properties.byType.forEach(pt => {
              const current = typeMap.get(pt.type) || 0;
              typeMap.set(pt.type, current + pt.count);
            });
          });
          return Array.from(typeMap.entries()).map(([type, count]) => ({ type, count }));
        })()
      }
    }
  };

  const selectedData = selectedRegionId 
    ? data.find(d => d.region.id === selectedRegionId)
    : null;

  const toggleRegion = (regionId: string) => {
    const newExpanded = new Set(expandedRegions);
    if (newExpanded.has(regionId)) {
      newExpanded.delete(regionId);
    } else {
      newExpanded.add(regionId);
    }
    setExpandedRegions(newExpanded);
    setSelectedRegionId(regionId);
    setSelectedDistrictId(null);
    setDistrictData(null);
  };

  const handleDistrictClick = async (districtId: string) => {
    setSelectedDistrictId(districtId);
    setIsLoadingDistrict(true);
    try {
      const data = await getDistrictAnalytics(districtId);
      setDistrictData(data);
    } catch (error) {
      console.error('Failed to load district data:', error);
    } finally {
      setIsLoadingDistrict(false);
    }
  };

  if (!data || data.length === 0) return null;

  // Use district data if a district is selected, otherwise use region or respublika data
  const displayData = districtData || selectedData || respublikaData;
  const isDistrictView = !!districtData;
  const isRespublikaView = !selectedRegionId && !districtData;

  return (
    <div className="flex h-full">
      {/* Sidebar - Fixed with scrollable content */}
      <div className="w-64 border-r-2 border-border bg-card flex flex-col h-full shadow-sm">
        <div className="p-4 border-b shrink-0">
          <button
            onClick={() => {
              setSelectedRegionId(null);
              setSelectedDistrictId(null);
              setDistrictData(null);
              setExpandedRegions(new Set());
            }}
            className={`w-full text-left font-bold text-lg px-3 py-2 rounded-lg transition-colors ${
              isRespublikaView 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-muted'
            }`}
          >
            Respublika
          </button>
        </div>
        <nav className="p-2 flex-1 overflow-y-auto">
          {data.map((item) => (
            <div key={item.region.id} className="mb-1">
              <button
                onClick={() => toggleRegion(item.region.id)}
                className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors flex items-center justify-between ${
                  selectedRegionId === item.region.id && !selectedDistrictId
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'hover:bg-muted'
                }`}
              >
                <span>{item.region.nameUz}</span>
                {expandedRegions.has(item.region.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              
              {/* Districts submenu */}
              {expandedRegions.has(item.region.id) && item.districts.length > 0 && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.districts.map((district) => (
                    <button
                      key={district.id}
                      onClick={() => handleDistrictClick(district.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedDistrictId === district.id
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'hover:bg-muted'
                      }`}
                    >
                      • {district.nameUz}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto bg-blue-50 dark:bg-gray-900">
        {isLoadingDistrict ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Yuklanmoqda...</div>
          </div>
        ) : (
          <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {isDistrictView 
                  ? displayData.district.nameUz 
                  : isRespublikaView
                    ? 'O\'zbekiston Respublikasi'
                    : displayData.region.nameUz
                }
              </h1>
            </div>

            {/* Mahallas Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-emerald-600 dark:text-emerald-400">Mahallalar</span>
                <span className="text-muted-foreground">statistikasi</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Jami mahallalar"
                  count={displayData.stats.mahallas.total}
                  variant="success"
                  label="Soni"
                />
                <StatCard
                  title="Faol mahallalar"
                  count={displayData.stats.mahallas.active}
                  variant="info"
                  label="Soni"
                />
                <StatCard
                  title="Optimallashgan"
                  count={displayData.stats.mahallas.hidden}
                  variant="danger"
                  label="Soni"
                />
              </div>
            </div>

            {/* Streets Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400">Ko'chalar</span>
                <span className="text-muted-foreground">statistikasi</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Jami ko'chalar"
                  count={displayData.stats.streets.total}
                  variant="success"
                  label="Soni"
                />
                {displayData.stats.streets.byType.slice(0, 4).map((typeData: any, idx: number) => {
                  const variants: Array<'info' | 'warning'> = ['info', 'warning'];
                  return (
                    <StatCard
                      key={typeData.type}
                      title={typeData.type}
                      count={typeData.count}
                      variant={variants[idx] || 'info'}
                      label="Soni"
                    />
                  );
                })}
              </div>
            </div>

            {/* Districts & Properties (only show for region view) */}
            {!isDistrictView && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-purple-600 dark:text-purple-400">Ko'chmas mulk</span>
                  <span className="text-muted-foreground">statistikasi</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Ko'chmas mulk"
                    count={displayData.stats.properties.total}
                    variant="success"
                    label="Soni"
                  />
                  {displayData.stats.properties.byType.slice(0, 3).map((typeData: any, idx: number) => {
                    const variants: Array<'info' | 'warning'> = ['info', 'warning'];
                    return (
                      <StatCard
                        key={typeData.type}
                        title={typeData.type}
                        count={typeData.count}
                        variant={variants[idx] || 'info'}
                        label="Soni"
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Properties for district view */}
            {isDistrictView && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-purple-600 dark:text-purple-400">Ko'chmas mulk</span>
                  <span className="text-muted-foreground">statistikasi</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title="Ko'chmas mulk"
                    count={displayData.stats.properties.total}
                    variant="success"
                    label="Soni"
                  />
                  {displayData.stats.properties.byType.slice(0, 3).map((typeData: any, idx: number) => {
                    const variants: Array<'info' | 'warning'> = ['info', 'warning'];
                    return (
                      <StatCard
                        key={typeData.type}
                        title={typeData.type}
                        count={typeData.count}
                        variant={variants[idx] || 'info'}
                        label="Soni"
                      />
                    );
                  })}
                </div>
              </div>
            )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
