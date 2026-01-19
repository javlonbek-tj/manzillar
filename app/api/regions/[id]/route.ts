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
    const { nameUz, nameRu, code } = body;

    const updatedRegion = await prisma.region.update({
      where: { id },
      data: {
        nameUz,
        nameRu,
        code,
      },
    });

    return NextResponse.json(updatedRegion);
  } catch (error) {
    console.error('Error updating region:', error);
    return NextResponse.json(
      { error: 'Failed to update region' },
      { status: 500 }
    );
  }
}
