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
  '/wp-sitemap.xml',
];

const ALLOWED_ORIGINS = [
  'https://legacy.pycon.hk',
  'https://pycon.hk', // If pycon.hk itself makes credentialed calls to pycon.hk/wp-json
  // Add any other specific origins if needed that will access the API with credentials
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
    const requestOrigin = request.headers.get('Origin');
    let allowedOriginForResponse = null;

    if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) {
      allowedOriginForResponse = requestOrigin;
    }

    // --- Prepare headers for the actual proxy fetch to legacy.pycon.hk ---
    const proxyHeaders = new Headers();
    // Pass essential client headers to the backend
    request.headers.forEach((value, key) => {
      // Filter out CORS-related headers from the incoming request,
      // as the legacy WP server doesn't need to know about this CORS negotiation
      if (!key.toLowerCase().startsWith('access-control-')) {
        proxyHeaders.set(key, value);
      }
    });
    // Set Host header explicitly for the backend if needed (often defaults correctly)
    proxyHeaders.set('Host', new URL(url).host);

    // Always set a custom User-Agent to identify proxy requests in backend logs
    proxyHeaders.set('User-Agent', 'Next.js PyCon Proxy');

    // Ensure body is included only for methods that support it
    let requestBody = undefined;
    if (!['GET', 'HEAD'].includes(request.method)) {
      requestBody = request.body; // Pass the original request body
    }

    // Fetch from the legacy WordPress site
    const response = await fetch(url, {
      method: request.method,
      headers: proxyHeaders,
      body: requestBody,
      redirect: 'follow', // Allow Next.js's fetch to follow redirects from legacy.pycon.hk
    });

    const pathname = new URL(url).pathname;
    const contentType =
      getMimeType(pathname) ||
      response.headers.get('content-type') ||
      'text/html';

    // --- Prepare headers for the response back to the browser ---
    const responseHeaders = new Headers();
    // Copy all headers from the legacy.pycon.hk response
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });

    // Handle special cases for sitemap.xml
    if (pathname.endsWith('sitemap.xml')) {
      const xml = await response.text();
      // Rewrite XSL stylesheet references to use the legacy domain instead
      const modifiedXml = xml.replace(
        'https://pycon.hk/default-sitemap.xsl?sitemap=root',
        'https://legacy.pycon.hk/default-sitemap.xsl?sitemap=root'
      );
      return new NextResponse(modifiedXml, {
        status: response.status,
        headers: responseHeaders,
      });
    }

    // Crucial: Set CORS headers for the response going BACK to the browser
    // Remove any existing CORS headers from the legacy.pycon.hk response first to be authoritative
    responseHeaders.delete('Access-Control-Allow-Origin');
    responseHeaders.delete('Access-Control-Allow-Methods');
    responseHeaders.delete('Access-Control-Allow-Headers');
    responseHeaders.delete('Access-Control-Allow-Credentials');
    responseHeaders.delete('Access-Control-Max-Age');

    if (allowedOriginForResponse) {
      responseHeaders.set(
        'Access-Control-Allow-Origin',
        allowedOriginForResponse
      );
      responseHeaders.set('Access-Control-Allow-Credentials', 'true'); // REQUIRED
    } else {
      // If the origin is not allowed, do not return ACAO. Browser will block.
      // This case should be caught by the OPTIONS preflight, but as a fallback.
    }

    // Add standard CORS headers (even though ACAO is conditional)
    responseHeaders.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    responseHeaders.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, X-WP-Nonce'
    );

    // Set other necessary headers
    responseHeaders.set('content-type', contentType);
    responseHeaders.set('x-content-type-options', 'nosniff'); // CORB prevention
    if (contentType.includes('javascript')) {
      responseHeaders.set('cross-origin-resource-policy', 'cross-origin');
    }

    // Handle HTML modifications
    if (contentType.includes('text/html')) {
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

    // For non-HTML responses
    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    // Use 'any' for unknown error types
    console.error('Proxy Error:', error);
    return new NextResponse(
      `Content unavailable due to proxy error: ${error.message}`,
      { status: 502 }
    );
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
