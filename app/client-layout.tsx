'use client'

import { WechatLoginModal } from '@/components/wechat-login-modal';
import { LoginProvider } from '@/contexts/login-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import localFont from 'next/font/local';

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});

const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const queryClient = new QueryClient()
  
  return (
    <html lang="zh">
      <body   
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LoginProvider>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
          <WechatLoginModal />
        </LoginProvider>
      </body>
    </html>
  )
}