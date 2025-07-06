// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export default async function yearRewriteMiddleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;
//   const currentYear = new Date().getFullYear();

//   // Handle the root path
//   if (pathname === '/') {
//     const yearPath = `/${currentYear}`;
//     const rewriteUrl = new URL(yearPath, request.url);
//     return NextResponse.rewrite(rewriteUrl);
//   }

//   // Check if the URL already starts with a year pattern (20XX)
//   const startsWithYearPattern = /^\/20\d{2}/.test(pathname);

//   // If it doesn't start with a year pattern, prepend the current year
//   if (!startsWithYearPattern) {
//     const yearPath = `/${currentYear}${pathname}`;
//     const rewriteUrl = new URL(yearPath, request.url);
//     return NextResponse.rewrite(rewriteUrl);
//   }

//   return null;
// }

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export default async function yearRewriteMiddleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const currentYear = new Date().getFullYear();

  // Check for year pattern (20XX)
  const yearMatch = pathname.match(/^\/20(\d{2})/);

  if (yearMatch) {
    const year = parseInt(`20${yearMatch[1]}`);

    // Proxy content from pycon.hk for years before 2025
    if (year < 2025) {
      const externalUrl = `https://pycon.hk${pathname}${search}`;

      try {
        const response = await fetch(externalUrl, {
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
        return new NextResponse(`Content unavailable: ${error}`, {
          status: 503,
        });
      }
    }
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
