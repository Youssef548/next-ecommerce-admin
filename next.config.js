/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable strict mode for better compatibility
  reactStrictMode: false,

  // Force dynamic rendering (not static)
  output: 'standalone',
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Enable experimental features
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma', 'bcrypt']
  },
  
  // Image configuration
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
    ],
  },
  
  // Environment-specific configuration
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
  },
  
  // Disable static optimization for dynamic behavior
  trailingSlash: false,
  
  // Headers for dynamic content
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: 'my-value',
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig



