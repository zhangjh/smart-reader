'use client'

import {
  ClerkProvider,
  useUser,
} from '@clerk/nextjs'
import { zhCN } from '@clerk/localizations'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import localFont from 'next/font/local';
import { useEffect } from 'react';
import Script from 'next/script';
import { ToastContainer, toast } from 'react-toastify'; // 引入 ToastContainer 和 toast
import 'react-toastify/dist/ReactToastify.css'; // 引入样式

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
          let extType = "email";
          if(user.externalAccounts.length > 0) {
            extType = user.externalAccounts[0].provider;
          }
          
           // 判断是否已经保存过
          const savedExtId = localStorage.getItem("extId");
          const savedUserId = localStorage.getItem("userId");
          if(savedExtId && savedExtId === user.id && savedUserId) {
            return;
          }
          localStorage.removeItem("extId");
          localStorage.removeItem("userId");

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
              const user = res.data;
              window.localStorage.setItem("userId", user.id);
              window.localStorage.setItem("extId", userId);
            }
          });
        } catch (error) {
          console.error("用户保存出错:", error);
        }
      } else {
        // 未登录清除本地缓存
        // window.localStorage.clear();
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
    <ClerkProvider localization={zhCN} afterSignOutUrl="/sign-out">      
      <html lang="zh">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <QueryClientProvider client={queryClient}>
            <SignUpSaveUser />
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