import React, { useState, useMemo } from "react";
import type { Submission } from "../types";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

interface SubmissionListProps {
  submissions: Submission[];
  agencies?: string[];
  onSubmissionsUpdate?: () => void;
}

export const SubmissionList: React.FC<SubmissionListProps> = ({
  submissions,
  agencies = [],
  onSubmissionsUpdate,
}) => {
  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedAgency, setSelectedAgency] = useState<string>("ALL");
  const [filterAnswer, setFilterAnswer] = useState<string>("ALL");
  const [filterPrize, setFilterPrize] = useState<string>("ALL");

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number | "ALL">(25);

  // Sensitive Data Masking State
  const [revealedIds, setRevealedIds] = useState<Set<number>>(new Set());
  const [showAllSensitive, setShowAllSensitive] = useState<boolean>(false);

  // Danger Zone Reset State
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [resetConfirmInput, setResetConfirmInput] = useState<string>("");
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Available agencies list (derived + props)
  const availableAgencies = useMemo(() => {
    const list = new Set<string>(agencies);
    submissions.forEach((s) => {
      if (s.agency) list.add(s.agency);
    });
    return Array.from(list).filter(Boolean).sort();
  }, [submissions, agencies]);

  // Overall statistics
  const totalCount = submissions.length;
  const qualifiedSubmissions = useMemo(
    () => submissions.filter((s) => (s.answer || "").toUpperCase() === "C"),
    [submissions]
  );
  const qualifiedCount = qualifiedSubmissions.length;
  const unqualifiedCount = totalCount - qualifiedCount;
  const wonCount = useMemo(
    () => submissions.filter((s) => !!s.prizeWon).length,
    [submissions]
  );
  const qualifiedPercent =
    totalCount > 0 ? ((qualifiedCount / totalCount) * 100).toFixed(1) : "0.0";

  // Filtering & Search
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      // 1. Search match
      if (searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const idStr = sub.id.toString();
        const codeStr = `#${idStr.padStart(4, "0")}`.toLowerCase();
        const nameMatch = sub.name.toLowerCase().includes(q);
        const phoneMatch = sub.phone.includes(q);
        const nationalIdMatch = sub.nationalId.includes(q);
        const codeMatch = idStr === q || codeStr.includes(q);
        const agencyMatch = sub.agency.toLowerCase().includes(q);

        if (
          !nameMatch &&
          !phoneMatch &&
          !nationalIdMatch &&
          !codeMatch &&
          !agencyMatch
        ) {
          return false;
        }
      }

      // 2. Agency filter
      if (selectedAgency !== "ALL" && sub.agency !== selectedAgency) {
        return false;
      }

      // 3. Answer filter
      const ans = (sub.answer || "").toUpperCase();
      if (filterAnswer === "C" && ans !== "C") return false;
      if (filterAnswer === "OTHER" && ans === "C") return false;

      // 4. Prize filter
      if (filterPrize === "WON" && !sub.prizeWon) return false;
      if (filterPrize === "NOT_WON" && !!sub.prizeWon) return false;

      return true;
    });
  }, [submissions, searchTerm, selectedAgency, filterAnswer, filterPrize]);

  // Pagination calculation
  const totalPages =
    pageSize === "ALL"
      ? 1
      : Math.max(1, Math.ceil(filteredSubmissions.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedSubmissions = useMemo(() => {
    if (pageSize === "ALL") return filteredSubmissions;
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredSubmissions.slice(start, start + pageSize);
  }, [filteredSubmissions, safeCurrentPage, pageSize]);

  // Toggle single row unmask
  const toggleReveal = (id: number) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Helper mask formatter
  const formatMasked = (
    val: string,
    id: number,
    type: "phone" | "cccd"
  ): string => {
    if (showAllSensitive || revealedIds.has(id)) {
      return val;
    }
    if (type === "phone") {
      return val.length > 4 ? val.slice(0, -3) + "***" : val;
    }
    return val.length > 4 ? "********" + val.slice(-4) : val;
  };

  // CSV Export functions
  const downloadCSVFromList = (list: Submission[], filename: string) => {
    if (list.length === 0) {
      alert("Không có dữ liệu để xuất file!");
      return;
    }
    const headers = "ID,Tên,Số Điện Thoại,CCCD,Đại lý,Đáp án,Giải thưởng\n";
    const rows = list
      .map(
        (sub) =>
          `${sub.id},"${sub.name}","${sub.phone}","${sub.nationalId}","${
            sub.agency
          }","${sub.answer || ""}","${sub.prizeWon || ""}"`
      )
      .join("\n");

    const csvContent = headers + rows;
    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportQualified = () => {
    if (qualifiedCount === 0) {
      alert("Chưa có người tham gia nào chọn đáp án đúng C!");
      return;
    }
    downloadCSVFromList(
      qualifiedSubmissions,
      `danh_sach_quay_so_dap_an_C_${qualifiedCount}_nguoi.csv`
    );
  };

  const handleExportAll = () => {
    downloadCSVFromList(
      submissions,
      `toan_bo_danh_sach_dang_ky_${totalCount}_nguoi.csv`
    );
  };

  const handleExportFiltered = () => {
    downloadCSVFromList(
      filteredSubmissions,
      `danh_sach_loc_${filteredSubmissions.length}_nguoi.csv`
    );
  };

  // Reset CSV execution
  const executeResetCSV = async () => {
    if (resetConfirmInput !== "RESET") {
      alert("Vui lòng gõ chữ RESET để xác nhận xóa dữ liệu!");
      return;
    }

    setIsResetting(true);
    try {
      const headers = "id,name,phone,nationalId,agency,answer,prizeWon\n";
      const response = await fetch("/api/write-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: headers }),
      });

      if (response.ok) {
        alert("Đã reset toàn bộ dữ liệu CSV thành công!");
        setShowResetConfirm(false);
        setResetConfirmInput("");
        if (onSubmissionsUpdate) {
          onSubmissionsUpdate();
        }
      } else {
        throw new Error("Reset CSV thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi reset CSV:", error);
      alert("Có lỗi xảy ra khi reset dữ liệu CSV!");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards - Phân cấp màu Dark Luxury tinh tế */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng Đăng Ký */}
        <div className="bg-[#1c150e]/95 backdrop-blur-md border border-[#ba7c38]/40 rounded-xl p-5 shadow-lg hover:border-[#ba7c38]/70 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ba7c38]">
              Tổng Đăng Ký
            </span>
            <span className="p-2 bg-[#ba7c38]/15 border border-[#ba7c38]/30 rounded-lg text-[#ffdca3] text-lg">
              👥
            </span>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">
            {totalCount.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-[#a89f91] font-medium">
            Tất cả lượt check-in ghi nhận
          </div>
        </div>

        {/* Card 2: Đạt chuẩn C (Xanh ngọc sang trọng) */}
        <div className="bg-[#0f1f17]/95 backdrop-blur-md border border-emerald-500/40 rounded-xl p-5 shadow-lg hover:border-emerald-500/70 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Đủ ĐK Quay Thưởng (C)
            </span>
            <span className="p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-lg text-emerald-300 text-lg">
              🎯
            </span>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-emerald-300 flex items-baseline gap-2">
            {qualifiedCount.toLocaleString()}
            <span className="text-sm font-semibold text-emerald-400">
              ({qualifiedPercent}%)
            </span>
          </div>
          <div className="mt-1 text-xs text-emerald-400/80 font-medium">
            Chọn đúng 1,696,000,000 VND
          </div>
        </div>

        {/* Card 3: Không Đạt (Đỏ sẫm dịu mắt) */}
        <div className="bg-[#221013]/95 backdrop-blur-md border border-rose-800/40 rounded-xl p-5 shadow-lg hover:border-rose-800/70 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Không Đạt (A, B, D / Khác)
            </span>
            <span className="p-2 bg-rose-500/15 border border-rose-500/30 rounded-lg text-rose-300 text-lg">
              ❌
            </span>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-rose-300 flex items-baseline gap-2">
            {unqualifiedCount.toLocaleString()}
            <span className="text-sm font-semibold text-rose-400">
              (
              {totalCount > 0
                ? ((unqualifiedCount / totalCount) * 100).toFixed(1)
                : 0}
              %)
            </span>
          </div>
          <div className="mt-1 text-xs text-rose-400/70 font-medium">
            Loại khỏi danh sách quay số
          </div>
        </div>

        {/* Card 4: Đã trúng giải (Hoàng kim sang trọng) */}
        <div className="bg-[#241a0d]/95 backdrop-blur-md border border-amber-500/40 rounded-xl p-5 shadow-lg hover:border-amber-500/70 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ffdca3]">
              Đã Trúng Giải
            </span>
            <span className="p-2 bg-amber-500/15 border border-amber-500/30 rounded-lg text-[#ffdca3] text-lg">
              🎁
            </span>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-[#ffdca3]">
            {wonCount.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-[#c4b5a2] font-medium">
            Đã trao thưởng trên Final.html
          </div>
        </div>
      </div>

      {/* Main Table Card - Dark Luxury Theme */}
      <Card className="p-6 bg-[#140f0b]/95 backdrop-blur-xl shadow-2xl border border-[#ba7c38]/35 rounded-2xl">
        {/* Header & Actions Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#ba7c38]/25">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-[#ffdca3]">📋</span> Danh Sách Người Tham Gia
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1c140e] text-[#ffdca3] border border-[#ba7c38]/40">
                {filteredSubmissions.length} / {totalCount} kết quả
              </span>
            </h3>
            <p className="text-xs text-[#a89f91] mt-1">
              Quản lý danh sách check-in, tra cứu nhanh và xuất dữ liệu quay
              thưởng cho ban tổ chức.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Nút Mở màn hình quay số */}
            <a
              href="/Final.html"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-[#ba7c38] hover:bg-[#9f6527] text-white shadow-md transition-all duration-200 hover:scale-[1.02]"
              title="Mở màn hình quay thưởng Final.html trên tab mới"
            >
              <span>🎰</span> Màn Hình Quay Thưởng
            </a>

            {/* Nút Xuất DS Quay Số (Đáp Án C) */}
            <button
              onClick={handleExportQualified}
              disabled={qualifiedCount === 0}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all duration-200 shadow-md ${
                qualifiedCount > 0
                  ? "bg-emerald-700 hover:bg-emerald-600 text-white hover:scale-[1.02] cursor-pointer"
                  : "bg-emerald-950 text-emerald-600 border border-emerald-800/40 opacity-50 cursor-not-allowed"
              }`}
              title="Chỉ xuất danh sách những người chọn đáp án đúng C để quay số"
            >
              <span>📥</span> Xuất DS Quay Số (C - {qualifiedCount})
            </button>

            {/* Nút Tải Toàn Bộ CSV */}
            <button
              onClick={handleExportAll}
              disabled={totalCount === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#1c140e] hover:bg-[#2a1d13] text-[#ffdca3] border border-[#ba7c38]/50 transition-all duration-200 shadow-md disabled:opacity-40 cursor-pointer"
            >
              <span>📄</span> Tải Toàn Bộ ({totalCount})
            </button>

            {/* Nút Làm Mới */}
            {onSubmissionsUpdate && (
              <button
                onClick={onSubmissionsUpdate}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg bg-[#1c140e] hover:bg-[#2a1d13] border border-[#ba7c38]/30 text-[#e8ded1] transition-colors cursor-pointer"
                title="Làm mới dữ liệu từ server"
              >
                <span>🔄</span> Làm Mới
              </button>
            )}
          </div>
        </div>

        {/* Toolbar: Tìm kiếm & Bộ lọc */}
        <div className="py-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3">
            {/* Input Search */}
            <div className="lg:col-span-4 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="🔍 Tìm theo Tên, SĐT, CCCD, #Mã số..."
                className="w-full pl-3.5 pr-8 py-2 text-xs rounded-lg border border-[#ba7c38]/35 focus:outline-none focus:ring-2 focus:ring-[#ba7c38] focus:border-[#ba7c38] bg-[#1c140e] text-white placeholder-[#7a7065]"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-2 text-[#a89f91] hover:text-white text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown Đại lý */}
            <div className="lg:col-span-3">
              <select
                value={selectedAgency}
                onChange={(e) => {
                  setSelectedAgency(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-3 text-xs rounded-lg border border-[#ba7c38]/35 focus:outline-none focus:ring-2 focus:ring-[#ba7c38] bg-[#1c140e] text-[#e8ded1]"
              >
                <option value="ALL">🏢 Tất cả Đại Lý ({availableAgencies.length})</option>
                {availableAgencies.map((agency) => (
                  <option key={agency} value={agency}>
                    {agency}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown Lọc Đáp Án */}
            <div className="lg:col-span-2">
              <select
                value={filterAnswer}
                onChange={(e) => {
                  setFilterAnswer(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-3 text-xs rounded-lg border border-[#ba7c38]/35 focus:outline-none focus:ring-2 focus:ring-[#ba7c38] bg-[#1c140e] text-[#e8ded1]"
              >
                <option value="ALL">🎯 Tất Cả Đáp Án</option>
                <option value="C">✓ Chỉ Đáp Án C ({qualifiedCount})</option>
                <option value="OTHER">✗ Đáp Án Khác ({unqualifiedCount})</option>
              </select>
            </div>

            {/* Dropdown Lọc Giải */}
            <div className="lg:col-span-2">
              <select
                value={filterPrize}
                onChange={(e) => {
                  setFilterPrize(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-3 text-xs rounded-lg border border-[#ba7c38]/35 focus:outline-none focus:ring-2 focus:ring-[#ba7c38] bg-[#1c140e] text-[#e8ded1]"
              >
                <option value="ALL">🎁 Tất Cả Giải</option>
                <option value="WON">Đã Trúng Giải ({wonCount})</option>
                <option value="NOT_WON">Chưa Trúng</option>
              </select>
            </div>

            {/* Toggle Ẩn/Hiện Thông Tin Nhạy Cảm */}
            <div className="lg:col-span-1 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowAllSensitive(!showAllSensitive)}
                className={`p-2 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                  showAllSensitive
                    ? "bg-[#ba7c38]/25 border-[#ba7c38] text-[#ffdca3]"
                    : "bg-[#1c140e] border-[#ba7c38]/30 text-[#c4b5a2] hover:bg-[#2a1d13] hover:text-[#ffdca3]"
                }`}
                title={
                  showAllSensitive
                    ? "Đang hiện đầy đủ CCCD & SĐT (Bấm để ẩn)"
                    : "Đang ẩn bớt CCCD & SĐT (Bấm để hiện đầy đủ)"
                }
              >
                {showAllSensitive ? "👁️ Đầy đủ" : "🔒 Ẩn số"}
              </button>
            </div>
          </div>

          {/* Dòng trạng thái lọc & Đặt lại bộ lọc */}
          {(searchTerm ||
            selectedAgency !== "ALL" ||
            filterAnswer !== "ALL" ||
            filterPrize !== "ALL") && (
            <div className="flex items-center justify-between text-xs text-[#c4b5a2] bg-[#1c140e]/90 px-3 py-1.5 rounded-lg border border-[#ba7c38]/30">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#ffdca3]">
                  Đang lọc:
                </span>
                {searchTerm && (
                  <span className="px-2 py-0.5 bg-[#ba7c38]/20 border border-[#ba7c38]/40 text-[#ffdca3] rounded">
                    Tìm: "{searchTerm}"
                  </span>
                )}
                {selectedAgency !== "ALL" && (
                  <span className="px-2 py-0.5 bg-[#ba7c38]/20 border border-[#ba7c38]/40 text-[#ffdca3] rounded">
                    Đại lý: {selectedAgency}
                  </span>
                )}
                {filterAnswer !== "ALL" && (
                  <span className="px-2 py-0.5 bg-[#ba7c38]/20 border border-[#ba7c38]/40 text-[#ffdca3] rounded">
                    Đáp án: {filterAnswer === "C" ? "Chỉ C" : "Khác C"}
                  </span>
                )}
                {filterPrize !== "ALL" && (
                  <span className="px-2 py-0.5 bg-[#ba7c38]/20 border border-[#ba7c38]/40 text-[#ffdca3] rounded">
                    Giải: {filterPrize === "WON" ? "Đã trúng" : "Chưa trúng"}
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleExportFiltered}
                  className="text-[#ffdca3] hover:text-white font-semibold cursor-pointer underline"
                >
                  Tải kết quả lọc ({filteredSubmissions.length})
                </button>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedAgency("ALL");
                    setFilterAnswer("ALL");
                    setFilterPrize("ALL");
                    setCurrentPage(1);
                  }}
                  className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                >
                  ✕ Xóa tất cả lọc
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Data Table with CCCD Column */}
        <div className="overflow-x-auto rounded-xl border border-[#ba7c38]/30 bg-[#140f0b]">
          <table className="w-full text-xs text-left text-[#e8ded1]">
            <thead className="text-[11px] font-bold text-[#ffdca3] uppercase bg-[#1c140e] border-b border-[#ba7c38]/40 tracking-wider">
              <tr>
                <th scope="col" className="px-3.5 py-3 w-16 text-center">
                  Mã
                </th>
                <th scope="col" className="px-3.5 py-3">
                  Họ và Tên
                </th>
                <th scope="col" className="px-3.5 py-3">
                  Số CCCD (Đối Soát)
                </th>
                <th scope="col" className="px-3.5 py-3">
                  Số Điện Thoại
                </th>
                <th scope="col" className="px-3.5 py-3">
                  Đại Lý Phân Phối
                </th>
                <th scope="col" className="px-3.5 py-3 text-center w-28">
                  Đáp Án
                </th>
                <th scope="col" className="px-3.5 py-3 w-28">
                  Giải Thưởng
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ba7c38]/15 bg-[#140f0b]">
              {paginatedSubmissions.length > 0 ? (
                paginatedSubmissions.map((sub, index) => {
                  const isCorrect = (sub.answer || "").toUpperCase() === "C";
                  const isRowRevealed =
                    showAllSensitive || revealedIds.has(sub.id);

                  return (
                    <tr
                      key={sub.id}
                      className={`hover:bg-[#ba7c38]/12 transition-colors ${
                        index % 2 === 0 ? "bg-[#140f0b]" : "bg-[#18120d]"
                      }`}
                    >
                      {/* Mã dự thưởng */}
                      <td className="px-3.5 py-2.5 font-bold text-center text-[#ffdca3] font-mono">
                        #{sub.id.toString().padStart(4, "0")}
                      </td>

                      {/* Họ tên */}
                      <td className="px-3.5 py-2.5 font-semibold text-white">
                        {sub.name}
                      </td>

                      {/* CCCD (Đối soát) */}
                      <td className="px-3.5 py-2.5 font-mono text-[#e8ded1]">
                        <span className="tracking-wide">
                          {formatMasked(sub.nationalId, sub.id, "cccd")}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleReveal(sub.id)}
                          className="ml-2 text-[#a89f91] hover:text-[#ffdca3] text-[10px] cursor-pointer"
                          title={isRowRevealed ? "Ẩn số" : "Xem đầy đủ"}
                        >
                          {isRowRevealed ? "🔒" : "👁️"}
                        </button>
                      </td>

                      {/* SĐT */}
                      <td className="px-3.5 py-2.5 font-mono text-[#e8ded1]">
                        <span>{formatMasked(sub.phone, sub.id, "phone")}</span>
                      </td>

                      {/* Đại lý */}
                      <td className="px-3.5 py-2.5 text-[#c4b5a2] font-medium">
                        {sub.agency || "-"}
                      </td>

                      {/* Đáp án */}
                      <td className="px-3.5 py-2.5 text-center">
                        {isCorrect ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                            ✓ C
                          </span>
                        ) : sub.answer ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-rose-950/80 text-rose-300 border border-rose-500/40">
                            {sub.answer}
                          </span>
                        ) : (
                          <span className="text-[#7a7065] italic">Chưa có</span>
                        )}
                      </td>

                      {/* Giải thưởng */}
                      <td className="px-3.5 py-2.5">
                        {sub.prizeWon ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-bold bg-[#241a0d] text-[#ffdca3] border border-amber-500/50">
                            🎁 {sub.prizeWon}
                          </span>
                        ) : (
                          <span className="text-[#7a7065]">Chưa trúng</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-10 text-[#a89f91] font-medium"
                  >
                    Không tìm thấy người tham gia nào phù hợp với điều kiện tìm
                    kiếm / lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-xs text-[#a89f91]">
          <div className="flex items-center gap-2">
            <span>
              Hiển thị{" "}
              <b className="text-white">
                {filteredSubmissions.length === 0
                  ? 0
                  : (safeCurrentPage - 1) *
                      (pageSize === "ALL"
                        ? filteredSubmissions.length
                        : pageSize) +
                    1}
              </b>{" "}
              -{" "}
              <b className="text-white">
                {pageSize === "ALL"
                  ? filteredSubmissions.length
                  : Math.min(
                      safeCurrentPage * (pageSize as number),
                      filteredSubmissions.length
                    )}
              </b>{" "}
              trên tổng số <b className="text-[#ffdca3]">{filteredSubmissions.length}</b> bản ghi
            </span>

            <span className="text-[#ba7c38]/40">|</span>

            {/* Rows per page selector */}
            <label className="flex items-center gap-1">
              <span>Xem:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const val = e.target.value;
                  setPageSize(val === "ALL" ? "ALL" : Number(val));
                  setCurrentPage(1);
                }}
                className="py-1 px-2 border border-[#ba7c38]/35 rounded bg-[#1c140e] text-xs text-[#e8ded1] focus:ring-1 focus:ring-[#ba7c38]"
              >
                <option value={25}>25 dòng / trang</option>
                <option value={50}>50 dòng / trang</option>
                <option value={100}>100 dòng / trang</option>
                <option value="ALL">Xem tất cả</option>
              </select>
            </label>
          </div>

          {/* Page Buttons */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="px-2.5 py-1.5 border border-[#ba7c38]/30 rounded bg-[#1c140e] text-[#e8ded1] hover:bg-[#2a1d13] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                ◀ Trước
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && safeCurrentPage > 3) {
                  pageNum = safeCurrentPage - 2 + i;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded text-xs font-semibold cursor-pointer transition-all ${
                      safeCurrentPage === pageNum
                        ? "bg-[#ba7c38] text-white font-bold shadow"
                        : "border border-[#ba7c38]/30 bg-[#1c140e] hover:bg-[#2a1d13] text-[#c4b5a2] hover:text-[#ffdca3]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={safeCurrentPage === totalPages}
                className="px-2.5 py-1.5 border border-[#ba7c38]/30 rounded bg-[#1c140e] text-[#e8ded1] hover:bg-[#2a1d13] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Sau ▶
              </button>
            </div>
          )}
        </div>

        {/* Danger Zone: Reset CSV */}
        <div className="mt-10 pt-6 border-t border-rose-900/50 bg-rose-950/20 -mx-6 -mb-6 p-6 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-rose-400 flex items-center gap-1.5">
                <span>⚠️</span> Vùng Nguy Hiểm: Đặt Lại Cơ Sở Dữ Liệu (Reset CSV)
              </h4>
              <p className="text-xs text-rose-300/80 mt-0.5">
                Hành động này sẽ xóa toàn bộ danh sách đăng ký hiện có trong file
                CSV. Dùng khi chuẩn bị chạy sự kiện mới.
              </p>
            </div>

            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-950/60 border border-rose-700/60 text-rose-300 hover:bg-rose-900/80 hover:text-white transition-colors cursor-pointer"
              >
                🗑️ Đặt Lại Toàn Bộ Dữ Liệu
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2 bg-[#1c140e] p-3 rounded-lg border border-rose-700/60 shadow-lg">
                <span className="text-xs font-semibold text-rose-300">
                  Gõ <b className="text-white">RESET</b> để xác nhận:
                </span>
                <input
                  type="text"
                  value={resetConfirmInput}
                  onChange={(e) => setResetConfirmInput(e.target.value)}
                  placeholder="RESET"
                  className="px-2.5 py-1 text-xs border border-rose-500 rounded uppercase font-bold text-rose-300 bg-[#140f0b] w-24 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button
                  type="button"
                  onClick={executeResetCSV}
                  disabled={resetConfirmInput !== "RESET" || isResetting}
                  className="px-3 py-1 text-xs font-bold rounded bg-rose-700 text-white hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isResetting ? "Đang xóa..." : "Xác nhận xóa"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetConfirm(false);
                    setResetConfirmInput("");
                  }}
                  className="px-2.5 py-1 text-xs font-medium rounded border border-[#ba7c38]/30 bg-[#140f0b] hover:bg-[#2a1d13] text-[#c4b5a2] cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
