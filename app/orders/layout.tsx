import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "智阅订单管理中心 - 会员订购、支付记录查询、服务升级管理平台",
  description: "智阅订单管理中心，提供完整的服务订单管理功能。查看会员订购、功能升级、支付记录等详细订单信息，支持订单状态实时查询、支付状态跟踪，让您的智阅服务购买和使用过程更加透明便捷，账单管理井井有条，服务体验更优质，享受贴心服务。",
  keywords: "订单管理,会员订购,支付记录,服务升级,订单查询",
  openGraph: {
    title: "订单管理 | 智阅",
    description: "管理您的智阅服务订单，查看订单状态和支付信息。",
    type: "website",
  },
  alternates: {
    canonical: '/orders',
  }
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}