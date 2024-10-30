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
      const userId = localStorage.getItem("userId");
      if(!userId) {
        throw new Error("用户未登录");
      }
      // 校验权限
      await fetch(`${serviceDomain}/order/list?status=1&userId=${userId}`)
        .then(response => response.json())
        .then(response => {
          if(!response.success) {
            // toast.error("查询付费订阅失败：", response.errorMsg);
            throw new Error("查询付费订阅失败：" + response.errorMsg);
          }
          if(response.data.length > 0) {
            const orders = response.data.results;
            for(const order of orders) {
              const curTime = new Date().getTime();
              // 订单一个月的生效期
              if(curTime > order.createTime + 30 * 24 * 60 * 60 * 1000) {
                // 已经失效
                console.log("orderId:", order.id, " expired");
              } else {
                // 存在有效的订阅，校验通过
                break;
              }
            }
            // 如果到这了，证明没有有效订阅
            // toast.error("您的付费订阅已失效，请重新订阅");
            throw new Error("您的付费订阅已失效，请重新订阅");
            // setTimeout(() => {
            //   window.location.href = "/" + window.location.pathname;
            // }, 2000);
            // return;
          } else {
            // 没有订单存在，可以试用一次
            fetch(`${serviceDomain}/trial/auth?userId=${userId}&productType=zhiyue&model=download`)
              .then(response => response.json())
              .then(response => {
                if(!response.success) {
                  // toast.error("查询试用次数失败：", response.errorMsg);
                  throw new Error("查询试用次数失败：" + response.errorMsg);
                }
                if(!response.success) {
                  // 已经试用过了
                  // toast.error("每个新用户仅可试用一次，请选择合适的计划付费订阅");
                  throw new Error("每个新用户仅可试用一次，请选择合适的计划付费订阅");
                  // setTimeout(() => {
                  //   window.location.href = "/" + window.location.pathname;
                  // }, 2000);
                  // return;
                } 
                // 新用户每个模块可以试用一次，记录试用次数
                fetch(`${serviceDomain}/trial/create`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    userId: userId,
                    // 试用的功能模块
                    model: 'download'
                  }),
                }).then(response => response.json())
                .then(response => {
                  console.log(response);
                  if(response.success) {
                    toast.success("新用户试用成功");
                  }
                });
              })
              .then(async () => {
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
              })
              .catch(error => {
                toast.error(error.messages);
              });
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