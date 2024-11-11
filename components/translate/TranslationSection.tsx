import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from 'react-toastify';
import EpubViewerComponent from '../EpubViewerComponent';

interface TranslationSectionProps {
  userId: string;
  serviceDomain: string;
  fileId: string;
  documentUrl: string;
}

const TranslationSection = ({ userId, serviceDomain, fileId, documentUrl }: TranslationSectionProps) => {
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [targetLang, setTargetLang] = useState<string>('');
  const [translateUrl, setTranslateUrl] = useState<string>('');
  const [translateFileId, setTranslateFileId] = useState<string>('');
  const [transProgress, setTransProgress] = useState<number>(0.0);

  useEffect(() => {
  }, [targetLang]);

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
        const translateSocket = new WebSocket(`${serviceDomain}/socket/translate?userId=${userId}`);
        translateSocket.onopen = () => {
            console.log("translate socket connected");
            translateSocket.send(JSON.stringify({
                "fileId": fileId,         // 原始待翻译文档的fileId
                "fileUrl": documentUrl,
                "userId": userId,
                "targetLang": targetLang
            }));
        };

        translateSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // 接收socket返回的翻译结果，返回一个翻译后的epub文档链接
            if(!data.success && data.errorMsg) {
                toast.error(data.errorMsg);
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
                    break;
                case 'transProgress':
                    setTransProgress(data);
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
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                <p>正在翻译中，请稍候...</p>
              </div>
            </div>
          )}
          {!isTranslating && (
            <>
            <div className="flex items-center justify-center h-full text-gray-500">
                点击"开始翻译"按钮开始翻译
            </div>
            <EpubViewerComponent url={translateUrl} fileId={translateFileId} recoredProgress={0.0} ignoreProgress={true} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranslationSection;