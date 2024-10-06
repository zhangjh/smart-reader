"use client"

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { WechatIcon } from '@/components/icons/wechat-icon';
import { useLogin } from '@/contexts/login-context';

export function WechatLoginModal() {
  const { isLoginModalOpen, closeLoginModal } = useLogin();

  const handleWechatLogin = () => {
    // 这里应该是微信登录的实际逻辑
    window.location.href = '/api/wechat-login';
  };

  return (
    <Dialog open={isLoginModalOpen} onOpenChange={closeLoginModal}>
      <DialogContent className="sm:max-w-[425px] bg-white rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">欢迎登录</DialogTitle>
          <DialogDescription className="text-gray-600">
            请使用微信账号登录我们的应用
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6">
          <Button
            onClick={handleWechatLogin}
            className="w-full py-4 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition duration-300 flex items-center justify-center space-x-2"
          >
            <WechatIcon className="w-6 h-6" />
            <span>微信登录</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}