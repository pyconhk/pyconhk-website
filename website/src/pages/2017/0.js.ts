import { getLegacy2017StaticText } from '@/years/2017/data/static';

export const prerender = true;

export function GET() {
  return new Response(getLegacy2017StaticText('/2017/0.js'), {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
    },
  });
}
