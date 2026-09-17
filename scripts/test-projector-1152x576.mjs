import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const finalHtmlPath = path.join(__dirname, '..', 'Final.html');

console.log("=== KIỂM THỬ TDD: TỐI ƯU MÀN CHIẾU 1152x576 (FINAL.HTML) ===");

const html = fs.readFileSync(finalHtmlPath, 'utf8');

// 1. Kiểm tra Media Query cho màn chiếu sân khấu
assert(
  html.includes('@media') && (html.includes('max-height: 650px') || html.includes('max-height: 600px') || html.includes('1152px')),
  "Thiếu CSS Media Query tối ưu cho màn chiếu thấp 1152x576"
);

// 2. Kiểm tra quy tắc 8 cột x 2 hàng
assert(
  html.includes('repeat(8, 1fr)'),
  "Thiếu cấu hình CSS Grid 8 cột 'repeat(8, 1fr)' cho màn chiếu 2:1"
);

// 3. Kiểm tra khóa cứng không cuộn trang (Zero-scroll)
assert(
  html.includes('overflow: hidden') && html.includes('height: 100vh'),
  "Thiếu quy tắc khóa chiều cao và ẩn cuộn trang (overflow: hidden)"
);

// 4. Kiểm tra cấu trúc Top Stage Bar tinh gọn (gộp Header và Nút điều khiển ngang)
assert(
  html.includes('stage-top-bar'),
  "Thiếu cấu trúc thanh Topbar tinh gọn 'stage-top-bar' cho màn chiếu"
);

// 5. Kiểm tra CSS tối ưu Modal cho màn chiếu
assert(
  html.includes('winner-announcement-box') && (html.includes('max-height: 520px') || html.includes('max-height: 510px')),
  "Thiếu giới hạn max-height an toàn cho Winner Modal trên màn chiếu"
);

console.log("✓ TẤT CẢ CÁC BÀI TEST TỐI ƯU MÀN CHIẾU 1152x576 ĐỀU PASS!");
