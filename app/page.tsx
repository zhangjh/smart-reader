'use client'

import { Button } from "@/components/ui/button"
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import { BookOpen, Brain, Database, MessageSquare, FileText, Globe } from 'lucide-react'
import './index.css';
import { useEffect, useState } from "react"
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // 引入样式

import util from "@/utils/util"

const debugMode = process.env.NEXT_PUBLIC_DEBUG_MODE;
const serviceDomain = debugMode === "true" ? "http://localhost:3001" : "https://tx.zhangjh.cn";

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center mb-4">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 mr-3">
        {icon}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
    </div>
    <p className="text-gray-600">{description}</p>
  </div>
);

const PricingCard = ({ title, price, features, isPopular, onClick }) => (
  <div 
    className={`bg-white p-6 rounded-lg shadow-md ${isPopular ? 'border-2 border-blue-500' : ''}`}
    onClick={onClick}
    >
    {isPopular && <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm font-semibold mb-2 inline-block">最受欢迎</span>}
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-3xl font-bold mb-4">{price}</p>
    <ul className="space-y-2">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center">
          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          {feature}
        </li>
      ))}
    </ul>
    <Button className="mt-6 w-full">选择方案</Button>
  </div>
);

const PaymentModal = ({ userId, isOpen, onClose, feature, itemType }) => {
  const [qrContent, setQrContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null); // 显式设置类型

  useEffect(() => {
    console.log(userId);
    if(isOpen) {
      console.log("PaymentModal");
      setLoading(true); // 开始加载

      fetch(`${serviceDomain}/order/genOrderUrl`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemType: itemType, userId: userId }),
      })
        .then(response => response.json())
        .then(response => {
          console.log(response);
          if(!response.success) {
            throw new Error("生成订单二维码失败:" + response.errorMessage);
          }
          const codeUrl = response.data.code_url;
          const orderId = response.data.orderId;
          if(!codeUrl) {
            throw new Error("生成订单二维码失败");
          }
          if(!orderId) {
            throw new Error("创建订单失败");
          }
          setQrContent(codeUrl);
          // 创建一个轮询请求，判断支付状态
          const timer = setInterval(() => {
            fetch(`${serviceDomain}/order/get?orderId=${orderId}`)
              .then(response => response.json())
              .then(response => {
                if(response.success) {
                  if(response.data.status === 1) {
                    clearInterval(timer);
                    setTimer(null);
                    toast.success("支付成功");
                    onClose(timer);
                  }
                }
              });
          }, 3000);
          setTimer(timer);
        }).catch(error => {
          console.error("Error:", error);
          toast.error("生成订单失败，请稍后再试");
        }).finally(() => {
          setLoading(false); // 加载完成
        });
    }
  }, [isOpen, itemType, onClose, userId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">支付方案</h2>
        <div className="mb-4">
          <h3 className="text-xl font-semibold">方案内容：</h3>
          <ul className="list-disc list-inside text-gray-700 text-sm pl-4"> {/* 调整字号和缩进 */}
            {feature.map((item, index) => (
              <li key={index} className="mb-2">{item}</li> // 将数组项映射为列表项
            ))}
          </ul>        
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-semibold">支付方式：</h3>
          <p className="text-gray-600">使用微信扫描二维码完成支付：</p>
        </div>
        <div className="flex justify-center mb-4">
          {loading ? ( // 根据加载状态显示内容
            <p className="text-gray-600">生成二维码中，请稍候...</p>
          ) : (
            qrContent && (
              <QRCodeSVG
                id="qr-code"
                value={qrContent}
                size={200}
                level="H"
              />
            )
          )}
        </div>
        <Button onClick={() => onClose(timer)} className="w-full">关闭</Button>
      </div>
    </div>
  );
};

export default function Home() {
  const [isPaymentOpen, setPaymentOpen] = useState(false);
  const [feature, setFeature] = useState([]);
  const [itemType, setItemType] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    async function init() {
      const userId = await util.getUserInfo();
      setUserId(userId);
    };
    init();
  }, []);
  const handlePaymentOpen = (feature, itemType) => {
  
    console.log("handlePaymentOpen");
    setPaymentOpen(true);
    setFeature(feature);
    setItemType(itemType);
  }
  const handlePaymentClose = (timer) => {
    setPaymentOpen(false);
    setFeature([]);
    setItemType("");
    if(timer) {
      clearInterval(timer);
    }
  }

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
            <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl mb-4">
                您的智能阅读伙伴
              </h1>
              <p className="mt-3 max-w-md mx-auto text-xl sm:text-2xl md:mt-5 md:max-w-3xl">
                结合电子书阅读、AI总结、个人知识库、智能问答和多语种翻译，提升您的阅读和学习体验。
              </p>
              <div className="mt-10 max-w-md mx-auto sm:flex sm:justify-center md:mt-12">
                <div className="rounded-md shadow">
                  <Button size="lg" className="w-full" 
                    onClick={() => {location.href = "/reader"}}>立即体验</Button>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-gray-900">
                  强大功能，一站式解决
                </h2>
                <p className="mt-4 text-xl text-gray-600">
                  我们的工具为您提供全方位的阅读和学习体验
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <FeatureCard
                  icon={<BookOpen className="w-6 h-6 text-blue-600" />}
                  title="电子书阅读器"
                  description="舒适的阅读界面，支持多种格式，让您随时随地享受阅读。"
                />
                <FeatureCard
                  icon={<Brain className="w-6 h-6 text-blue-600" />}
                  title="AI总结与评分"
                  description="智能分析电子书内容，提供精准总结和客观评分。"
                />
                <FeatureCard
                  icon={<Database className="w-6 h-6 text-blue-600" />}
                  title="个人知识库"
                  description="轻松构建您的个人知识体系，高效管理学习成果。"
                />
                <FeatureCard
                  icon={<MessageSquare className="w-6 h-6 text-blue-600" />}
                  title="智能问答"
                  description="基于已阅读的电子书内容，进行智能问答，深化理解。"
                />
                <FeatureCard
                  icon={<FileText className="w-6 h-6 text-blue-600" />}
                  title="解析文件管理"
                  description="查看已解析的文件记录，重新下载电子书，进行阅读和问答。"
                />
                <FeatureCard
                  icon={<Globe className="w-6 h-6 text-blue-600" />}
                  title="文档多语种翻译"
                  description="支持多种语言之间的文档翻译，打破语言障碍。"
                />
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-12">
                如何使用我们的工具
              </h2>
              <div className="flex flex-wrap justify-between items-center space-y-8 md:space-y-0">
                {[
                  { step: 1, title: "找书并上传", description: "将您想要阅读的电子书上传到我们的平台。" },
                  { step: 2, title: "初筛是否精读", description: "根据AI的总结内容和评分，掌握书籍梗概初筛是否精读。"},
                  { step: 3, title: "阅读器&AI伴读", description: "阅读电子书，同时利用智能问答功能，深入探讨书中的内容。" },
                  { step: 4, title: "构建知识库", description: "将重要内容添加到您的个人知识库中。" },
                  { step: 5, title: "多语种翻译", description: "需要时，使用多语种翻译功能突破语言障碍。" }
                ].map(({ step, title, description }) => (
                  <div key={step} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/5 text-center px-2">
                    <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-blue-600">{step}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{title}</h3>
                    <p className="text-gray-600">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="py-20 bg-gray-50" id="solution">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-12">
                选择适合您的方案
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <PricingCard
                  title="单篇文章"
                  price="¥5 / 次"
                  features={util.featuresArr.single}
                  isPopular={false}
                  onClick={() => handlePaymentOpen(util.featuresArr.single, "single")}
                />
                <PricingCard
                  title="基础包月"
                  price="¥29.9 / 月"
                  features={util.featuresArr.basic}
                  isPopular={true}
                  onClick={() => handlePaymentOpen(util.featuresArr.basic, "basic")}
                />
                <PricingCard
                  title="高级包月"
                  price="¥79.9 / 月"
                  features={util.featuresArr.senior}
                  isPopular={false}
                  onClick={() => handlePaymentOpen(util.featuresArr.senior, "senior")}
                />
                <PaymentModal userId={userId} feature={feature} itemType={itemType} isOpen={isPaymentOpen} onClose={handlePaymentClose} />
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-blue-600">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                <span className="block">准备好提升您的阅读体验了吗？</span>
                <span className="block text-blue-300">立即开始您的智能阅读之旅。</span>
              </h2>
              <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                <div className="inline-flex rounded-md shadow">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50"
                    onClick={() => {location.href = "/reader"}}>免费试用</Button>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}