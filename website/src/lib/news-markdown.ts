import { remark } from 'remark';
import remarkHtml from 'remark-html';
import { cleanLegacyHtml } from '@/legacy/legacy-html';

export async function renderNewsMarkdown(
  markdown: string,
  collectionYear?: number
): Promise<string> {
  const html = String(
    await remark().use(remarkHtml, { sanitize: true }).process(markdown)
  );

  return collectionYear
    ? cleanLegacyHtml(html, { event: String(collectionYear) })
    : html;
}
