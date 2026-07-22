import { decodeCloudflareProtectedEmails } from '@/legacy/cloudflare-email';
import { repairLegacy2017ArchiveSidebar } from '@/legacy/conference-archive-links';
import { prepareLegacySearchableHtml } from '@/legacy/legacy-html';
import { resolveLegacy2017HtmlAssets } from '@/years/2017/data/assets';
import { getLegacy2017Page } from '@/years/2017/data/pages';

export const prerender = true;

export function GET() {
  const page = getLegacy2017Page('/2017/about/coc.html');

  return new Response(
    prepareLegacySearchableHtml(
      resolveLegacy2017HtmlAssets(
        repairLegacy2017ArchiveSidebar(decodeCloudflareProtectedEmails(page.fullHtml))
      ),
      {
        route: page.route,
        title: page.title,
      }
    ),
    {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    }
  );
}
