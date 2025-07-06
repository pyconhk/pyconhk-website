import { NextRequest, NextResponse } from 'next/server';
import testHostnameMiddleware from './middlewares/testHostnameMiddleware';
import yearRewriteMiddleware from './middlewares/yearRewrite';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets completely
  if (
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/_next/image/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.') // Any file with extension
  ) {
    return NextResponse.next();
  }

  const middlewares = [testHostnameMiddleware, yearRewriteMiddleware];

  for (const middleware of middlewares) {
    const response = await middleware(request);
    if (response) {
      return response;
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
