import React from 'react';
import { useLogin } from '@/contexts/login-context';
import { Button } from './ui/button';
import { LogoIcon } from './icons/logo';

const NavBar = () => {
  const { openLoginModal } = useLogin();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <LogoIcon className="w-12 h-12" />
            <a href="/" className="text-2xl font-bold text-blue-600">智阅</a>
          </div>
          <div className="flex items-center">
          <a href="/search" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">找书</a>
            <a href="/reader" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">阅读器</a>
            <a className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">知识库</a>
            <Button className="ml-2 h-6" onClick={ openLoginModal }>登录</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;