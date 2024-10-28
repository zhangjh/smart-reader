'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, ClipboardList, History, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LogoIcon } from './icons/logo';


const Sidebar = ({ children }) => {
  const pathname = usePathname();
  const isActive = (path) => pathname === path;

  const NavLinks = () => (
    <nav className="p-4 space-y-2">
      <Link
        href="/search"
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
          isActive('/reader')
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <BookOpen className="h-5 w-5" />
        <span>找书</span>
      </Link>
      <Link
        href="/reader"
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
          isActive('/reader')
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <BookOpen className="h-5 w-5" />
        <span>阅读器</span>
      </Link>
      <Link
        href="/orders"
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
          isActive('/orders')
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <ClipboardList className="h-5 w-5" />
        <span>订单列表</span>
      </Link>
      <Link
        href="/history"
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
          isActive('/history')
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-600 hover:bg-gray-50'
        }`}
      >
        <History className="h-5 w-5" />
        <span>阅读记录</span>
      </Link>
    </nav>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-white border-r">
        <div className="h-20 flex items-center px-6 border-b">
          <Link href="/" className="flex items-center space-x-2">
            <LogoIcon className="w-10 h-10" />
            <span className="text-xl font-bold text-blue-600">智阅</span>
          </Link>
        </div>
        <NavLinks />
      </aside>

      {/* Mobile Header with Menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-50">
        <div className="flex items-center justify-between px-4 h-full">
          <Link href="/" className="flex items-center space-x-2">
            <LogoIcon className="w-8 h-8" />
            <span className="text-xl font-bold text-blue-600">智阅</span>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="h-16 flex items-center px-6 border-b">
                <Link href="/" className="flex items-center space-x-2">
                  <LogoIcon className="w-8 h-8" />
                  <span className="text-xl font-bold text-blue-600">智阅</span>
                </Link>
              </div>
              <NavLinks />
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      {/* Main Content Area */}
      <main className="flex-1 md:ml-0">
        <div className="md:h-16 h-16 border-b bg-white" />
        <div className="mt-16 md:mt-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Sidebar;