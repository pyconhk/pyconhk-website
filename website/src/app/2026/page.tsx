import type { Metadata } from 'next';
import CfpLandingPage from './components/CfpLandingPage';
import { contentByLocale } from './content';

export const metadata: Metadata = contentByLocale.en.metadata;

export default function Page() {
  return <CfpLandingPage locale='en' />;
}
