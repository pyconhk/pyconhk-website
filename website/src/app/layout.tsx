import { GoogleAnalytics } from '@next/third-parties/google';
import type { Metadata } from 'next';

import { Montserrat } from 'next/font/google';
import '../styles/globals.css';
import Footer from './utils/Footer';

const montserrat = Montserrat({ weight: ['500', '600'], subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PyCon HK 2026 CFP | Many Voices, One Python Story',
  description:
    'Submit a proposal for PyCon Hong Kong 2026. Many voices, one Python story.',
  openGraph: {
    title: 'PyCon HK 2026 CFP',
    description: 'Many Voices, One Python Story',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'PyCon HK 2026',
  },
  twitter: {
    card: 'summary',
    title: 'PyCon HK 2026 CFP',
    description: 'Many Voices, One Python Story',
    creator: '@pyconhk',
    site: '@pyconhk',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en_US' className='light'>
      <body className={`${montserrat.className}`}>
        {children}
        <Footer />
      </body>
      {process.env.NEXT_PUBLIC_IS_TEST_ENV !== 'true' && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}
