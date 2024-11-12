'use client'

import { SignIn, useUser } from '@clerk/nextjs'
import '@/app/sign.css'; 
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import util from '@/utils/util';

const debugMode = process.env.NEXT_PUBLIC_DEBUG_MODE;
const serviceDomain = debugMode === "true" ? "http://localhost:3001" : "https://tx.zhangjh.cn";

export default function Page() {
  const { user, isSignedIn } = useUser();

  useEffect(() => {
    if(isSignedIn) {
      const id = user.id;
      const userName = user.username;
      const avatar = user.imageUrl;
      const email = user.emailAddresses[0].emailAddress;
      // 如果有邮箱认为是邮箱登录，否则只记录clerk
      let extType = "clerk";
      if(email) {
        extType = "email";
      }
      // 查询内部userId
      fetch(`${serviceDomain}/user/getUser?extId=${id}&extType=${extType}`)
        .then(response => response.json())
        .then(async response => {
          if(!response.success) {
            // 三方登录的不走注册，需要在这里注册一下
            await util.register({
              extType, extId: id, avatar, email, userName
            });
            return;
          }
          localStorage.setItem("extId", id);
          localStorage.setItem("userId", response.data.id);
          window.history.go(-1);
        });
    }
  }, [isSignedIn]);

  return !isSignedIn && (
    <div className="centered-container">
      <SignIn />
    </div>
  )
}