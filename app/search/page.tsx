'use client'

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const BookSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { data: searchResults, refetch, isFetching } = useQuery({
    queryKey: ['bookSearch', searchTerm],
    queryFn: async () => {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      return Array(10).fill("xxxxxxxxx").map((_, i) => ({
        id: i,
        title: `Book ${i + 1} about ${searchTerm}`,
        author: `Author ${i + 1}`,
        description: `This is a book about ${searchTerm}...`
      }));
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

  return (
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
                  <h3 className="text-lg font-semibold">{book.title}</h3>
                  <p className="text-sm text-gray-600">{book.author}</p>
                  <p className="mt-2">{book.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookSearch;