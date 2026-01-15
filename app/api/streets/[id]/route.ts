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
    const { nameUz, nameRu, code, districtId } = body;

    const updatedStreet = await prisma.street.update({
      where: { id },
      data: {
        nameUz,
        nameRu,
        code,
        district: { connect: { id: districtId } },
      },
    });

    return NextResponse.json(updatedStreet);
  } catch (error) {
    console.error('Error updating street:', error);
    return NextResponse.json(
      { error: 'Failed to update street' },
      { status: 500 }
    );
  }
}
