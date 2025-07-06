import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const prefixProxyLists = ['wp-admin', 'conference-highlights'];

const fetchProxy = async (url: string, request: NextRequest) => {
  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': request.headers.get('user-agent') || 'Next.js Proxy',
      },
    });

    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        'content-type': response.headers.get('content-type') || 'text/html',
      },
    });
  } catch (error) {
    return new NextResponse(`Content unavailable: ${error}`, { status: 503 });
  }
};

export default async function yearRewriteMiddleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const currentYear = new Date().getFullYear();

  // Check for year pattern (20XX)
  const yearMatch = pathname.match(/^\/20(\d{2})/);
  const prefixProxyListMatch = prefixProxyLists.some(prefix =>
    pathname.startsWith(`/${prefix}`)
  );

  if (yearMatch) {
    const year = parseInt(`20${yearMatch[1]}`);

    // Proxy content from pycon.hk for years before 2025
    if (year < 2025) {
      const externalUrl = `https://legacy.pycon.hk${pathname}${search}`;
      return fetchProxy(externalUrl, request);
    }
  }

  if (prefixProxyListMatch) {
    // Proxy content for specific paths
    const externalUrl = `https://legacy.pycon.hk${pathname}${search}`;
    return fetchProxy(externalUrl, request);
  }

  // Handle root and non-year paths
  if (pathname === '/') {
    return NextResponse.rewrite(new URL(`/${currentYear}`, request.url));
  }

  if (!pathname.match(/^\/20\d{2}/)) {
    return NextResponse.rewrite(
      new URL(`/${currentYear}${pathname}`, request.url)
    );
  }

  return null;
}
