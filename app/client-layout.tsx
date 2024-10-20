'use client'

import {
  ClerkProvider,
} from '@clerk/nextjs'
import { zhCN } from '@clerk/localizations'

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
    <ClerkProvider localization={zhCN}>
      <html lang="zh">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}