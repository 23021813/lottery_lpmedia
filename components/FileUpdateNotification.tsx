import React from 'react';

interface FileUpdateNotificationProps {
  show: boolean;
  onClose: () => void;
  fileName: string;
}

export const FileUpdateNotification: React.FC<FileUpdateNotificationProps> = ({ show, onClose, fileName }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0-10V4m0 0l3 3m-3-3L9 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">File Updated</h3>
            <p className="text-sm text-gray-600">Please replace the file manually</p>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-700 mb-2">
            File <strong>{fileName}</strong> đã được tải xuống.
          </p>
          <p className="text-sm text-gray-700 mb-2">
            Vui lòng thực hiện các bước sau:
          </p>
          <ol className="text-sm text-gray-700 list-decimal list-inside space-y-1">
            <li>Tìm file đã tải xuống trong thư mục Downloads</li>
            <li>Copy file này vào thư mục <code className="bg-gray-100 px-1 rounded">/data/</code> của project</li>
            <li>Thay thế file cũ</li>
            <li>Refresh trang để thấy thay đổi</li>
          </ol>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Refresh Page
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};