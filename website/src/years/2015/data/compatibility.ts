export function decodeLegacy2015HtmlEntities(value: string): string {
  return value
    .replace(/&lt;/gu, '<')
    .replace(/&gt;/gu, '>')
    .replace(/&quot;/gu, '"')
    .replace(/&#39;/gu, "'")
    .replace(/&amp;/gu, '&');
}

export function legacy2015CompatibilityText(bodyHtml: string): string {
  const match = bodyHtml.match(/<code>([\s\S]*?)<\/code>/u);

  return decodeLegacy2015HtmlEntities(match?.[1] ?? '');
}
