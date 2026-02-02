import { PrismaClient } from "../../lib/generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import fs from "fs";
import path from "path";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Mavze data...");

  const geojsonPath = path.join(process.cwd(), "mavze.geojson");
  if (!fs.existsSync(geojsonPath)) {
    console.error("mavze.geojson file not found in root directory");
    return;
  }

  const fileContent = fs.readFileSync(geojsonPath, "utf-8");
  const geojson = JSON.parse(fileContent);

  const features = geojson.features;
  console.log(`Found ${features.length} features in GeoJSON.`);

  let createdCount = 0;
  let skippedCount = 0;

  for (const feature of features) {
    const { properties, geometry } = feature;
    const districtCode = String(properties.code); // This is the 'code' from properties

    // Find the district by its code (mapping to our District model's nameUz or external ID if exists)
    // The user mentioned "code field which is districtId in our model"
    // So we assume District model has 'id' that matches this 'code' or we need to find it.
    
    const district = await prisma.district.findFirst({
      where: {
        code: districtCode
      }
    });

    if (!district) {
      console.warn(`District with ID/Code ${districtCode} not found. Skipping feature.`);
      skippedCount++;
      continue;
    }

    // Simple center calculation (average of coordinates)
    let center = null;
    if (geometry.type === "Polygon" && geometry.coordinates[0]) {
      const coords = geometry.coordinates[0];
      const latSum = coords.reduce((acc: number, curr: any) => acc + curr[1], 0);
      const lngSum = coords.reduce((acc: number, curr: any) => acc + curr[0], 0);
      center = [lngSum / coords.length, latSum / coords.length];
    } else if (geometry.type === "MultiPolygon") {
      // For MultiPolygon, just take the first polygon's first ring for center
      const coords = geometry.coordinates[0][0];
      const latSum = coords.reduce((acc: number, curr: any) => acc + curr[1], 0);
      const lngSum = coords.reduce((acc: number, curr: any) => acc + curr[0], 0);
      center = [lngSum / coords.length, latSum / coords.length];
    }

    try {
      await prisma.mavze.create({
        data: {
          geometry: geometry as any,
          center: center as any,
          districtId: district.id,
        },
      });
      createdCount++;
    } catch (error) {
      console.error(`Error creating Mavze for district ${districtCode}:`, error);
    }
  }

  console.log(`Seeding complete. Created: ${createdCount}, Skipped: ${skippedCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
