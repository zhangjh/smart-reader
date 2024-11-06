'use client'

import React, { useState } from 'react';
import { LogoIcon } from './icons/logo';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';
import {
  SignInButton,
  SignedIn,
  SignedOut,
  SignOutButton,
  UserButton
} from '@clerk/nextjs'

const NavBar = () => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    // window.location.href = '/';
  };

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const NavLinks = () => (
    <>
      <a href="/search" className="text-gray-600 hover:text-gray-900 px-2 py-2 rounded-md text-sm font-medium flex items-center whitespace-nowrap">
        找书
      </a>
      <a href="/reader" className="text-gray-600 hover:text-gray-900 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap">
        阅读器
      </a>
      <a href="/translation" className="text-gray-600 hover:text-gray-900 px-2 py-2 rounded-md text-sm font-medium flex items-center whitespace-nowrap">
        翻译
      </a>
      <div className="relative inline-block">
        <button onClick={toggleDropdown} className="text-gray-600 hover:text-gray-900 px-2 py-2 rounded-md text-sm font-medium whitespace-nowrap">
          我的
        </button>
        {isDropdownOpen && (
          <div className="absolute left-0 md:right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
            <a href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-md">订单</a>
            <a href="/history" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-md">阅读记录</a>
          </div>
        )}
      </div>
    </>
  );

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <LogoIcon className="w-8 h-8 sm:w-12 sm:h-12" />
            <a href="/" className="text-xl sm:text-2xl font-bold text-blue-600">智阅</a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div className="flex space-x-2 mr-4">
              <NavLinks />
            </div>
            <div className="border-l border-gray-300 h-6 mx-2"></div>
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

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <SignedIn>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 mr-4"
                  }
                }}
              />
            </SignedIn>
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <NavLinks />
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <SignedOut>
                <div className="px-2">
                  <SignInButton mode="modal">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                      登录
                    </Button>
                  </SignInButton>
                </div>
              </SignedOut>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;