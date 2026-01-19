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
    const { nameUz, nameRu, code } = body;

    const updatedRegion = await prisma.region.update({
      where: { id },
      data: {
        nameUz,
        nameRu,
        code,
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/address-data');
    revalidatePath('/analytics');
    revalidatePath('/');

    // Invalidate analytics cache
    revalidateTag('dashboard-analytics');
    revalidateTag('regional-analytics');
    revalidateTag('regions');
    revalidateTag('map-initial-data');

    return NextResponse.json(updatedRegion);
  } catch (error) {
    console.error('Error updating region:', error);
    return NextResponse.json(
      { error: 'Failed to update region' },
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
    const deletedRegion = await prisma.region.delete({
      where: { id },
    });

    revalidatePath('/dashboard');
    revalidatePath('/address-data');
    revalidatePath('/analytics');
    revalidatePath('/');

    // Invalidate analytics cache
    revalidateTag('dashboard-analytics');
    revalidateTag('regional-analytics');
    revalidateTag('regions');
    revalidateTag('map-initial-data');

    return NextResponse.json(deletedRegion);
  } catch (error) {
    console.error('Error deleting region:', error);
    return NextResponse.json(
      { error: 'Failed to delete region' },
      { status: 500 }
    );
  }
}
