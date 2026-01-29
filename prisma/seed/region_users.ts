import prisma from '@/lib/prisma';
import path from 'path';
import xlsx from "xlsx";

async function main() {
  const filePath = path.join(process.cwd(), "region_users.xlsx");

  console.log(`Reading file from: ${filePath}`);
  
  if (!require('fs').existsSync(filePath)) {
    console.error(`File not found at ${filePath}`);
    process.exit(1);
  }

  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);

  console.log(`Found ${rows.length} records.`);

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of rows as any[]) {
    const { region, fullname, jshshir, phone, position, status } = row;

    // Validate required fields
    if (!region || !fullname || !jshshir || !phone || !position || !status) {
      console.log(`⚠️ Skipping row - missing required fields:`, { region, fullname, jshshir, phone, position, status });
      skipped++;
      continue;
    }

    try {
      // Find the region by code
      const regionRecord = await prisma.region.findUnique({
        where: { code: String(region).trim() }
      });

      if (!regionRecord) {
        console.log(`❌ Region not found for code: ${region}`);
        errors++;
        continue;
      }

      // Normalize position value
      const normalizedPosition = String(position).toLowerCase().trim();
      let positionEnum: 'boss' | 'assistant';
      
      if (normalizedPosition.includes('boshligi') || normalizedPosition === 'boss') {
        positionEnum = 'boss';
      } else if (normalizedPosition.includes('mutaxassis') || normalizedPosition === 'assistant') {
        positionEnum = 'assistant';
      } else {
        console.log(`⚠️ Invalid position value: ${position}. Skipping row.`);
        skipped++;
        continue;
      }

      // Normalize status value
      const normalizedStatus = String(status).toLowerCase().trim();
      let statusEnum: 'active' | 'vacant';
      
      if (normalizedStatus === 'active' || normalizedStatus === 'faol') {
        statusEnum = 'active';
      } else if (normalizedStatus === 'vacant' || normalizedStatus === 'bo\'sh' || normalizedStatus === 'bosh') {
        statusEnum = 'vacant';
      } else {
        console.log(`⚠️ Invalid status value: ${status}. Defaulting to 'active'.`);
        statusEnum = 'active';
      }

      // Upsert the region user (create or update based on jshshir)
      const result = await prisma.regionUser.upsert({
        where: { jshshir: String(jshshir).trim() },
        update: {
          fullName: String(fullname).trim(),
          phoneNumber: String(phone).trim(),
          position: positionEnum,
          status: statusEnum,
          regionId: regionRecord.id,
        },
        create: {
          fullName: String(fullname).trim(),
          jshshir: String(jshshir).trim(),
          phoneNumber: String(phone).trim(),
          position: positionEnum,
          status: statusEnum,
          regionId: regionRecord.id,
        },
      });

      if (result) {
        // Check if it was an update or create by trying to find if it existed before
        const existing = await prisma.regionUser.findUnique({
          where: { jshshir: String(jshshir).trim() }
        });
        
        if (existing && existing.updatedAt > existing.createdAt) {
          updated++;
        } else {
          created++;
        }

        if ((created + updated) % 10 === 0) {
          console.log(`✅ Processed ${created + updated} users so far...`);
        }
      }
    } catch (error) {
      console.error(`❌ Error processing row:`, { region, fullname, jshshir }, error);
      errors++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`✅ Created: ${created}`);
  console.log(`🔄 Updated: ${updated}`);
  console.log(`⚠️ Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
