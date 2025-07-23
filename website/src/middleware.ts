import { NextRequest, NextResponse } from 'next/server';
import yearRewriteMiddleware from './middlewares/yearRewrite';

export async function middleware(request: NextRequest) {
  const middlewares = [yearRewriteMiddleware];

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
    // '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml).*)',
  ],
};
