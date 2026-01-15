import prisma from '@/lib/prisma';
import path from 'path';
import xlsx from "xlsx";

async function main() {
  const filePath = path.join(process.cwd(), "mfy.xlsx");

  console.log(`Reading file from: ${filePath}`);
  
  if (!require('fs').existsSync(filePath)) {
    console.error(`File not found at ${filePath}`);
    process.exit(1);
  }

  const workbook = xlsx.readFile(filePath);

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);

  console.log(`Found ${rows.length} records in Excel file.`);

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const row of rows as any[]) {
    const { code, mergedIntoId, regulationUrl } = row;

    if (!code) {
      console.log(`⚠️  Skipping row: missing code`);
      skipped++;
      continue;
    }

    // Find the mahalla by code
    const mahalla = await prisma.mahalla.findUnique({
      where: { code: String(code) },
      include: {
        district: {
          include: {
            region: true
          }
        }
      }
    });

    if (!mahalla) {
      console.log(`❌ Mahalla not found with code: ${code}`);
      notFound++;
      continue;
    }

    // Only update mahallas in Farg‘ona viloyati
    if (mahalla.district.region.nameUz !== "Farg‘ona viloyati") {
      console.log(`⏭️  Skipping ${mahalla.nameUz} (${code}) - not in Farg‘ona viloyati (region: ${mahalla.district.region.nameUz})`);
      skipped++;
      continue;
    }

    // Prepare update data
    const updateData: any = {
      hidden: true, // Mark as optimized
    };

    if (mergedIntoId) {
      updateData.mergedIntoId = String(mergedIntoId);
      
      // Try to find the merged mahalla name
      const mergedMahalla = await prisma.mahalla.findUnique({
        where: { code: String(mergedIntoId) }
      });
      
      if (mergedMahalla) {
        updateData.mergedIntoName = mergedMahalla.nameUz;
      }
    }

    if (regulationUrl) {
      updateData.regulationUrl = String(regulationUrl).trim();
    }

    // Update the mahalla
    await prisma.mahalla.update({
      where: { code: String(code) },
      data: updateData,
    });

    console.log(`✅ Updated: ${mahalla.nameUz} (${code}) - merged into: ${updateData.mergedIntoName || mergedIntoId || 'N/A'}`);
    updated++;
  }

  console.log('\n📊 Summary:');
  console.log(`✅ Updated: ${updated}`);
  console.log(`⚠️  Skipped (not in Farg‘ona): ${skipped}`);
  console.log(`❌ Not found: ${notFound}`);
  console.log(`📝 Total processed: ${rows.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
