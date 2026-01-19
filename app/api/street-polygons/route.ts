import { NextResponse } from "next/server";
import { getStreetPolygons } from "@/lib/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get('districtId');

    if (!districtId) {
      return NextResponse.json({ error: "districtId is required" }, { status: 400 });
    }

    const serializedPolygons = await getStreetPolygons(districtId);

    return NextResponse.json(serializedPolygons);
  } catch (error) {
    console.error("API Error fetching street polygons:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
