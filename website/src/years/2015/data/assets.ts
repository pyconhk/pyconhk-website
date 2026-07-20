import type { ImageMetadata } from 'astro';

type AssetModule = {
  default: ImageMetadata;
};

const liveAssets = import.meta.glob<AssetModule>('../assets/live/**/*.{jpg,png}', {
  eager: true,
});

const assetUrlByLegacyPath = new Map<string, string>();
const missingSpeakerImagePaths = new Set([
  '/2015/speakers/austin-imperial.jpg',
  '/2015/speakers/pili-hu.jpg',
]);

for (const [assetPath, asset] of Object.entries(liveAssets)) {
  const legacyPath = legacyPathForAssetPath(assetPath);

  if (legacyPath) {
    setLegacyAssetPath(legacyPath, asset.default.src);
  }
}

export async function resolveLegacy2015HtmlImages(html: string): Promise<string> {
  return html
    .replace(/<img\b[^>]*>/giu, (tag) => {
      const source = tag.match(/\ssrc=(["'])([^"']+)\1/iu)?.[2];

      return source && missingSpeakerImagePaths.has(normalizeLegacyPath(source))
        ? ''
        : tag;
    })
    .replace(
      /(\s)(src|href)=(["'])([^"']+)\3/giu,
      (attribute, prefix: string, name: string, quote: string, value: string) => {
        const assetUrl = resolveLegacyAssetUrl(value);

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

function legacyPathForAssetPath(assetPath: string): string | undefined {
  const livePath = assetPath.replace(/^\.\.\/assets\/live\//u, '');

  if (livePath.startsWith('wp-content/uploads/')) {
    return `/legacy-wp/uploads/${livePath.slice('wp-content/uploads/'.length)}`;
  }

  if (livePath.startsWith('2015/')) {
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
  const assetUrl = resolveLegacyAssetUrl(value);

  return assetUrl ? `${assetUrl}${descriptor}` : '';
}

function resolveLegacyAssetUrl(value: string): string | undefined {
  return assetUrlByLegacyPath.get(normalizeLegacyPath(value));
}

function setLegacyAssetPath(legacyPath: string, assetUrl: string): void {
  assetUrlByLegacyPath.set(normalizeLegacyPath(legacyPath), assetUrl);
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
