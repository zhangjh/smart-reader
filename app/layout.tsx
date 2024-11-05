import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from './client-layout';

export const metadata: Metadata = {
  title: "智阅 - 您的智能阅读伙伴",
  keywords: "智阅,AI伴读,电子书下载,epub阅读器,AI总结,AI翻译,文档问答,书籍内容总结",
  description: "智阅：结合电子书阅读、AI总结、个人知识库和智能问答，提升您的阅读和学习体验。",
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
