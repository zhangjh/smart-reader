'use client'

import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import FileUploader from '@/components/translate/FileUploader';
import TranslationSection from '@/components/translate/TranslationSection';
import { withAuth } from '@/components/withAuth';
import './index.css';
import util from '@/utils/util';
import EpubViewerComponent from '@/components/EpubViewerComponent';

const debugMode = process.env.NEXT_PUBLIC_DEBUG_MODE;
const serviceDomain = debugMode === "true" ? "http://localhost:3001" : "https://tx.zhangjh.cn";
const socketDomain = debugMode === "true" ? "ws://localhost:3002" : "wss://tx.zhangjh.cn";

const TranslatePage = () => { 
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [fileId, setFileId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    async function init() {
        const userId = await util.getUserInfo();
        setUserId(userId);
    };
    init();
  }, []);

  useEffect(() => {
    console.log(userId);
  }, [documentUrl, userId]);

  const handleFileProcessed = (fileUrl: string, fileId: string) => {
    setDocumentUrl(fileUrl);
    setFileId(fileId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavBar />
      <div className="flex-grow flex flex-col lg:flex-row">
        {!documentUrl && (
          <FileUploader 
            onFileProcessed={handleFileProcessed}
            serviceDomain={serviceDomain}
            userId={userId}
          />
        )}
        
        {documentUrl && (
          <>
            <div className="w-full lg:w-1/2 p-4 border border-gray-200">
              <div className="bg-white rounded-lg shadow-md p-4 h-[60vh] lg:h-full overflow-auto">
                <EpubViewerComponent url={documentUrl} fileId={fileId} recoredProgress={0.0} ignoreProgress={true}/>
              </div>
            </div>
            <TranslationSection
              userId={userId}
              fileId={fileId}
              documentUrl={documentUrl}
              socketDomain={socketDomain}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default withAuth(TranslatePage);