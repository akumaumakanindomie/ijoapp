import type { NextConfig } from 'next';

const nextConfig: NextConfig = {

  async redirects() {
    return [
      {
        source: '/admin/dashboard/content',
        destination: '/admin/dashboard',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;