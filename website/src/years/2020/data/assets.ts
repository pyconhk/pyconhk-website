import { stableLegacyAssetPath } from '@/legacy/legacy-html';
import { resolveLegacy2018AssetUrl } from '@/years/2018/data/assets';

const legacy2020AssetUrls = import.meta.glob<string>(
  '../assets/live/**/*.{jpg,jpeg,png,gif,svg,webp,ico,woff2,woff,ttf,eot}',
  {
    eager: true,
    import: 'default',
    query: '?url',
  }
);

const assetUrlByLegacyPath = new Map<string, string>();
const shouldUseStableAssetRoutes = import.meta.env.DEV;

for (const [assetPath, assetUrl] of Object.entries(legacy2020AssetUrls)) {
  const legacyPath = legacyPathForAssetPath(assetPath);

  if (legacyPath) {
    assetUrlByLegacyPath.set(
      normalizeLegacyPath(legacyPath),
      absoluteAssetUrl(assetUrl)
    );
  }
}

export function resolveLegacy2020HtmlAssets(html: string, event = '2020'): string {
  return html
    .replace(/url\((["']?)([^"')]+)\1\)/giu, (match, _quote, value: string) => {
      if (/^(?:data|about|#)/iu.test(value)) {
        return match;
      }

      const assetUrl = resolveLegacy2020AssetUrl(value);

      return assetUrl ? `url("${assetUrl}")` : match;
    })
    .replace(
      /(\s)(href|src|poster|data-src|data-image-src|content)=(["'])([^"']+)\3/giu,
      (attribute, prefix: string, name: string, quote: string, value: string) => {
        if (shouldUseStableAssetRoutes) {
          const assetHref = resolveLegacy2020AssetHref(value, event);

          return assetHref
            ? `${prefix}${name}=${quote}${assetHref}${quote}`
            : attribute;
        }

        const assetUrl = resolveLegacy2020AssetUrl(value);

        return assetUrl ? `${prefix}${name}=${quote}${assetUrl}${quote}` : attribute;
      }
    )
    .replace(
      /(\s)srcset=(["'])([^"']+)\2/giu,
      (_attribute, prefix: string, quote: string, value: string) => {
        const candidates = value
          .split(',')
          .map((candidate) => rewriteSrcsetCandidate(candidate, event))
          .filter((candidate) => candidate !== '');

        return candidates.length > 0
          ? `${prefix}srcset=${quote}${candidates.join(', ')}${quote}`
          : '';
      }
    )
    .replace(
      /(?:https?:\/\/(?:www\.)?pycon\.hk)?\/wp-content\/uploads\/[^"'\s<>)]+/giu,
      (value: string, offset: number, htmlValue: string) => {
        if (
          isAlreadyResolvedSourceAsset(htmlValue, offset) ||
          isHrefAttributeValue(htmlValue, offset)
        ) {
          return value;
        }

        return shouldUseStableAssetRoutes
          ? (resolveLegacy2020AssetHref(value, event) ?? value)
          : (resolveLegacy2020AssetUrl(value) ?? value);
      }
    )
    .replace(
      /(?:https?:\\\/\\\/(?:www\.)?pycon\.hk)?\\\/wp-content\\\/uploads\\\/[^"'\s<>)]+/giu,
      (value: string, offset: number, htmlValue: string) => {
        if (
          isAlreadyResolvedSourceAsset(htmlValue, offset) ||
          isEscapedHrefAttributeValue(htmlValue, offset)
        ) {
          return value;
        }

        const normalizedValue = value.replace(/\\\//gu, '/');
        const assetUrl = shouldUseStableAssetRoutes
          ? resolveLegacy2020AssetHref(normalizedValue, event)
          : resolveLegacy2020AssetUrl(normalizedValue);

        return assetUrl ?? value;
      }
    );
}

export function resolveLegacy2020AssetUrl(
  value: string,
  baseUrl = 'https://pycon.hk'
): string | undefined {
  const assetUrl =
    assetUrlByLegacyPath.get(normalizeLegacyPath(value, baseUrl)) ??
    resolveLegacy2018AssetUrl(value, baseUrl);

  return assetUrl ? absoluteAssetUrl(assetUrl) : undefined;
}

function resolveLegacy2020AssetHref(value: string, event: string): string | undefined {
  const legacyPath = normalizeLegacyPath(value);

  if (!assetUrlByLegacyPath.has(legacyPath) && !resolveLegacy2018AssetUrl(value)) {
    return undefined;
  }

  return legacyHrefForValue(value, event);
}

function absoluteAssetUrl(assetUrl: string): string {
  return /^(?:[a-z][a-z\d+.-]*:|\/)/iu.test(assetUrl) ? assetUrl : `/${assetUrl}`;
}

function isAlreadyResolvedSourceAsset(html: string, offset: number): boolean {
  return html.slice(Math.max(0, offset - 80), offset).includes('/src/years/');
}

function isHrefAttributeValue(html: string, offset: number): boolean {
  return /\bhref=(["'])$/iu.test(html.slice(Math.max(0, offset - 12), offset));
}

function isEscapedHrefAttributeValue(html: string, offset: number): boolean {
  return /\\?"href\\?:(["'])$/iu.test(html.slice(Math.max(0, offset - 16), offset));
}

function legacyPathForAssetPath(assetPath: string): string | undefined {
  const livePath = assetPath.replace(/^\.\.\/assets\/live\//u, '');

  if (livePath.startsWith('wp-content/')) {
    return `/${livePath}`;
  }

  return undefined;
}

function rewriteSrcsetCandidate(candidate: string, event: string): string {
  const parts = candidate.trim().match(/^(\S+)(.*)$/su);

  if (!parts) {
    return '';
  }

  const [, value, descriptor] = parts;
  const assetUrl = shouldUseStableAssetRoutes
    ? resolveLegacy2020AssetHref(value, event)
    : resolveLegacy2020AssetUrl(value);

  if (assetUrl) {
    return `${assetUrl}${descriptor}`;
  }

  if (isLegacyUploadPath(value)) {
    return `${legacyHrefForValue(value, event)}${descriptor}`;
  }

  return '';
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

function isLegacyUploadPath(value: string): boolean {
  return normalizeLegacyPath(value).startsWith('/wp-content/uploads/');
}

function legacyHrefForValue(
  value: string,
  event: string,
  baseUrl = 'https://pycon.hk'
): string {
  try {
    const url = new URL(value, baseUrl);
    const assetPath = stableLegacyAssetPath(url.pathname, event);

    return `${assetPath ?? url.pathname}${url.search}${url.hash}`;
  } catch {
    return value;
  }
}
