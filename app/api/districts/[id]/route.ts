import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { id } = params;

  try {
    const body = await request.json();
    const { nameUz, nameRu, code, regionId } = body;

    const updatedDistrict = await prisma.district.update({
      where: { id },
      data: {
        nameUz,
        nameRu,
        code,
        region: { connect: { id: regionId } },
      },
    });

    return NextResponse.json(updatedDistrict);
  } catch (error) {
    console.error('Error updating district:', error);
    return NextResponse.json(
      { error: 'Failed to update district' },
      { status: 500 }
    );
  }
}
