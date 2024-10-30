'use client'

import {
  ClerkProvider,
  useUser,
} from '@clerk/nextjs'
import { zhCN } from '@clerk/localizations'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import localFont from 'next/font/local';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

const debugMode = process.env.NEXT_PUBLIC_DEBUG_MODE;
const serviceDomain = debugMode === "true" ? "http://localhost:3001" : "https://tx.zhangjh.cn";

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

function SignUpSaveUser() {
  const { user, isSignedIn } = useUser();
  
  useEffect(() => {
    const saveUser = async () => {
      if(isSignedIn && user) {
        try {
          // 调用保存用户
          console.log(user);
          const userId = user.id;
          const userName = user.username;
          const email = user.emailAddresses[0].emailAddress;
          const avatar = user.imageUrl;
          const extType = user.externalAccounts[0].provider;
          
           // 判断是否已经保存过
          const savedUserId = localStorage.getItem("extId");
          if(savedUserId && savedUserId === user.id) {
            return;
          }

          await fetch(`${serviceDomain}/user/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              userName,
              avatar,
              extType,
              extId: userId,
              email
            })
          }).then(response => response.json())
          .then(res => {
            if(!res.success) {
              console.log(res.errorMsg);
              toast.error("保存用户信息出错:" + res.errorMsg);
            } else {
              // 写本地缓存
              const user = res.user;
              window.localStorage.setItem("userId", user.id);
              window.localStorage.setItem("extId", userId);
            }
          });
        } catch (error) {
          console.error("用户保存出错:", error);
        }
      }
    };
    saveUser();
  }, [isSignedIn, user]);

  return null;
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const queryClient = new QueryClient();
  
  return (
    <ClerkProvider localization={zhCN}>      
      <html lang="zh">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <QueryClientProvider client={queryClient}>
            <SignUpSaveUser />
            {children}
          </QueryClientProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}