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
import { ScrollArea } from "@/components/ui/scroll-area";

import './index.css';
import { withAuth } from '@/components/withAuth';
import util from '@/utils/util';
import { toast } from 'react-toastify';
import { useSearchParams } from 'next/navigation';
import { SignedIn, useUser } from '@clerk/nextjs';

const debugMode = process.env.NEXT_PUBLIC_DEBUG_MODE;
const serviceDomain = debugMode === "true" ? "http://localhost:3001" : "https://tx.zhangjh.cn";
const socketDomain = debugMode === "true" ? "ws://localhost:3002" : "wss://tx.zhangjh.cn";

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
  const [summary, setSummary] = useState<string>('');
  const [uploading, setUpLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [summaring, setSummaring] = useState(false);
  const [chatting, setChatting] = useState(false);
  const [chatContext, setChatContext] = useState<{ role: string; content: string; }[]>([]);
  const [chatAnswer, setChatAnswer] = useState<{ question: string; answer: string; }[]>([]); // 指定类型为数组
  const [epubUrl, setEpubUrl] = useState(null);
  const [fileId, setFileId] = useState('');
  const [userId, setUserId] = useState('');
  const [progress, setProgress] = useState(0);
  const [needUpdate, setNeedUpdate] = useState(false);
  const [summaryProgress, setSummaryProgesss] = useState<number>(0.0);
  const [checking, setChecking] = useState(false);
  const [isNewUpload, setIsNewUpload] = useState(false);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  const searchParams = useSearchParams();
  const fileIdParam = searchParams.get("fileId");

  const [chatSocket, setChatSocket] = useState<WebSocket>();

  const { isSignedIn, user } = useUser();

  // 区别于summary，这个contentSummary是书籍内容拆分成章节后的总结，用来辅助对话使用
  const [contentSummary, setContentSummary] = useState("");
  
   let curAnswer = '';
  async function init() {
    const savedUserId = localStorage.getItem("userId");
    if(savedUserId) {
      setUserId(savedUserId);
    } else {
      if(isSignedIn) {
        if(isSignedIn) {
          const extId = user.id;
          const userName = user.username;
          const email = user.emailAddresses[0].emailAddress;
          const avatar = user.imageUrl;
          // 如果有邮箱认为是邮箱登录，否则只记录clerk
          let extType = "clerk";
          if(email) {
            extType = "email";
          }
          const userId = await util.getUserByExtId({extType, extId, avatar, email, userName});
          setUserId(userId);
        }
      }
    }
  };

  useEffect(() => {
    init();
  }, [isSignedIn]);
 
  useEffect(() => {
    if (fileIdParam && userId && !isNewUpload) {
      setFileId(fileIdParam);
      // 建立socket
      openChatSocket();
      // 获取fileUrl
      fetch(`${serviceDomain}/books/getReadFileUrl?userId=${userId}&fileId=${fileIdParam}`)
        .then(response => response.json())
        .then(response => {
            if(!response.success) {
                toast.error(response.errorMsg);
                return;
            }
            console.log(response.data);
            setEpubUrl(response.data);
            setUpLoading(false);
        });
      // 获取总结, 从记录获取title、author、contentSummary填充
      fetch(`${serviceDomain}/books/getRecordDetail?userId=${userId}&fileId=${fileIdParam}`)
        .then(response => response.json())
        .then(response => {
          if(!response.success) {
            toast.error(response.errorMsg);
            return;
          }
          setTitle(response.data.title);
          setAuthor(response.data.author);
          setContentSummary(response.data.contentSummary);
          setSummary(response.data.summary);
          setProgress(response.data.progress);
        });
    }
  }, [fileIdParam, userId]);

  const openChatSocket = async function() {
    const chatSocket = new WebSocket(`${socketDomain}/socket/chat?userId=${userId}`);
    if(!chatSocket) {
      toast.error("chatSocket连接服务器失败，请重试");
      return;
    }
    setChatSocket(chatSocket);

    chatSocket.onopen = () => {
      // 发送确认消息，保证连接不会自动断联
      chatSocket.send(JSON.stringify({
        'type': 'ping',
      }));
      console.log("chatSocket connected");
    };

    chatSocket.onmessage = event => {
      const data = JSON.parse(event.data);
        // data.success == false
        if(!data.success && data.errorMsg) {
          toast.error(data.errorMsg);
          return;
        }
        if(data.type === 'finish') {
          setChatting(false);
          // 保存聊天使用记录
          util.saveUsage('chat', userId);
          // 构建聊天上下文
          const curChatContext = chatContext;
          curChatContext.push({
            role: "user",
            content: question
          });
          curChatContext.push({
            role: "assistant",
            content: curAnswer,
          });
          setChatContext(curChatContext);
          curAnswer = '';
        } else if(data.type === 'data') {
          // 构建问答区显示内容
          curAnswer += data.data;
          chatAnswer[chatAnswer.length - 1].answer = curAnswer;
          setChatAnswer([...chatAnswer]);
        }
    }

    chatSocket.onclose = (e) => {
      console.log("chatSocket closed", e);
    }

    chatSocket.onerror = e => {
      console.error("chatSocket error", e);
    }
  }

  const openSummarySocket = async function(fileId:string) {
    const socket = new WebSocket(`${socketDomain}/socket/summary?userId=${userId}`);

    socket.onopen = () => {
      console.log('summaryWebsocket connected');
      socket.send(JSON.stringify({
        'fileId': fileId,
        'userId': userId,
      }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // data.success == false
      if(!data.success && data.errorMsg) {
        toast.error(data.errorMsg);
        return;
      }
      if(data.type === 'summaryProgress') {
        setSummaryProgesss(data.data);
        return;
      }
      // 结束标记
      if(data.type === 'finish') {          
        // 更新解析记录
        setNeedUpdate(true);
      } else if(data.type === 'data') {
        setSummaring(false);
        setSummary(prevSummary => (prevSummary || '') + data.data);
      } else if(data.type === 'title') {
        setTitle(data.data);
      } else if(data.type === 'author') {
        setAuthor(data.data);
      } else if(data.type === 'contentSummary') {
        setContentSummary(data.data);
      }
    };

    socket.onclose = () => {
      console.log('websocket closed');
    };

    socket.onerror = (error) => {
      console.error('websocket error: ', error);
    };
  }

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitted question:', question);
    // setChecking(true);
    // // 权限校验
    // await util.authCheck(userId, 'chat', async () => {
    //   setChecking(false);
    // });
    if(!question) {
      return;
    }
    setChatting(true);
    // 清空输入框
    setQuestion('');
    // 问答区显示内容
    chatAnswer.push({
      "question": question,
      "answer": "正在思考中...",
    });

    const chatQuery = {
      'question': question,
      'title': title,
      'author': author,
      'summary': contentSummary,
      'context': {
        messages: chatContext
      },
    };
    console.log(chatQuery);
    if(!chatSocket || chatSocket.readyState !== WebSocket.OPEN) {
      openChatSocket();
    }
    if(chatSocket?.readyState === WebSocket.OPEN) {
      // 本轮问答
      chatSocket.send(JSON.stringify(chatQuery));
    }
  };

  const handleClearConversation = () => {
    console.log('Clearing conversation');
    setQuestion('');
  };

  const updateRecord = (fileId:string, title: string, author: string, summary: string, contentSummary: string) => {
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
        'contentSummary': contentSummary
      }),
    });
  };

  useEffect(() => {
    if(needUpdate) {
      updateRecord(fileId, title, author, summary, contentSummary);
    }
  }, [needUpdate]);

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setUpLoading(true);
      setIsNewUpload(true);  // 标记为新上传
      // 权限校验
      setChecking(true);
      await util.authCheck(userId, 'reader', async () => {
        setChecking(false);
        // 调用后端服务进行格式转换，获取转换后的epub文件后再渲染
        const reader = new FileReader();
        reader.onload = () => {
          const fileContent = reader.result as ArrayBuffer;
          if(!fileContent) {
            toast.error("文件内容为空");
            return;
          }

          // 判断是否需要进行格式转换
          let format:string | undefined = uploadedFile.type;
          format = mimeTypeMap[uploadedFile.type as keyof typeof mimeTypeMap];
          if(!format) {
            // 获取文件扩展名
            format = uploadedFile.name.split('.').pop().toLowerCase();
          }
          if(!format) {
            toast.error("文件格式不支持");
            return;
          }

          const convertSocket = new WebSocket(`${socketDomain}/socket/convert?userId=${userId}`);
          convertSocket.onopen = () => {
            console.log("convertSocket connected");
            convertSocket.send(JSON.stringify({ 
              fileData: Array.from(new Uint8Array(fileContent)), 
              fileExt: format,
              fileName: uploadedFile.name,
              fileSize: uploadedFile.size
            }));
            setUpLoading(false);
            setConverting(true);
          }
          convertSocket.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            if(!data.success && data.errorMsg) {
              toast.error(data.errorMsg);
              return;
            }
            if(data.type === "fileUrl") {
              setEpubUrl(data.data);
            }
            if(data.type === "fileId") {
              setFileId(data.data);
              // 改写地址栏
              window.history.pushState(null, title, window.location.pathname + `?fileId=${data.data}`);
              // 有fileId后就可以创建连接了
              // 建立问答socket
              openChatSocket();
              // 建立总结socket
              openSummarySocket(data.data);
            }
            if(data.type === "finish") {
              setConverting(false);
              setSummaring(true);
              // 保存文件解析使用记录
              await util.saveUsage('reader', userId);
            }
          }
          convertSocket.onclose = () => {
            console.log("convertSocket closed");
          }
        };
        reader.readAsArrayBuffer(uploadedFile);
      });
    }
  };

  return (
    <SignedIn>
      <div className="min-h-screen flex flex-col bg-white">
        <NavBar />
        <div className="flex-grow flex flex-col lg:flex-row">
          {checking && (
            <div className="w-full flex items-center justify-center p-4 h-screen">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">权限校验中，请稍等...</h2>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                </div>　　 　 　
              </div>
            </div>
          )}
          
          {!checking && (
            <>
            {/* 有fileId参数时不展示，等待epubUrl解析完成 */}
            {!fileIdParam && !epubUrl && !uploading && !converting && (
              <div className="w-full flex flex-col items-center justify-center p-4 lg:h-screen h-[70vh]">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">上传您的电子书</h2>
                  <p className="mb-4">支持的格式：docx、pdf、epub、azw3</p>
                  <p className="mb-4">大小不要超过50MB</p>
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
          
            {uploading && (
              <div className="w-full flex items-center justify-center p-4">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">正在处理您的电子书</h2>
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                  </div>　　 　 　
                </div>
              </div>
            )}

            {!uploading && converting && (
              <div className="w-full flex items-center justify-center p-4">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">正在转换电子书格式</h2>
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
                  <div className="bg-white rounded-lg border border-gray-200 p-4 h-[82vh] lg:h-full">
                    <EpubViewerComponent url={epubUrl} fileId={fileId} recoredProgress={progress} />
                  </div>
                </div>

                {/* 右侧：摘要和问答 */}
                <div className="w-full lg:w-1/2 flex flex-col p-4 h-[calc(100vh-4rem)]">
                  {/* 上半部分：摘要 */}
                  <div className="flex-grow mb-4 flex flex-col h-1/2">
                  {summaring && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4 flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">AI正在总结中，请稍等...</h2>
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                        </div>   
                        <div className="flex justify-center">
                          <span>{summaryProgress}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-white rounded-lg border border-gray-200 p-4 flex-1">
                  {(!summaring && chatAnswer.length == 0) && (
                    <ScrollArea className="h-full max-h-[calc(100vh-20rem)]">
                      <div className="space-y-4 prose">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
                      </div>
                    </ScrollArea>
                  )}
                  {(!summaring && chatAnswer.length > 0) && (
                    <ScrollArea className="h-full max-h-[calc(50vh-8rem)]">
                      <div className="space-y-4 prose">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
                      </div>
                    </ScrollArea>
                  )}
                  </div>
                  </div>

                  {/** 展示聊天问答内容 */}
                  { (chatting || chatAnswer.length > 0) && (
                    <div className="flex-grow mb-4 flex flex-col h-1/3">
                      <div className="bg-white rounded-lg border border-gray-200 p-4 flex-1">
                        <ScrollArea className="h-full max-h-[calc(40vh-8rem)]">
                          <div className="space-y-4 prose pr-4">
                            <ReactMarkdown 
                              rehypePlugins={[rehypeRaw]}
                              remarkPlugins={[remarkGfm]}
                            >
                              {chatAnswer.map((item) => (
                                `**问题:** ${item.question}  \n**回答:** ${item.answer}`
                              )).join('\n\n')}
                            </ReactMarkdown>
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  ) }

                  {/* 下半部分：问答 */}
                  <div className="mt-auto">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
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
            </>
          )}
        </div>
      </div>
    </SignedIn>
   
  );
};

export default withAuth(EpubReader);