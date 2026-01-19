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

    revalidatePath('/dashboard');
    revalidatePath('/address-data');
    revalidatePath('/analytics');

    // Invalidate analytics cache
    revalidateTag('dashboard-analytics');
    revalidateTag('regional-analytics');

    return NextResponse.json(updatedDistrict);
  } catch (error) {
    console.error('Error updating district:', error);
    return NextResponse.json(
      { error: 'Failed to update district' },
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
    const deletedDistrict = await prisma.district.delete({
      where: { id },
    });

    revalidatePath('/dashboard');
    revalidatePath('/address-data');
    revalidatePath('/analytics');

    // Invalidate analytics cache
    revalidateTag('dashboard-analytics');
    revalidateTag('regional-analytics');

    return NextResponse.json(deletedDistrict);
  } catch (error) {
    console.error('Error deleting district:', error);
    return NextResponse.json(
      { error: 'Failed to delete district' },
      { status: 500 }
    );
  }
}
