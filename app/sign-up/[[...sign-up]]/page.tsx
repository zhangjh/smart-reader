'use client'

import { SignUp, useSignUp, useUser } from '@clerk/nextjs'
import '@/app/sign.css';
import { useEffect } from 'react';
import { useLogin } from '@/contexts/login-context';
import { toast } from 'react-toastify';

const debugMode = process.env.NEXT_PUBLIC_DEBUG_MODE;
const serviceDomain = debugMode === "true" ? "http://localhost:3001" : "https://tx.zhangjh.cn";

export default function Page() {

  const { isLoaded, signUp } = useSignUp();
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if(isLoaded && signUp && isSignedIn) {
      const saveUser = async () => {
        try {
          // 只在首次注册时调用保存用户
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
      }
      saveUser();
    }
  }, [isLoaded, signUp, isSignedIn, user]);

  return (
    <div className="centered-container">
      <SignUp fallbackRedirectUrl={"/"} />
    </div>
  )
}