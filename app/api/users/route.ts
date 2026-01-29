import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const skip = (page - 1) * limit;
    
    // Filters
    const search = searchParams.get('search') || '';
    const userType = searchParams.get('userType') || 'all'; // all, region, district
    const status = searchParams.get('status') || 'all'; // all, active, vacant
    const regionId = searchParams.get('regionId') || '';
    const districtId = searchParams.get('districtId') || '';

    // Build where clauses
    const regionWhere: any = {};
    const districtWhere: any = {};

    // Search filter
    if (search) {
      const searchFilter = {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { jshshir: { contains: search, mode: 'insensitive' } },
          { phoneNumber: { contains: search, mode: 'insensitive' } },
        ],
      };
      regionWhere.AND = [searchFilter];
      districtWhere.AND = [searchFilter];
    }

    // Status filter
    if (status !== 'all') {
      regionWhere.status = status;
      districtWhere.status = status;
    }

    // Region filter
    if (regionId) {
      regionWhere.regionId = regionId;
      districtWhere.district = {
        regionId: regionId,
      };
    }

    // District filter
    if (districtId) {
      districtWhere.districtId = districtId;
    }

    // Fetch data based on userType
    let regionUsers: any[] = [];
    let districtUsers: any[] = [];
    let totalRegionUsers = 0;
    let totalDistrictUsers = 0;

    if ((userType === 'all' || userType === 'region') && !districtId) {
      [regionUsers, totalRegionUsers] = await Promise.all([
        prisma.regionUser.findMany({
          where: regionWhere,
          include: {
            region: {
              select: {
                nameUz: true,
                code: true,
              },
            },
          },
          skip: userType === 'region' ? skip : 0,
          take: userType === 'region' ? limit : undefined,
          orderBy: { region: { nameUz: 'asc' } },
        }),
        prisma.regionUser.count({ where: regionWhere }),
      ]);
    }

    if (userType === 'all' || userType === 'district') {
      [districtUsers, totalDistrictUsers] = await Promise.all([
        prisma.districtUser.findMany({
          where: districtWhere,
          include: {
            district: {
              select: {
                nameUz: true,
                code: true,
                region: {
                  select: {
                    nameUz: true,
                  },
                },
              },
            },
          },
          skip: userType === 'district' ? skip : 0,
          take: userType === 'district' ? limit : undefined,
          orderBy: { district: { region: { nameUz: 'asc' } } },
        }),
        prisma.districtUser.count({ where: districtWhere }),
      ]);
    }

    // Transform data to unified format
    const transformedRegionUsers = regionUsers.map((user) => ({
      id: user.id,
      fullName: user.fullName || '-',
      jshshir: user.jshshir || '-',
      phoneNumber: user.phoneNumber || '-',
      position: user.position === 'boss' ? 'Sho\'ba boshligi' : 'Sho\'ba bosh mutaxassisi',
      status: user.status,
      location: user.region.nameUz,
      locationCode: user.region.code,
      region: user.region.nameUz,
      userType: 'region' as const,
      createdAt: user.createdAt,
    }));

    const transformedDistrictUsers = districtUsers.map((user) => ({
      id: user.id,
      fullName: user.fullName || '-',
      jshshir: user.jshshir || '-',
      phoneNumber: user.phoneNumber || '-',
      position: 'Tuman xodimi',
      status: user.status,
      location: user.district.nameUz,
      locationCode: user.district.code,
      region: user.district.region.nameUz,
      userType: 'district' as const,
      createdAt: user.createdAt,
    }));

    // Combine and sort
    let allUsers = [...transformedRegionUsers, ...transformedDistrictUsers];
    const totalCount = totalRegionUsers + totalDistrictUsers;

    // If fetching all types, apply pagination after combining
    if (userType === 'all') {
      allUsers = allUsers
        .sort((a, b) => {
          const regionSort = a.region.localeCompare(b.region);
          if (regionSort !== 0) return regionSort;
          return a.fullName.localeCompare(b.fullName);
        })
        .slice(skip, skip + limit);
    }

    return NextResponse.json({
      users: allUsers,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats: {
        totalRegionUsers,
        totalDistrictUsers,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userType, fullName, jshshir, phoneNumber, position, status, regionId, districtId } = body;

    if (!userType) {
      return NextResponse.json({ error: 'User type is required' }, { status: 400 });
    }

    if (userType === 'region') {
      if (!regionId || !position) {
        return NextResponse.json({ error: 'Missing required fields for region user' }, { status: 400 });
      }

      if (status !== 'vacant' && (!fullName || !jshshir || !phoneNumber)) {
        return NextResponse.json({ error: 'Missing personal data for active user' }, { status: 400 });
      }

      const user = await prisma.regionUser.create({
        data: {
          fullName: fullName || null,
          jshshir: jshshir || null,
          phoneNumber: phoneNumber || null,
          position: position as any,
          status: (status || 'active') as any,
          region: { connect: { id: regionId } },
        },
      });
      return NextResponse.json(user);
    } else if (userType === 'district') {
      if (!districtId) {
        return NextResponse.json({ error: 'District ID is required for district user' }, { status: 400 });
      }

      const user = await prisma.districtUser.create({
        data: {
          fullName: fullName || null,
          jshshir: jshshir || null,
          phoneNumber: phoneNumber || null,
          status: (status || 'active') as any,
          district: { connect: { id: districtId } },
        },
      });
      return NextResponse.json(user);
    }

    return NextResponse.json({ error: 'Invalid user type' }, { status: 400 });
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json({ error: 'Bu JSHSHIR band qilingan' }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, userType, fullName, jshshir, phoneNumber, position, status, regionId, districtId } = body;

    if (!id || !userType) {
      return NextResponse.json({ error: 'ID and user type are required' }, { status: 400 });
    }

    if (userType === 'region') {
      const updateData: any = {};
      updateData.fullName = fullName || null;
      updateData.jshshir = jshshir || null;
      updateData.phoneNumber = phoneNumber || null;
      if (position !== undefined) updateData.position = position as any;
      if (status !== undefined) updateData.status = status as any;

      const user = await prisma.regionUser.update({
        where: { id },
        data: {
          ...updateData,
          region: regionId ? { connect: { id: regionId } } : undefined,
        },
      });
      return NextResponse.json(user);
    } else if (userType === 'district') {
      const updateData: any = {};
      updateData.fullName = fullName || null;
      updateData.jshshir = jshshir || null;
      updateData.phoneNumber = phoneNumber || null;
      if (status !== undefined) updateData.status = status as any;

      const user = await prisma.districtUser.update({
        where: { id },
        data: {
          ...updateData,
          district: districtId ? { connect: { id: districtId } } : undefined,
        },
      });
      return NextResponse.json(user);
    }

    return NextResponse.json({ error: 'Invalid user type' }, { status: 400 });
  } catch (error) {
    console.error('Error in PATCH /api/users:', error);
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json({ error: 'Bu JSHSHIR band qilingan' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userType = searchParams.get('userType');

    if (!id || !userType) {
      return NextResponse.json({ error: 'ID and user type are required' }, { status: 400 });
    }

    if (userType === 'region') {
      await prisma.regionUser.delete({
        where: { id },
      });
    } else if (userType === 'district') {
      await prisma.districtUser.delete({
        where: { id },
      });
    } else {
      return NextResponse.json({ error: 'Invalid user type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/users:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
