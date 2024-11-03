/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { SignIn, useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import '@/app/sign.css'; 

function AuthenticatedContent({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useUser()
  const pathname = usePathname()
  
  if (!isSignedIn) {
    return (
      <div className="centered-container"> 
        <SignIn path={pathname} signUpUrl='/sign-up' redirectUrl={pathname} />
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