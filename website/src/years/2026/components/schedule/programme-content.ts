import { remark } from 'remark';
import remarkHtml from 'remark-html';

export async function renderProgrammeMarkdown(markdown: string) {
  return String(await remark().use(remarkHtml, { sanitize: true }).process(markdown));
}
