import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/shared/sanity/lib/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const data = await client.fetch(query);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Sanity API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from Sanity' },
      { status: 500 }
    );
  }
}