import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "文档智能翻译 - 支持PDF、DOCX、EPUB多语种在线翻译",
  description: "智阅文档智能翻译工具，支持PDF、DOCX、EPUB等多种格式的专业翻译服务。采用AI驱动技术，提供中英日韩等多语种互译，完美保持原文档格式和排版。让语言不再成为阅读障碍，轻松跨越语言壁垒，畅享全球知识，提升学习效率，拓展知识视野。",
  keywords: "文档翻译,PDF翻译,DOCX翻译,多语种翻译,智能翻译,在线翻译工具,文档格式保持",
  openGraph: {
    title: "文档智能翻译 | 智阅",
    description: "专业的文档翻译工具，支持多种格式和语言，保持原文档格式。",
    type: "website",
  },
  alternates: {
    canonical: '/translation',
  }
};

export default function TranslationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}