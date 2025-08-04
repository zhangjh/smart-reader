import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "智能电子书阅读器 - 支持EPUB、PDF、DOCX、AZW3格式在线阅读",
  description: "智阅智能电子书阅读器，支持EPUB、PDF、DOCX、AZW3等多种格式在线阅读。集成AI智能总结、智能问答、阅读进度同步等功能，打造沉浸式智能阅读体验。只需上传电子书文件，即可开始您的智能阅读之旅，让阅读更高效，学习更智能，知识获取更便捷。",
  keywords: "电子书阅读器,EPUB阅读器,PDF阅读器,AI阅读助手,智能问答,电子书总结,阅读器在线,免费阅读器",
  openGraph: {
    title: "智能电子书阅读器 | 智阅",
    description: "智阅电子书阅读器，支持多种格式，AI智能总结与问答，提升您的阅读效率。",
    type: "website",
  },
  alternates: {
    canonical: '/reader',
  }
};

export default function ReaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}