import { stableLegacyAssetPath } from '@/legacy/legacy-html';

const legacy2018AssetUrls = import.meta.glob<string>(
  '../assets/live/**/*.{jpg,jpeg,png,gif,svg,webp,ico,woff2,woff,ttf,eot}',
  {
    eager: true,
    import: 'default',
    query: '?url',
  }
);

const assetUrlByLegacyPath = new Map<string, string>();

for (const [assetPath, assetUrl] of Object.entries(legacy2018AssetUrls)) {
  const legacyPath = legacyPathForAssetPath(assetPath);

  if (legacyPath) {
    assetUrlByLegacyPath.set(normalizeLegacyPath(legacyPath), assetUrl);
  }
}

export function resolveLegacy2018HtmlAssets(html: string): string {
  return html
    .replace(/url\((["']?)([^"')]+)\1\)/giu, (match, _quote, value: string) => {
      if (/^(?:data|about|#)/iu.test(value)) {
        return match;
      }

      const assetUrl = resolveLegacy2018AssetUrl(value);

      return assetUrl ? `url("${assetUrl}")` : match;
    })
    .replace(
      /(\s)(href|src|poster|data-src|data-image-src)=(["'])([^"']+)\3/giu,
      (attribute, prefix: string, name: string, quote: string, value: string) => {
        if (name.toLowerCase() === 'href') {
          const assetHref = resolveLegacy2018AssetHref(value);

          return assetHref
            ? `${prefix}${name}=${quote}${assetHref}${quote}`
            : attribute;
        }

        const assetUrl = resolveLegacy2018AssetUrl(value);

        return assetUrl ? `${prefix}${name}=${quote}${assetUrl}${quote}` : attribute;
      }
    )
    .replace(
      /(\s)srcset=(["'])([^"']+)\2/giu,
      (_attribute, prefix: string, quote: string, value: string) => {
        const candidates = value
          .split(',')
          .map((candidate) => rewriteSrcsetCandidate(candidate))
          .filter((candidate) => candidate !== '');

        return candidates.length > 0
          ? `${prefix}srcset=${quote}${candidates.join(', ')}${quote}`
          : '';
      }
    );
}

export function rewriteLegacy2018CssAssets(css: string, assetPath: string): string {
  return css.replace(/url\((["']?)([^"')]+)\1\)/giu, (match, _quote, value: string) => {
    if (/^(?:data|about|#)/iu.test(value)) {
      return match;
    }

    const assetUrl = resolveLegacy2018AssetUrl(value, `https://pycon.hk${assetPath}`);

    return assetUrl ? `url("${assetUrl}")` : match;
  });
}

export function resolveLegacy2018AssetUrl(
  value: string,
  baseUrl = 'https://pycon.hk'
): string | undefined {
  return assetUrlByLegacyPath.get(normalizeLegacyPath(value, baseUrl));
}

function resolveLegacy2018AssetHref(value: string): string | undefined {
  const legacyPath = normalizeLegacyPath(value);

  if (!assetUrlByLegacyPath.has(legacyPath)) {
    return undefined;
  }

  return legacyHrefForValue(value);
}

function legacyPathForAssetPath(assetPath: string): string | undefined {
  const livePath = assetPath.replace(/^\.\.\/assets\/live\//u, '');

  if (livePath.startsWith('wp-content/')) {
    return `/${livePath}`;
  }

  return undefined;
}

function rewriteSrcsetCandidate(candidate: string): string {
  const parts = candidate.trim().match(/^(\S+)(.*)$/su);

  if (!parts) {
    return '';
  }

  const [, value, descriptor] = parts;
  const assetUrl = resolveLegacy2018AssetUrl(value);

  return assetUrl ? `${assetUrl}${descriptor}` : '';
}

function normalizeLegacyPath(value: string, baseUrl = 'https://pycon.hk'): string {
  const path = pathnameForLegacyUrl(value, baseUrl);

  try {
    return decodeURI(path);
  } catch {
    return path;
  }
}

function pathnameForLegacyUrl(value: string, baseUrl: string): string {
  try {
    return new URL(value, baseUrl).pathname;
  } catch {
    return value;
  }
}

function legacyHrefForValue(value: string, baseUrl = 'https://pycon.hk'): string {
  try {
    const url = new URL(value, baseUrl);
    const assetPath = stableLegacyAssetPath(url.pathname, '2018');

    return `${assetPath ?? url.pathname}${url.search}${url.hash}`;
  } catch {
    return value;
  }
}
