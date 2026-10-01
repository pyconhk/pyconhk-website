import { parseDocument } from 'yaml';

export function parseNewsFrontmatter(source: string) {
  // News is data, including unfinished drafts. Never select an executable
  // frontmatter engine from an author-controlled delimiter such as "---js".
  const parts = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/u.exec(source);
  if (!parts) {
    throw new Error('News must use plain YAML frontmatter between --- lines');
  }

  const document = parseDocument(parts[1]);
  const problem = document.errors[0] ?? document.warnings[0];
  if (problem) throw problem;
  const data: unknown = document.toJS();
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('News YAML frontmatter must be a mapping');
  }

  return { data: data as Record<string, unknown>, content: parts[2] };
}
