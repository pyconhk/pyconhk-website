import type { ImageMetadata } from 'astro';

type AssetModule = {
  default: ImageMetadata | string;
};

const liveAssets = import.meta.glob<AssetModule>(
  '../assets/live/**/*.{jpg,jpeg,png,svg}',
  {
    eager: true,
  }
);

const assetUrlByLegacyPath = new Map<string, string>();

for (const [assetPath, asset] of Object.entries(liveAssets)) {
  const legacyPath = legacyPathForAssetPath(assetPath);

  if (legacyPath) {
    setLegacyAssetPath(legacyPath, assetUrlForModule(asset));
  }
}

setLegacyAssetAlias('/2017/images/favicon.ico', '/2017/images/favicon-v2.png');
setLegacyAssetAlias(
  '/2017/logos/CityU_Logo_Standard_Signature.png',
  '/2017/logos/CityU_Logo_Standard_Signature.svg'
);
setLegacyAssetAlias('/2017/logos/alvanon.png', '/2017/logos/alvanon.svg');
setLegacyAssetAlias('/2017/logos/axa-im.png', '/2017/logos/axa-im.svg');
setLegacyAssetAlias('/2017/logos/main_logo.png', '/2017/logos/main_logo.svg');
setLegacyAssetAlias('/2017/logos/mysql-clr.png', '/2017/logos/mysql-clr.svg');
setLegacyAssetAlias('/2017/logos/psf.png', '/2017/logos/psf.svg');
setLegacyAssetPath('/js/ga.js', '/2017/js/ga.js');

export function resolveLegacy2017HtmlAssets(html: string): string {
  return html
    .replace(
      /(\s)(src|href|data-image-src)=(["'])([^"']+)\3/giu,
      (attribute, prefix: string, name: string, quote: string, value: string) => {
        const assetUrl = resolveLegacy2017AssetUrl(value);

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

export function resolveLegacy2017StaticTextAssets(value: string): string {
  return value.replace(
    /(?:https?:\/\/[^\s"'()<>]+|\/2017\/(?:images|licensebuttons|logos|organizer|portraits)\/[^\s"'()<>]+)/giu,
    (match) => resolveLegacy2017AssetUrl(match) ?? match
  );
}

export function rewriteLegacy2017CssAssets(css: string): string {
  return css.replace(/url\((["']?)([^"')]+)\1\)/giu, (match, _quote, value: string) => {
    const assetUrl = resolveLegacy2017AssetUrl(value, 'https://pycon.hk/2017/app.css');

    return assetUrl ? `url("${assetUrl}")` : match;
  });
}

export function resolveLegacy2017AssetUrl(
  value: string,
  baseUrl = 'https://pycon.hk'
): string | undefined {
  return assetUrlByLegacyPath.get(normalizeLegacyPath(value, baseUrl));
}

function assetUrlForModule(asset: AssetModule): string {
  return typeof asset.default === 'string' ? asset.default : asset.default.src;
}

function legacyPathForAssetPath(assetPath: string): string | undefined {
  const livePath = assetPath.replace(/^\.\.\/assets\/live\//u, '');

  if (livePath.startsWith('2017/')) {
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
  const assetUrl = resolveLegacy2017AssetUrl(value);

  return assetUrl ? `${assetUrl}${descriptor}` : '';
}

function setLegacyAssetPath(legacyPath: string, assetUrl: string): void {
  assetUrlByLegacyPath.set(normalizeLegacyPath(legacyPath), assetUrl);
}

function setLegacyAssetAlias(legacyPath: string, sourceLegacyPath: string): void {
  const assetUrl = assetUrlByLegacyPath.get(normalizeLegacyPath(sourceLegacyPath));

  if (assetUrl) {
    setLegacyAssetPath(legacyPath, assetUrl);
  }
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
