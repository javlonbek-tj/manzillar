'use server';

import prisma from './prisma';
import type { RegionData, DistrictData, MahallaData, MavzeData } from '@/types/map';

// Fetch all regions
export async function getRegions(): Promise<RegionData[]> {
  try {
    const regions = await prisma.region.findMany({
      orderBy: { nameUz: 'asc' },
    });
    // Prisma returns generic JSON types, we cast them to our specific interfaces
    return regions as unknown as RegionData[];
  } catch (error) {
    console.error('Failed to fetch regions:', error);
    return [];
  }
}

// Fetch districts for a specific region
export async function getDistricts(regionId: string): Promise<DistrictData[]> {
  if (!regionId) return [];
  try {
    const districts = await prisma.district.findMany({
      where: { regionId },
      orderBy: { nameUz: 'asc' },
    });
    return districts as unknown as DistrictData[];
  } catch (error) {
    console.error('Failed to fetch districts:', error);
    return [];
  }
}

// Fetch mahallas for a specific district
export async function getMahallas(districtId: string): Promise<MahallaData[]> {
  if (!districtId) return [];
  try {
    const mahallas = await prisma.mahalla.findMany({
      where: { districtId },
      orderBy: { nameUz: 'asc' },
    });
    return mahallas as unknown as MahallaData[];
  } catch (error) {
    console.error('Failed to fetch mahallas:', error);
    return [];
  }
}

// Fetch mavzes for a specific district
export async function getMavzes(districtId: string): Promise<MavzeData[]> {
  if (!districtId) return [];
  try {
    const mavzes = await prisma.mavze.findMany({
      where: { districtId },
    });
    return mavzes as unknown as MavzeData[];
  } catch (error) {
    console.error('Failed to fetch mavzes:', error);
    return [];
  }
}

// Fetch all regions with their districts (for structure page)
export async function getAllRegionsWithDistricts() {
  try {
    const regions = await prisma.region.findMany({
      include: {
        districts: {
          orderBy: { nameUz: 'asc' },
        },
      },
      orderBy: { nameUz: 'asc' },
    });
    return regions;
  } catch (error) {
    console.error('Failed to fetch regions with districts:', error);
    return [];
  }
}

// Fetch statistics for dashboard
export async function getStatistics() {
  try {
    const [regionCount, districtCount, mahallaCount, propertyCount] = await Promise.all([
      prisma.region.count(),
      prisma.district.count(),
      prisma.mahalla.count(),
      prisma.property.count(),
    ]);

    return {
      regions: regionCount,
      districts: districtCount,
      mahallas: mahallaCount,
      properties: propertyCount,
    };
  } catch (error) {
    console.error('Failed to fetch statistics:', error);
    return {
      regions: 0,
      districts: 0,
      mahallas: 0,
      properties: 0,
    };
  }
}

// Fetch all statistics for a specific context
export async function getGlobalStatistics() {
  try {
    const [regions, districts, mahallas, streets] = await Promise.all([
      prisma.region.count(),
      prisma.district.count(),
      prisma.mahalla.count(),
      prisma.street.count(),
    ]);

    return { regions, districts, mahallas, streets };
  } catch (error) {
    console.error('Failed to fetch global statistics:', error);
    return { regions: 0, districts: 0, mahallas: 0, streets: 0 };
  }
}

export async function getRegionStatistics(regionId: string) {
  if (!regionId) return null;
  try {
    const [districts, mahallas, streets] = await Promise.all([
      prisma.district.count({ where: { regionId } }),
      prisma.mahalla.count({ where: { district: { regionId } } }),
      prisma.street.count({ where: { district: { regionId } } }),
    ]);

    return { districts, mahallas, streets };
  } catch (error) {
    console.error('Failed to fetch region statistics:', error);
    return { districts: 0, mahallas: 0, streets: 0 };
  }
}

export async function getDistrictStatistics(districtId: string) {
  if (!districtId) return null;
  try {
    const [mahallas, streets] = await Promise.all([
      prisma.mahalla.count({ where: { districtId } }),
      prisma.street.count({ where: { districtId } }),
    ]);

    return { mahallas, streets };
  } catch (error) {
    console.error('Failed to fetch district statistics:', error);
    return { mahallas: 0, streets: 0 };
  }
}

// Fetch initial data for map (regions with basic info)
export async function getMapInitialData() {
  try {
    const regions = await prisma.region.findMany({
      select: {
        id: true,
        nameUz: true,
        nameRu: true,
        geometry: true,
      },
      orderBy: { nameUz: 'asc' },
    });
    return regions;
  } catch (error) {
    console.error('Failed to fetch map initial data:', error);
    return [];
  }
}


export async function getStreets(mahallaId: string) {
  if (!mahallaId) return [];
  try {
    const mahalla = await prisma.mahalla.findUnique({
      where: { id: mahallaId },
      select: { code: true }
    });

    if (!mahalla) return [];

    const streets = await prisma.street.findMany({
      where: { mahallaId: mahalla.code },
      orderBy: { nameUz: 'asc' },
    });
    return streets;
  } catch (error) {
    console.error('Failed to fetch streets:', error);
    return [];
  }
}

export async function getStreetsByDistrict(districtId: string) {
  if (!districtId) return [];
  try {
    const streets = await prisma.street.findMany({
      where: { districtId },
      orderBy: { nameUz: 'asc' },
    });
    return streets;
  } catch (error) {
    console.error('Failed to fetch district streets:', error);
    return [];
  }
}

export async function getProperties(districtId?: string) {
  try {
    const properties = await prisma.property.findMany({
      where: {
        districtId,
      },
    });
    return properties;
  } catch (error) {
    console.error('Failed to fetch real estate:', error);
    return [];
  }
}

export async function getDashboardAnalytics() {
  try {
    const [
      totalRegions,
      totalDistricts,
      totalMahallas,
      totalStreets,
      totalProperties,
      streetsByType,
      hiddenMahallas
    ] = await Promise.all([
      prisma.region.count(),
      prisma.district.count(),
      prisma.mahalla.count(),
      prisma.street.count(),
      prisma.property.count(),
      prisma.street.groupBy({
        by: ['type'],
        _count: {
          id: true
        }
      }),
      prisma.mahalla.count({
        where: {
          hidden: true
        }
      })
    ]);

    // Graph data: Mahallas per region
    const regionsWithCounts = await prisma.region.findMany({
      include: {
        districts: {
          include: {
            _count: {
              select: { mahallas: true }
            }
          }
        }
      },
      orderBy: { nameUz: 'asc' }
    });

    const regionStats = regionsWithCounts.map(r => ({
      name: r.nameUz,
      mahallas: r.districts.reduce((acc, d) => acc + d._count.mahallas, 0),
      districts: r.districts.length
    }));

    return {
      counts: {
        regions: totalRegions,
        districts: totalDistricts,
        mahallas: totalMahallas,
        streets: totalStreets,
        properties: totalProperties,
      },
      charts: {
        regions: regionStats,
        streetTypes: streetsByType.map(s => ({ name: s.type || 'Aniqlanmagan', value: s._count.id })),
        dataHealth: {
          hiddenMahallas,
          totalMahallas
        }
      }
    };
  } catch (error) {
    console.error('Failed to fetch dashboard analytics:', error);
    return null;
  }
}export async function getRegionalAnalytics() {
  try {
    const regions = await prisma.region.findMany({
      select: {
        id: true,
        nameUz: true,
        nameRu: true,
        code: true,
      },
      orderBy: { nameUz: 'asc' }
    });

    const analytics = await Promise.all(
      regions.map(async (region) => {
        // Fetch districts for this region
        const districts = await prisma.district.findMany({
          where: { regionId: region.id },
          select: {
            id: true,
            nameUz: true,
            code: true,
          },
          orderBy: { nameUz: 'asc' }
        });

        const [
          totalDistricts,
          totalMahallas,
          activeMahallas,
          hiddenMahallas,
          mergedMahallas,
          totalStreets,
          streetsByType,
          totalProperties,
          propertiesByType
        ] = await Promise.all([
          prisma.district.count({ where: { regionId: region.id } }),
          prisma.mahalla.count({ where: { district: { regionId: region.id } } }),
          prisma.mahalla.count({ 
            where: { 
              district: { regionId: region.id },
              hidden: false
            } 
          }),
          prisma.mahalla.count({ 
            where: { 
              district: { regionId: region.id },
              hidden: true 
            } 
          }),
          prisma.mahalla.count({ 
            where: { 
              district: { regionId: region.id },
              mergedIntoId: { not: null }
            } 
          }),
          prisma.street.count({ where: { district: { regionId: region.id } } }),
          prisma.street.groupBy({
            by: ['type'],
            where: { district: { regionId: region.id } },
            _count: { id: true }
          }),
          prisma.property.count({ where: { district: { regionId: region.id } } }),
          prisma.property.groupBy({
            by: ['type'],
            where: { district: { regionId: region.id } },
            _count: { id: true }
          })
        ]);

        return {
          region: {
            id: region.id,
            nameUz: region.nameUz,
            nameRu: region.nameRu,
            code: region.code
          },
          districts: districts.map(d => ({
            id: d.id,
            nameUz: d.nameUz,
            code: d.code
          })),
          stats: {
            districts: totalDistricts,
            mahallas: {
              total: totalMahallas,
              active: activeMahallas,
              hidden: hiddenMahallas,
              merged: mergedMahallas
            },
            streets: {
              total: totalStreets,
              byType: streetsByType.map(s => ({
                type: s.type || 'Aniqlanmagan',
                count: s._count.id
              }))
            },
            properties: {
              total: totalProperties,
              byType: propertiesByType.map(p => ({
                type: p.type || 'Aniqlanmagan',
                count: p._count.id
              }))
            }
          }
        };
      })
    );

    return analytics;
  } catch (error) {
    console.error('Failed to fetch regional analytics:', error);
    return [];
  }
}


export async function getDistrictAnalytics(districtId: string) {
  try {
    const district = await prisma.district.findUnique({
      where: { id: districtId },
      select: {
        id: true,
        nameUz: true,
        nameRu: true,
        code: true,
        regionId: true,
        region: {
          select: {
            nameUz: true
          }
        }
      }
    });

    if (!district) return null;

    const [
      totalMahallas,
      activeMahallas,
      hiddenMahallas,
      mergedMahallas,
      totalStreets,
      streetsByType,
      totalProperties,
      propertiesByType
    ] = await Promise.all([
      prisma.mahalla.count({ where: { districtId } }),
      prisma.mahalla.count({
        where: {
          districtId,
          hidden: false
        }
      }),
      prisma.mahalla.count({
        where: {
          districtId,
          hidden: true
        }
      }),
      prisma.mahalla.count({
        where: {
          districtId,
          mergedIntoId: { not: null }
        }
      }),
      prisma.street.count({ where: { districtId } }),
      prisma.street.groupBy({
        by: ['type'],
        where: { districtId },
        _count: { id: true }
      }),
      prisma.property.count({ where: { districtId } }),
      prisma.property.groupBy({
        by: ['type'],
        where: { districtId },
        _count: { id: true }
      })
    ]);

    return {
      district: {
        id: district.id,
        nameUz: district.nameUz,
        nameRu: district.nameRu,
        code: district.code,
        regionName: district.region.nameUz
      },
      stats: {
        mahallas: {
          total: totalMahallas,
          active: activeMahallas,
          hidden: hiddenMahallas,
          merged: mergedMahallas
        },
        streets: {
          total: totalStreets,
          byType: streetsByType.map(s => ({
            type: s.type || 'Aniqlanmagan',
            count: s._count.id
          }))
        },
        properties: {
          total: totalProperties,
          byType: propertiesByType.map(p => ({
            type: p.type || 'Aniqlanmagan',
            count: p._count.id
          }))
        }
      }
    };
  } catch (error) {
    console.error('Failed to fetch district analytics:', error);
    return null;
  }
}
