import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '智阅 - 您的智能阅读伙伴',
    short_name: '智阅',
    description: '智阅：结合电子书阅读、AI总结、个人知识库和智能问答，提升您的阅读和学习体验。',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}