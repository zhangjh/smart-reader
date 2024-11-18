import React, { useEffect, useState } from 'react';
import PricingCard from './PricingCard';
import { toast } from 'react-toastify';
import util from '@/utils/util';

const debugMode = process.env.NEXT_PUBLIC_DEBUG_MODE;
const serviceDomain = debugMode === "true" ? "http://localhost:3001" : "https://tx.zhangjh.cn";

interface PricingProps {
  onPlanSelect: (feature: string[], itemType: string) => void;
}
interface Item {
    key: string,
    title: string,
    oriPrice: number,
    price: number,
    featuresArr: string[],
}

const PricingSection: React.FC<PricingProps> = ({ onPlanSelect }) => {

  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    if(!items.length) {
       fetch(`${serviceDomain}/order/getItems`)
        .then(response => response.json())
        .then(response => {
            if(!response.success) {
                toast.error("获取方案信息失败:" + response.errorMsg);
                return;
            }
            const data = response.data;
            const newItems: Item[] = [];
            for (let key in data) {
              const solution = data[key];
              if(newItems.indexOf(solution) !== -1) {
                continue;
              }
              newItems.push({
                key: key,
                title: solution.name,
                oriPrice: solution.oriPrice,
                price: solution.price,
                featuresArr: solution.description
              });
            }
            setItems(newItems);
        }); 
    }
  }, []);

  return (
    <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-12">
            选择适合您的方案
        </h2>
        {items.length === 0 ? (
            <div className="text-center">加载中...</div> // 加载指示器
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {items.map((item, index) => (
                <PricingCard
                key={index}
                title={item.title}
                price={' ¥ ' + item.price / 100}
                originalPrice={' ¥ ' + item.oriPrice / 100}
                features={item.featuresArr}
                isPopular={'basic' === item.key}
                isDiscount={true}
                onClick={() => onPlanSelect(item.featuresArr, item.key)}
                />
            ))}
            </div>
        )}
        </div>
    </section>
  );
};

export default PricingSection;