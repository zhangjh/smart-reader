import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from './client-layout';

export const metadata: Metadata = {
  title: {
    default: "智阅 - 智能电子书阅读器，AI总结问答，个人知识库管理平台",
    template: "%s | 智阅"
  },
  description: "智阅是专业的智能阅读平台，支持EPUB、PDF、DOCX、AZW3等格式电子书在线阅读。提供AI智能总结、智能问答、个人知识库管理、多语种文档翻译等功能，让阅读更高效，学习更智能，打造您的专属数字图书馆，提升知识获取效率。",
  keywords: "智阅,AI伴读,电子书阅读器,AI总结,智能问答,文档翻译,知识库管理,智能阅读,PDF阅读器,电子书下载",
  authors: [{ name: "太初软件", url: "https://iread.chat" }],
  creator: "太初软件",
  publisher: "智阅",
  category: "Education",
  classification: "Educational Technology",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://iread.chat'),
  alternates: {
    canonical: '/',
    languages: {
      'zh-CN': '/',
    }
  },
  openGraph: {
    title: "智阅 - 您的智能阅读伙伴",
    description: "智阅：结合电子书阅读、AI总结、个人知识库和智能问答，提升您的阅读和学习体验。支持多语种翻译，打造您的专属知识库。",
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
