'use client'

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/SideBar';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";

import util from '@/utils/util';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';

const debugMode = process.env.NEXT_PUBLIC_DEBUG_MODE;
const serviceDomain = debugMode === "true" ? "http://localhost:3001" : "https://tx.zhangjh.cn";

interface Order {
  id: number;
  create_time: string;
  item_type: string;
  order_type: number;
  order_price: number;
  status: number;
  pay_url: string;
}
interface Item {
  key: string,
  title: string,
  oriPrice: number,
  price: number,
  featuresArr: string[],
}

const Orders = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('-1');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [isMobileDevice, setIsMobileDevice] = useState(false); // 添加状态
  const [items, setItems] = useState<Item[]>([]);

  const { isSignedIn, user } = useUser();

  useEffect(() => {
    // 仅在客户端执行
    setIsMobileDevice(/Mobi|Android/i.test(navigator.userAgent));

    const fetchItems = async () => {
      const fetchedItems = await util.fetchItems();
      setItems(fetchedItems);
    };
    fetchItems();
  }, []);
  
  const fetchOrders = async () => {
    if (!userId) return;  // 添加保护检查

    setLoading(true);
    try {
      const response = await fetch(`${serviceDomain}/order/list?userId=${userId}&pageIndex=${currentPage}&pageSize=5&status=${statusFilter}`);
      const res = await response.json();
      
      if (!res.success) {
        throw new Error(res.errorMessage || '获取订单列表失败');
      }
      
      setOrders(res.data.results);
      setTotalPages(Math.ceil(res.data.total / 5));
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('获取订单列表失败，请稍后重试');
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

  // 监听userId、currentPage和titleFilter的变化
  useEffect(() => {
    if (userId) {
      fetchOrders();
    }
  }, [userId, currentPage, statusFilter]);

  const getItemTypeText = (type: string) => {
    return items.filter(item => item.key === type)[0].title;
  };
  const getItemContent = (type: string) => {
    const featuresArr = items.filter(item => item.key === type)[0].featuresArr;
    return featuresArr
      .toString()
      .split(',')
      .join(',\n');
  };

  const getOrderTypeText = (type: number) => {
    switch (type) {
      case 1:
        return '新购';
      case 2:
        return '续费';
      default:
        return '未知类型';
    }
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
  
  const handlePrice = (price: number) => {
    return price / 100 + ' ¥';
  };

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
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('复制成功');
    }).catch((error) => {
      console.error('Copy failed:', error);
      toast.error('复制失败，请重试');
    });
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
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="min-w-[120px]">
                      <h3 className="font-medium mb-1">订单号</h3>
                      <p className="text-sm text-gray-500 break-all md:break-normal">
                        {order.id}
                      </p>
                    </div>
                    <div className="min-w-[120px]">
                      <h3 className="font-medium mb-1">{getOrderTypeText(order.order_type)}</h3>
                      <p className="text-sm text-gray-500">
                        {handleDate(order.create_time)}
                      </p>
                    </div>
                    <div className="min-w-[120px]">
                      <h3 className="font-medium mb-1">{getItemTypeText(order.item_type)}</h3>
                      <p className="text-sm text-gray-500 whitespace-pre-wrap break-all md:break-normal">
                        {getItemContent(order.item_type)}
                      </p>
                    </div>
                    <div className="min-w-[120px]">
                      <p className="font-medium mb-1">{handlePrice(order.order_price)}</p>
                      <p className="text-sm text-gray-500">
                        {getStatusText(order.status)}
                      </p>
                      {isMobileDevice && order.status === 0 && order.pay_url && (
                        <Button 
                          onClick={() => copyToClipboard(order.pay_url)}
                          className="bg-green-500 hover:bg-green-600 text-white mt-2 w-full"
                        >
                          复制去微信支付
                        </Button>
                      )}
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