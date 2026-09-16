import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const finalHtmlPath = path.join(__dirname, '..', 'Final.html');

console.log("=== KIỂM THỬ TDD: POPUP VINH DANH NGƯỜI TRÚNG CHO MC ===");

const html = fs.readFileSync(finalHtmlPath, 'utf8');

// 1. Kiểm tra DOM elements của Modal
assert(html.includes('id="winnerAnnouncementModal"'), "Thiếu modal container #winnerAnnouncementModal");
assert(html.includes('id="winnerModalRank"'), "Thiếu thẻ hiển thị hạng giải #winnerModalRank");
assert(html.includes('id="winnerModalCode"'), "Thiếu thẻ hiển thị mã số trúng thưởng cực đại #winnerModalCode");
assert(html.includes('id="winnerModalName"'), "Thiếu thẻ hiển thị họ tên #winnerModalName");
assert(html.includes('id="winnerModalAgency"'), "Thiếu thẻ hiển thị đại lý #winnerModalAgency");
assert(html.includes('id="winnerModalSecure"'), "Thiếu thẻ hiển thị CCCD/SĐT bảo mật #winnerModalSecure");
assert(html.includes('id="winnerModalNextBtn"'), "Thiếu nút điều hướng #winnerModalNextBtn");

// 2. Kiểm tra CSS typography cỡ lớn cho MC
assert(html.includes('.winner-code-large'), "Thiếu class CSS .winner-code-large");
assert(html.includes('.winner-name-large'), "Thiếu class CSS .winner-name-large");

// 3. Kiểm tra hàm xử lý async Promise và phím tắt
assert(html.includes('showWinnerAnnouncementModal'), "Thiếu hàm showWinnerAnnouncementModal");
assert(html.includes('handleWinnerModalConfirm'), "Thiếu hàm handleWinnerModalConfirm");
assert(html.includes('TIẾP TỤC'), "Thiếu nhãn nút 'TIẾP TỤC'");
assert(html.includes('HOÀN TẤT'), "Thiếu nhãn nút 'HOÀN TẤT'");
assert(html.includes('Space') || html.includes('keydown'), "Thiếu logic bắt sự kiện phím Space/Enter");

console.log("✓ TẤT CẢ CÁC BÀI TEST POPUP VINH DANH ĐỀU PASS!");
