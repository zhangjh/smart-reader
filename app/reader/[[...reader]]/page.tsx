'use client'

import {useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NavBar from '@/components/NavBar';
import EpubViewerComponent from '@/components/EpubViewerComponent';
import { Send, Eraser, Upload } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; 
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm';

import './index.css';
import { withAuth } from '@/components/withAuth';
import util from '@/utils/util';

const debugMode = process.env.NEXT_PUBLIC_DEBUG_MODE;
const serviceDomain = debugMode === "true" ? "http://localhost:3001" : "https://tx.zhangjh.cn";

const mimeTypeMap = {
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/pdf": "pdf",
    "application/epub+zip": "epub",
    "application/x-mobipocket-ebook": "azw3",
    // 添加其他需要的 MIME 类型映射
};

const EpubReader = () => {
  const [question, setQuestion] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [summary, setSummary] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [chatting, setChatting] = useState(false);
  const [chatContext, setChatContext] = useState<{ role: string; content: string; }[]>([]);
  const [chatAnswer, setChatAnswer] = useState<{ question: string; answer: string; }[]>([]); // 指定类型为数组
  const [epubUrl, setEpubUrl] = useState(null);
  const [fileId, setFileId] = useState('');
  const [userId, setUserId] = useState('');

  let finalSummary:Array<string> = [];
  let title:string = "";
  let author:string = "";

  useEffect(() => {
    async function getUserId() {
        const userId = await util.getUserInfo();
        if(userId) {
          setUserId(userId);
        }
    }
    getUserId();
  }, []);

  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted question:', question);
    const curQuestion = question;
    setChatting(true);
    // 清空输入框
    setQuestion('');
    // 问答区显示内容
    chatAnswer.push({
      "question": curQuestion,
      "answer": "正在思考中...",
    });
    const timer = setInterval(() => {
      chatAnswer[chatAnswer.length - 1].answer += ".";
      setChatAnswer([...chatAnswer]);
    }, 1000);
    // 调用chat接口获取结果
    const headers = {
      'Content-Type': 'application/json',
      'userId': userId,
    };
    fetch(serviceDomain + '/chat/', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        'question': curQuestion,
        'title': title,
        'author': author,
        'summary': summary,
        'context': {
          messages: chatContext
        },
      })
    }).then(async response => {
      const body = response.body;
      if(!body) {
        throw new Error("接口调用异常");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      // 本轮回答
      let curAnswer = '';
      while (true) {
        const { done, value } = await reader.read();
          if (done) {
            reader.releaseLock();
            // 构建聊天上下文
            const curChatContext = chatContext;
            curChatContext.push({
              role: "user",
              content: curQuestion
            });
            curChatContext.push({
              role: "assistant",
              content: curAnswer,
            });
            setChatContext(curChatContext);
            setChatting(false);
            break;
          }
          curAnswer = decoder.decode(value, { stream: true});
          console.log(curAnswer);
          // 停止定时器timer
          if(timer) {
            clearInterval(timer);
          }
          // 构建问答区显示内容
          chatAnswer[chatAnswer.length - 1].answer = curAnswer;
          setChatAnswer([...chatAnswer]);
        }
      });
  };

  const handleClearConversation = () => {
    console.log('Clearing conversation');
    setQuestion('');
  };

  const updateRecord = (fileId:string, title: string, author: string, summary: string) => {
    fetch(`${serviceDomain}/parse/updateRecord`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'fileId': fileId,
        'userId': userId,
        'title': title,
        'author': author,
        'summary': summary,
      }),
    });
  };

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setIsLoading(true);

      // 调用后端服务进行格式转换，获取转换后的epub文件后再渲染
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('userId', userId);

      // 判断是否需要进行格式转换
      let format:string | undefined = uploadedFile.type;
      format = mimeTypeMap[uploadedFile.type as keyof typeof mimeTypeMap];
      if(!format) {
        // 获取文件扩展名
        format = uploadedFile.name.split('.').pop().toLowerCase();
      }
      if(!format) {
        throw new Error("文件格式不支持");
      }
     
      const convertResponse = await fetch(serviceDomain + "/parse/convert", {
        method: 'POST',
        body: formData,
      });
      const convertResult = await convertResponse.json();
      if (!convertResult.success) {
        console.error(convertResult.errorMsg);
        throw new Error(convertResult.errorMsg);
      }
      const fileUrl = convertResult.data.fileUrl;
      const fileId = convertResult.data.fileId;
      console.log("fileUrl: ", fileUrl);
      setIsLoading(false);
      setEpubUrl(fileUrl);
      setFileId(fileId);
      // fetch summary
      setProcessing(true);

      // 防止wss跨域
      const socket = new WebSocket('wss://iread.chat/summary');

      socket.onopen = () => {
        console.log('websocket connected');
        socket.send(JSON.stringify({
          'fileId': fileId,
          'userId': userId,
        }));
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // data.success == false
        if(data.success && !data.success) {
          throw new Error(data.errorMsg);
        }
        setProcessing(false);
        // 结束标记
        if(data.type === 'finish') {          
          // 更新解析记录
          updateRecord(fileId, title, author, finalSummary.join(""));
        } else if(data.type === 'data') {
          // 更新summary
          finalSummary.push(data.data);
          setSummary(prevSummary => prevSummary + data.data); // 使用函数式更新
        } else if(data.type === 'title') {
          title = data.data;
        } else if(data.type === 'author') {
          author = data.data;
        }
      };

      socket.onclose = () => {
        console.log('websocket closed');
      };

      socket.onerror = (error) => {
        console.error('websocket error: ', error);
      };
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
                <EpubViewerComponent url={epubUrl} fileId={fileId} />
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
                    <ReactMarkdown 
                      rehypePlugins={[rehypeRaw]}
                      remarkPlugins={[remarkGfm]}
                    >
                      {chatAnswer.map((item) => (
                        `**问题:** ${item.question}  \n**回答:** ${item.answer}`
                      )).join('\n\n')}
                    </ReactMarkdown>
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
                    disabled={chatting}
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

export default withAuth(EpubReader);
// export default EpubReader;
