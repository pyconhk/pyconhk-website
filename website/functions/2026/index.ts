import { localeRedirectResponse } from '../../src/years/2026/locales';

export function onRequest({ request }: { request: Request }): Response {
  return localeRedirectResponse(request, (locale) => `/2026/${locale}`);
}
