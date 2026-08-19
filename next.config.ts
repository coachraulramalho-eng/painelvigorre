import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // 🔥 typedRoutes removido para evitar erros de tipagem
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // 🔥 eslint removido (não é mais suportado no next.config.ts)
  // 🔥 experimental removido
};

export default nextConfig;
