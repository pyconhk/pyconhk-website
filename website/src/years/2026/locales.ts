import { preferredLocaleCookie } from '@/config/site';

// Korean is CFP-only until it is supported across the full public site.
export const supportedLocales = [
  'en',
  'zh-hk',
  'zh-hant',
  'zh-hans',
  'ko',
  'ja',
] as const;

export type CfpLocale = (typeof supportedLocales)[number];

const defaultLocale: CfpLocale = 'en';
const cookieMaxAge = 31_536_000;

export function resolveCfpLocale(locale?: string): CfpLocale {
  return isCfpLocale(locale) ? locale : defaultLocale;
}

export function localeRedirectResponse(
  request: Request,
  localePath: (locale: CfpLocale) => string
): Response {
  const locale = preferredLocale(request);
  const requestUrl = new URL(request.url);
  const location = `${localePath(locale)}${requestUrl.search}`;
  const secure = requestUrl.protocol === 'https:' ? '; Secure' : '';

  return new Response(null, {
    status: 302,
    headers: {
      'Cache-Control': 'private, no-store',
      Location: location,
      'Set-Cookie': `${preferredLocaleCookie}=${locale}; Path=/; Max-Age=${cookieMaxAge}; SameSite=Lax${secure}`,
      Vary: 'Cookie, Accept-Language',
    },
  });
}

function preferredLocale(request: Request): CfpLocale {
  const cookieLocale = readCookie(request.headers.get('Cookie'));

  if (isCfpLocale(cookieLocale)) {
    return cookieLocale;
  }

  for (const language of acceptedLanguages(request.headers.get('Accept-Language'))) {
    const locale = localeFromLanguage(language);

    if (locale) {
      return locale;
    }
  }

  return defaultLocale;
}

function readCookie(cookieHeader: string | null): string {
  const prefix = `${preferredLocaleCookie}=`;
  const cookie = (cookieHeader ?? '')
    .split(';')
    .map((value) => value.trim())
    .find((value) => value.startsWith(prefix));

  if (!cookie) {
    return '';
  }

  try {
    return decodeURIComponent(cookie.slice(prefix.length));
  } catch {
    return '';
  }
}

function acceptedLanguages(header: string | null): string[] {
  return (header ?? '')
    .split(',')
    .map((value, index) => {
      const [language = '', ...parameters] = value.trim().split(';');
      const qualityParameter = parameters.find((parameter) =>
        parameter.trim().toLowerCase().startsWith('q=')
      );
      const quality = qualityParameter
        ? Number.parseFloat(qualityParameter.split('=', 2)[1] ?? '')
        : 1;

      return {
        index,
        language,
        quality: Number.isFinite(quality) ? quality : 0,
      };
    })
    .filter(({ language, quality }) => language && quality > 0)
    .sort((left, right) => right.quality - left.quality || left.index - right.index)
    .map(({ language }) => language);
}

function localeFromLanguage(language: string): CfpLocale | undefined {
  const normalized = language.toLowerCase().replaceAll('_', '-');

  if (isCfpLocale(normalized)) {
    return normalized;
  }

  const primaryLocale = normalized.split('-')[0];

  if (isCfpLocale(primaryLocale)) {
    return primaryLocale;
  }

  if (
    normalized.startsWith('zh-hk') ||
    normalized.startsWith('zh-mo') ||
    normalized.startsWith('yue')
  ) {
    return 'zh-hk';
  }

  if (
    normalized.startsWith('zh-hans') ||
    normalized.startsWith('zh-cn') ||
    normalized.startsWith('zh-sg')
  ) {
    return 'zh-hans';
  }

  if (normalized.startsWith('zh-hant') || normalized.startsWith('zh-tw')) {
    return 'zh-hant';
  }

  return undefined;
}

function isCfpLocale(locale?: string): locale is CfpLocale {
  return supportedLocales.includes(locale as CfpLocale);
}
