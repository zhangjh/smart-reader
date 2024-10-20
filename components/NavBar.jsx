import React from 'react';
import { LogoIcon } from './icons/logo';
import { Button } from './ui/button';
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'

const NavBar = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <LogoIcon className="w-12 h-12" />
            <a href="/" className="text-2xl font-bold text-blue-600">智阅</a>
          </div>
          <div className="flex items-center">
            <div className="flex space-x-4 mr-6">
              <a href="/search" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">找书</a>
              <a href="/reader" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">阅读器</a>
              <a className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">知识库</a>
            </div>
            <div className="border-l border-gray-300 h-6 mx-4"></div>
            <SignedOut>
              <SignInButton mode="modal">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  登录
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;