import { fetchSanityPageBySlug } from "@/shared/sanity/lib/fetch";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  
  if (!slug) {
    return NextResponse.json({ error: 'Slug parameter required' }, { status: 400 });
  }

  try {
    const page = await fetchSanityPageBySlug({ slug });
    
    return NextResponse.json({
      found: !!page,
      slug: slug,
      metaTitle: page?.meta_title,
      metaDescription: page?.meta_description,
      hasBlocks: !!page?.blocks?.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      slug: slug,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}