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

const fetchProxy = async (url: string) => {
  try {
    const response = await fetch(url);

    const pathname = new URL(url).pathname;
    const contentType =
      getMimeType(pathname) ||
      response.headers.get('content-type') ||
      'text/html';
    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        'content-type': contentType,
      },
    });
  } catch (error) {
    return new NextResponse(`Content unavailable: ${error}`, { status: 503 });
  }
};

export default async function yearRewriteMiddleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  console.log(`Request URL: ${request.url}`);
  const currentYear = new Date().getFullYear();

  const isWordPressPath = wordPressProxyPaths.some(path =>
    pathname.startsWith(path)
  );
  console.log(`Is wordpress path: ${isWordPressPath}`);

  if (isWordPressPath) {
    const externalUrl = `https://legacy.pycon.hk${pathname}${search}`;
    return fetchProxy(externalUrl);
  }

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
      return fetchProxy(externalUrl);
    }
  }

  if (prefixProxyListMatch) {
    // Proxy content for specific paths
    const externalUrl = `https://legacy.pycon.hk${pathname}${search}`;
    return fetch(externalUrl);
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
