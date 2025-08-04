/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
      ignoreBuildErrors: true,
    },
    images: {
      domains: ['s3proxy.cdn-zlib.sk'],
      formats: ['image/webp', 'image/avif'],
      minimumCacheTTL: 60,
      dangerouslyAllowSVG: true,
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
    // reactStrictMode: false,
    compress: true,
    poweredByHeader: false,
    generateEtags: true,
    
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block',
            },
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin',
            },
            {
              key: 'Permissions-Policy',
              value: 'camera=(), microphone=(), geolocation=()',
            },
          ],
        },
        {
          source: '/api/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store, must-revalidate',
            },
          ],
        },
        {
          source: '/_next/static/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
        {
          source: '/favicon.ico',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=86400, stale-while-revalidate=604800',
            },
          ],
        },
        {
          source: '/:path*.(png|jpg|jpeg|gif|webp|svg|ico)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=86400, stale-while-revalidate=604800',
            },
          ],
        },
        {
          source: '/:path*.(woff|woff2|ttf|otf)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'public, max-age=31536000, immutable',
            },
          ],
        },
      ];
    },
    
    async redirects() {
      return [
        {
          source: '/home',
          destination: '/',
          permanent: true,
        },
        {
          source: '/index',
          destination: '/',
          permanent: true,
        },
        {
          source: '/index.html',
          destination: '/',
          permanent: true,
        },
      ];
    },

    // 启用实验性功能以提升性能
    experimental: {
      scrollRestoration: true,
    },

    // 编译优化
    compiler: {
      removeConsole: process.env.NODE_ENV === 'production',
    },
};

export default nextConfig;
