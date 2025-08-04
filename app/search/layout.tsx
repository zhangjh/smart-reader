import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "智阅电子书搜索下载平台 - 海量EPUB、PDF、DOCX电子书资源免费下载",
  description: "智阅电子书搜索下载平台，汇聚海量优质电子书资源，提供免费搜索下载服务。支持按书名、作者、ISBN等多维度精准搜索，提供EPUB、PDF、DOCX、AZW3等多种格式下载选择，助您打造专属的数字图书馆，享受便捷的阅读体验，丰富知识储备。",
  keywords: "电子书搜索,电子书下载,免费电子书,EPUB下载,PDF下载,书籍搜索,在线图书馆",
  openGraph: {
    title: "电子书搜索下载 | 智阅",
    description: "海量电子书资源搜索下载，支持多种格式，免费使用。",
    type: "website",
  },
  alternates: {
    canonical: '/search',
  }
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}