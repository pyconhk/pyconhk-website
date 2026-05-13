import type { Metadata } from 'next';
import CfpLandingPage from '../components/CfpLandingPage';
import { contentByLocale, resolveLocale, supportedLocales } from '../content';

type Params = Promise<{ locale?: string }>;

export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  const params = await props.params;
  const locale = resolveLocale(params.locale);

  return contentByLocale[locale].metadata;
}

export function generateStaticParams() {
  return supportedLocales.map(locale => ({ locale }));
}

export default async function Page(props: { params: Params }) {
  const params = await props.params;
  const locale = resolveLocale(params.locale);

  return <CfpLandingPage locale={locale} />;
}
