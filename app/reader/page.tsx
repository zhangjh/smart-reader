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
  const [summary, setSummary] = useState(`
## 《宝贵的人生建议》总结

### 1. 书籍概要
《宝贵的人生建议》是一本汇集了作者在68岁生日时开始为子女写下的人生感悟的书籍。作者通过460条简洁的人生建议，结合历代智慧、个人经历和现代格言，旨在传承智慧，鼓励读者将建议内化为自身的成长动力，并与年轻人分享。书中内容涵盖了个人成长、人际关系、职业发展、心态调整等多个方面，强调积极的生活态度和有效的方法。

### 2. 核心论点
作者的核心论点在于，通过自我成长和理性选择，可以提升个人价值和人际关系。书中强调了耐心、实用主义、个人价值观、尊重他人、乐观心态、倾听、感恩、珍惜等重要性。

### 3. 关键章节
- **个人成长**：强调自我投资、学习新技能、自我宽恕、独立价值观、持续学习、理性接受观点等。
- **人际关系**：强调尊重他人、面对拖延时的心态调整、个人成长需要他人帮助、直接指挥他人以获得帮助、成功的代价、从失败中学习的重要性等。
- **职业发展**：强调选择与价值观相符的工作、善行本身的奖励价值以及慷慨的利己性。
- **心态调整**：强调乐观心态、倾听他人、设定截止日期以筛选事项、勇于提问和将生活视为设计模型的重要性。

### 4. 作者风格
作者的写作风格简洁明了，充满智慧，既有学术性，又有故事性，易于读者理解和接受。

### 5. 内容评分
**4.5/5**
- 内容质量：高，涵盖了个人成长和人际交往的多个方面。
- 信息密度：高，每一条建议都蕴含着深刻的智慧。
- 观点正确性：高，建议基于实践经验和个人感悟。

### 6. 推荐理由
《宝贵的人生建议》适合所有追求个人成长和提升人际关系的人阅读。特别是对于年轻人、职场人士和希望改善生活品质的人群，这本书提供了宝贵的指导。它不仅是一本个人成长手册，也是一本充满智慧的生活指南。

`);
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

        const response = await fetch('http://localhost:3001/parse/convert', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
        if (result.success) {
          console.log(result.data);
          setEpubUrl(result.data);
        } else {
          console.error(result.errorMsg);
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
      <div className="flex-grow flex flex-col lg:flex-row">
        {!file && !isLoading && (
          <div className="w-full flex items-center justify-center p-4">
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
              <div className="flex-grow mb-4">
                <div className="bg-white rounded-lg shadow-md p-4 h-full">
                  <div className="space-y-4">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
                  </div>
                </div>
              </div>

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
