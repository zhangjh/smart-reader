'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NavBar from '@/components/NavBar';
import EpubViewerComponent from '@/components/EpubViewerComponent';
import { Send, Eraser, Upload } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; 
import remarkGfm from 'remark-gfm';
import './index.css';

const EpubReader = () => {
  const [question, setQuestion] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [summary, setSummary] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [chatting, setChatting] = useState(false);
  const [chatAnswer, setChatAnswer] = useState('');
  const [epubUrl, setEpubUrl] = useState(null);

  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted question:', question);
    setChatting(true);
    // 调用chat接口获取结果
    const headers = {
      'Content-Type': 'application/json',
      'userId': "1234",
    };
    fetch('http://localhost:3001/chat/', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        'question': question,
        'context': [],
      })
    }).then(response => {
      const body = response.body;
      if(!body) {
        throw new Error("接口调用异常");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      readAndOutput();

      // 读取并输出流数据
      function readAndOutput() {
        reader.read().then(({ done, value }) => {
            if (done) {
                reader.releaseLock();
                setChatAnswer('xxxxxxx');
                return;
            }

            const chunk = decoder.decode(value, { stream: true });
            console.log(chunk);
            let existAnswer = chatAnswer;
            let answerRet = `\n**问:** ${question}\n`;
            answerRet += `答: ${chunk}`;
            setChatAnswer(existAnswer + answerRet);
            readAndOutput(); // 递归读取下一个块
        });
      }
    });
  };

  const handleClearConversation = () => {
    console.log('Clearing conversation');
    setQuestion('');
    setChatting(false);
  };

  const handleFileUpload = async (e) => {
    let uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setIsLoading(true);

       // 调用后端服务进行格式转换，获取转换后的epub文件后再渲染
       const formData = new FormData();
       formData.append('file', uploadedFile);

      // 判断是否需要进行格式转换
      let format = uploadedFile.type;
      if(!format) {
        // 获取文件扩展名
        format = uploadedFile.name.split('.').pop().toLowerCase();
      }
      if("application/epub+zip" !== format) {
        console.log(format);
        console.log("need to convert to epub");

        const response = await fetch('https://tx.zhangjh.cn/parse/convert', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
        if (result.success) {
          console.log(result.data);
          uploadedFile = result.data;
        } else {
          console.error(result.errorMsg);
        }
      } 
      setIsLoading(false);
      setEpubUrl(uploadedFile);
      // fetch summary
      formData.set('file', uploadedFile);
      setProcessing(true);
      const response = await fetch('http://localhost:3001/parse/summary', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      console.log(result);
      if(result.success) {
        setSummary(result.data);
        setProcessing(false);
      } else {
        console.error(result.errorMsg);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      <div className="flex-grow flex flex-col lg:flex-row">
        {!file && !isLoading && (
          <div className="w-full flex flex-col items-center justify-center p-4 h-screen">
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
          <div className="w-full flex items-center justify-center p-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">正在处理您的电子书</h2>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
              </div>           
            </div>
          </div>
        )}
        
        {epubUrl && (
          <>
            {/* 左侧：Epub内容 */}
            <div className="w-full lg:w-1/2 p-4 lg:border-r lg:border-gray-200">
              <div className="bg-white rounded-lg shadow-md p-4 h-[60vh] lg:h-full">
                <EpubViewerComponent url={epubUrl} />
              </div>
            </div>

            {/* 右侧：摘要和问答 */}
            <div className="w-full lg:w-1/2 flex flex-col p-4">
              {/* 上半部分：摘要 */}
              {processing && (
                 <div className="flex-grow mb-4">
                  <div className="bg-white rounded-lg shadow-md p-4 h-full flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-4">AI正在总结中，请稍等...</h2>
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                      </div>           
                    </div>
                  </div>
                </div>
              )}
              {!processing && (
                <div className="flex-grow mb-4">
                  <div className="bg-white rounded-lg shadow-md p-4 h-full">
                    <div className="space-y-4 prose">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              {/** 展示聊天问答内容 */}
              { chatting && (
                <div className="flex-grow mb-4">
                <div className="bg-white rounded-lg shadow-md p-4 h-full">
                  <div className="space-y-4 prose">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{chatAnswer}</ReactMarkdown>
                  </div>
                </div>
              </div>
              ) }

              {/* 下半部分：问答 */}
              <div className="mt-4">
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
