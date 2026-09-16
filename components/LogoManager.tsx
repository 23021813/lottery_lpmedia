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
    <Card className="h-full flex flex-col justify-between">
      <div>
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4 pb-3 border-b border-[#ba7c38]/25">
          <h3 className="text-xl font-bold text-[#ba7c38]">Quản Lý Logo</h3>
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={handleCurrentLogo}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#1c140e] hover:bg-[#281b12] text-[#ffdca3] border border-[#ba7c38]/40 transition-colors cursor-pointer"
            >
              👁️ Xem Logo Hiện Tại
            </button>
            <button 
              type="button"
              onClick={handleRemoveLogo}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-700/50 transition-colors cursor-pointer"
            >
              🗑️ Xóa Logo
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-[#1c140e] rounded-xl border border-[#ba7c38]/35 shadow-inner">
            <p className="text-xs font-bold text-[#ffdca3] mb-2 uppercase tracking-wider">
              📌 Hướng dẫn cập nhật:
            </p>
            <ul className="text-xs text-[#e8ded1] space-y-1.5">
              <li>• File logo lưu tại: <code className="bg-[#140f0b] text-[#ffdca3] border border-[#ba7c38]/30 px-1.5 py-0.5 rounded font-mono">public/logo.png</code></li>
              <li>• Định dạng hỗ trợ: JPG, PNG, WEBP, SVG</li>
              <li>• Dung lượng tối đa: 2MB</li>
              <li>• Hiển thị ở đầu form đăng ký và màn hình quay số</li>
              <li className="text-[#a89f91]">• Khuyến nghị: Logo nền trong suốt (PNG) tỷ lệ chuẩn</li>
            </ul>
          </div>

          <div className="flex flex-col space-y-2 pt-1">
            <label htmlFor="logo-upload" className="block text-xs font-bold uppercase tracking-wider text-[#e8ded1]">
              Chọn file logo mới:
            </label>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="block w-full text-xs text-[#c4b5a2]
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-xs file:font-bold
                file:bg-[#ba7c38] file:text-white
                hover:file:bg-[#9f6527]
                bg-[#1c140e] border border-[#ba7c38]/35 rounded-lg p-2
                disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            />
            
            {isUploading && (
              <div className="flex items-center text-[#ffdca3] text-xs font-medium pt-1">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#ba7c38]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang tải lên máy chủ...
              </div>
            )}

            {uploadMessage && (
              <p className={`text-xs p-3 rounded-lg font-medium ${
                uploadMessage.includes('thành công') 
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' 
                  : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
              }`}>
                {uploadMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};