'use client'

import React from 'react';
import Sidebar from '@/components/SideBar';
import { Card } from "@/components/ui/card";

const Orders = () => {
  const orders = [
    { id: 1, book: "深度思考", date: "2024-03-15", status: "已完成", price: "￥29.9" },
    { id: 2, book: "认知觉醒", date: "2024-03-14", status: "处理中", price: "￥39.9" },
    { id: 3, book: "终身成长", date: "2024-03-13", status: "已完成", price: "￥19.9" },
  ];

  return (
    <Sidebar>
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">订单列表</h1>
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{order.book}</h3>
                    <p className="text-sm text-gray-500">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{order.price}</p>
                    <p className="text-sm text-gray-500">{order.status}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default Orders;