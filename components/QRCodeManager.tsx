import React, { useState, useEffect } from "react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

export const QRCodeManager: React.FC = () => {
  const [targetUrl, setTargetUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    // Default to origin URL or production domain
    if (typeof window !== "undefined") {
      const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      // If local, suggest the production domain, else use current domain
      if (isLocal) {
        setTargetUrl("https://reg.3nestinvest.com/");
      } else {
        setTargetUrl(window.location.origin + "/");
      }
    }
  }, []);

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(
    targetUrl || "https://reg.3nestinvest.com/"
  )}&format=png&margin=20`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "qrcode_standee_checkin_1000x1000.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback: direct window open if CORS restricts fetch
      window.open(qrImageUrl, "_blank");
    }
  };

  return (
    <Card className="h-full flex flex-col justify-between">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h3 className="text-xl font-bold text-[#ba7c38]">
            Mã QR Code Check-in (In Standee Sự Kiện)
          </h3>
          <p className="text-xs text-[#a89f91] mt-1">
            Đường link gốc cố định dán standee để khách tham dự quét mã vào form đăng ký check-in
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Preview QR */}
        <div className="flex flex-col items-center justify-center p-4 bg-[#1c140e] rounded-xl border border-[#ba7c38]/40 shadow-lg">
          <div className="p-3 bg-white rounded-lg shadow">
            <img
              src={qrImageUrl}
              alt="QR Code Check-in Standee"
              className="w-48 h-48 object-contain rounded"
              loading="lazy"
            />
          </div>
          <span className="text-[11px] text-[#a89f91] mt-3 font-medium">Kích thước in: 1000 x 1000 px (Sắc nét)</span>
        </div>

        {/* Cấu hình link */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#e8ded1] uppercase tracking-wider mb-1">
              Đường link đích gắn với QR Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-[#ba7c38]/35 rounded-lg focus:ring-2 focus:ring-[#ba7c38] focus:outline-none bg-[#1c140e] text-white"
                placeholder="https://reg.3nestinvest.com/"
              />
              <Button
                onClick={handleCopyLink}
                variant="secondary"
                className="w-auto px-4 py-2 text-xs font-medium"
              >
                {copied ? "✓ Đã copy" : "Copy Link"}
              </Button>
            </div>
          </div>

          <div className="p-3 bg-[#1c140e] border border-[#ba7c38]/40 rounded-lg text-xs text-[#e8ded1] space-y-1">
            <p className="font-bold text-[#ffdca3]">⚠️ Lưu ý in ấn Standee:</p>
            <p>
              • Đường link check-in là trang chủ <strong className="text-white">{targetUrl || "/"}</strong>, không bị thay đổi trong suốt sự kiện.
            </p>
            <p className="text-[#a89f91]">
              • Khách quét mã sẽ tự động mở form điền thông tin và câu hỏi trắc nghiệm trên điện thoại.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={handleDownloadQR}
              className="w-auto px-5 py-2.5 text-sm bg-[#ba7c38] hover:bg-[#9f6527] text-white font-bold shadow-md"
            >
              📥 Tải ảnh QR Code (PNG in decal)
            </Button>
            <a
              href="/Final.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-[#1c140e] hover:bg-[#2a1d13] text-[#ffdca3] border border-[#ba7c38]/40 transition-colors"
            >
              🎰 Mở Màn Hình Quay Số (Final.html) ↗
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
};
