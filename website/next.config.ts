import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

const setup = async () => {
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.NEXT_PUBLIC_IS_TEST_ENV === 'true'
  ) {
    const loadDevPlatform = Function('specifier', 'return import(specifier)') as (
      specifier: string
    ) => Promise<{ setupDevPlatform: () => Promise<void> }>;
    const { setupDevPlatform } = await loadDevPlatform(
      '@cloudflare/next-on-pages/next-dev'
    );
    await setupDevPlatform();
  }
  return nextConfig;
};

export default setup();
