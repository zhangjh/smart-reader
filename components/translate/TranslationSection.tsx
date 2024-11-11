import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from 'react-toastify';
import EpubViewerComponent from '../EpubViewerComponent';
import util from '@/utils/util';

interface TranslationSectionProps {
  userId: string;
  socketDomain: string;
  fileId: string;
}

const TranslationSection = ({ userId, socketDomain, fileId }: TranslationSectionProps) => {
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [targetLang, setTargetLang] = useState<string>('英语');
  const [translateUrl, setTranslateUrl] = useState<string>('');
  const [translateFileId, setTranslateFileId] = useState<string>('');
  const [transProgress, setTransProgress] = useState<number>(0.0);

  useEffect(() => {
    setTargetLang(targetLang);
  }, [targetLang]);

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
        const translateSocket = new WebSocket(`${socketDomain}/socket/translate?userId=${userId}`);
        translateSocket.onopen = () => {
            console.log("translate socket connected");
            translateSocket.send(JSON.stringify({
                "fileId": fileId,         // 原始待翻译文档的fileId
                "userId": userId,
                "targetLang": targetLang
            }));
        };

        translateSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // 接收socket返回的翻译结果，返回一个翻译后的epub文档链接
            if(!data.success && data.errorMsg) {
                toast.error(data.errorMsg);
                setIsTranslating(false);
                return;
            }
            const msgType = data.type;
            switch (msgType) {
                case 'finish':
                    break;
                case 'fileId':
                    setTranslateFileId(data.data); 
                    break;
                case 'fileUrl':
                    setTranslateUrl(data.data);
                    setIsTranslating(false);
                    // 保存翻译使用次数
                    util.saveUsage('translate', userId);
                    break;
                case 'transProgress':
                    setTransProgress(data.data);
                    break;
            }
        };

        translateSocket.onclose = () => {
            console.log("translate socket closed");
            if(isTranslating) {
                setIsTranslating(false);
            }
        };

        translateSocket.onerror = (e) => {
            console.log("translate socket error:", e);
            if(isTranslating) {
                setIsTranslating(false);
            }
        };
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('翻译失败，请重试');
      setIsTranslating(false);
    }
  };

  return (
    <div className="w-full lg:w-1/2 p-4 border border-gray-200">
      <div className="bg-white rounded-lg shadow-md p-4 h-[60vh] lg:h-full">
        <div className="flex justify-between items-center mb-4">
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1"
          >
            <option value="英语">英语</option>
            <option value="日语">日语</option>
            <option value="韩语">韩语</option>
            <option value="法语">法语</option>
            <option value="德语">德语</option>
            <option value="中文">中文</option>
          </select>
          <Button 
            onClick={handleTranslate}
            disabled={isTranslating}
          >
            {isTranslating ? '翻译中...' : '开始翻译'}
          </Button>
        </div>
        <div className="prose max-w-none overflow-auto h-[calc(100%-4rem)]">
          {isTranslating && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                <p>正在翻译中，请稍候...</p>
                <p>请勿关闭浏览器，好的东西值得耐心等待...</p>
                {transProgress && transProgress < 100 && (
                    <p>翻译进度：{transProgress}%</p>
                )}
                {transProgress && transProgress == 100.0 && (
                    <p>翻译后处理中...</p>
                )}
                {!transProgress && (
                    <p>文档预处理中...</p>
                )}
              </div>
            </div>
          )}
          {!isTranslating && (
            <>
            {!translateUrl ? (
                 <div className="flex items-center justify-center h-full text-gray-500">
                    点击开始翻译按钮开始翻译
                </div>
            ) : (
                <EpubViewerComponent url={translateUrl} fileId={translateFileId} recoredProgress={0.0} ignoreProgress={true} />
            )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranslationSection;