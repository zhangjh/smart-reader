'use client'

import {
  ClerkProvider,
} from '@clerk/nextjs'
import { zhCN } from '@clerk/localizations'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import localFont from 'next/font/local';
import Script from 'next/script';
import { ToastContainer } from 'react-toastify'; // 引入 ToastContainer 和 toast
import 'react-toastify/dist/ReactToastify.css'; // 引入样式
import { usePathname } from 'next/navigation';

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
  const queryClient = new QueryClient();
  const pathname = usePathname();

  const signInFallbackRedirectUrl = `/sign-in?redirect=${pathname}`
  const signUpFallbackRedirectUrl = `/sign-up?redirect=${pathname}`

  return (
    <ClerkProvider localization={zhCN} afterSignOutUrl="/sign-out" 
      signUpFallbackRedirectUrl={signUpFallbackRedirectUrl} 
      signInFallbackRedirectUrl={signInFallbackRedirectUrl} >      
      <html lang="zh">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
          <ToastContainer />
        </body>
        <Script
          strategy='lazyOnload'
          src="//js.users.51.la/21929023.js"
        ></Script>
      </html>
    </ClerkProvider>
  )
}