'use client'

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-toastify';
import util from '@/utils/util';

const debugMode = process.env.NEXT_PUBLIC_DEBUG_MODE;
const serviceDomain = debugMode === "true" ? "http://localhost:3001" : "https://tx.zhangjh.cn";

const BookSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { isSignedIn, user } = useUser();
  const [userId, setUserId] = useState('');

    async function init() {
      const savedUserId = localStorage.getItem("userId");
      if(savedUserId) {
        setUserId(savedUserId);
      } else {
        if(isSignedIn) {
          const extId = user.id;
          const userName = user.username;
          const email = user.emailAddresses[0].emailAddress;
          const avatar = user.imageUrl;
          // 如果有邮箱认为是邮箱登录，否则只记录clerk
          let extType = "clerk";
          if(email) {
            extType = "email";
          }
          const userId = await util.getUserByExtId({extType, extId, avatar, email, userName});
          setUserId(userId);
        }
      }
    };
  
    useEffect(() => {
      init();
    }, [isSignedIn]);

  const { data: searchResults, refetch, isFetching } = useQuery({
    queryKey: ['bookSearch', searchTerm, currentPage],
    queryFn: async () => {
      const response = await fetch(serviceDomain + `/books/search?keyword=${searchTerm}&page=${currentPage}&limit=10`);
      console.log(response);
      if (!response.ok) {
        toast.error('查找失败，请稍后再试');
        return;
      }
      const res = await response.json();
      if(res.success) {
        if(!res.data || res.data.length === 0) {
          toast.info("未搜索到对应书籍");
          return;
        }
        return res.data;
      } else {
        toast.error('查找失败: ' + res.errorMsg);
        return;
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
      // 校验权限
      await util.authCheck(userId, "download", async () => {
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
          // 保存下载使用次数
          util.saveUsage("download", userId);
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
              {searchResults && searchResults.map((book) => (
                <div key={book.id} className="border p-4 rounded-lg">
                  <h3 
                    className="text-lg font-semibold cursor-pointer hover:text-blue-600"
                    onClick={() => getDownloadLink(book.id, book.hash)}
                  >         
                    {book.title}
                  </h3>
                  <Image 
                    src={book.cover}
                    alt={book.title}
                    width={150}
                    height={150}
                    className="rounded-lg"
                  />
                  <p className="text-sm text-gray-600">
                    <strong>作者：</strong>{book.author}</p>
                  <p className="text-sm text-gray-600">
                    <strong>语种：</strong>{book.language}</p>
                  <p className="text-sm text-gray-600">
                    <strong>评分：</strong>{book.interestScore}</p>
                  <p className="text-sm text-gray-600">
                    <strong>出版社：</strong>{book.publisher}</p>
                  <p className="text-sm text-gray-600">
                    <strong>格式：</strong>{book.extension}</p>
                  <p className="text-sm text-gray-600">
                    <strong>大小：</strong>{book.filesizeString}</p>
                  <div 
                    className="mt-2"
                    dangerouslySetInnerHTML={{ __html: book.description }}
                  />               
                </div>
              ))}
              
              {/* 分页控制 */}
              <div className="flex justify-center gap-2 mt-4">
                <Button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || isFetching}
                >
                  上一页
                </Button>
                <span className="flex items-center px-4">第 {currentPage} 页</span>
                <Button 
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={searchResults && searchResults.length < 10 || isFetching}
                >
                  下一页
                </Button>
              </div>
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