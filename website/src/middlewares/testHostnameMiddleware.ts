import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export default async function testHostnameMiddleware(request: NextRequest) {
  const { hostname, pathname, search } = request.nextUrl;

  // Check if the request is for the test subdomain
  if (hostname === 'test.pycon.hk') {
    const testDomain = 'test.pyconhk-website.pages.dev';
    const externalUrl = `https://${testDomain}${pathname}${search}`;

    try {
      const response = await fetch(externalUrl, {
        method: request.method,
        headers: {
          'user-agent': request.headers.get('user-agent') || 'Next.js Proxy',
          accept: request.headers.get('accept') || '*/*',
        },
        body:
          request.method !== 'GET' && request.method !== 'HEAD'
            ? await request.arrayBuffer()
            : undefined,
      });

      return new NextResponse(response.body, {
        status: response.status,
        headers: {
          'content-type': response.headers.get('content-type') || 'text/html',
          'cache-control': response.headers.get('cache-control') || 'no-cache',
        },
      });
    } catch (error) {
      return new NextResponse(`Test content unavailable: ${error}`, {
        status: 503,
      });
    }
  }

  return null;
}
