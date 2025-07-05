import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function yearRewriteMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const currentYear = new Date().getFullYear();

  // Handle the root path
  if (pathname === '/') {
    const yearPath = `/${currentYear}`;
    const rewriteUrl = new URL(yearPath, request.url);
    return NextResponse.rewrite(rewriteUrl);
  }

  // Check if the URL already starts with a year pattern (20XX)
  const startsWithYearPattern = /^\/20\d{2}/.test(pathname);

  // If it doesn't start with a year pattern, prepend the current year
  if (!startsWithYearPattern) {
    const yearPath = `/${currentYear}${pathname}`;
    const rewriteUrl = new URL(yearPath, request.url);
    return NextResponse.rewrite(rewriteUrl);
  }

  return null;
}
