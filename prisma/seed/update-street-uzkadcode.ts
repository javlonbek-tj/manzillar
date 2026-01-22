import prisma from '@/lib/prisma';
import path from 'path';
import xlsx from "xlsx";

async function main() {
  const filePath = path.join(process.cwd(), "kucha.xlsx");

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
  let notFound = 0;

  for (const row of rows as any[]) {
    const { code, uzKadCode } = row;

    if (!code) {
      console.log(`⚠️ Skipping row without code`);
      skipped++;
      continue;
    }

    if (!uzKadCode) {
      console.log(`⚠️ Skipping row with code ${code} - no uzKadCode`);
      skipped++;
      continue;
    }

    const result = await prisma.street.updateMany({
      where: { code: String(code) },
      data: {
        uzKadCode: String(uzKadCode).trim(),
      },
    });

    if (result.count === 0) {
      console.log(`❌ Street not found for code: ${code}`);
      notFound++;
    } else {
      updated++;
      if (updated % 100 === 0) {
        console.log(`✅ Updated ${updated} streets so far...`);
      }
    }
  }

  console.log('\n=== Summary ===');
  console.log(`✅ Updated: ${updated}`);
  console.log(`⚠️ Skipped: ${skipped}`);
  console.log(`❌ Not found: ${notFound}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
