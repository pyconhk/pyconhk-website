import cyberportBack from '@/years/2015/assets/live/2015/images/cyberport-back.jpg';
import { legacy2015CompatibilityText } from '@/years/2015/data/compatibility';
import { getLegacy2015Page } from '@/years/2015/data/pages';

export function legacy2015ResourceResponse(route: string, contentType: string) {
  const page = getLegacy2015Page(route);
  const body = legacy2015CompatibilityText(page.bodyHtml).replace(
    /url\("images\/cyberport-back\.jpg"\)/gu,
    `url("${cyberportBack.src}")`
  );

  return new Response(body, {
    headers: {
      'Content-Type': `${contentType}; charset=utf-8`,
    },
  });
}
