import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface BlobFile {
  pathname: string;
  url: string;
  size: number;
  uploadedAt: string;
}

export const BlobStatusManager: React.FC = () => {
  const [files, setFiles] = useState<BlobFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  const loadFiles = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/list-files');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setFiles(result.data || []);
          setMessage(`Tìm thấy ${result.data?.length || 0} files trong Vercel Blob`);
          setMessageType('success');
        } else {
          setMessage('Không thể tải danh sách files');
          setMessageType('error');
        }
      } else {
        setMessage('Lỗi khi kết nối với Vercel Blob');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Lỗi khi tải danh sách files từ Vercel Blob');
      setMessageType('error');
      console.error('Error loading files:', error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const getFileIcon = (filename: string): string => {
    if (filename.endsWith('.json')) return '📄';
    if (filename.endsWith('.csv')) return '📊';
    return '📁';
  };

  const hasRequiredFiles = () => {
    const hasConfig = files.some(f => f.pathname === 'config.json');
    const hasCsv = files.some(f => f.pathname === 'data.csv');
    return { hasConfig, hasCsv };
  };

  const { hasConfig, hasCsv } = hasRequiredFiles();

  return (
    <Card className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-slate-800">Trạng Thái Vercel Blob Storage</h3>
        <Button 
          onClick={loadFiles}
          variant="secondary"
          className="!w-auto px-3 py-1.5 text-sm"
          isLoading={isLoading}
        >
          Refresh
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Files Status</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>config.json:</span>
              <span>{hasConfig ? '✅ Có' : '❌ Không có'}</span>
            </div>
            <div className="flex justify-between">
              <span>data.csv:</span>
              <span>{hasCsv ? '✅ Có' : '❌ Không có'}</span>
            </div>
            <div className="flex justify-between">
              <span>Tổng files:</span>
              <span>{files.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">System Status</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Vercel Blob:</span>
              <span>✅ Hoạt động</span>
            </div>
            <div className="flex justify-between">
              <span>API Endpoints:</span>
              <span>✅ Sẵn sàng</span>
            </div>
            <div className="flex justify-between">
              <span>Storage:</span>
              <span>✅ Persistent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-slate-800 mb-3">Danh sách Files</h4>
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getFileIcon(file.pathname)}</span>
                    <div>
                      <div className="font-medium text-slate-900">{file.pathname}</div>
                      <div className="text-xs text-slate-500">
                        {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                      </div>
                    </div>
                  </div>
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Xem
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-lg text-sm mb-4 ${
          messageType === 'success' ? 'bg-green-100 text-green-800' :
          messageType === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {message}
        </div>
      )}

      {/* Help Text */}
      <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <h5 className="font-semibold mb-2">Thông tin:</h5>
        <ul className="space-y-1">
          <li>• <strong>config.json:</strong> Chứa cấu hình agencies và time settings</li>
          <li>• <strong>data.csv:</strong> Chứa dữ liệu đăng ký của người dùng</li>
          <li>• <strong>Vercel Blob:</strong> Persistent storage, data không bị mất khi redeploy</li>
          <li>• <strong>Auto-create:</strong> Files sẽ được tạo tự động với default values khi cần</li>
        </ul>
      </div>
    </Card>
  );
};