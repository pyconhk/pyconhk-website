import type { ImageMetadata } from 'astro';

type AssetModule = {
  default: ImageMetadata;
};

const liveAssets = import.meta.glob<AssetModule>('../assets/live/**/*.{jpg,png}', {
  eager: true,
});

const assetUrlByLegacyPath = new Map<string, string>();

for (const [assetPath, asset] of Object.entries(liveAssets)) {
  const legacyPath = legacyPathForAssetPath(assetPath);

  if (legacyPath) {
    setLegacyAssetPath(legacyPath, asset.default.src);
  }
}

setLegacyAssetAlias('/2016/cyberport.jpg', '/2016/venue/cyberport.jpg');
setLegacyAssetAlias('/2016/pycon.png', '/2016/venue/pycon.png');

export function resolveLegacy2016HtmlAssets(html: string): string {
  return html
    .replace(
      /(\s)(src|href)=(["'])([^"']+)\3/giu,
      (attribute, prefix: string, name: string, quote: string, value: string) => {
        const assetUrl = resolveLegacy2016AssetUrl(value);

        return assetUrl ? `${prefix}${name}=${quote}${assetUrl}${quote}` : attribute;
      }
    )
    .replace(
      /(\s)srcset=(["'])([^"']+)\2/giu,
      (_attribute, prefix: string, quote: string, value: string) => {
        const candidates = value
          .split(',')
          .map(rewriteSrcsetCandidate)
          .filter((candidate) => candidate !== '');

        return candidates.length > 0
          ? `${prefix}srcset=${quote}${candidates.join(', ')}${quote}`
          : '';
      }
    );
}

export function resolveLegacy2016AssetUrl(value: string): string | undefined {
  return assetUrlByLegacyPath.get(normalizeLegacyPath(value));
}

function legacyPathForAssetPath(assetPath: string): string | undefined {
  const livePath = assetPath.replace(/^\.\.\/assets\/live\//u, '');

  if (livePath.startsWith('2016/')) {
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
  const assetUrl = resolveLegacy2016AssetUrl(value);

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

function normalizeLegacyPath(value: string): string {
  const path = pathnameForLegacyUrl(value);

  try {
    return decodeURI(path);
  } catch {
    return path;
  }
}

function pathnameForLegacyUrl(value: string): string {
  try {
    return new URL(value, 'https://pycon.hk').pathname;
  } catch {
    return value;
  }
}
