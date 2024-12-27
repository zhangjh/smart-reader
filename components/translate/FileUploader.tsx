import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { toast } from 'react-toastify';
import util from '@/utils/util';

interface FileUploaderProps {
  onFileProcessed: (fileUrl: string, title: string, content: string) => void;
  serviceDomain: string;
  userId: string;
}

const FileUploader = ({ onFileProcessed, serviceDomain, userId }: FileUploaderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setChecking(true);
      // 校验权限
      await util.authCheck(userId, 'translate', async () => {
        setChecking(false);
        setIsLoading(true);
        try {
          const formData = new FormData();
          formData.append('file', uploadedFile);
          formData.append('userId', userId);
          formData.append('spaceId', '1');

          const response = await fetch(`${serviceDomain}/parse/convert`, {
            method: 'POST',
            body: formData,
          });
          
          const result = await response.json();
          if (!result.success) {
            throw new Error(result.errorMsg);
          }

          const { fileUrl, fileId } = result.data;
          onFileProcessed(fileUrl, fileId, userId);
        } catch (error) {
          console.error('File upload error:', error);
          toast.error('文件上传失败，请重试');
        } finally {
          setIsLoading(false);
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">正在上传文档</h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>           
        </div>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="w-full flex items-center justify-center p-4 h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">权限校验中，请稍等...</h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>           
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 h-[70vh] lg:h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">上传您的文档</h2>
        <p className="mb-4">支持的格式：docx、pdf、epub、azw3</p>
        <p className="mb-4">大小不要超过10MB</p>
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
  );
};

export default FileUploader;