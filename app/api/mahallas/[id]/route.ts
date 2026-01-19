import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';

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

    // Revalidate paths and tags that use this data
    revalidatePath('/dashboard');
    revalidatePath('/address-data');
    revalidatePath('/analytics');
    revalidatePath(`/address-data/mahalla/${id}`);
    
    // Invalidate analytics cache
    revalidateTag('dashboard-analytics');
    revalidateTag('regional-analytics');
    revalidateTag('street-polygons');
    revalidateTag('properties');

    return NextResponse.json(updatedMahalla);
  } catch (error) {
    console.error('Error updating mahalla:', error);
    return NextResponse.json(
      { error: 'Failed to update mahalla' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { id } = params;

  try {
    const deletedMahalla = await prisma.mahalla.delete({
      where: { id },
    });

    // Revalidate paths and tags that use this data
    revalidatePath('/dashboard');
    revalidatePath('/address-data');
    revalidatePath('/analytics');
    
    // Invalidate analytics cache
    revalidateTag('dashboard-analytics');
    revalidateTag('regional-analytics');
    revalidateTag('street-polygons');
    revalidateTag('properties');

    return NextResponse.json(deletedMahalla);
  } catch (error) {
    console.error('Error deleting mahalla:', error);
    return NextResponse.json(
      { error: 'Failed to delete mahalla' },
      { status: 500 }
    );
  }
}
