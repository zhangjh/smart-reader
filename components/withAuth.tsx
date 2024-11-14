/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { SignIn, useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import '@/app/sign.css'; 

function AuthenticatedContent({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useUser();
  const pathname = usePathname();
  
  if (!isSignedIn) {
    const signInFallbackRedirectUrl = `/sign-in?redirect=${pathname}`
    const signUpFallbackRedirectUrl = `/sign-up?redirect=${pathname}`
    return (
      <div className="centered-container"> 
        <SignIn path={pathname} signUpFallbackRedirectUrl={signUpFallbackRedirectUrl} fallbackRedirectUrl={signInFallbackRedirectUrl} />
      </div>
    )
  }
  return <>{children}</>
}

export function withAuth(WrappedComponent: React.ComponentType) {
  return function WithAuth(props: any) {
    return (
      <AuthenticatedContent>
        <WrappedComponent {...props} />
      </AuthenticatedContent>
    )
  }
}