import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get('tag');

  if (!tag) {
    return NextResponse.json(
      { error: 'Missing tag parameter' },
      { status: 400 }
    );
  }

  const validTags = [
    'dashboard-analytics',
    'regional-analytics',
    'regions',
    'map-initial-data',
    'global-statistics',
    'region-statistics',
    'district-statistics',
    'properties',
    'properties-district',
    'street-polygons',
    'street-addressing',
    'district-addressing'
  ];

  try {
    if (tag === 'all') {
      validTags.forEach((t) => revalidateTag(t));
      return NextResponse.json({ revalidated: true, tags: validTags, now: Date.now() });
    }

    if (!validTags.includes(tag)) {
      return NextResponse.json(
        { error: 'Invalid tag', validTags },
        { status: 400 }
      );
    }

    revalidateTag(tag);
    return NextResponse.json({ revalidated: true, tag, now: Date.now() });
  } catch (err) {
    return NextResponse.json(
      { error: 'Error revalidating', message: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
