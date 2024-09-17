'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NavBar from '@/components/NavBar';
import EpubViewerComponent from '@/components/EpubViewerComponent';
import { Send, Eraser, Upload } from 'lucide-react';

const EpubReader = () => {
  const [question, setQuestion] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [summary, setSummary] = useState({
    overview: 'Brief overview of the book content.',
    keyPoints: ['Key point 1', 'Key point 2', 'Key point 3'],
    rating: '4.5/5'
  });
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [epubUrl, setEpubUrl] = useState(null);

  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted question:', question);
  };

  const handleClearConversation = () => {
    console.log('Clearing conversation');
    setQuestion('');
  };

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setIsLoading(true);

      // 判断是否需要进行格式转换
      const format = uploadedFile.type;
      if("application/epub+zip" !== format) {
        console.log(format);
        console.log("need to convert to epub");
        // 调用后端服务进行格式转换，获取转换后的epub文件后再渲染
        const formData = new FormData();
        formData.append('file', uploadedFile);

        const response = await fetch('/api/convert', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
        if (result.success) {
          console.log(result.data);
          setEpubUrl(result.data.epubUrl);
        } else {
          console.error(result.error.message);
        }
      } else {
        setEpubUrl(uploadedFile);
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      <div className="flex-grow flex">
        {!file && !isLoading && (
          <div className="w-full flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">上传您的电子书</h2>
              <p className="mb-4">支持的格式：docx、pdf、epub、azw3</p>
              <div className="flex items-center justify-center">
                <Input
                  type="file"
                  accept=".docx,.pdf,.epub,.azw3"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex items-center justify-center w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400">
                    <Upload className="w-12 h-12 text-gray-400" />
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}
        
        {isLoading && (
          <div className="w-full flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">正在处理您的电子书</h2>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
              </div>            </div>
          </div>
        )}
        
        {epubUrl && (
          <>
            {/* 左侧：Epub内容 */}
            <div className="w-1/2 p-4 border-r border-gray-200">
              <div className="bg-white rounded-lg shadow-md p-4 h-full">
                <EpubViewerComponent url={epubUrl} />
              </div>
            </div>

            {/* 右侧：摘要和问答 */}
            <div className="w-1/2 flex flex-col">
              {/* 上半部分：摘要 */}
              <div className="flex-grow p-4">
                <div className="bg-white rounded-lg shadow-md p-4 h-full">
                  <h2 className="text-2xl font-bold mb-4">内容摘要</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold">概述</h3>
                      <p>{summary.overview}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">关键要点</h3>
                      <ul className="list-disc list-inside">
                        {summary.keyPoints.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">推荐评分</h3>
                      <p className="text-2xl font-bold text-blue-600">{summary.rating}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 下半部分：问答 */}
              <div className="p-4">
                <div className="bg-white rounded-lg shadow-md p-4">
                  <Input
                    type="text"
                    placeholder="输入您想知道的关于本书的问题"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    className={`transition-all duration-300 ease-in-out ${
                      isInputFocused ? 'h-20' : 'h-10'
                    }`}
                  />
                  <div className="mt-2 flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleClearConversation}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700"
                      aria-label="清除对话"
                    >
                      <Eraser className="h-4 w-4 mr-2" />
                      清除对话 
                    </Button>
                    <Button 
                      type="submit" 
                      onClick={handleQuestionSubmit}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                      aria-label="提交问题"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      提交
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EpubReader;
