import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { CACHE_TAGS } from '@/utils/cache-utils';

export async function POST(request: NextRequest) {
  try {
    const { tags } = await request.json();

    // Validate tags
    if (!tags || !Array.isArray(tags)) {
      return NextResponse.json(
        { error: 'Invalid tags provided' },
        { status: 400 }
      );
    }

    // Validate that all tags are valid
    const validTags = Object.values(CACHE_TAGS);
    const invalidTags = tags.filter(tag => !validTags.includes(tag));
    if (invalidTags.length > 0) {
      return NextResponse.json(
        { error: `Invalid tags: ${invalidTags.join(', ')}` },
        { status: 400 }
      );
    }

    // Revalidate each tag
    for (const tag of tags) {
      await revalidateTag(tag);
    }

    return NextResponse.json({
      revalidated: true,
      timestamp: Date.now(),
      tags,
    });
  } catch (error) {
    console.error('Error revalidating cache:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate cache' },
      { status: 500 }
    );
  }
} 