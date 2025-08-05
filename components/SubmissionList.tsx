import React from "react";
import type { Submission } from "../types";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

interface SubmissionListProps {
  submissions: Submission[];
  onSubmissionsUpdate?: () => void;
}

export const SubmissionList: React.FC<SubmissionListProps> = ({
  submissions,
  onSubmissionsUpdate,
}) => {
  const downloadCSV = () => {
    if (submissions.length === 0) return;

    const headers = "ID,Tên,Số Điện Thoại,CCCD,Đại lý,Giải thưởng\n";
    const rows = submissions
      .map(
        (sub) =>
          `${sub.id},"${sub.name}","${sub.phone}","${sub.nationalId}","${
            sub.agency
          }","${sub.prizeWon || ""}"`
      )
      .join("\n");

    const csvContent = headers + rows;
    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "danh_sach_dang_ky.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetCSV = async () => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn reset toàn bộ dữ liệu CSV? Hành động này không thể hoàn tác!"
      )
    ) {
      return;
    }

    try {
      const headers = "id,name,phone,nationalId,agency,prizeWon\n";

      const response = await fetch("/api/write-csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: headers,
        }),
      });

      if (response.ok) {
        alert("Đã reset CSV thành công!");
        if (onSubmissionsUpdate) {
          onSubmissionsUpdate();
        }
      } else {
        throw new Error("Failed to reset CSV");
      }
    } catch (error) {
      console.error("Error resetting CSV:", error);
      alert("Có lỗi xảy ra khi reset CSV!");
    }
  };

  return (
    <Card className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-slate-800">
          Danh Sách Tham Gia ({submissions.length})
        </h3>
        <div className="flex gap-2">
          <Button
            onClick={downloadCSV}
            variant="secondary"
            className="w-auto px-3 py-1.5 text-sm"
            disabled={submissions.length === 0}
          >
            Tải File CSV
          </Button>
          <Button
            onClick={resetCSV}
            variant="secondary"
            className="w-auto px-3 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white"
          >
            Reset CSV
          </Button>
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto rounded-lg border border-slate-300/70">
        {submissions.length > 0 ? (
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-700 uppercase bg-slate-200/60 sticky top-0">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Mã số
                </th>
                <th scope="col" className="px-4 py-3">
                  Tên
                </th>
                <th scope="col" className="px-4 py-3 hidden md:table-cell">
                  Đại lý
                </th>
                <th scope="col" className="px-4 py-3 hidden lg:table-cell">
                  SĐT
                </th>
                <th scope="col" className="px-4 py-3">
                  Giải
                </th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => {
                return (
                  <tr
                    key={sub.id}
                    className="bg-white/40 border-b border-slate-300/50 hover:bg-slate-200/40"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      #{sub.id}
                    </td>
                    <td className="px-4 py-3">{sub.name}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {sub.agency}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {sub.phone.slice(0, -3) + "***"}
                    </td>
                    <td className="px-4 py-3">
                      {sub.prizeWon ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {sub.prizeWon}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">
                          Chưa trúng
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-center py-8 text-slate-500">Chưa có ai đăng ký.</p>
        )}
      </div>
    </Card>
  );
};
