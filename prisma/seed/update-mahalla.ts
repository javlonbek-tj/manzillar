
import prisma from '@/lib/prisma';
import path from 'path';
import xlsx from "xlsx";

async function main() {
  const filePath = path.join(process.cwd(), "mahalla.xlsx");

  console.log(`Reading file from: ${filePath}`);
  
  if (!require('fs').existsSync(filePath)) {
    console.error(`File not found at ${filePath}`);
    process.exit(1);
  }

  const workbook = xlsx.readFile(filePath);

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);

  console.log(`Found ${rows.length} records.`);

  let updated = 0;
  let skipped = 0;

  for (const row of rows as any[]) {
    const { geoCode, regulation, oldName } = row;

    if (!geoCode) {
      skipped++;
      continue;
    }

    const result = await prisma.mahalla.updateMany({
      where: { geoCode: String(geoCode) },
      data: {
        regulation: regulation?.toString().trim() || null,
        oldName: oldName?.toString().trim() || null,
      },
    });

    if (result.count === 0) {
      skipped++;
    } else {
      updated++;
    }
  }

  console.log(`✅ Updated: ${updated}`);
  console.log(`⚠️ Skipped: ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
