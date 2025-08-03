// export default nextConfig;
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
};

const setup = async () => {
  if (process.env.NEXT_PUBLIC_IS_TEST_ENV === 'true') {
    await setupDevPlatform();
  }
  return nextConfig;
};

export default setup();
