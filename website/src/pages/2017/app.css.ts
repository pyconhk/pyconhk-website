import { rewriteLegacy2017CssAssets } from '@/years/2017/data/assets';
import { getLegacy2017StaticText } from '@/years/2017/data/static';

export const prerender = true;

export function GET() {
  return new Response(
    rewriteLegacy2017CssAssets(getLegacy2017StaticText('/2017/app.css')),
    {
      headers: {
        'Content-Type': 'text/css; charset=utf-8',
      },
    }
  );
}
