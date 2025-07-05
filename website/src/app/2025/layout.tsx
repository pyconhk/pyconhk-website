import type { Metadata } from 'next';
import NavBar from './components/utils/NavBar';
import '@/styles/globals.css';

import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ weight: ['500', '600'], subsets: ['latin'] });

// Metadata for the 2025 section
export const metadata: Metadata = {
  title: 'PyCon HK 2025',
  description:
    'Python Conference Hong Kong 2025 - Join us on October 11-12, 2025 at City University of Hong Kong',
  keywords: [
    'Python',
    'PyCon',
    'Hong Kong',
    'Conference',
    'Programming',
    'Technology',
    '2025',
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={montserrat.className}>
      <NavBar />

      <main>{children}</main>
    </div>
  );
}
