export function cleanLegacyText(text: string) {
  return text
    .replace(
      /([^\s>])((?:Date|Time|Venue|Website|Videos|Meeting ID|Passcode):)/g,
      '$1 $2'
    )
    .replace(/([A-Za-z])(https?:\/\/)/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

export function cleanLegacyHtml(html: string) {
  return html
    .replace(
      /([^\s>])((?:Date|Time|Venue|Website|Videos|Meeting ID|Passcode):)/g,
      '$1 $2'
    )
    .replace(/([A-Za-z])(https?:\/\/)/g, '$1 $2');
}
