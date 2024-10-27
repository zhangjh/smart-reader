import React from 'react';
import Link from 'next/link';

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-100 h-full p-4">
      <h2 className="text-lg font-bold mb-4">菜单</h2>
      <ul>
        <li><Link href="/search" className="block py-2 text-gray-600 hover:text-gray-900">找书</Link></li>
        <li><Link href="/reader" className="block py-2 text-gray-600 hover:text-gray-900">阅读器</Link></li>
        <li><Link href="/orders" className="block py-2 text-gray-600 hover:text-gray-900">订单</Link></li>
        <li><Link href="/history" className="block py-2 text-gray-600 hover:text-gray-900">阅读记录</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar; 