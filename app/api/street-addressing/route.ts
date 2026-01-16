import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Retrieve addressing for a street polygon
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const streetPolygonId = searchParams.get('streetPolygonId');

    if (!streetPolygonId) {
      return NextResponse.json({ error: "streetPolygonId is required" }, { status: 400 });
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Error deleting addressing:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
