import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

// GET: Retrieve addressing for a street polygon or all addressing for a district
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const streetPolygonId = searchParams.get('streetPolygonId');
    const districtId = searchParams.get('districtId');

    if (districtId) {
      // Find all addressing records for street polygons in this district
      const addressingList = await prisma.streetAddressing.findMany({
        where: {
          streetPolygon: {
            districtId: districtId
          }
        },
        include: {
          streetPolygon: {
            select: {
              id: true,
              nameUz: true
            }
          }
        }
      });
      return NextResponse.json(addressingList);
    }

    if (!streetPolygonId) {
      return NextResponse.json({ error: "streetPolygonId or districtId is required" }, { status: 400 });
    }

    const addressing = await prisma.streetAddressing.findUnique({
      where: { streetPolygonId },
    });

    if (!addressing) {
      return NextResponse.json({ error: "Addressing not found" }, { status: 404 });
    }

    return NextResponse.json(addressing);
  } catch (error) {
    console.error("API Error fetching addressing:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Create or update addressing for a street polygon
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      streetPolygonId,
      centerline,
      addressPoints,
      crossLines,
      intervalMeters,
      offsetMeters,
      startNumber,
      totalLength
    } = body;

    if (!streetPolygonId || !centerline || !addressPoints) {
      return NextResponse.json(
        { error: "streetPolygonId, centerline, and addressPoints are required" },
        { status: 400 }
      );
    }

    // Upsert (create or update) the addressing
    const addressing = await prisma.streetAddressing.upsert({
      where: { streetPolygonId },
      update: {
        centerline,
        addressPoints,
        crossLines: crossLines || [],
        intervalMeters: intervalMeters || 20,
        offsetMeters: offsetMeters || 5,
        startNumber: startNumber || 0,
        totalLength: totalLength || 0,
      },
      create: {
        streetPolygonId,
        centerline,
        addressPoints,
        crossLines: crossLines || [],
        intervalMeters: intervalMeters || 20,
        offsetMeters: offsetMeters || 5,
        startNumber: startNumber || 0,
        totalLength: totalLength || 0,
      },
    });

    revalidatePath('/street-addressing');

    // Invalidate analytics cache
    revalidateTag('dashboard-analytics');
    revalidateTag('regional-analytics');

    return NextResponse.json(addressing);
  } catch (error) {
    console.error("API Error saving addressing:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Remove addressing for a street polygon
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const streetPolygonId = searchParams.get('streetPolygonId');

    if (!streetPolygonId) {
      return NextResponse.json({ error: "streetPolygonId is required" }, { status: 400 });
    }

    await prisma.streetAddressing.delete({
      where: { streetPolygonId },
    });

    revalidatePath('/street-addressing');

    // Invalidate analytics cache
    revalidateTag('dashboard-analytics');
    revalidateTag('regional-analytics');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Error deleting addressing:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
