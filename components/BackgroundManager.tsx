import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export const BackgroundManager: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadMessage('Vui lòng chọn file ảnh hợp lệ');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadMessage('File ảnh không được vượt quá 5MB');
      return;
    }

    setIsUploading(true);
    setUploadMessage('');

    try {
      const formData = new FormData();
      formData.append('background', file);

      const response = await fetch('/api/upload-background', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUploadMessage('Background đã được cập nhật thành công! Trang sẽ tự động reload...');
          // Reload page after 2 seconds to show new background
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          throw new Error(result.error || 'Lỗi không xác định');
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error uploading background:', error);
      setUploadMessage(`Lỗi khi upload background: ${error.message}`);
    } finally {
      setIsUploading(false);
      // Clear file input
      event.target.value = '';
    }
  };

  const handleCurrentBackground = () => {
    // Open current background in new tab
    window.open('/bg.jpeg', '_blank');
  };

  return (
    <Card className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-slate-800">Quản Lý Background</h3>
        <Button 
          onClick={handleCurrentBackground}
          variant="secondary"
          className="!w-auto px-3 py-1.5 text-sm"
        >
          Xem Background Hiện Tại
        </Button>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 mb-2">
            <strong>Hướng dẫn:</strong>
          </p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• File ảnh sẽ được lưu vào: <code className="bg-blue-100 px-1 rounded">public/bg.jpeg</code></li>
            <li>• Định dạng hỗ trợ: JPG, PNG, WEBP</li>
            <li>• Kích thước tối đa: 5MB</li>
            <li>• Ảnh sẽ được áp dụng cho cả form đăng ký và phần quay số</li>
          </ul>
        </div>

        <div className="flex flex-col space-y-3">
          <label htmlFor="background-upload" className="block text-sm font-medium text-slate-700">
            Chọn ảnh background mới:
          </label>
          <input
            id="background-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-medium
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
          
          {isUploading && (
            <div className="flex items-center text-blue-600">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang upload...
            </div>
          )}

          {uploadMessage && (
            <p className={`text-sm p-3 rounded-lg ${
              uploadMessage.includes('thành công') 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {uploadMessage}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
