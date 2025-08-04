import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "阅读历史记录管理中心 - 追踪阅读进度，智能统计分析，打造个人数字图书馆",
  description: "智阅阅读历史记录管理中心，帮您追踪每本书的阅读进度，管理已读书籍，继续未完成的阅读任务。提供智能阅读数据统计分析，建立完整的个人阅读档案和数字图书馆，让您的阅读成长轨迹清晰可见，阅读习惯一目了然，提升阅读效率，优化学习体验。",
  keywords: "阅读历史,阅读记录,阅读进度,书籍管理,个人图书馆,阅读统计",
  openGraph: {
    title: "阅读历史记录 | 智阅",
    description: "管理您的阅读历史，追踪阅读进度，打造个人阅读档案。",
    type: "website",
  },
  alternates: {
    canonical: '/history',
  }
};

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}