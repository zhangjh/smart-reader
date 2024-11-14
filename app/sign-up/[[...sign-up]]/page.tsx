'use client'

import { SignedOut, SignUp, useSignUp, useUser } from '@clerk/nextjs'
import '@/app/sign.css';
import { useEffect } from 'react';
import util from '@/utils/util';
import { useSearchParams } from 'next/navigation';

export default function Page() {

  const { isLoaded, signUp } = useSignUp();
  const { isSignedIn, user } = useUser();

  const redirect = useSearchParams().get("redirect");

  useEffect(() => {
    if(isLoaded && signUp && isSignedIn) {
      util.signUpSaveUser(user);
      if(redirect) {
        window.location.href = redirect;
      }
    }
  }, [isLoaded, signUp, isSignedIn, user]);

  return <SignedOut>
    <div className="centered-container">
      <SignUp />
    </div>
  </SignedOut>
}