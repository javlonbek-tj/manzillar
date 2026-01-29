import prisma from '@/lib/prisma';
import path from 'path';
import xlsx from "xlsx";

async function main() {
  const filePath = path.join(process.cwd(), "district_users.xlsx");

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
  let skipped = 0;
  let errors = 0;

  for (const row of rows as any[]) {
    const { district, fullname, jshshir, phone, status } = row;

    // Validate required fields - district and status are required
    if (!district || !status) {
      console.log(`⚠️ Skipping row - missing district or status:`, { district, status });
      skipped++;
      continue;
    }

    try {
      // Find the district by code
      const districtRecord = await prisma.district.findUnique({
        where: { code: String(district).trim() }
      });

      if (!districtRecord) {
        console.log(`❌ District not found for code: ${district}`);
        errors++;
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

      // For vacant positions, personal info might be missing
      const userData: any = {
        status: statusEnum,
        districtId: districtRecord.id,
      };

      // Only add personal info if it exists
      if (fullname) {
        userData.fullName = String(fullname).trim();
      }
      if (jshshir) {
        userData.jshshir = String(jshshir).trim();
      }
      if (phone) {
        userData.phoneNumber = String(phone).trim();
      }

      // Create the district user
      const result = await prisma.districtUser.create({
        data: userData,
      });

      if (result) {
        created++;
        
        if (created % 10 === 0) {
          console.log(`✅ Created ${created} users so far...`);
        }
        
        // Log vacant positions
        if (statusEnum === 'vacant') {
          console.log(`📝 Created vacant position for district: ${districtRecord.nameUz}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error processing row:`, { district, fullname, jshshir }, error);
      errors++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`✅ Created: ${created}`);
  console.log(`⚠️ Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
