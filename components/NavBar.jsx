'use client'

import React, { useState } from 'react';
import { LogoIcon } from './icons/logo';
import { Button } from './ui/button';
import {
  SignInButton,
  SignedIn,
  SignedOut,
  SignOutButton,
  UserButton
} from '@clerk/nextjs'

const NavBar = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const handleSignOut = () => {
    // window.location.href = '/';
  };

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen); // 切换下拉菜单的显示状态
  };

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
              <a href="/translation" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">翻译</a>
              {/* <a className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">知识库</a> */}
              <div className="relative">
                <button onClick={toggleDropdown} className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  我的
                </button>
                {isDropdownOpen && ( // 根据状态显示下拉菜单
                  <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md z-10">
                    <a href="/orders" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">订单</a>
                    <a href="/history" className="block px-4 py-2 text-gray-600 hover:bg-gray-100">阅读记录</a>
                  </div>
                )}
              </div>
            </div>
            <div className="border-l border-gray-300 h-6 mx-4"></div>
            <SignedOut>
              <SignInButton mode="modal">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded h-8">
                  登录
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <SignOutButton signOutCallback={handleSignOut}>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              </SignOutButton>
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;