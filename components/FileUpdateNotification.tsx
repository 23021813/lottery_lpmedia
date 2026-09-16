import React from 'react';

interface FileUpdateNotificationProps {
  show: boolean;
  onClose: () => void;
  fileName: string;
}

export const FileUpdateNotification: React.FC<FileUpdateNotificationProps> = ({ show, onClose, fileName }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#140f0b] border border-[#ba7c38]/50 rounded-2xl p-6 max-w-md w-full shadow-2xl text-[#e8ded1]">
        <div className="flex items-center mb-4 pb-3 border-b border-[#ba7c38]/30">
          <div className="w-10 h-10 bg-[#ba7c38]/20 border border-[#ba7c38]/40 rounded-full flex items-center justify-center mr-3 text-[#ffdca3]">
            <svg className="w-5 h-5 text-[#ba7c38]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0-10V4m0 0l3 3m-3-3L9 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#ffdca3]">File Updated</h3>
            <p className="text-xs text-[#a89f91]">Vui lòng thay thế file thủ công</p>
          </div>
        </div>
        
        <div className="mb-5 space-y-2 text-xs">
          <p>
            File <strong className="text-white font-mono bg-[#1c140e] px-1.5 py-0.5 rounded border border-[#ba7c38]/30">{fileName}</strong> đã được tải xuống.
          </p>
          <p className="text-[#a89f91]">
            Vui lòng thực hiện các bước sau:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-[#e8ded1] bg-[#1c140e] p-3 rounded-lg border border-[#ba7c38]/25">
            <li>Tìm file đã tải xuống trong thư mục Downloads</li>
            <li>Copy file này vào thư mục <code className="bg-[#140f0b] text-[#ffdca3] px-1 rounded font-mono">/data/</code> của project</li>
            <li>Thay thế file cũ</li>
            <li>Refresh trang để thấy thay đổi</li>
          </ol>
        </div>
        
        <div className="flex justify-end space-x-3 pt-2">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#ba7c38] hover:bg-[#9f6527] text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Tải lại trang
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1c140e] hover:bg-[#281b12] text-[#c4b5a2] border border-[#ba7c38]/30 rounded-lg text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};