import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from './client-layout';

export const metadata: Metadata = {
  title: {
    default: "智阅 - 您的智能阅读伙伴",
    template: "%s | 智阅"
  },
  description: "智阅：结合电子书阅读、AI总结、个人知识库和智能问答，提升您的阅读和学习体验。支持多语种翻译，打造您的专属知识库。",
  keywords: "智阅,AI伴读,电子书下载,epub阅读器,AI总结,AI翻译,文档问答,书籍内容总结,知识库管理,智能阅读,电子书阅读,PDF阅读器",
  authors: [{ name: "太初软件" }],
  creator: "太初软件",
  publisher: "智阅",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://iread.chat'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "智阅 - 您的智能阅读伙伴",
    description: "智阅：结合电子书阅读、AI总结、个人知识库和智能问答，提升您的阅读和学习体验。",
    url: 'https://iread.chat',
    siteName: '智阅',
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "智阅 - 您的智能阅读伙伴",
    description: "智阅：结合电子书阅读、AI总结、个人知识库和智能问答，提升您的阅读和学习体验。",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    "baidu-site-verification": "codeva-fauiyMT50E",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClientLayout>{children}</ClientLayout>
  );
}
