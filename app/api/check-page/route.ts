import { fetchSanityPageBySlug } from "@/shared/sanity/lib/fetch";
import { client } from "@/shared/sanity/lib/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  
  if (!slug) {
    return NextResponse.json({ error: 'Slug parameter required' }, { status: 400 });
  }

  try {
    // Test con query molto semplice prima
    const simpleQuery = `*[_type == "page" && slug.current == $slug][0]{_id, meta_title, slug, _type}`;
    const simpleResult = await client.fetch(simpleQuery, { slug });
    
    console.log('Simple query result:', simpleResult);
    
    // Solo se la query semplice funziona, prova quella complessa
    let complexResult = null;
    if (simpleResult) {
      try {
        complexResult = await fetchSanityPageBySlug({ slug });
      } catch (complexError) {
        console.error('Complex query error:', complexError);
      }
    }
    
    return NextResponse.json({
      found: !!simpleResult,
      slug: slug,
      simple: {
        found: !!simpleResult,
        id: simpleResult?._id,
        title: simpleResult?.meta_title
      },
      complex: {
        found: !!complexResult,
        error: complexResult ? null : 'Query failed'
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Query error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      slug: slug,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}