import React from 'react';
import { Button } from "@/components/ui/button";

interface PricingCardProps {
  key: number;
  title: string;
  price: string;
  originalPrice?: string;
  features: string[];
  isPopular: boolean;
  isDiscount?: boolean;
  onClick: () => void;
}

const PricingCard = ({
  key, 
  title, 
  price, 
  originalPrice,
  features, 
  isPopular,
  isDiscount = false,
  onClick 
}: PricingCardProps) => (
  <div 
    key={key}
    className={`bg-white p-6 rounded-lg shadow-md relative ${isPopular ? 'border-2 border-blue-500' : ''}`}
    onClick={onClick}
  >
    {isPopular && (
      <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm font-semibold mb-2 inline-block">
        最受欢迎
      </span>
    )}
    {isDiscount && (
      <span className="absolute -top-3 -right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold transform rotate-12">
        限时优惠
      </span>
    )}
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <div className="mb-4">
      <p className="text-3xl font-bold inline-block mr-2">{price}</p>
      {originalPrice && (
        <span className="text-gray-500 line-through">{originalPrice}</span>
      )}
    </div>
    <ul className="space-y-2">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          {feature}
        </li>
      ))}
    </ul>
    <Button className="mt-6 w-full">选择方案</Button>
  </div>
);

export default PricingCard;