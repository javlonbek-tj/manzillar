import { NextResponse } from "next/server";
import { getPropertiesByDistrict } from "@/lib/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get('districtId');
    const mahalla = searchParams.get('mahalla');

    if (!districtId) {
      return NextResponse.json({ error: "districtId is required" }, { status: 400 });
    }

    const properties = await getPropertiesByDistrict(districtId, mahalla || undefined);

    return NextResponse.json(properties);
  } catch (error) {
    console.error("API Error fetching properties:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
