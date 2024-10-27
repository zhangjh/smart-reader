'use client'

import React from 'react';
import Sidebar from '@/components/SideBar';

const OrderList = () => {
    // todo: 
  const orders = [
    { id: 1, title: '订单 1', date: '2023-01-01' },
    { id: 2, title: '订单 2', date: '2023-01-02' },
    // 更多订单...
  ];

  return (
    <div className="flex-1 p-4">
      <h2 className="text-xl font-bold mb-4">订单列表</h2>
      <ul>
        {orders.map(order => (
          <li key={order.id} className="border-b py-2">
            {order.title} - {order.date}
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded">上一页</button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded ml-2">下一页</button>
      </div>
    </div>
  );
};

const OrderPage = () => {
  return (
    <div className="flex">
      <Sidebar />
      <OrderList />
    </div>
  );
};

export default OrderPage;