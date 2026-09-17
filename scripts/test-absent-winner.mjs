import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const finalHtmlPath = path.join(__dirname, '..', 'Final.html');

console.log("=== KIỂM THỬ TDD: NÚT VẮNG MẶT & TỰ ĐỘNG QUAY LẠI Ô TƯƠNG ỨNG ===");

const html = fs.readFileSync(finalHtmlPath, 'utf8');

// 1. Kiểm tra HTML có nút VẮNG MẶT (#winnerModalAbsentBtn)
assert(
  html.includes('id="winnerModalAbsentBtn"') && html.includes('VẮNG MẶT'),
  "Thiếu nút VẮNG MẶT (#winnerModalAbsentBtn) trong modal vinh danh"
);

// 2. Kiểm tra CSS cho nút vắng mặt và nhóm nút
assert(
  html.includes('.winner-btn-absent') && html.includes('.winner-actions-group'),
  "Thiếu CSS .winner-btn-absent hoặc .winner-actions-group cho nhóm nút modal"
);

// 3. Kiểm tra biến absentWinners được khai báo và đồng bộ sessionStorage
assert(
  html.includes('absentWinners') && html.includes('sessionStorage'),
  "Thiếu biến quản lý danh sách absentWinners hoặc đồng bộ sessionStorage"
);

// 4. Kiểm tra hàm xử lý khi bấm vắng mặt: handleWinnerAbsent
assert(
  html.includes('function handleWinnerAbsent') || html.includes('const handleWinnerAbsent'),
  "Thiếu hàm handleWinnerAbsent để xử lý khi người trúng thưởng vắng mặt"
);

// 5. Kiểm tra bộ lọc participants loại trừ absentWinners để không bao giờ bốc lại
assert(
  html.includes('absentWinners.includes'),
  "Thiếu điều kiện lọc thí sinh loại trừ những người đã bị hủy do vắng mặt (!absentWinners.includes)"
);

// 6. Kiểm tra phím tắt cho MC: bắt phím 'KeyV' hoặc 'Delete' hoặc 'v'
assert(
  html.includes('handleWinnerAbsent') && (html.includes('KeyV') || html.includes('"v"') || html.includes('"V"') || html.includes('Delete')),
  "Thiếu phím tắt nhanh (KeyV / Delete) cho MC báo người trúng vắng mặt"
);

// 7. Kiểm tra cơ chế tự động quay lại chính ô hiện tại khi kết quả là absent
assert(
  html.includes("action === 'absent'") || html.includes('action === "absent"'),
  "Thiếu logic kiểm tra action === 'absent' để tự động quay lại ô tương ứng"
);

console.log("✓ TẤT CẢ CÁC BÀI TEST TDD VẮNG MẶT & QUAY LẠI Ô ĐỀU PASS!");
