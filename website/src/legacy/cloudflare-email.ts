const protectedEmailAnchorPattern =
  /<a\b([^>]*?)\s+href=(["'])\/cdn-cgi\/l\/email-protection#([0-9a-f]+)\2([^>]*)>\s*<span\b[^>]*?\sdata-cfemail=(["'])([0-9a-f]+)\5[^>]*>[\s\S]*?<\/span>\s*<\/a>/giu;

const protectedEmailDataAnchorPattern =
  /<a\b[^>]*?\sdata-cfemail=(["'])([0-9a-f]+)\1[^>]*>[\s\S]*?<\/a>/giu;

const protectedEmailHrefPattern =
  /href=(["'])\/cdn-cgi\/l\/email-protection#([0-9a-f]+)\1/giu;

export function decodeCloudflareProtectedEmails(html: string): string {
  return html
    .replace(
      protectedEmailAnchorPattern,
      (
        match,
        beforeHref: string,
        _hrefQuote: string,
        hrefEmail: string,
        afterHref: string,
        _spanQuote: string,
        spanEmail: string
      ) => {
        const email =
          decodeCloudflareEmail(spanEmail) ?? decodeCloudflareEmail(hrefEmail);

        if (!email) {
          return match;
        }

        return `<a${beforeHref} href="mailto:${escapeHtmlAttribute(email)}"${afterHref}>${escapeHtmlText(email)}</a>`;
      }
    )
    .replace(
      protectedEmailDataAnchorPattern,
      (match, _quote: string, protectedEmail: string) => {
        const email = decodeCloudflareEmail(protectedEmail);

        return email
          ? `<a href="mailto:${escapeHtmlAttribute(email)}">${escapeHtmlText(email)}</a>`
          : match;
      }
    )
    .replace(
      protectedEmailHrefPattern,
      (match, quote: string, protectedEmail: string) => {
        const email = decodeCloudflareEmail(protectedEmail);

        return email
          ? `href=${quote}mailto:${escapeHtmlAttribute(email)}${quote}`
          : match;
      }
    );
}

export function stripCloudflareChallengeScripts(html: string): string {
  return html.replace(
    /<script\b[^>]*>(?:(?!<\/script>).)*challenge-platform\/scripts\/jsd\/main\.js(?:(?!<\/script>).)*<\/script>/gis,
    ''
  );
}

export function stripLegacyScripts(html: string): string {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>\s*/giu, '');
}

export function decodeCloudflareEmail(protectedEmail: string): string | undefined {
  if (!/^(?:[0-9a-f]{2}){2,}$/iu.test(protectedEmail)) {
    return undefined;
  }

  const key = Number.parseInt(protectedEmail.slice(0, 2), 16);
  const bytes = [];

  for (let index = 2; index < protectedEmail.length; index += 2) {
    const byte = Number.parseInt(protectedEmail.slice(index, index + 2), 16);
    bytes.push(byte ^ key);
  }

  return new TextDecoder().decode(new Uint8Array(bytes));
}

function escapeHtmlAttribute(value: string): string {
  return escapeHtmlText(value).replace(/"/gu, '&quot;');
}

function escapeHtmlText(value: string): string {
  return value.replace(/[&<>]/gu, (character) => {
    switch (character) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      default:
        return character;
    }
  });
}
