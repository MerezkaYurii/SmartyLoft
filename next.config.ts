import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**', // Разрешаем любые пути внутри домена Cloudinary
      },
    ],
  },
};

export default nextConfig;
