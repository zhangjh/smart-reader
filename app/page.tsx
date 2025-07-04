'use client'

import { Button } from "@/components/ui/button"
import NavBar from '@/components/NavBar'
import Footer from '@/components/Footer'
import { BookOpen, Brain, Database, MessageSquare, FileText, Globe } from 'lucide-react'
import './index.css';
import { useEffect, useState } from "react"
import 'react-toastify/dist/ReactToastify.css'; // 引入样式
import PricingSection from '@/components/pricing/PricingSection';
import PaymentModal from '@/components/payment/PaymentModal';


interface FeatureCardProps {
  icon: React.ReactNode;
  title: string,
  description: string
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
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

export default function Home() {
  const [isPaymentOpen, setPaymentOpen] = useState(false);
  const [feature, setFeature] = useState<string[]>([]);
  const [itemType, setItemType] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if(userId) {
      setUserId(userId);
    }
  }, []);
  const handlePaymentOpen = (feature: string[], itemType: string) => {
  
    console.log("handlePaymentOpen");
    setPaymentOpen(true);
    setFeature(feature);
    setItemType(itemType);
  }
  const handlePaymentClose = (timer: NodeJS.Timeout | null) => {
    setPaymentOpen(false);
    setFeature([]);
    setItemType("");
    if(timer) {
      clearInterval(timer);
    }
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "智阅",
    "description": "智阅：结合电子书阅读、AI总结、个人知识库和智能问答，提升您的阅读和学习体验。",
    "url": "https://iread.chat",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "CNY"
    },
    "featureList": [
      "电子书阅读器",
      "AI总结与评分",
      "个人知识库",
      "智能问答",
      "文档多语种翻译"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
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

          {/* Android App Section */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white border rounded-lg p-8 text-center">
                <h2 className="text-3xl font-bold mb-4 text-gray-900">体验更佳的智阅安卓APP</h2>
                <p className="text-xl mb-6 text-gray-600">
                  安卓应用功能更丰富，体验更流畅，比web阅读更沉浸
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
                  <div className="flex items-center text-gray-700">
                    <span className="mr-2">📱</span>
                    <span>原生体验，性能更优</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="mr-2">🚀</span>
                    <span>功能更全面，操作更便捷</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="mr-2">📚</span>
                    <span>沉浸式阅读体验</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="mr-2">🌍</span>
                    <span>支持多语言界面</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="mr-2">🔄</span>
                    <span>无需下载，阅读体验闭环</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="mr-2">🧠</span>
                    <span>支持脑图，专注电子书阅读</span>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  onClick={() => window.open('https://play.google.com/store/apps/details?id=cn.zhangjh.zhiyue', '_blank')}
                >
                  前往Google Play下载
                </Button>
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
          <PricingSection onPlanSelect={handlePaymentOpen} />
          <PaymentModal
            userId={userId}
            feature={feature}
            itemType={itemType}
            isOpen={isPaymentOpen}
            onClose={handlePaymentClose}
          />

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