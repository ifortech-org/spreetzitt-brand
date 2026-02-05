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
    // Test diretto con la query base per debug
    const directQuery = `*[_type == "page" && slug.current == $slug][0]{_id, meta_title, slug}`;
    const directResult = await client.fetch(directQuery, { slug });
    
    // Query normale tramite fetchSanityPageBySlug
    const page = await fetchSanityPageBySlug({ slug });
    
    // Query per vedere tutte le pagine che iniziano con "en/"
    const allEnPages = await client.fetch(`*[_type == "page" && slug.current match "en/*"]{slug.current, _id, meta_title}`);
    
    console.log('Direct query result:', directResult);
    console.log('FetchSanityPageBySlug result:', !!page);
    console.log('All en/ pages:', allEnPages);
    
    return NextResponse.json({
      found: !!page,
      slug: slug,
      metaTitle: page?.meta_title,
      directQuery: {
        found: !!directResult,
        id: directResult?._id,
        title: directResult?.meta_title
      },
      allEnPages: allEnPages,
      debug: {
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Sanity query error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      slug: slug,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}