import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export default async function testHostnameMiddleware(request: NextRequest) {
  const { hostname, pathname, search } = request.nextUrl;
  const testDomain = process.env.NEXT_PUBLIC_TEST_DOMAIN;

  // Check if the request is for the test subdomain
  if (hostname === 'test.pycon.hk') {
    try {
      // Get test domain from environment or use default
      const testUrl = `https://${testDomain}${pathname}${search}`;

      const response = await fetch(testUrl, {
        method: request.method,
        headers: {
          ...Object.fromEntries(request.headers.entries()),
          host: testDomain,
          'x-forwarded-host': hostname,
        },
        body:
          request.method !== 'GET' && request.method !== 'HEAD'
            ? await request.arrayBuffer()
            : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const body = await response.arrayBuffer();

      return new NextResponse(body, {
        status: response.status,
        headers: {
          'content-type': response.headers.get('content-type') || 'text/html',
          'cache-control': 'no-cache',
        },
      });
    } catch (error) {
      console.error('❌ Test hostname proxy error:', error);
      const fallbackUrl = `https://${testDomain}${pathname}${search}`;
      return NextResponse.redirect(fallbackUrl, 302);
    }
  }

  return null;
}
