import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get('districtId');
    const mahalla = searchParams.get('mahalla');

    if (!districtId) {
      return NextResponse.json({ error: "districtId is required" }, { status: 400 });
    }

    const where: any = { districtId };
    if (mahalla) {
      where.mahalla = mahalla;
    }

    const properties = await prisma.property.findMany({
      where,
      select: {
        id: true,
        owner: true,
        address: true,
        houseNumber: true,
        geometry: true,
        center: true,
        type: true,
        cadastralNumber: true,
        areaInDoc: true,
        areaReal: true,
        mahalla: true,
        streetName: true,
      },
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error("API Error fetching properties:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
