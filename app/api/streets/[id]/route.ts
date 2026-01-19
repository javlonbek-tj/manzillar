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

    revalidatePath('/dashboard');
    revalidatePath('/address-data');
    revalidatePath('/analytics');

    // Invalidate analytics cache
    revalidateTag('dashboard-analytics');
    revalidateTag('regional-analytics');

    return NextResponse.json(updatedStreet);
  } catch (error) {
    console.error('Error updating street:', error);
    return NextResponse.json(
      { error: 'Failed to update street' },
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
    const deletedStreet = await prisma.street.delete({
      where: { id },
    });

    revalidatePath('/dashboard');
    revalidatePath('/address-data');
    revalidatePath('/analytics');

    // Invalidate analytics cache
    revalidateTag('dashboard-analytics');
    revalidateTag('regional-analytics');

    return NextResponse.json(deletedStreet);
  } catch (error) {
    console.error('Error deleting street:', error);
    return NextResponse.json(
      { error: 'Failed to delete street' },
      { status: 500 }
    );
  }
}
