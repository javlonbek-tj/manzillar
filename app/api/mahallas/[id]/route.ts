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
    const {
      nameUz,
      nameRu,
      code,
      districtId,
      uzKadName,
      geoCode,
      oneId,
      hidden,
      mergedIntoId,
      mergedIntoName,
      regulationUrl,
    } = body;

    const updatedMahalla = await prisma.mahalla.update({
      where: { id },
      data: {
        nameUz,
        nameRu,
        code,
        district: { connect: { id: districtId } },
        uzKadName,
        geoCode,
        oneId,
        hidden: Boolean(hidden),
        mergedIntoId,
        mergedIntoName,
        regulationUrl,
      },
    });

    return NextResponse.json(updatedMahalla);
  } catch (error) {
    console.error('Error updating mahalla:', error);
    return NextResponse.json(
      { error: 'Failed to update mahalla' },
      { status: 500 }
    );
  }
}
