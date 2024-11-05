import React, { useState } from 'react';
import { IoLogoWechat } from "react-icons/io5";
import { FaXTwitter } from "react-icons/fa6";
import { FaGithub } from "react-icons/fa";
import { toast } from 'react-toastify';

const Footer = () => {
  const [showWx, setShowWx] = useState(false);

  return (
    <>
      <footer className="bg-gray-100">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <span className="text-2xl font-bold text-blue-600">智阅</span>
              <p className="text-gray-500 text-base">
                提升您的阅读体验，让学习更加高效。
              </p>
              <div className="flex space-x-6">
                <a className="text-gray-400 hover:text-gray-500" 
                  onClick={() => {
                    setShowWx(true);
                    toast.info("点击二维码关闭");
                  }}>
                  <span className="sr-only">微信</span>
                  <IoLogoWechat />
                </a>
                <a target='_blank' href="https://x.com/Dante_Chaser" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">推特</span>
                  <FaXTwitter />
                </a>
                <a target='_blank' href="https://github.com/zhangjh" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">GitHub</span>
                  <FaGithub />
                </a>
              </div>
            </div>
            <div className="mt-12 xl:mt-0 xl:col-span-2">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                    解决方案
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                        电子书阅读
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                        AI总结
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                        个人知识库
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                        智能问答
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                    支持
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                        使用指南
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                        常见问题
                      </a>
                    </li>
                    <li>
                      <a href="mailto:zhangjh_initial@126.com" className="text-base text-gray-500 hover:text-gray-900">
                        联系我们
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-200 pt-8">
            <p className="text-base text-gray-400 xl:text-center">
              &copy; 2024 智阅@太初软件. 保留所有权利.
            </p>
          </div>
        </div>
      </footer>

      { showWx && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative">
            <img 
              src="/imgs/wechat.jpg" 
              alt="微信二维码" 
              width={200}
              className="object-contain"
              onClick={() =>setShowWx(false)}
            />
          </div>
        </div>
      )}
    </>
   
  );
};

export default Footer;