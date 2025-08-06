import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export const LogoManager: React.FC = () => {
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

    // Validate file size (max 2MB for logo)
    if (file.size > 2 * 1024 * 1024) {
      setUploadMessage('File logo không được vượt quá 2MB');
      return;
    }

    setIsUploading(true);
    setUploadMessage('');

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch('/api/upload-logo', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUploadMessage('Logo đã được cập nhật thành công! Trang sẽ tự động reload...');
          // Reload page after 2 seconds to show new logo
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
      console.error('Error uploading logo:', error);
      setUploadMessage(`Lỗi khi upload logo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      // Clear file input
      event.target.value = '';
    }
  };

  const handleCurrentLogo = () => {
    // Open current logo in new tab
    window.open('/logo.png', '_blank');
  };

  const handleRemoveLogo = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa logo hiện tại?')) {
      return;
    }

    try {
      const response = await fetch('/api/remove-logo', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUploadMessage('Logo đã được xóa thành công! Trang sẽ tự động reload...');
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
      console.error('Error removing logo:', error);
      setUploadMessage(`Lỗi khi xóa logo: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Card className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-slate-800">Quản Lý Logo</h3>
        <div className="flex gap-2">
          <Button 
            onClick={handleCurrentLogo}
            variant="secondary"
            className="!w-auto px-3 py-1.5 text-sm"
          >
            Xem Logo Hiện Tại
          </Button>
          <Button 
            onClick={handleRemoveLogo}
            variant="secondary"
            className="!w-auto px-3 py-1.5 text-sm bg-red-50 text-red-700 hover:bg-red-100"
          >
            Xóa Logo
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-800 mb-2">
            <strong>Hướng dẫn:</strong>
          </p>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• File logo sẽ được lưu vào: <code className="bg-green-100 px-1 rounded">public/logo.png</code></li>
            <li>• Định dạng hỗ trợ: JPG, PNG, WEBP, SVG</li>
            <li>• Kích thước tối đa: 2MB</li>
            <li>• Logo sẽ hiển thị ở đầu form đăng ký</li>
            <li>• Khuyến nghị: Logo trong suốt (PNG) với tỷ lệ 16:9 hoặc vuông</li>
          </ul>
        </div>

        <div className="flex flex-col space-y-3">
          <label htmlFor="logo-upload" className="block text-sm font-medium text-slate-700">
            Chọn logo mới:
          </label>
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-medium
              file:bg-green-50 file:text-green-700
              hover:file:bg-green-100
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
          
          {isUploading && (
            <div className="flex items-center text-green-600">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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