import { NextResponse } from 'next/server';
import { writeFile, mkdir, readdir, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get('url');

    if (!fileUrl) {
      return NextResponse.json({ error: 'URL not provided' }, { status: 400 });
    }

    // Safety check: ensure the URL starts with /uploads/
    if (!fileUrl.startsWith('/uploads/')) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    const filePath = join(process.cwd(), 'public', fileUrl);
    
    try {
      await unlink(filePath);
      return NextResponse.json({ success: true });
    } catch (err) {
      console.error('Error deleting file from disk:', err);
      // Even if file doesn't exist, we consider it a success for cleanup purposes
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error('Error in DELETE upload:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const regionName = searchParams.get('regionName');

    if (!regionName) {
      return NextResponse.json({ files: [] });
    }

    const regionDir = join(process.cwd(), 'public', 'uploads', 'optimization', regionName);
    
    try {
      const files = await readdir(regionDir);
      const fileData = files.map(file => ({
        name: file,
        url: `/uploads/optimization/${regionName}/${file}`
      }));
      return NextResponse.json({ files: fileData });
    } catch (err) {
      // If directory doesn't exist, just return empty list
      return NextResponse.json({ files: [] });
    }
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json({ files: [] });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const regionName = formData.get('regionName') as string || 'general';

    if (!file) {
      return NextResponse.json(
        { error: 'File not provided' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create organized path: public/uploads/optimization/[regionName]/
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'optimization', regionName);
    
    await mkdir(uploadDir, { recursive: true });

    // Use original filename but maybe unique? 
    // User wants reuse, so if they upload the same name, maybe overwrite or use it.
    // Let's keep a bit of uniqueness to avoid accidental overwrites if names are common like "document.pdf"
    // Actually, user said "preventing uploading multiply the same files". 
    // If I use the original name, they can overwrite it or just use the existing one.
    const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_'); 
    const path = join(uploadDir, fileName);

    await writeFile(path, buffer);
    const fileUrl = `/uploads/optimization/${regionName}/${fileName}`;

    return NextResponse.json({ url: fileUrl, fileName: file.name });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
