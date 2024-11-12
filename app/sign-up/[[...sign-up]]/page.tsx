'use client'

import { SignUp, useSignUp, useUser } from '@clerk/nextjs'
import '@/app/sign.css';
import { useEffect } from 'react';
import util from '@/utils/util';

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
          // 如果有邮箱认为是邮箱登录，否则只记录clerk
          let extType = "clerk";
          if(email) {
            extType = "email";
          }
          // 判断是否已经保存过
          const savedExtId = localStorage.getItem("extId");
          const savedUserId = localStorage.getItem("userId");
          if(savedExtId && savedExtId === user.id && savedUserId) {
            return;
          }
          localStorage.removeItem("extId");
          localStorage.removeItem("userId");
          await util.register({
            extType, extId: userId, avatar, userName, email
          });
        } catch (error) {
          console.error("用户保存出错:", error);
        }
      }
      saveUser();
    }
  }, [isLoaded, signUp, isSignedIn, user]);

  return !isSignedIn && (
    <div className="centered-container">
      <SignUp />
    </div>
  )
}