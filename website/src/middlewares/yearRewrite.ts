import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const prefixProxyLists = ['/conference-highlights'];

// WordPress paths to proxy
const wordPressProxyPaths = [
  '/wp-content',
  '/wp-includes',
  '/wp-admin',
  '/wp-json',
  '/xmlrpc.php',
  '/wp-login.php',
  '/wp-cron.php',
];

const getMimeType = (pathname: string): string | null => {
  const ext = pathname.split('.').pop()?.toLowerCase();

  const mimeTypes: Record<string, string> = {
    // Text
    html: 'text/html',
    htm: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    mjs: 'application/javascript',
    json: 'application/json',
    xml: 'application/xml',
    txt: 'text/plain',

    // Images
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    ico: 'image/x-icon',
    bmp: 'image/bmp',

    // Fonts
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    eot: 'application/vnd.ms-fontobject',
    otf: 'font/otf',

    // Documents
    pdf: 'application/pdf',
    zip: 'application/zip',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',

    // Audio/Video
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    webm: 'video/webm',
    wav: 'audio/wav',
    ogg: 'audio/ogg',

    // Archives
    tar: 'application/x-tar',
    gz: 'application/gzip',
    rar: 'application/vnd.rar',
  };

  return ext ? mimeTypes[ext] || null : null;
};

const fetchProxy = async (url: string, request: NextRequest) => {
  try {
    if (request.method === 'OPTIONS') {
      const responseHeaders = new Headers();
      responseHeaders.set('access-control-allow-origin', '*');
      responseHeaders.set(
        'access-control-allow-methods',
        'GET, POST, PUT, DELETE, OPTIONS'
      );
      responseHeaders.set(
        'access-control-allow-headers',
        'Content-Type, Authorization, X-Requested-With'
      );
      responseHeaders.set('access-control-max-age', '86400'); // 24 hours

      return new NextResponse(null, {
        status: 204, // No content
        headers: responseHeaders,
      });
    }
    const response = await fetch(url, {
      headers: {
        'user-agent': request.headers.get('user-agent') || 'Next.js Proxy',
        accept: request.headers.get('accept') || '*/*',
      },
    });

    const pathname = new URL(url).pathname;
    const contentType =
      getMimeType(pathname) ||
      response.headers.get('content-type') ||
      'text/html';

    // Create response headers to prevent CORB
    const responseHeaders = new Headers();
    responseHeaders.set('content-type', contentType);

    // CORS headers
    responseHeaders.set('access-control-allow-origin', '*');
    responseHeaders.set('access-control-allow-methods', 'GET, POST, OPTIONS');
    responseHeaders.set('access-control-allow-headers', 'Content-Type');

    // CORB prevention headers
    responseHeaders.set('x-content-type-options', 'nosniff');

    // For JSON/XML responses that might trigger CORB
    if (contentType.includes('json') || contentType.includes('xml')) {
      responseHeaders.set('access-control-allow-credentials', 'true');
    }

    // For script files
    if (contentType.includes('javascript')) {
      responseHeaders.set('cross-origin-resource-policy', 'cross-origin');
    }

    if (contentType.includes('text/html')) {
      // Get the HTML content
      const html = await response.text();

      // Extract year path from URL
      const yearMatch = pathname.match(/^\/20\d{2}/);
      const yearPath = yearMatch ? yearMatch[0] + '/' : '/';

      // Add base tag to the head section
      const modifiedHtml = html.replace(
        /<head>/i,
        `<head>\n<base href="${request.nextUrl.origin}${yearPath}">`
      );

      return new NextResponse(modifiedHtml, {
        status: response.status,
        headers: responseHeaders,
      });
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return new NextResponse(`Content unavailable: ${error}`, { status: 503 });
  }
};

export default async function yearRewriteMiddleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const currentYear = new Date().getFullYear();

  const isWordPressPath = wordPressProxyPaths.some(path =>
    pathname.startsWith(path)
  );

  if (isWordPressPath) {
    const externalUrl = `https://legacy.pycon.hk${pathname}${search}`;
    return fetchProxy(externalUrl, request);
  }

  // Check for year pattern (20XX)
  const yearMatch = pathname.match(/^\/20(\d{2})/);
  const prefixProxyListMatch = prefixProxyLists.some(prefix =>
    pathname.startsWith(prefix)
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
