'use client'

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/SideBar';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";

const debugMode = process.env.NEXT_PUBLIC_DEBUG_MODE;
const serviceDomain = debugMode === "true" ? "http://localhost:3001" : "https://tx.zhangjh.cn";

interface Order {
  id: number;
  book: string;
  date: string;
  status: number;
  price: string;
}

const Orders = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('-1');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${serviceDomain}/order/list?pageIndex=${currentPage}&pageSize=5&status=${statusFilter}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.errorMessage || '获取订单列表失败');
      }
      
      setOrders(data.data.orders);
      setTotalPages(Math.ceil(data.data.total / 5));
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('获取订单列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return '已完成';
      case 0:
        return '待支付';
      default:
        return '未知状态';
    }
  };

  return (
    <Sidebar>
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl md:text-2xl font-bold">订单列表</h1>
            <div className="flex items-center gap-2">
              <Label className="text-sm">状态筛选：</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-1">全部</SelectItem>
                  <SelectItem value="1">已完成</SelectItem>
                  <SelectItem value="0">待支付</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : (
            <div className="space-y-4 mb-6">
              {orders.map((order) => (
                <Card key={order.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{order.book}</h3>
                      <p className="text-sm text-gray-500">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{order.price}</p>
                      <p className="text-sm text-gray-500">{getStatusText(order.status)}</p>
                    </div>
                  </div>
                </Card>
              ))}

              {orders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  暂无订单数据
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

export default Orders;