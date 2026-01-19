import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get('districtId');

    if (!districtId) {
      return NextResponse.json({ error: "districtId is required" }, { status: 400 });
    }

    const streetPolygons = await prisma.streetPolygone.findMany({
      where: { districtId },
      select: {
        id: true,
        nameUz: true,
        code: true,
        type: true,
        geometry: true,
        mahallaId: true,
      },
    });

    // Force proper JSON serialization - Prisma's JsonValue needs to be converted to plain objects
    const serializedPolygons = JSON.parse(JSON.stringify(streetPolygons));

    return NextResponse.json(serializedPolygons);
  } catch (error) {
    console.error("API Error fetching street polygons:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
