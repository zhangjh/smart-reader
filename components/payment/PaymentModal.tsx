import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'react-toastify';
import { env } from "process";

const debugMode = env.DEBUG_MODE;
const serviceDomain = debugMode === "true" ? "http://localhost:3001" : "https://tx.zhangjh.cn";

interface PaymentModalProps {
  userId: string;
  isOpen: boolean;
  onClose: (timer: NodeJS.Timeout | null) => void;
  feature: string[];
  itemType: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ userId, isOpen, onClose, feature, itemType }) => {
  const [qrContent, setQrContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if(isOpen) {
      setLoading(true);

      fetch(`${serviceDomain}/order/genOrderUrl`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemType, userId }),
      })
        .then(response => response.json())
        .then(response => {
          if(!response.success) {
            throw new Error("生成订单二维码失败:" + response.errorMessage);
          }
          const codeUrl = response.data.code_url;
          const orderId = response.data.orderId;
          if(!codeUrl || !orderId) {
            throw new Error("生成订单失败");
          }
          setQrContent(codeUrl);
          
          const newTimer = setInterval(() => {
            fetch(`${serviceDomain}/order/get?orderId=${orderId}`)
              .then(response => response.json())
              .then(response => {
                if(response.success && response.data.status === 1) {
                  clearInterval(newTimer);
                  setTimer(null);
                  toast.success("支付成功");
                  onClose(newTimer);
                }
              });
          }, 3000);
          setTimer(newTimer);
        })
        .catch(error => {
          console.error("Error:", error);
          toast.error("生成订单失败，请稍后再试");
        })
        .finally(() => {
          setLoading(false);
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
          <ul className="list-disc list-inside text-gray-700 text-sm pl-4">
            {feature.map((item, index) => (
              <li key={index} className="mb-2">{item}</li>
            ))}
          </ul>        
        </div>
        <div className="mb-4">
          <h3 className="text-xl font-semibold">支付方式：</h3>
          <p className="text-gray-600">使用微信扫描二维码完成支付：</p>
        </div>
        <div className="flex justify-center mb-4">
          {loading ? (
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

export default PaymentModal;