'use client'

import { SignIn, useUser } from '@clerk/nextjs'
import '@/app/sign.css'; 
import { useEffect } from 'react';
import { toast } from 'react-toastify';

const debugMode = process.env.NEXT_PUBLIC_DEBUG_MODE;
const serviceDomain = debugMode === "true" ? "http://localhost:3001" : "https://tx.zhangjh.cn";

export default function Page() {
  
  useEffect(() => {
    const { user, isSignedIn } = useUser();
    if(isSignedIn) {
      const id = user.id;
      let extType = "email";
      if(user.externalAccounts.length > 0) {
        extType = user.externalAccounts[0].provider;
      }
      // 查询内部userId
      fetch(`${serviceDomain}/user/getUser?extId=${id}&extType=${extType}`)
        .then(response => response.json())
        .then(response => {
          if(!response.success) {
            toast.error("查询登录用户失败");
            return;
          }
          localStorage.setItem("extId", id);
          localStorage.setItem("userId", response.data.id);
        });
    }
  }, []);

  return (
    <div className="centered-container">
      <SignIn />
    </div>
  )
}