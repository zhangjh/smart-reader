'use client'

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/SideBar';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from 'react-toastify';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import util from '@/utils/util';

const debugMode = process.env.NEXT_PUBLIC_DEBUG_MODE;
const serviceDomain = debugMode === "true" ? "http://localhost:3001" : "https://tx.zhangjh.cn";

interface History {
  id: number;
  create_time: string;
  title: string;
  author: string;
  cover: string;
  // lastRead
  modify_time: string;
  // 来自本地浏览器缓存
  progress: number;
  fileId: string;
  summary: string;
}
const ReadingHistory = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [titleFilter, setTitleFilter] = useState<string>('');
    const [readingHistory, setReadingHistory] = useState<History[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        async function getUserId() {
            const userId = await util.getUserInfo();
            setUserId(userId);
        }
        getUserId();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${serviceDomain}/books/getHistory?userId=${userId}&pageIndex=${currentPage}&pageSize=10&title=${titleFilter}`);
            const res = await response.json();
            
            if (!res.success) {
            throw new Error(res.errorMessage || '获取阅读记录列表失败');
            }
            
            setReadingHistory(res.data.results);
            setTotalPages(Math.ceil(res.data.total / 10));
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('获取订单列表失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    const handleDate = (date: string) => {
        // 2024-10-26T15:54:36.897Z
        return date.toLocaleString().replace('T', ' ').replace('Z', '').replace(/\.\d+/, '');
      };

    return (
        <Sidebar>
            <div className="p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl md:text-2xl font-bold">阅读记录</h1>
                    <div className="flex items-center gap-2">
                        <Input 
                            type="text"
                            placeholder="输入书籍名称检索"
                            value={titleFilter} 
                            onChange={e => setTitleFilter(e.target.value)} 
                            className="w-full md:w-3/4" // 在手机端宽度为100%，在中等及以上屏幕宽度为75%
                        />
                        <Button 
                            type="submit" 
                            disabled={loading}
                            onClick={() => fetchHistory()}
                            className="ml-4 bg-blue-500 hover:bg-blue-600 text-white"
                            aria-label="提交"
                        >
                            提交
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8">加载中...</div>
                ) : (
                    <div className="space-y-4 mb-6">
                        {readingHistory.map((history) => (
                        <Card key={history.id} className="p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-medium">开始阅读时间</h3>
                                    <p className="text-sm text-gray-500">{handleDate(history.create_time)}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium">最近阅读时间</h3>
                                    <p className="text-sm text-gray-500">{history.modify_time}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">书籍</p>
                                    <p className="text-sm text-gray-500">{history.title} : {history.author}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                    <span>阅读进度</span>
                                    <span>{history.progress}%</span>
                                    </div>
                                    <Progress value={history.progress} className="h-2" />
                                </div>
                            </div>
                            <div className="flex justify-end mt-2">
                                <Button 
                                    onClick={() => window.location.href = `/reader?fileId=${history.fileId}`} 
                                    className="mr-2 bg-green-500 hover:bg-green-600 text-white"
                                >
                                    去阅读
                                </Button>
                                <Button 
                                    onClick={() => window.location.href = `${serviceDomain}/books/getReadFileUrl?fileId=${history.fileId}`} 
                                    className="bg-blue-500 hover:bg-blue-600 text-white"
                                >
                                    下载
                                </Button>
                            </div>
                        </Card>
                        ))}

                        {readingHistory.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            暂无阅读历史数据
                        </div>
                        )}
                    </div>
                )}

                {totalPages > 1 && (
                <Pagination>
                    <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i + 1}>
                        <PaginationLink
                            onClick={() => setCurrentPage(i + 1)}
                            isActive={currentPage === i + 1}
                            className={currentPage === i + 1 ? 'bg-primary text-primary-foreground' : ''}
                        >
                            {i + 1}
                        </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                    </PaginationItem>
                    </PaginationContent>
                </Pagination>
                )}
            </div>
            </div>
        </Sidebar>
        );
};

export default ReadingHistory;