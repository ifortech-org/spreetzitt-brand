import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verifica che la richiesta provenga da Sanity (opzionale ma consigliato)
    const token = request.headers.get('authorization');
    if (token !== `Bearer ${process.env.SANITY_REVALIDATE_SECRET}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Estrai informazioni dal webhook di Sanity
    const { _type, slug, _id } = body;
    const revalidatedPaths: string[] = [];
    
    if (_type === 'page' && slug?.current) {
      // Per slug multi-segmento come "en/blog", rivalidate il path corretto
      const pagePath = `/${slug.current}`;
      revalidatePath(pagePath);
      revalidatedPaths.push(pagePath);
      
      // Gestione speciale per la homepage inglese
      if (slug.current === 'en') {
        revalidatePath('/en');
        revalidatedPaths.push('/en');
      }
      
      console.log(`Revalidated page: ${slug.current}`);
    }
    
    if (_type === 'post' && slug?.current) {
      // Rivalidate il post specifico
      const postPaths = [`/blog/${slug.current}`, `/en/blog/${slug.current}`];
      postPaths.forEach(path => {
        revalidatePath(path);
        revalidatedPaths.push(path);
      });
      
      // Rivalidate la pagina blog per aggiornare la lista
      const blogPaths = ['/blog', '/en/blog'];
      blogPaths.forEach(path => {
        revalidatePath(path);
        revalidatedPaths.push(path);
      });
      
      console.log(`Revalidated post: ${slug.current}`);
    }

    // Per contenuti globali (navigazione, footer, SEO), rivalidate tutto
    if (['navigation', 'footer', 'seo', 'site'].includes(_type)) {
      revalidatePath('/', 'layout');
      revalidatedPaths.push('/ (layout)');
      console.log(`Revalidated global content: ${_type}`);
    }

    // Forza purge cache Vercel se disponibile
    const response = NextResponse.json({ 
      message: 'Revalidated successfully',
      revalidated: true,
      timestamp: new Date().toISOString(),
      paths: revalidatedPaths,
      type: _type,
      id: _id
    });

    // Headers per forzare no-cache su questo endpoint
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
    
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { message: 'Error revalidating', error: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}