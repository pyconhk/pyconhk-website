import { resolveLegacy2017StaticTextAssets } from '@/years/2017/data/assets';
import { getLegacy2017StaticText } from '@/years/2017/data/static';

export const prerender = true;

export function GET() {
  return new Response(
    resolveLegacy2017StaticTextAssets(getLegacy2017StaticText('/2017/manifest.json')),
    {
      headers: {
        'Content-Type': 'application/manifest+json; charset=utf-8',
      },
    }
  );
}
