import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const finalHtmlPath = path.join(__dirname, '..', 'Final.html');

console.log("=== KIỂM THỬ TDD: TỐI ƯU MÀN CHIẾU 1152x576 (4 HÀNG & BỎ BORDER PROGRESS BAR) ===");

const html = fs.readFileSync(finalHtmlPath, 'utf8');

// 1. Kiểm tra Media Query cho màn chiếu sân khấu 1152x576
assert(
  html.includes('@media') && (html.includes('max-height: 650px') || html.includes('max-height: 600px') || html.includes('1152px')),
  "Thiếu CSS Media Query tối ưu cho màn chiếu thấp 1152x576"
);

// 2. Kiểm tra cấu hình 4 cột x 4 hàng (repeat(4, 1fr))
assert(
  html.includes('repeat(4, 1fr)'),
  "Thiếu cấu hình CSS Grid 4 cột x 4 hàng 'repeat(4, 1fr)'"
);

// 3. Kiểm tra khóa cứng không cuộn trang (Zero-scroll)
assert(
  html.includes('overflow: hidden') && html.includes('height: 100vh'),
  "Thiếu quy tắc khóa chiều cao và ẩn cuộn trang (overflow: hidden)"
);

// 4. Kiểm tra cấu trúc thẻ bố trí dạng 2 cột ngang (card-main-content & card-details)
assert(
  html.includes('card-main-content') && html.includes('card-details'),
  "Thiếu cấu trúc chia 2 cột ngang (card-main-content & card-details) để tận dụng chiều rộng gấp đôi"
);

// 5. Kiểm tra loại bỏ border xung quanh progress bar
assert(
  html.includes('border: none') || html.includes('border: 0'),
  "Chưa loại bỏ border bao quanh progress bar"
);

console.log("✓ TẤT CẢ CÁC BÀI TEST TỐI ƯU MÀN CHIẾU 1152x576 (4 HÀNG) ĐỀU PASS!");
