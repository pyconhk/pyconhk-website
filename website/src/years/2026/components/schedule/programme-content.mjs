import { remark } from 'remark';
import remarkHtml from 'remark-html';

export async function renderProgrammeMarkdown(markdown) {
  return String(await remark().use(remarkHtml, { sanitize: true }).process(markdown));
}
