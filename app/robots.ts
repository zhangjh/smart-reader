import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
          '/*.json$',
          '/sign-out',
        ],
        crawlDelay: 1,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/private/'],
      },
      {
        userAgent: 'Baiduspider',
        allow: '/',
        disallow: ['/api/', '/admin/', '/private/'],
        crawlDelay: 2,
      }
    ],
    sitemap: 'https://iread.chat/sitemap.xml',
    host: 'https://iread.chat',
  }
}