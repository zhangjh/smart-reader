'use client'

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/SideBar';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from 'react-toastify';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import util from '@/utils/util';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useUser } from '@clerk/nextjs';

const debugMode = process.env.NEXT_PUBLIC_DEBUG_MODE;
const serviceDomain = debugMode === "true" ? "http://localhost:3001" : "https://tx.zhangjh.cn";

interface History {
    id: number;
    create_time: string;
    title: string;
    author: string;
    cover: string;
    modify_time: string;
    progress: number;
    file_id: string;
    summary: string;
}

const ReadingHistory = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [titleFilter, setTitleFilter] = useState<string>('');
    const [readingHistory, setReadingHistory] = useState<History[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [userId, setUserId] = useState<string | null>(null);

    const { isSignedIn, user } = useUser();

    const fetchHistory = async () => {
        if (!userId) return;  // 添加保护检查
        
        setLoading(true);
        try {
            const response = await fetch(
                `${serviceDomain}/books/getHistory?userId=${userId}&pageIndex=${currentPage}&pageSize=10&title=${encodeURIComponent(titleFilter)}&orderField=modify_time`
            );
            const res = await response.json();
            
            if (!res.success) {
                throw new Error(res.errorMessage || '获取阅读记录列表失败');
            }
            setReadingHistory(res.data.results);
            setTotalPages(Math.ceil(res.data.total / 10));
        } catch (error) {
            console.error('Error fetching reading history:', error);
            toast.error('获取阅读记录失败，请稍后重试');
        } finally {
            setLoading(false);
        }
    };

    async function init() {
        const savedUserId = localStorage.getItem("userId");
        if(savedUserId) {
            setUserId(savedUserId);
        } else {
            if(isSignedIn) {
            const extId = user.id;
            const email = user.emailAddresses[0].emailAddress;
            // 如果有邮箱认为是邮箱登录，否则只记录clerk
            let extType = "clerk";
            if(email) {
                extType = "email";
            }
            const userId = await util.getUserByExtId(extType, extId);
            setUserId(userId);
            }
        }
    };

    useEffect(() => {
        init();
    }, []);

    // 监听userId、currentPage和titleFilter的变化
    useEffect(() => {
        if (userId) {
            fetchHistory();
        }
    }, [userId, currentPage]); // 添加currentPage依赖

    // 处理搜索
    const handleSearch = () => {
        setCurrentPage(1); // 重置页码
        fetchHistory();
    };

    const handleDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (error) {
            console.error('Date parsing error:', error);
            return dateStr;
        }
    };

    const getFile = (fileId:string) => {
        fetch(`${serviceDomain}/books/getReadFileUrl?userId=${userId}&fileId=${fileId}`)
            .then(response => response.json())
            .then(response => {
                if(!response.success) {
                    toast.error(response.errorMsg);
                    return;
                }
                window.location.href = response.data;
            });
    };

    const deleteHistory = (fileId: string) => {
        fetch(`${serviceDomain}/books/deleteHistory`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    fileId: fileId
                })
            })
            .then(response => response.json())
            .then(response => {
                if(!response.success) {
                    toast.error(response.errorMsg);
                    return;
                }
                fetchHistory();
            });
    };

    return (
        <Sidebar>
            <div className="p-4 md:p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-0">阅读记录</h1>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Input 
                                type="text"
                                placeholder="输入书籍名称检索"
                                value={titleFilter} 
                                onChange={e => setTitleFilter(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleSearch()}
                                className="w-full md:w-64"
                            />
                            <Button 
                                onClick={handleSearch}
                                disabled={loading}
                                className="ml-4 bg-blue-500 hover:bg-blue-600 text-white"
                            >
                                搜索
                            </Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">加载中...</div>
                    ) : (
                        <div className="space-y-4 mb-6">
                            {readingHistory.map((history) => (
                                <Card key={history.id} className="p-4">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <h3 className="font-medium">开始阅读时间</h3>
                                            <p className="text-sm text-gray-500">{handleDate(history.create_time)}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-medium">最近阅读时间</h3>
                                            <p className="text-sm text-gray-500">{handleDate(history.modify_time)}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium">书籍</p>
                                            <p className="text-sm text-gray-500">
                                                {util.sliceContent(history.title, 10)}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {util.sliceContent(history.author, 10)}
                                            </p>
                                        </div>
                                        <div className="space-y-1 w-full md:w-48">
                                            <div className="flex justify-between text-sm">
                                                <span>阅读进度</span>
                                                <span>{history.progress}%</span>
                                            </div>
                                            <Progress value={history.progress} className="h-2" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <Button 
                                            onClick={() => window.location.href = `/reader?fileId=${history.file_id}`}
                                            className="mr-2 bg-green-500 hover:bg-green-600 text-white"
                                        >
                                            继续阅读
                                        </Button>
                                        <Button 
                                            onClick={() => getFile(history.file_id)}
                                            className="mr-2 bg-blue-500 hover:bg-blue-600 text-white"
                                        >
                                            下载
                                        </Button>
                                        <Button 
                                            onClick={() => deleteHistory(history.file_id)}
                                            className="mr-2 bg-red-500 hover:bg-red-600 text-white"
                                        >
                                            删除
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