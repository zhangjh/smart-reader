'use client'

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { useUser } from '@clerk/nextjs';
import { ToastContainer, toast } from 'react-toastify'; // 引入 ToastContainer 和 toast
import 'react-toastify/dist/ReactToastify.css'; // 引入样式
import util from '@/utils/util';

const debugMode = process.env.NEXT_PUBLIC_DEBUG_MODE;
const serviceDomain = debugMode === "true" ? "http://localhost:3001" : "https://tx.zhangjh.cn";

const BookSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { isSignedIn } = useUser();

  const { data: searchResults, refetch, isFetching } = useQuery({
    queryKey: ['bookSearch', searchTerm],
    queryFn: async () => {
      const response = await fetch(serviceDomain + `/books/search?keyword=${searchTerm}&limit=10`);
      console.log(response);
      if (!response.ok) {
        throw new Error('查找失败');
      }
      const res = await response.json();
      if(res.success) {
        return res.data;
      } else {
        throw new Error('查找失败: ' + res.errorMsg);
      }
    },
    enabled: false,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsSearching(true);
      refetch().then(() => setIsSearching(false));
    }
  };

  const getDownloadLink = async (bookId: string, bookHash: string) => {
    try {
      if(!isSignedIn) {
        window.location.href = "/sign-in?redirect_url=" + window.location.pathname;
        return;
      }
      const userId = window.localStorage.getItem("userId");
      if(!userId) {
        throw new Error("用户未登录");
      }
      // 校验权限
      util.authCheck(userId, "download", async () => {
        const response = await fetch(`${serviceDomain}/books/download`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookId: bookId,
            hashId: bookHash,
          }),
        });
        if (!response.ok) {
          throw new Error('获取下载链接失败');
        }
        const res = await response.json();
        if (res.success && res.data) {
          window.open(res.data, '_blank');
        } else {
          throw new Error('获取下载链接失败');
        }
      });
    } catch (error) {
      console.error('下载错误:', error);
      toast.error('获取下载链接失败，请稍后再试');
    }
  };

  return (
    <>  
      <ToastContainer />
      <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex items-center justify-center flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto w-full">
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex items-center">
              <Input
                type="text"
                placeholder="搜索书籍..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow mr-2"
              />
              <Button type="submit" disabled={isFetching}>
                {isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '搜索'}
              </Button>
            </div>
          </form>

          {isSearching && (
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2">正在搜索...</p>
            </div>
          )}

          {searchResults && !isSearching && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">搜索结果</h2>
              {searchResults.map((book) => (
                <div key={book.id} className="border p-4 rounded-lg">
                  <h3 
                    className="text-lg font-semibold cursor-pointer hover:text-blue-600"
                    onClick={() => getDownloadLink(book.id, book.hash)}
                  >         
                    {book.title}
                  </h3>
                  <img src={book.cover} alt={book.title} />
                  <p className="text-sm text-gray-600">
                    <strong>作者：</strong>{book.author}</p>
                  <p className="text-sm text-gray-600">
                    <strong>语种：</strong>{book.language}</p>
                  <p className="text-sm text-gray-600">
                    <strong>出版社：</strong>{book.publisher}</p>
                  <div 
                    className="mt-2"
                    dangerouslySetInnerHTML={{ __html: book.description }}
                  />               
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
    </>
  );
};

export default BookSearch;