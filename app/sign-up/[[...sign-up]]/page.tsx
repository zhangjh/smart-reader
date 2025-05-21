'use client'

import { SignedOut, SignUp, useSignUp, useUser } from '@clerk/nextjs'
import '@/app/sign.css';
import { useEffect } from 'react';
import util from '@/utils/util';
import { useSearchParams } from 'next/navigation';

export default function Page() {
  const { isLoaded, signUp } = useSignUp();
  const { isSignedIn, user } = useUser();
  const redirect = useSearchParams()?.get("redirect");

  useEffect(() => {
    async function handleSignUp() {
      if(isLoaded && signUp && isSignedIn && user) {
        try {
          await util.signUpSaveUser(user);
          // 验证localStorage是否正确设置
          const storedUserId = localStorage.getItem("userId");
          const storedExtId = localStorage.getItem("extId");
          
          if (!storedUserId || !storedExtId) {
            console.error('注册后未能正确设置用户信息');
            return;
          }

          if(redirect) {
            window.location.href = redirect;
          }
        } catch (error) {
          console.error('注册过程发生错误:', error);
        }
      }
    }
    
    handleSignUp();
  }, [isLoaded, signUp, isSignedIn, user]);

  return <SignedOut>
    <div className="centered-container">
      <SignUp />
    </div>
  </SignedOut>
}