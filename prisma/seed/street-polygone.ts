import prisma from '@/lib/prisma';
import * as fs from 'fs';
import * as path from 'path';

interface StreetFeature {
  type: 'Feature';
  id: number;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  properties: {
    Tuman_sh_1: string;  // districtId (code)
    Mahalla_so: string;  // mahallaId (code)
    Kocha_ID: string;    // code
    Kocha_nomi: string;  // nameUz
    Kocha_turi: string;  // type
  };
}

interface GeoJSONData {
  type: 'FeatureCollection';
  features: StreetFeature[];
}

async function main() {
  const filePath = path.join(process.cwd(), 'street_polygone.geojson');

  console.log(`📂 Reading file from: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found at ${filePath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const geoData: GeoJSONData = JSON.parse(fileContent);

  console.log(`📊 Found ${geoData.features.length} street polygons in GeoJSON file.`);

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const feature of geoData.features) {
    const { properties, geometry } = feature;
    const { Tuman_sh_1, Mahalla_so, Kocha_ID, Kocha_nomi, Kocha_turi } = properties;

    // Validate required fields
    if (!Kocha_ID || !Kocha_nomi || !Tuman_sh_1 || !Mahalla_so) {
      console.log(`⚠️  Skipping feature ${feature.id}: missing required fields`);
      skipped++;
      continue;
    }

    try {
      // Check if district exists
      const district = await prisma.district.findUnique({
        where: { code: String(Tuman_sh_1) }
      });

      if (!district) {
        console.log(`❌ District not found with code: ${Tuman_sh_1} (for street: ${Kocha_nomi})`);
        errors++;
        continue;
      }

      // Check if mahalla exists
      const mahalla = await prisma.mahalla.findUnique({
        where: { code: String(Mahalla_so) }
      });

      if (!mahalla) {
        console.log(`❌ Mahalla not found with code: ${Mahalla_so} (for street: ${Kocha_nomi})`);
        errors++;
        continue;
      }

      // Upsert street polygon
      const streetPolygon = await prisma.streetPolygone.upsert({
        where: { code: String(Kocha_ID) },
        update: {
          nameUz: String(Kocha_nomi).trim(),
          type: String(Kocha_turi || 'Ko\'cha').trim(),
          geometry: geometry,
          districtId: district.id,
          mahallaId: mahalla.id,
        },
        create: {
          code: String(Kocha_ID),
          nameUz: String(Kocha_nomi).trim(),
          type: String(Kocha_turi || 'Ko\'cha').trim(),
          geometry: geometry,
          districtId: district.id,
          mahallaId: mahalla.id,
        },
      });

      if (streetPolygon) {
        const action = await prisma.streetPolygone.findUnique({
          where: { code: String(Kocha_ID) },
          select: { createdAt: true, updatedAt: true }
        });
        
        if (action && action.createdAt.getTime() === action.updatedAt.getTime()) {
          created++;
          if (created % 100 === 0) {
            console.log(`✅ Created ${created} street polygons...`);
          }
        } else {
          updated++;
          if (updated % 100 === 0) {
            console.log(`🔄 Updated ${updated} street polygons...`);
          }
        }
      }
    } catch (error: any) {
      console.error(`❌ Error processing street ${Kocha_nomi} (${Kocha_ID}):`, error.message);
      errors++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Created: ${created}`);
  console.log(`🔄 Updated: ${updated}`);
  console.log(`⚠️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`📝 Total processed: ${geoData.features.length}`);
}

main()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
