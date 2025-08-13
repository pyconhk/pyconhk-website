import { GoogleAnalytics } from '@next/third-parties/google';
import type { Metadata } from 'next';

import { Montserrat } from 'next/font/google';
import '../styles/globals.css';
import Footer from './utils/Footer';

import ogImage from '../../public/2025/landing-pages/open-graph.webp';

const montserrat = Montserrat({ weight: ['500', '600'], subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'The leading Python Conference in Hong Kong',
  description:
    'PyCon Hong Kong is the leading Python conference in Hong Kong, bringing together Python enthusiasts to share their insights and foster collaboration.',
  openGraph: {
    title: 'PyCon HK 2025',
    description: 'The leading Python Conference in Hong Kong',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'PyCon HK 2025',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL}${ogImage.src}`,
        width: ogImage.width,
        height: ogImage.height,
        alt: 'PyCon HK 2025',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PyCon HK 2025',
    description: 'The leading Python Conference in Hong Kong',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL}${ogImage.src}`],
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
    <html lang='en_US'>
      <body className={`${montserrat.className}`}>
        {children}
        <Footer />
      </body>
      {!process.env.NEXT_PUBLIC_IS_TEST_ENV && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}
