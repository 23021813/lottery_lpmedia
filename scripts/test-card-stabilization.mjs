import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const finalHtmlPath = path.join(__dirname, '..', 'Final.html');

console.log("=== KIỂM THỬ TDD: CỐ ĐỊNH KÍCH THƯỚC CARD & ÁNH SÁNG CHẠY VIỀN ===");

const html = fs.readFileSync(finalHtmlPath, 'utf8');

// 1. Kiểm tra font-variant-numeric: tabular-nums chống nhảy số
assert(
  html.includes('tabular-nums') || html.includes('"tnum"'),
  "Thiếu thuộc tính font-variant-numeric: tabular-nums cho .card-code"
);

// 2. Kiểm tra cố định chiều rộng cho .card-code
assert(
  html.includes('card-code') && (html.includes('width: 9') || html.includes('flex: 0 0 9') || html.includes('min-width: 9')),
  "Thiếu cố định chiều rộng bất biến cho .card-code"
);

// 3. Kiểm tra grid-template-columns sử dụng minmax(0, 1fr)
assert(
  html.includes('minmax(0, 1fr)'),
  "Thiếu repeat(4, minmax(0, 1fr)) để khóa cứng chiều rộng 4 cột"
);

// 4. Kiểm tra hiệu ứng ánh sáng quang viền chạy quanh border (border light trace animation)
assert(
  html.includes('borderLightTrace') || html.includes('borderLight') || html.includes('rotateBorder'),
  "Thiếu animation đường ánh sáng chạy quang viền khi card quay"
);

// 5. Kiểm tra pseudo-element ::before / conic-gradient cho is-spinning
assert(
  html.includes('conic-gradient') && html.includes('is-spinning'),
  "Thiếu hiệu ứng conic-gradient chạy quanh viền thẻ is-spinning"
);

console.log("✓ TẤT CẢ CÁC BÀI TEST CỐ ĐỊNH CARD & ÁNH SÁNG CHẠY VIỀN ĐỀU PASS!");
