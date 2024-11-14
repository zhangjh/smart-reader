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
      util.signUpSaveUser(user);
    }
  }, [isLoaded, signUp, isSignedIn, user]);

  return !isSignedIn && (
    <div className="centered-container">
      <SignUp />
    </div>
  )
}